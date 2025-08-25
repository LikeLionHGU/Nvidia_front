// src/pages/MainPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";

import DetailPlacePage from "./DetailPage";
import LocationSearchModal from "./LocationSearchModal";

import "./../styles/global.css";
import MapWrapper from "../components/specific/MapWrapper";
import FormComponent from "../components/specific/FormComponent";
import SearchResultContainer from "../components/specific/SearchResultContainer";
import RecommendationBox from "../components/specific/RecommendationBox";

import { postMain, postRecommend } from "../apis/recommend";

function MainPage() {
  const [markers, setMarkers] = useState([]);
  const [recommendList, setRecommendList] = useState([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSearchLocationModalOpen, setIsSearchLocationModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [addressInputs, setAddressInputs] = useState([""]);
  const [budgetRange, setBudgetRange] = useState([0, 100000]);
  const [hoveredRoomId, setHoveredRoomId] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null); // { lat, lng }
  const [centerAddress, setCenterAddress] = useState(null);

  const navigate = useNavigate();

  // 0) 최초 진입 시 한 번 현재 위치 시도 (실패해도 앱은 동작)
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        // 위치 권한 거부/실패 시에는 사용자가 버튼으로 재시도하도록 유지
        console.warn("Geolocation permission denied or failed.");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("이 브라우저에서는 Geolocation이 지원되지 않습니다.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting current location:", error);
        alert("현재 위치를 가져올 수 없습니다. 위치 권한을 허용해주세요.");
      }
    );
  };

  const handleAddressInputChange = (index, value) => {
    const next = [...addressInputs];
    next[index] = value;
    setAddressInputs(next);
  };
  const addAddressInput = () => {
    if (addressInputs.length >= 5) return alert("최대 5개의 주소만 입력 가능합니다.");
    setAddressInputs((prev) => [...prev, ""]);
  };
  const removeAddressInput = (index) => {
    setAddressInputs((prev) => prev.filter((_, i) => i !== index));
  };

  const moveToDetailPage = (roomId) => {
    setIsDetailModalOpen(true);
    setSelectedRoomId(roomId);
  };
  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedRoomId(null);
  };

  const handleMarkerHover = (roomId, isHovering) => {
    setHoveredRoomId(isHovering ? roomId : null);
  };

  const openSearchLocationModal = (index) => {
    setIsSearchLocationModalOpen(true);
  };

  const closeSearchLocationModal = () => {
    setIsSearchLocationModalOpen(false);
  };

  const handleLocationConfirm = (center) => {
    // 인풋엔 도로명만 표시 (readOnly)
    setAddressInputs((prev) => {
      const n = prev.length ? [...prev] : [""];
      n[0] = center?.roadName || "";
      return n;
    });
    // 단일 중간값 보관
    setCenterAddress(center); // { roadName, latitude, longitude }
    setIsSearchLocationModalOpen(false);
  };

  const [prompt, setPrompt] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const requestRecommend = async () => {
    if (!centerAddress) {
      alert("위치를 먼저 선택해주세요.");
      return;
    }
    setLoading(true);
    setShowResults(true);
    try {
      const data = await postRecommend({
        center: centerAddress,
        prompt,
        minPrice,
        maxPrice,
      });

      const list = Array.isArray(data?.recommendList) ? data.recommendList : Array.isArray(data) ? data : [];

      setRecommendList(list);
      setMarkers(
        list.map((item) => ({
          position: {
            lat: Number(item.address?.latitude),
            lng: Number(item.address?.longitude),
          },
          title: `장소 ${item.roomId}`,
          id: item.roomId,
          price: Number(item.price).toLocaleString(),
        }))
      );
    } catch (e) {
      console.error("POST /recommend 실패:", e);
      alert("추천을 불러오지 못했습니다.");
      setShowResults(false); // 에러 발생 시 결과 화면을 다시 숨김
    } finally {
      setLoading(false);
    }
  };

  // 1) 추천 API: 위치가 준비된 이후에만 호출. 응답 비거나 실패하면 더미로 대체.
  useEffect(() => {
    if (!currentLocation) return;

    const applyData = (list) => {
      setRecommendList(list);
      setMarkers(
        (list || []).map((item) => ({
          position: {
            lat: Number(item.address?.latitude),
            lng: Number(item.address?.longitude),
          },
          title: `장소 ${item.roomId}`,
          id: item.roomId,
          price: Number(item.price).toLocaleString(),
        }))
      );
    };

    (async () => {
      try {
        const data = await postMain({
          latitude: Number(currentLocation.lat),
          longitude: Number(currentLocation.lng),
        });
        const list = Array.isArray(data?.recommendList) ? data.recommendList : Array.isArray(data) ? data : [];
        applyData(list);
      } catch (err) {
        console.error("POST /main 실패", err);
      }
    })();
  }, [currentLocation]);

  const handleRecommendClick = () => setShowResults(true);
  const handleBackClick = () => setShowResults(false);

  const mapClientId = import.meta.env.VITE_MAP_CLIENT_ID;

  return (
    <PageContainer>
      <ContentsContainer>
        <SearchResultsContainer>
          {showResults ? (
            <SearchResultContainer
              handleBackClick={handleBackClick}
              recommendList={recommendList}
              moveToDetailPage={moveToDetailPage}
              onCardClick={moveToDetailPage}
              hoveredRoomId={hoveredRoomId}
              prompt={prompt}
              centerAddress={centerAddress}
              isLoading={loading}
            />
          ) : (
            <FormComponent
              addressInputs={addressInputs}
              handleAddressInputChange={handleAddressInputChange}
              // ▼ 기존 setIsSearchLocationModalOpen 대신, 인덱스를 받는 오픈함수 내려줌
              onOpenSearchLocationModal={openSearchLocationModal}
              prompt={prompt}
              setPrompt={setPrompt}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              onSubmitRecommend={requestRecommend}
            />
          )}
        </SearchResultsContainer>

        <MapWrapper
          mapClientId={mapClientId}
          markers={markers}
          moveToDetailPage={moveToDetailPage}
          handleMarkerHover={handleMarkerHover}
          currentLocation={currentLocation || { lat: 37.5665, lng: 126.978 }} // 서울시청 근처 기본값
          handleGetCurrentLocation={handleGetCurrentLocation}
          isDetailModalOpen={isDetailModalOpen}
          isSearchLocationModalOpen={isSearchLocationModalOpen}
        />
      </ContentsContainer>
      
      {showResults ? <></>: <RecommendationBox
        recommendList={recommendList}
        isDetailModalOpen={isDetailModalOpen}
        isSearchLocationModalOpen={isSearchLocationModalOpen}
        onCardClick={moveToDetailPage}
      />}

      {isDetailModalOpen && <DetailPlacePage onClose={closeDetailModal} roomId={selectedRoomId} />}

      {isSearchLocationModalOpen && (
        <LocationSearchModal onClose={closeSearchLocationModal} onConfirm={handleLocationConfirm} />
      )}
    </PageContainer>
  );
}
export default MainPage;

/* ================= styles ================= */

const PageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const ContentsContainer = styled.div`
  display: flex;
  width: 100%;
  height: 90vh;
`;

const SearchResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin: 20px 10px 20px 20px;
  overflow-y: auto;
  box-shadow: 0 -2px 23.9px 0 rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: #fff;

  /* 스크롤바 숨김 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE, Edge */
  &::-webkit-scrollbar {
    display: none;
  } /* Chrome, Safari */
`;
