import React from "react";
import "./../styles/global.css";

function DetailPage({ isModal = false, onClose, roomId }) {
  return (
    <div>
      {!isModal && (
        <h1 style={{ cursor: "pointer" }} onClick={() => window.history.back()}>
          로고
        </h1>
      )}
      <h1>장소 상세정보 페이지</h1>
      <h2>장소 상세정보 불러와서 이미지파일, 텍스트 정보들 배치</h2>
      <h3>방번호 {roomId}</h3>
    </div>
  );
}

export default DetailPage;