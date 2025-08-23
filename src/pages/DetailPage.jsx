import React, { useEffect, useState } from "react";
import styled from "styled-components";
import "./../styles/global.css";
import { useNavigate } from "react-router-dom";
import { getRecommendDetail } from "../apis/recommend";

function DetailPage({ onClose, roomId }) {
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      try {
        setLoading(true);
        const res = await getRecommendDetail(roomId);
        if (mounted) setRoomData(res || null);
      } catch (err) {
        console.error("상세 정보를 불러오지 못했습니다.", err);
        if (mounted) setRoomData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (roomId) fetchData();
    return () => {
      mounted = false;
    };
  }, [roomId]);

  if (loading) {
    return (
      <ModalBackground>
        <Wrapper>
          <div>로딩중...</div>
        </Wrapper>
      </ModalBackground>
    );
  }

  if (!roomData) {
    return (
      <ModalBackground>
        <Wrapper>
          <div>정보를 불러오지 못했습니다.</div>
        </Wrapper>
      </ModalBackground>
    );
  }

  const { photoList = [], address, maxPeople, phoneNumber, memo, chipList = [], optionList = [], price } = roomData;

  const handleReserve = (id) => {
    navigate(`/reservation-page/${id}`);
  };

  return (
    <ModalBackground>
      <Overlay onClick={onClose} />
      <Wrapper>
        <div className="title">장소 상세정보 페이지</div>

        <div className="save-content">
          {/* 메인 사진 */}
          {photoList?.[0] && (
            <img
              src={photoList[0]}
              alt="장소 대표 사진"
              style={{ width: "320px", height: "auto", borderRadius: "8px", objectFit: "cover" }}
            />
          )}

          {/* 서브 사진 슬림 갤러리 */}
          {photoList.length > 1 && (
            <Thumbs>
              {photoList.slice(1).map((p, i) => (
                <img key={i} src={p} alt={`photo-${i + 1}`} />
              ))}
            </Thumbs>
          )}

          <h3>방번호: {roomData.roomId}</h3>
          <p>주소: {address?.roadName}</p>
          <p>
            좌표: {address?.latitude}, {address?.longitude}
          </p>
          <p>최대 인원: {maxPeople}명</p>
          <p>연락처: {phoneNumber}</p>
          <p>가격: {Number(price).toLocaleString()}원</p>

          {chipList.length > 0 && (
            <>
              <SectionTitle>특징</SectionTitle>
              <ChipRow>
                {chipList.map((chip, i) => (
                  <Chip key={i}>{chip}</Chip>
                ))}
              </ChipRow>
            </>
          )}

          {optionList.length > 0 && (
            <>
              <SectionTitle>옵션</SectionTitle>
              <OptionList>
                {optionList.map((opt, i) => (
                  <li key={i}>{opt}</li>
                ))}
              </OptionList>
            </>
          )}

          {memo && (
            <>
              <SectionTitle>메모</SectionTitle>
              <MemoBox>{memo}</MemoBox>
            </>
          )}
        </div>

        <BtnContainer>
          <CancelBtn onClick={onClose}>취소</CancelBtn>
          <ReserveBtn onClick={() => handleReserve(roomData.roomId)}>예약하기</ReserveBtn>
        </BtnContainer>
      </Wrapper>
    </ModalBackground>
  );
}

export default DetailPage;

/* ===== styles ===== */
const modalBase = `
  width: 100vw;
  height: 100vh;
  top: 0; left: 0; right: 0; bottom: 0;
  position: fixed;
`;
const ModalBackground = styled.div`
  ${modalBase}
  background: rgba(0,0,0,0.2);
  z-index: 4;
`;
const Overlay = styled.div`
  ${modalBase}
`;
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  width: 80vw;
  max-width: 800px;
  min-height: 500px;
  max-height: 90vh;
  border-radius: 12px;
  overflow-y: auto;
  padding-bottom: 16px;

  .title {
    font-size: 18px;
    font-weight: 700;
    margin: 18px 0 8px;
    line-height: 150%;
  }
  .save-content {
    width: 90%;
    font-size: 14px;
    text-align: left;
    line-height: 150%;
  }
`;
const BtnContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin: 16px 0;
`;
const ButtonBase = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  outline: none;
  border: none;
  border-radius: 8px;
  width: 201px;
  height: 37px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
`;
const CancelBtn = styled(ButtonBase)`
  color: #b3b3b3;
  background: #f7f7f7;
  &:hover {
    filter: brightness(0.95);
  }
  &:active {
    background: #26945e;
    color: #fff;
  }
`;
const ReserveBtn = styled(ButtonBase)`
  color: #fff;
  background: #2fb975;
  &:hover {
    filter: brightness(1.1);
  }
  &:active {
    background: #26945e;
  }
`;

const Thumbs = styled.div`
  display: flex;
  gap: 8px;
  margin: 10px 0 4px;
  img {
    width: 90px;
    height: 70px;
    object-fit: cover;
    border-radius: 6px;
  }
`;
const SectionTitle = styled.h4`
  margin: 12px 0 6px;
  font-size: 15px;
  font-weight: 700;
`;
const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;
const Chip = styled.span`
  padding: 6px 10px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  font-size: 12px;
  color: #334155;
`;
const OptionList = styled.ul`
  margin: 0;
  padding-left: 18px;
  li {
    margin: 2px 0;
  }
`;
const MemoBox = styled.div`
  white-space: pre-wrap;
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 10px;
  font-size: 13px;
  color: #444;
`;
