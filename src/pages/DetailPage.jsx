import React from "react";
import "./../styles/global.css";
import { useNavigate } from "react-router-dom";

function DetailPlacePage() {
    const navigate = useNavigate();

    const moveToHomePage = () => {
      navigate('/');
    }
  
    return (
        <div>
        <h1 style={{cursor:"pointer"}}onClick={moveToHomePage}>로고</h1>
        <h1>장소 상세정보 페이지</h1>
        <h2>장소 상세정보 불러와서 이미지파일, 텍스트 정보들 배치</h2>
      </div>
  );
}

export default DetailPlacePage;
