import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import "./../styles/global.css";
import { useNavigate } from "react-router-dom";

function DetailPage({ onClose, roomId }) {
  const [roomData, setRoomData] = useState(null);

  const navigate = useNavigate();

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
    {
      roomId: 3,
      photo: "https://snvision.seongnam.go.kr/imgdata/snvision/201911/2019112148082756.jpg",
      address: { latitude: "37.3947611", longitude: "127.1111361" },
      maxPeople: 10,
      phoneNumber: "010-8765-2321",
      price: 35000,
      roadName: "경기도 성남시 분당구 판교역로 160 ",
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
    return (
        <ModalBackground>
            <Wrapper>
                <div>로딩중...</div>
            </Wrapper>
        </ModalBackground>
    );
  }

  const handleReserve = (roomId) => {
    navigate(`/reservation-page/${roomId}`);
    // TODO: 예약 API 호출 로직 추가
  };

  return (
    <ModalBackground>
        <Overlay onClick={onClose} />
        <Wrapper>
            <div className="title">장소 상세정보 페이지</div>
            <div className="save-content">
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
            <BtnContainer>
              <CancelBtn className="cancel" onClick={onClose}>취소</CancelBtn>
              <ReserveBtn className="reserve" onClick={() => handleReserve(roomId)}>예약하기</ReserveBtn>
            </BtnContainer>
        </Wrapper>
    </ModalBackground>
  );
}

export default DetailPage;

const modalBase = `
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: fixed;
`;

const ModalBackground = styled.div`
  ${modalBase}
  background: rgba(0, 0, 0, 0.2);
  z-index: 4;
  cursor: default;
`;

const Overlay = styled.div`
  ${modalBase}
  cursor: default;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #ffffff;
  width: 80vw;
  max-width: 800px;
  min-height: 500px;
  max-height: 90vh;
  border-radius: 12px;
  overflow-y: auto;

  .title {
    font-size: 18px;
    font-weight: bold;
    margin-top: 18px;
    margin-bottom: 8px;
    line-height: 150%;
  }

  .save-content {
    width: 90%;
    font-size: 14px;
    text-align: center;
    line-height: 150%;
    flex: 1;
    overflow-y: auto;
  }
`;

const BtnContainer = styled.div`
  display: flex;
  width: 100%;
  height: auto;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
  margin-bottom: 16px;
  gap: 10px;
`;

const CancelBtn = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  outline: none;
  border: none;
  border-radius: 8px;
  width: 201px;
  height: 37px;
  font-size: 14px;
  font-weight: bold;
  color: #B3B3B3;
  background-color: #F7F7F7;
  cursor: pointer;

  &:active {
    background-color: #26945E;
  }

  &:hover {
    filter: brightness(0.95);
  }
`;

const ReserveBtn = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  outline: none;
  border: none;
  border-radius: 8px;
  width: 201px;
  height: 37px;
  font-size: 14px;
  font-weight: bold;
  color: white;
  background-color: #2FB975;
  cursor: pointer;

  &:active {
    background-color: #26945E;
  }

  &:hover {
    filter: brightness(1.1);
  }
`;