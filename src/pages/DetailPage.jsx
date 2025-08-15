import React, { useEffect, useState } from "react";
import axios from "axios";
import "./../styles/global.css";

function DetailPage({ isModal = false, onClose, roomId }) {
  const [roomData, setRoomData] = useState(null);

  // 임시 데이터
  const dummyData = [
    {
      roomId: 1,
      photo: "https://pbs.twimg.com/media/GUyPp8eaYAAhzbz.jpg",
      address: { latitude: "37.4782", longitude: "127.0282" },
      maxPeople: 4,
      phoneNumber: "010-1234-5678",
      price: 50000,
      roadName: "서울특별시 서초구 서초중앙로 188",
    },
    {
      roomId: 2,
      photo: "https://i.pinimg.com/736x/d5/43/5a/d5435a7ab5b8756ae76b048f9c7967a4.jpg",
      address: { latitude: "37.4592", longitude: "127.1292" },
      maxPeople: 2,
      phoneNumber: "010-8765-4321",
      price: 30000,
      roadName: "서울특별시 강남구 개포로 623",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 실제 API 호출 (현재는 주석 처리)
        /*
        const res = await axios.get(`/reservation/${roomId}`);
        setRoomData(res.data);
        */

        // 더미 데이터에서 찾기
        const found = dummyData.find((item) => item.roomId === Number(roomId));
        setRoomData(found || null);
      } catch (error) {
        console.error("방 정보를 불러오지 못했습니다.", error);
      }
    };

    if (roomId) fetchData();
  }, [roomId]);

  if (!roomData) {
    return <div>로딩중...</div>;
  }

  return (
    <div>
      {!isModal && (
        <h1 style={{ cursor: "pointer" }} onClick={() => window.history.back()}>
          로고
        </h1>
      )}
      <h1>장소 상세정보 페이지</h1>
      <img
        src={roomData.photo}
        alt="장소 사진"
        style={{ width: "300px", borderRadius: "8px" }}
      />
      <h3>방번호: {roomData.roomId}</h3>
      <p>주소: {roomData.roadName}</p>
      <p>최대 인원: {roomData.maxPeople}명</p>
      <p>연락처: {roomData.phoneNumber}</p>
      <p>가격: {roomData.price.toLocaleString()}원</p>
    </div>
  );
}

export default DetailPage;