// DetailPage.jsx (변경본)
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import "./../styles/global.css";
import { useNavigate } from "react-router-dom";
import { getRecommendDetail } from "../apis/recommend";

import MaxPeopleNumTable from "../assets/icons/MaxPeopleNumTable.svg";
import LocationTable from "../assets/icons/LocationTable.svg";
import MoodTable from "../assets/icons/MoodTable.svg";
import PhoneNumTable from "../assets/icons/PhoneNumTable.svg";
import OpeningTimeTable from "../assets/icons/OpeningTimeTable.svg";
import PriceTable from "../assets/icons/PriceTable.svg";
import CheckBoxIcon from "../assets/icons/CheckBox.svg";

function DetailPage({ onClose, roomId }) {
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!roomId) return;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await getRecommendDetail(roomId);
        setRoomData(data);
      } catch (error) {
        console.error("Failed to fetch room details:", error);
        // TODO: 에러 처리 UI 추가
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [roomId]);

  if (loading) {
    return (
      <ModalBackground>
        <Wrapper>로딩중...</Wrapper>
      </ModalBackground>
    );
  }
  if (!roomData) {
    return (
      <ModalBackground>
        <Wrapper>정보를 불러오지 못했습니다.</Wrapper>
      </ModalBackground>
    );
  }

  const {
    photoList = [],
    address,
    maxPeople,
    phoneNumber,
    openingTime,
    memo,
    chipList = [],
    optionList = [],
    price,
  } = roomData;

  const handleReserve = (id) => navigate(`/reservation-page/${id}`);
  const maskPhone = (p) => p.replace(/(\d{3})-?(\d{4})-?(\d{4})/, "$1-$2-****");

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? photoList.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === photoList.length - 1 ? 0 : prev + 1));
  };

  const handleImageClick = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <ModalBackground>
      <Overlay onClick={onClose} />
      <Wrapper>
        <ImgContainer>
          {photoList.length > 0 && (
            <>
              <MainImgWrapper>
                <MainImg src={photoList[currentImageIndex]} alt="장소 대표 사진" />
                {photoList.length > 1 && (
                  <>
                    <ArrowButton left onClick={handlePrevImage}>
                      ❮
                    </ArrowButton>
                    <ArrowButton right onClick={handleNextImage}>
                      ❯
                    </ArrowButton>
                    <ImageCounter>
                      {currentImageIndex + 1}/{photoList.length}
                    </ImageCounter>
                  </>
                )}
              </MainImgWrapper>
              {photoList.length > 1 && (
                <SubImgContainer>
                  {photoList.map((photo, index) => (
                    <SubImageWrapper key={index} isActive={index === currentImageIndex}>
                      <img src={photo} alt={`photo-${index + 1}`} onClick={() => handleImageClick(index)} />
                    </SubImageWrapper>
                  ))}
                </SubImgContainer>
              )}
            </>
          )}
        </ImgContainer>

        <RightContainer>
          <TitleAddress>{address?.roadName}</TitleAddress>

          {/* === 아이콘 2열 테이블 섹션 === */}
          <InfoTable>
            <InfoRow>
              <InfoCell>
                <Icon src={LocationTable} alt="" />
                <Texts>
                  <MainText>{address?.roadName}</MainText>
                </Texts>
              </InfoCell>
              <InfoCell>
                <Icon src={OpeningTimeTable} alt="" />
                <Texts>
                  <MainText>
                    {openingTime || "영업시간 정보 없음"} <SubText>(영업시간)</SubText>
                  </MainText>
                </Texts>
              </InfoCell>
            </InfoRow>

            <InfoRow>
              <InfoCell>
                <Icon src={PhoneNumTable} alt="" />
                <Texts>
                  <MainText>{maskPhone(phoneNumber)}</MainText>
                </Texts>
              </InfoCell>
              <InfoCell>
                <Icon src={MaxPeopleNumTable} alt="" />
                <Texts>
                  <MainText>수용인원 {maxPeople}명</MainText>
                </Texts>
              </InfoCell>
            </InfoRow>

            <InfoRow>
              <InfoCell>
                <Icon src={PriceTable} alt="" />
                <Texts>
                  <MainText>
                    {Number(price).toLocaleString()}원<SubText>(30min 당)</SubText>
                  </MainText>
                </Texts>
              </InfoCell>
              <InfoCell as="div">
                <Icon src={MoodTable} alt="" />
                <ChipList>
                  {chipList.map((c, i) => (
                    <Chip key={i}>{c}</Chip>
                  ))}
                </ChipList>
              </InfoCell>
            </InfoRow>
          </InfoTable>
          {/* === /아이콘 2열 테이블 === */}
          <BottomContent>
            <OptionContainer>
              {optionList.length > 0 && (
                <>
                  <SectionTitle>제공되는 항목</SectionTitle>
                  <OptionUl>
                    {optionList.map((opt, i) => (
                      <li key={i}>
                        <img src={CheckBoxIcon} alt="체크" width="12" height="12" />
                        {opt}
                      </li>
                    ))}
                  </OptionUl>
                </>
              )}
            </OptionContainer>
            <MemoContainer>
              {memo && (
                <>
                  <MemoBox>
                    <SectionTitle>Host 안내 사항</SectionTitle>
                    <MemoWrapper>{memo}</MemoWrapper>
                  </MemoBox>
                </>
              )}
            </MemoContainer>
          </BottomContent>

          <BtnContainer>
            <CancelBtn onClick={onClose}>취소</CancelBtn>
            <ReserveBtn onClick={() => handleReserve(roomData.roomId)}>예약하기</ReserveBtn>
          </BtnContainer>
        </RightContainer>
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
  align-items: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  width: 1000px;
  height: 491px;
  padding: 60px 36px;
  border-radius: 12px;
  overflow-y: auto;
