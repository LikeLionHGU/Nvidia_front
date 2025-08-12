import React from "react";
import MapComponent from "../apis/MapComponent";
import { NavermapsProvider } from "react-naver-maps";
import { useNavigate } from "react-router-dom";
import "./../styles/global.css";

function HomePage() {
  const navigate = useNavigate();

  const moveToAddPlacePage = () => {
    navigate('/add-place');
  }

  const moveToDetailPage = () => {
    navigate('/detail-page');
  }

  const moveToManagePage = () => {
    navigate('/manage-page');
  }

  const mapClientId = import.meta.env.VITE_MAP_CLIENT_ID;
  const markers = [
    { position: { lat: 37.5037, lng: 127.0448 }, title: "강남구 테헤란로 131" },
    { position: { lat: 37.4959, lng: 127.0198 }, title: "서초구 서초대로77길 54" },
    { position: { lat: 37.5663, lng: 126.9779 }, title: "중구 세종대로 110" },
  ];

  return (
    <NavermapsProvider ncpKeyId={mapClientId}> 
    {/* ncpClientID 였는데 ncpKeyId로 바뀜 절대 수정 금지 */}
      <div>
        <h1>홈페이지</h1>
        <h2 style={{cursor:"pointer"}} onClick={moveToAddPlacePage}>장소등록</h2>
        <h2 style={{cursor:"pointer"}} onClick={moveToDetailPage}>장소상세</h2>
        <h2 style={{cursor:"pointer"}} onClick={moveToManagePage}>장소관리</h2>
        <MapComponent markers={markers} />
      </div>
    </NavermapsProvider>
  );
}


export default HomePage;
