import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import DetailPlacePage from "./DetailPage";
import LocationSearchModal from "./LocationSearchModal";
import axios from "axios";

// import { getRecommendList, searchPlacesByKeyword } from "../apis/MainPageAPI";
import "./../styles/global.css";
import MapWrapper from "../components/specific/MapWrapper";
import FormComponent from "../components/specific/FormComponent";
import SearchResultContainer from "../components/specific/SearchResultContainer";
import RecommendationBox from "../components/specific/RecommendationBox";
import MapComponent from "../apis/MapComponent";

function MainPage() {
  const [markers, setMarkers] = useState([]); // 기본 장소 마커들
  const [recommendList, setRecommendList] = useState([]); // 추천 장소 목록 (API 연동 전 더미 데이터)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSearchLocationModalOpen, setIsSearchLocationModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [showResults, setShowResults] = useState(false); // 추천 결과 표시 여부 상태
  const [addressInputs, setAddressInputs] = useState([""]); // 주소 입력창 배열
  const [budgetRange, setBudgetRange] = useState([0, 100000]);
  const [hoveredRoomId, setHoveredRoomId] = useState(null); // New state for hovered room ID
  const [currentLocation, setCurrentLocation] = useState(null); // { lat: ..., lng: ... }

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting current location:", error);
          alert("현재 위치를 가져올 수 없습니다. 위치 권한을 허용해주세요.");
        }
      );
    } else {
      alert("이 브라우저에서는 Geolocation이 지원되지 않습니다.");
    }
  };

  const handleAddressInputChange = (index, value) => {
    const newAddressInputs = [...addressInputs];
    newAddressInputs[index] = value;
    setAddressInputs(newAddressInputs);
  };

  const addAddressInput = () => {
    if (addressInputs.length < 5) {
      setAddressInputs([...addressInputs, ""]);
    } else {
      alert("최대 5개의 주소만 입력 가능합니다.");
    }
  };

  const removeAddressInput = (index) => {
    const newAddressInputs = addressInputs.filter((_, i) => i !== index);
    setAddressInputs(newAddressInputs);
  };

  const moveToDetailPage = (roomId) => {
    setIsDetailModalOpen(true);
    setSelectedRoomId(roomId);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedRoomId(null);
  };

  const closeSearchLocationModal = () => { // props로 주소 리스트 받아오기 (좌표 계산도 여기(?))
    // 중간위치 받아오는 API 호출 여기서 처리하기
    setIsSearchLocationModalOpen(false);
  }

  const navigate = useNavigate();

  // New handler for marker hover
  const handleMarkerHover = (roomId, isHovering) => {
    setHoveredRoomId(isHovering ? roomId : null);
  };

  // 1. 초기 로딩 시 추천 목록(더미 데이터) 가져오고, 마커와 주소 설정
  // 기존 "1. 초기 로딩 시 추천 목록..." useEffect 를 아래로 교체
