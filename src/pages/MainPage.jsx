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

function MainPage() {
  const [markers, setMarkers] = useState([]); // 기본 장소 마커들
  const [recommendList, setRecommendList] = useState([]); // 추천 장소 목록 (API 연동 전 더미 데이터)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);

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

  // 1. 초기 로딩 시 추천 목록(더미 데이터) 가져오고, 마커와 주소 설정
  useEffect(() => {
    // API 연동 전까지 사용할 더미 데이터
    const dummyRecommendList = [
      {
        roomId: 1,
        photo: "https://pbs.twimg.com/media/GUyPp8eaYAAhzbz.jpg",
        address: { latitude: "37.4782", longitude: "127.0282" },
        maxPeople: 4, phoneNumber: "010-1234-5678", price: 50000,
        roadName: "서울특별시 서초구 서초중앙로 188",
      },
      {
        roomId: 2,
        photo: "https://i.pinimg.com/736x/d5/43/5a/d5435a7ab5b8756ae76b048f9c7967a4.jpg",
        address: { latitude: "37.4592", longitude: "127.1292" },
        maxPeople: 2, phoneNumber: "010-8765-4321", price: 30000,
        roadName: "서울특별시 강남구 개포로 623",
      },
    ];

    setRecommendList(dummyRecommendList);

    // 더미 데이터 기반으로 지도에 표시할 마커 생성
    const newMarkers = dummyRecommendList.map(item => ({
      position: { lat: parseFloat(item.address.latitude), lng: parseFloat(item.address.longitude) },
      title: `장소 ${item.roomId}`
    }));
    setMarkers(newMarkers);
  }, []); // 컴포넌트 마운트 시 1회만 실행

  const moveToAddPlacePage = () => navigate("/add-place");
  // const moveToDetailPage = (roomId) => navigate(`/detail-page/${roomId}`);
  // const moveToManagePage = () => navigate("/manage-page");

  const mapClientId = import.meta.env.VITE_MAP_CLIENT_ID;

  return (
    <div>
      {/* 상단 네비게이션 */}
      <div>
        <span>홈페이지 </span>
        <span style={{ cursor: "pointer" }} onClick={moveToAddPlacePage}>장소등록{" "}</span>
        <span style={{ cursor: "pointer" }} onClick={moveToManagePage}>장소관리</span>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <ContentsContainer>
        <AIsearchContainer>AI 검색</AIsearchContainer>
        
        {/* 장소 검색 결과 목록 */}
        <SearchResultsContainer>
          {recommendList.map((item) => (
            <SearchResultItem
              key={item.roomId}
              onClick={() => moveToDetailPage(item.roomId)}
              // onClick={moveToDetailPage}
            >
              <ResultPhoto src={item.photo} alt="장소 사진" />
              <ResultInfo>
                <ResultAddress>
                  주소: {item.roadName}
                </ResultAddress>
                <ResultDetails>
                  최대인원: {item.maxPeople}명 | 연락처: {item.phoneNumber}
                </ResultDetails>
                <ResultPrice>{item.price.toLocaleString()}원</ResultPrice>
              </ResultInfo>
            </SearchResultItem>
          ))}
        </SearchResultsContainer>

        {/* 네이버 지도 */}
        <MapContainer>
          <NavermapsProvider ncpKeyId={mapClientId}>
            <MapComponent 
              markers={markers}
              center={{ lat: 37.4782, lng: 127.0282 }}
            />
          </NavermapsProvider>
        </MapContainer>
        
      </ContentsContainer>

      {isDetailModalOpen && (
        <CommonModal title="장소 상세 정보" onClose={closeDetailModal}>
          <DetailPlacePage isModal={true} onClose={closeDetailModal} roomId={selectedRoomId}/>
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


const ContentsContainer = styled.div`
  display: flex;
  width: 100%;
  height: 90vh;
`;

const MapContainer = styled.div`
  width: 33%;
  margin: 10px;
`;

const AIsearchContainer = styled.div`
  display: flex;
  border: 1px solid black;
  flex: 1;
  margin: 10px;
`;

const SearchResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid black;
  flex: 1;
  margin: 10px;
`;

const SearchBarContainer = styled.div`
  border: 1px solid black;
  margin: 10px;
`;