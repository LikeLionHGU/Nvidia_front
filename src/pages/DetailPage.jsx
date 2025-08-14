import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNavermaps } from "react-naver-maps";

function DetailPage() {
  const navigate = useNavigate();
  const navermaps = useNavermaps();

  return (
    <div>
      <h1 style={{ cursor: "pointer" }} onClick={() => navigate("/")}>로고</h1>
      <h1>장소 상세정보 페이지</h1>
      <h2>장소 상세정보 불러와서 이미지파일, 텍스트 정보들 배치</h2>
    </div>
  );
}

export default DetailPage;