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

const isDesignMode = () => {
  if (typeof window === "undefined") return false;
  const sp = new URLSearchParams(window.location.search);
  return sp.get("design") === "1";
};

// 화면에 바로 쓸 더미 데이터
const DESIGN_DUMMY = [
  {
    roomId: 101,
    photo: "https://picsum.photos/seed/spaceon101/640/480",
    address: { roadName: "서울 강남구 테헤란로 231", latitude: 37.49895, longitude: 127.0276 },
    maxPeople: 6,
    phoneNumber: "010-1111-2222",
    price: 42000,
  },
  {
    roomId: 102,
    photo: "https://picsum.photos/seed/spaceon102/640/480",
    address: { roadName: "서울 서초구 서초대로 74길", latitude: 37.4962, longitude: 127.0234 },
    maxPeople: 4,
    phoneNumber: "010-3333-4444",
    price: 38000,
  },
  {
    roomId: 103,
    photo: "https://picsum.photos/seed/spaceon103/640/480",
    address: { roadName: "성남시 분당구 판교역로 146", latitude: 37.3947, longitude: 127.1109 },
    maxPeople: 8,
    phoneNumber: "010-5555-6666",
    price: 55000,
  },
];

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

  useEffect(() => {
    if (!isDesignMode()) return;

    // recommendList/markers 세팅
    setRecommendList(DESIGN_DUMMY);
    setMarkers(
      DESIGN_DUMMY.map((item) => ({
        position: { lat: Number(item.address.latitude), lng: Number(item.address.longitude) },
        title: `장소 ${item.roomId}`,
        id: item.roomId,
        price: Number(item.price).toLocaleString(),
      }))
    );

    // 지도 센터도 첫 결과로 이동
    setCurrentLocation({
      lat: Number(DESIGN_DUMMY[0].address.latitude),
      lng: Number(DESIGN_DUMMY[0].address.longitude),
    });

    // 결과 화면 바로 오픈
    setShowResults(true);
  }, []);

  // 0) 최초 진입 시 한 번 현재 위치 시도 (실패해도 앱은 동작)
  useEffect(() => {
    if (isDesignMode()) return; // 🔒 디자인 모드면 geolocation 안 탐
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

  const requestRecommend = async () => {
    if (isDesignMode()) {
      setRecommendList(DESIGN_DUMMY);
      setMarkers(
        DESIGN_DUMMY.map((item) => ({
          position: { lat: Number(item.address.latitude), lng: Number(item.address.longitude) },
          title: `장소 ${item.roomId}`,
          id: item.roomId,
          price: Number(item.price).toLocaleString(),
        }))
      );
      setCurrentLocation({
        lat: Number(DESIGN_DUMMY[0].address.latitude),
        lng: Number(DESIGN_DUMMY[0].address.longitude),
      });
      setShowResults(true);
      return;
    }
    if (!centerAddress) {
      alert("위치를 먼저 선택해주세요.");
      return;
    }
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
      setShowResults(true);
    } catch (e) {
      console.error("POST /recommend 실패:", e);
      alert("추천을 불러오지 못했습니다.");
    }
  };

  // 1) 추천 API: 위치가 준비된 이후에만 호출. 응답 비거나 실패하면 더미로 대체.
  useEffect(() => {
    if (isDesignMode()) return; // 🔒 디자인 모드면 /main 호출하지 않음
    if (!currentLocation) return;

    const fallback = [
      // {
      //   roomId: 1,
      //   photo: "https://picsum.photos/seed/spaceon1/640/480",
      //   address: { roadName: "서울 강남구 테헤란로 123", latitude: 37.498, longitude: 127.028 },
      //   maxPeople: 4,
      //   phoneNumber: "010-1234-5678",
      //   price: 30000,
      // },
      // {
      //   roomId: 2,
      //   photo: "https://i.pinimg.com/736x/d5/43/5a/d5435a7ab5b8756ae76b048f9c7967a4.jpg",
      //   address: { roadName: "서울 서초구 서초대로 77", latitude: 37.496, longitude: 127.024 },
      //   maxPeople: 2,
      //   phoneNumber: "010-8765-4321",
      //   price: 45000,
      // },
      // {
      //   roomId: 3,
      //   photo: "https://snvision.seongnam.go.kr/imgdata/snvision/201911/2019112148082756.jpg",
      //   address: { roadName: "성남 분당구 판교역로 160", latitude: 37.3947611, longitude: 127.1111361 },
      //   maxPeople: 3,
      //   phoneNumber: "010-2222-3333",
      //   price: 35000,
      // },
    ];

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
        applyData(list.length ? list : fallback);
      } catch (err) {
        console.error("POST /main 실패 → fallback:", err);
        applyData(fallback);
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

      <RecommendationBox
        recommendList={recommendList}
        isDetailModalOpen={isDetailModalOpen}
        isSearchLocationModalOpen={isSearchLocationModalOpen}
        onCardClick={moveToDetailPage}
      />

      {isDetailModalOpen && <DetailPlacePage isModal={true} onClose={closeDetailModal} roomId={selectedRoomId} />}

      {isSearchLocationModalOpen && (
        <LocationSearchModal isModal={true} onClose={closeSearchLocationModal} onConfirm={handleLocationConfirm} />
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
