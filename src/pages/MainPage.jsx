import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import CommonModal from "../components/common/commonModal";
import DetailPlacePage from "./DetailPage";
// import { getRecommendList, searchPlacesByKeyword } from "../apis/MainPageAPI";
import "./../styles/global.css";
import MapWrapper from "../components/specific/MapWrapper";
import FormComponent from "../components/specific/FormComponent";
import SearchResultContainer from "../components/specific/SearchResultContainer";

function MainPage() {
  const [markers, setMarkers] = useState([]); // 기본 장소 마커들
  const [recommendList, setRecommendList] = useState([]); // 추천 장소 목록 (API 연동 전 더미 데이터)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
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

  const navigate = useNavigate();

  // New handler for marker hover
  const handleMarkerHover = (roomId, isHovering) => {
    setHoveredRoomId(isHovering ? roomId : null);
  };

  // 1. 초기 로딩 시 추천 목록(더미 데이터) 가져오고, 마커와 주소 설정
  useEffect(() => {
    // API 연동 전까지 사용할 더미 데이터
    const dummyRecommendList = [
      {
        roomId: 1,
        photo: "https://pbs.twimg.com/media/GUyPp8eaYAAhzbz.jpg",
        address: { latitude: "37.4782", longitude: "127.0282" },
        maxPeople: 4,
        phoneNumber: "010-1234-5678",
        price: 50000,
        roadName: "서울특별시 서초구 서초중앙로 188",
      },
      {
        roomId: 2,
        photo: "https://i.pinimg.com/736x/d5/43/5a/d5435a7ab5b8756ae76b048f9c7967a4.jpg",
        address: { latitude: "37.4592", longitude: "127.1292" },
        maxPeople: 2,
        phoneNumber: "010-8765-4321",
        price: 30000,
        roadName: "서울특별시 강남구 개포로 623",
      },
      {
        roomId: 3,
        photo: "https://i.pinimg.com/736x/d5/43/5a/d5435a7ab5b8756ae76b048f9c7967a4.jpg",
        address: { latitude: "37.3947611", longitude: "127.1111361" },
        maxPeople: 3,
        phoneNumber: "010-8765-2321",
        price: 35000,
        roadName: "경기도 성남시 분당구 판교역로 160 ",
      },
    ];

    setRecommendList(dummyRecommendList);

    // 더미 데이터 기반으로 지도에 표시할 마커 생성
    const newMarkers = dummyRecommendList.map((item) => ({
      position: { lat: parseFloat(item.address.latitude), lng: parseFloat(item.address.longitude) },
      title: `장소 ${item.roomId}`,
      id: item.roomId, // Pass roomId as id
      price: item.price.toLocaleString(), // Pass price
    }));
    setMarkers(newMarkers);
  }, []); // 컴포넌트 마운트 시 1회만 실행

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
    <div>
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
        />
      </ContentsContainer>

      {isDetailModalOpen && (
        <CommonModal title="장소 상세 정보" onClose={closeDetailModal}>
          <DetailPlacePage isModal={true} onClose={closeDetailModal} roomId={selectedRoomId} />
        </CommonModal>
      )}
    </div>
  );
}
export default MainPage;

// 스타일 컴포넌트들은 그대로 유지
const ContentsContainer = styled.div`
  display: flex;
  width: 100%;
  height: 95vh;
`;

const SearchResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid black;
  flex: 1;
  margin: 10px;
  overflow-y: auto;
`;
