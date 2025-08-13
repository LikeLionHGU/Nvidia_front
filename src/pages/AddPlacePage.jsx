import React from "react";
import "./../styles/global.css";
import { useNavigate } from "react-router-dom";

function AddPlacePage() {
  const navigate = useNavigate();

  const moveToHomePage = () => {
    navigate('/');
  }

  return (
      <div>
        <h1 style={{cursor:"pointer"}}onClick={moveToHomePage}>로고</h1>
        <h1>장소등록 페이지</h1>
        <h2>여기서는 등록정보 Post</h2>
        <h3>Post할 데이터</h3>
        <li>이미지(여러장)</li>
        <li>텍스트 정보들</li>
      </div>
  );
}

export default AddPlacePage;