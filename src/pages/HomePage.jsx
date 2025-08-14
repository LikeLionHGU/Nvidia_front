import React, { useState } from "react";
import MapComponent from "../apis/MapComponent";
import { NavermapsProvider } from "react-naver-maps";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import CommonModal from "../components/common/commonModal";
import DetailPlacePage from "./DetailPage";
import ManageMyPlacePage from "./ManageMyPlacePage";
import "./../styles/global.css";

function HomePage() {
  const navigate = useNavigate();
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  const moveToAddPlacePage = () => {
    navigate("/add-place");
  };

  const moveToDetailPage = () => {
    setIsDetailModalOpen(true);
  };

  const moveToManagePage = () => {
    setIsManageModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
  };

  const closeManageModal = () => {
    setIsManageModalOpen(false);
  };

  const mapClientId = import.meta.env.VITE_MAP_CLIENT_ID;
  const markers = [
    { position: { lat: 37.5037, lng: 127.0448 }, title: "강남구 테헤란로 131" },
    { position: { lat: 37.4959, lng: 127.0198 }, title: "서초구 서초대로77길 54" },
    { position: { lat: 37.5663, lng: 126.9779 }, title: "중구 세종대로 110" },
  ];

  return (
    <div>
      <div>
        <span>홈페이지 </span>
        <span style={{ cursor: "pointer" }} onClick={moveToAddPlacePage}>
          장소등록{" "}
        </span>
        <span style={{ cursor: "pointer" }} onClick={moveToDetailPage}>
          장소상세{" "}
        </span>
        <span style={{ cursor: "pointer" }} onClick={moveToManagePage}>
          장소관리
        </span>
      </div>

      <SearchBarContainer>검색 바</SearchBarContainer>

      <ContentsContainer>
        <AIsearchContainer>AI 검색</AIsearchContainer>
        <SearchResultsContainer>검색결과</SearchResultsContainer>
        <MapContainer>
          <NavermapsProvider ncpKeyId={mapClientId}>
            <MapComponent markers={markers} />
          </NavermapsProvider>
        </MapContainer>
      </ContentsContainer>

      {isDetailModalOpen && (
        <CommonModal title="장소 상세 정보" onClose={closeDetailModal}>
          <DetailPlacePage isModal={true} onClose={closeDetailModal} />
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

export default HomePage;

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
  border: 1px solid black;
  flex: 1;
  margin: 10px;
`;

const SearchBarContainer = styled.div`
  border: 1px solid black;
  margin: 10px;
`;