// 기존 useEffect 전체 교체
// MainPage.jsx — 추천 호출 useEffect 전체 교체
useEffect(() => {
  const fallback = [
    { roomId: 1, photo: "https://picsum.photos/seed/spaceon1/640/480",
      address: { roadName: "서울 강남구 테헤란로 123", latitude: 37.498, longitude: 127.028 },
      maxPeople: 4, phoneNumber: "010-1234-5678", price: 30000 },
    { roomId: 2, photo: "https://i.pinimg.com/736x/d5/43/5a/d5435a7ab5b8756ae76b048f9c7967a4.jpg",
      address: { roadName: "서울 서초구 서초대로 77", latitude: 37.496, longitude: 127.024 },
      maxPeople: 2, phoneNumber: "010-8765-4321", price: 45000 },
    { roomId: 3, photo: "https://snvision.seongnam.go.kr/imgdata/snvision/201911/2019112148082756.jpg",
      address: { roadName: "성남 분당구 판교역로 160", latitude: 37.3947611, longitude: 127.1111361 },
      maxPeople: 3, phoneNumber: "010-2222-3333", price: 35000 },
  ];

  const applyData = (list) => {
    setRecommendList(list);
    setMarkers((list || []).map((item) => ({
      position: { lat: Number(item.address?.latitude), lng: Number(item.address?.longitude) },
      title: `장소 ${item.roomId}`,
      id: item.roomId,
      price: Number(item.price).toLocaleString(),
    })));
  };

  const fetchRecommend = async () => {
    try {
      // 위치가 없으면 서울시청 기준 좌표 사용
      const lat = Number(currentLocation?.lat ?? 37.5665);
      const lng = Number(currentLocation?.lng ?? 126.9780);

      const body = { latitude: lat, longitude: lng };
      console.log("[/spaceon/main] req:", body);

      const { data } = await axios.post("/spaceon/main", body, {
        headers: { "Content-Type": "application/json" },
      });

      const list = Array.isArray(data?.recommendList) ? data.recommendList : [];
      applyData(list.length ? list : fallback);
      console.log("호출성공: ", list);
    } catch (err) {
      console.error("추천 목록 호출 실패(서버 500 등) → 더미 적용:", err);
      applyData(fallback);
    }
  };

  fetchRecommend();
}, [currentLocation]); // 현재 위치가 바뀌면 다시 호출

  const handleRecommendClick = () => {
    // NOTE: 실제 추천 로직은 여기서 처리해야 합니다.
    // 현재는 단순히 결과 카드 표시 상태만 변경합니다.
    setShowResults(true);
  };

  const handleBackClick = () => {
    setShowResults(false);
  };

  const mapClientId = import.meta.env.VITE_MAP_CLIENT_ID;

  return (
    <PageContainer>
      {/* 상단 네비게이션 */}

      {/* 메인 컨텐츠 영역 */}
      <ContentsContainer>
        {/* 장소 검색 결과 목록 또는 추천 입력 폼 */}
        <SearchResultsContainer>
          {showResults ? (
            <SearchResultContainer
              handleBackClick={handleBackClick}
              recommendList={recommendList}
              moveToDetailPage={moveToDetailPage}
              hoveredRoomId={hoveredRoomId}
            />
          ) : (
            <FormComponent
              addressInputs={addressInputs}
              handleAddressInputChange={handleAddressInputChange}
              removeAddressInput={removeAddressInput}
              addAddressInput={addAddressInput}
              budgetRange={budgetRange}
              setBudgetRange={setBudgetRange}
              handleRecommendClick={handleRecommendClick}
              setIsSearchLocationModalOpen={setIsSearchLocationModalOpen}
            />
          )}
        </SearchResultsContainer>

        {/* 네이버 지도 */}
        <MapWrapper
          mapClientId={mapClientId}
          markers={markers}
          moveToDetailPage={moveToDetailPage}
          handleMarkerHover={handleMarkerHover}
          currentLocation={currentLocation}
          handleGetCurrentLocation={handleGetCurrentLocation}
          isDetailModalOpen={isDetailModalOpen}
          isSearchLocationModalOpen={isSearchLocationModalOpen}
        />
      </ContentsContainer>

      <RecommendationBox recommendList={recommendList} isDetailModalOpen={isDetailModalOpen} isSearchLocationModalOpen={isSearchLocationModalOpen} onCardClick={moveToDetailPage} />

      {isDetailModalOpen && (
          <DetailPlacePage isModal={true} onClose={closeDetailModal} roomId={selectedRoomId} />
      )}

      {isSearchLocationModalOpen &&(
          <LocationSearchModal isModal={true} onClose={closeSearchLocationModal} />
      )}
    </PageContainer>
  );
}
export default MainPage;

const PageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

// 스타일 컴포넌트들은 그대로 유지
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
  box-shadow: 0 -2px 23.9px 0 rgba(0, 0, 0, 0.10);
  border-radius: 8px;
  background: #FFF;

  /* 스크롤바 숨기기 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE, Edge */
  
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari */
  }
`;
