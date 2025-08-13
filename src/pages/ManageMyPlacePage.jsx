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
        <h1>장소 관리 페이지</h1>
        <h2>API put(전체)/patch(일부) 호출 (정보수정)</h2>
      </div>
  );
}
export default ManageMyPlacePage;