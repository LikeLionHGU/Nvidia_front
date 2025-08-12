import React from "react";
import "./../styles/global.css";
import { useNavigate } from "react-router-dom";

function ManageMyPlacePage() {
    const navigate = useNavigate();

    const moveToHomePage = () => {
      navigate('/');
    }
  
    return (
        <div>
        <h1 style={{cursor:"pointer"}}onClick={moveToHomePage}>로고</h1>
        <h1>장소 상세정보 페이지</h1>
      </div>
  );
}
export default ManageMyPlacePage;