import React from "react";
import "./../styles/global.css";

function ManageMyPlacePage({ isModal = false, onClose }) {
  return (
    <div>
      {!isModal && (
        <h1 style={{ cursor: "pointer" }} onClick={() => window.history.back()}>
          로고
        </h1>
      )}
      <h1>장소 관리 페이지</h1>
      <h2>API put(전체)/patch(일부) 호출 (정보수정)</h2>
    </div>
  );
}

export default ManageMyPlacePage;