`;

const ImgContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;

const MainImgWrapper = styled.div`
  position: relative;
  width: 408px;
  height: 401px;
`;

const MainImg = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 6.872px;
  object-fit: cover;
`;

const ArrowButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${(props) => (props.left ? "left: 15px;" : "right: 15px;")}
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;

const ImageCounter = styled.div`
  position: absolute;
  bottom: 15px;
  right: 15px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
`;

const SubImgContainer = styled.div`
  width: 408px;
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 8px;
`;

const SubImageWrapper = styled.div`
  cursor: pointer;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid ${(props) => (props.isActive ? "#0089fc" : "transparent")};

  img {
    width: 73px;
    height: 73px;
    object-fit: cover;
    display: block;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.8;
    }
  }
`;

const RightContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 24px;
  flex: 1;
`;

const TitleAddress = styled.h2`
  color: #0089fc;
  font-family: Pretendard, sans-serif;
  font-size: 32.196px;
  font-weight: 700;
  line-height: 54.486px;
  letter-spacing: 1.981px;
  margin: 0 0 8px;
`;

/* ====== 아이콘 2열 테이블 ====== */
const InfoTable = styled.div`
  border-top: 0.71px solid #ddd;
  border-bottom: 0.71px solid #ddd;
  margin: 8px 0 16px;
  color: #8b8b8b;
  font-size: 12.433px;
  line-height: 21.313px;
`;
const InfoRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 16px 0 16px 24px;

  & + & {
    border-top: 0.71px solid #ddd;
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;
const InfoCell = styled.div`
  display: flex;
  align-items: center;
  min-height: 28px;
  gap: 10px;
`;
const Icon = styled.img`
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
`;
const Texts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;
const MainText = styled.span`
  color: #2b2b2b;
  font-size: 15px;
  line-height: 1.45;
`;
const SubText = styled.span`
  color: #8b8b8b;
  font-size: 12px;
  margin-left: 4px;
`;

const ChipList = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;
const Chip = styled.span`
  display: flex;
  height: 16.275px;
  padding: 4.547px;
  justify-content: center;
  align-items: center;
  gap: 4.547px;
  border-radius: 2.959px;
  border: 0.4px solid #f2f2f2;
  background: #fff;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.05);
  color: #030303;
  text-align: center;
  font-family: Pretendard;
  font-size: 9px;
  font-style: normal;
  font-weight: 700;
  line-height: 24.777px;
  letter-spacing: 0.901px;
`;

const SectionTitle = styled.h4`
  color: #000;
  text-align: center;
  font-family: Pretendard;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  margin: 8px 0;
`;

const OptionUl = styled.ul`
  margin: 0;
  padding: 8px 28px 8px 8px;
  list-style: none;

  li {
    margin: 4px 0;
    display: flex;
    align-items: center;
    gap: 6px;
    color: #000;
    font-family: Pretendard;
    font-size: 11px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
  }
`;

const MemoContainer = styled.div`
  flex: 1;
  margin-left: 16px;
`;

const MemoBox = styled.div`
  white-space: pre-wrap;
  background: #fafafa;
  border: 1px solid #eee;
  height: 180px;
  border-radius: 4px;
  font-size: 13px;
  color: #444;
  margin-bottom: 8px;
`;

const MemoWrapper = styled.div`
  margin-top: 13px;
  margin-left: 13px;
`;

const BtnContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 8px;
`;

const BottomContent = styled.div`
  display: flex;
  justify-content: space-between;
`;

const OptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 117px;
  height: 180px;
  flex-shrink: 0;
  align-items: center;
  border-radius: 4px;
  border: 1.414px solid #f3f3f3;
  background: #fafafa;
`;

const ButtonBase = styled.button`
  display: flex;
  width: 137.788px;
  height: 45.625px;
  padding: 9.125px;
  justify-content: center;
  align-items: center;
  gap: 9.125px;
  border: none;
  font-size: 20px;
  font-weight: 700;
  border-radius: 8px;
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
