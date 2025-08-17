import React, { useState, useEffect } from "react";
import MapComponent from "../apis/MapComponent";
import { NavermapsProvider } from "react-naver-maps";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import CommonModal from "../components/common/commonModal";
import DetailPlacePage from "./DetailPage";
import ManageMyPlacePage from "./ManageMyPlacePage";
// import { getRecommendList, searchPlacesByKeyword } from "../apis/MainPageAPI";
import "./../styles/global.css";
import SearchResultItem, {
  ResultPhoto,
  ResultInfo,
  ResultAddress,
  ResultDetails,
  ResultPrice,
} from "../components/specific/SearchResultItem";
import BudgetSlider from "../components/specific/BudgetSlider";

function MainPage() {
  const [markers, setMarkers] = useState([]); // 기본 장소 마커들
  const [recommendList, setRecommendList] = useState([]); // 추천 장소 목록 (API 연동 전 더미 데이터)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
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

  const moveToManagePage = () => {
    setIsManageModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedRoomId(null);
  };

  const closeManageModal = () => {
    setIsManageModalOpen(false);
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

  const moveToAddPlacePage = () => navigate("/add-place");

  const mapClientId = import.meta.env.VITE_MAP_CLIENT_ID;

  return (
    <div>
      {/* 상단 네비게이션 */}
      {/* <div>
        <span>홈페이지 </span>
        <span style={{ cursor: "pointer" }} onClick={moveToAddPlacePage}>
          장소등록{" "}
        </span>
        <span style={{ cursor: "pointer" }} onClick={moveToManagePage}>
          장소관리
        </span>
        <input
          type="search"
          placeholder="찾으시는 공실을 검색해보세요!"
          style={{ width: "300px", marginLeft: "200px" }}
        />
      </div> */}

      {/* 메인 컨텐츠 영역 */}
      <ContentsContainer>
        {/* 장소 검색 결과 목록 또는 추천 입력 폼 */}
        <SearchResultsContainer>
          {showResults ? (
            <>
              <BackButton onClick={handleBackClick}>수정하기</BackButton>
              {recommendList.map((item) => (
                <SearchResultItem
                  key={item.roomId}
                  onClick={() => moveToDetailPage(item.roomId)}
                  isHovered={hoveredRoomId === item.roomId} // Pass isHovered prop
                >
                  <ResultPhoto src={item.photo} alt="장소 사진" />
                  <ResultInfo>
                    <ResultAddress>주소: {item.roadName}</ResultAddress>
                    <ResultDetails>
                      최대인원: {item.maxPeople}명 | 연락처: {item.phoneNumber}
                    </ResultDetails>
                    <ResultPrice>{item.price.toLocaleString()}원</ResultPrice>
                  </ResultInfo>
                </SearchResultItem>
              ))}
            </>
          ) : (
            <FormContainer>
              <Step>
                <StepTitle>[Step 1] 위치 지정</StepTitle>
                <StepDescription>친구를 추가하여 여러 위치를 입력할 수 있습니다.</StepDescription>
                <AddressListContainer>
                  {addressInputs.map((input, index) => (
                    <AddressInputContainer key={index}>
                      <Input
                        type="text"
                        placeholder="원하는 위치를 입력하세요."
                        value={input}
                        onChange={(e) => handleAddressInputChange(index, e.target.value)}
                      />
                      {index > 0 && <RemoveButton onClick={() => removeAddressInput(index)}>X</RemoveButton>}
                    </AddressInputContainer>
                  ))}
                </AddressListContainer>
                <AddFriendButton onClick={addAddressInput}>친구 추가하기</AddFriendButton>
              </Step>

              <Step>
                <StepTitle>[Step 2] 분위기와 목적</StepTitle>
                <StepDescription>원하는 장소의 특징을 자유롭게 알려주세요.</StepDescription>
                <Textarea placeholder="예: 강남역 근처에서 친구랑 조용히 얘기할 수 있는 카페" />
              </Step>

              <Step>
                <StepTitle>[Step 3] 예산 설정</StepTitle>
                <BudgetSlider value={budgetRange} onChange={setBudgetRange} />
              </Step>

              <RecommendButton onClick={handleRecommendClick}>추천받기</RecommendButton>
            </FormContainer>
          )}
        </SearchResultsContainer>

        {/* 네이버 지도 */}
        <MapContainer>
          <NavermapsProvider ncpKeyId={mapClientId}>
            {/* 마커가 준비된 후에만 지도 렌더링, center prop 제거 */}
            {markers.length > 0 ? (
              <MapComponent
                markers={markers}
                onMarkerClick={moveToDetailPage} // 클릭 핸들러 전달
                onMarkerHover={handleMarkerHover} // 호버 핸들러 전달
                currentLocation={currentLocation} // New prop
              />
            ) : (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                지도 로딩 중...
              </div>
            )}
          </NavermapsProvider>
          <CurrentLocationButton onClick={handleGetCurrentLocation}>📍 현재 위치 불러오기</CurrentLocationButton>
        </MapContainer>
      </ContentsContainer>

      {isDetailModalOpen && (
        <CommonModal title="장소 상세 정보" onClose={closeDetailModal}>
          <DetailPlacePage isModal={true} onClose={closeDetailModal} roomId={selectedRoomId} />
        </CommonModal>
      )}

      {isManageModalOpen && (
        <CommonModal title="장소 관리" onClose={closeManageModal}>
          <ManageMyPlacePage isModal={true} onClose={closeManageModal} />
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

const MapContainer = styled.div`
  width: 60%;
  margin: 10px;
`;

const CurrentLocationButton = styled.button`
  position: absolute;
  top: 70px;
  right: 20%; /* 수평 중앙 정렬 */
  transform: translateX(-50%); /* 정확한 중앙 정렬을 위한 조정 */
  z-index: 1000;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 20px; /* 둥근 모서리 (원형이 아닌) */
  padding: 10px 15px; /* 내용에 따라 크기 조절을 위한 패딩 */
  display: flex; /* 내용 중앙 정렬을 위해 유지 */
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  font-size: 16px; /* 패딩과 더 잘 어울리도록 폰트 크기 조정 */
  color: #333;
  white-space: nowrap; /* 텍스트 줄바꿈 방지 */
  &:hover {
    background-color: #f0f0f0;
  }
`;

const SearchResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid black;
  flex: 1;
  margin: 10px;
  overflow-y: auto;
`;

const AddressListContainer = styled.div`
  margin-bottom: 10px;
`;

const AddressInputContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
`;

const RemoveButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  margin-left: 10px;
  cursor: pointer;

  &:hover {
    background-color: #c82333;
  }
`;

const FormContainer = styled.div`
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
`;

const Step = styled.div`
  margin-bottom: 25px;
`;

const StepTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
`;

const StepDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
`;

const Textarea = styled.textarea`
  width: 95%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  display: block;
  margin: 0 auto;
`;

const RecommendButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }
`;

const AddFriendButton = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background-color: #218838;
  }
`;

const BackButton = styled.button`
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 15px;
  margin: 10px;
  cursor: pointer;
  align-self: flex-start;

  &:hover {
    background-color: #5a6268;
  }
`;
