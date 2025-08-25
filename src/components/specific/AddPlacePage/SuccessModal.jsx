
import React from 'react';
import styled from 'styled-components';
import Logo from '../../../assets/icons/LogoWhite.svg';
import {useNavigate} from "react-router-dom";




const SuccessModal = ({ show, onClose, previewUrl, name }) => {
  const navigate = useNavigate();

  if (!show) {
    return null;
  }

  

  return (
    <Overlay onClick={onClose}>
      <SuccessCard onClick={(e) => e.stopPropagation()}>
        <SuccessHead>
          <BrandLogo src={Logo} alt="SPACEON Logo" />
          <HeadMsg>해당 공실이 예약되었습니다. 예약 내역을 조회해보세요.</HeadMsg>
        </SuccessHead>

        <ThumbWrap>
          {previewUrl ? (
            <Thumb src={previewUrl} alt="uploaded preview" />
          ) : (
            <ThumbPlaceholder>이미지 없음</ThumbPlaceholder>
          )}
        </ThumbWrap>

        <CenterText>
          <HostName>{name || "호스트"} Host님!</HostName>
          <BigMsg>공실이 등록되었어요!</BigMsg>
        </CenterText>

        <Actions>
          <PrimaryBtn onClick={()=>navigate("/manage-page")}>확인</PrimaryBtn>
        </Actions>
      </SuccessCard>
    </Overlay>
  );
};

export default SuccessModal;

const Overlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000;
`;

const SuccessCard = styled.div`
  width: 780px;
  height: 590px;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 18px 48px rgba(0,0,0,0.18);
`;

const SuccessHead = styled.div`
  background: #0D87FF;
  color: #fff;
  padding: 22px 18px 170px; /* 아래로 파란 영역 */
  text-align: center;
`;

const BrandLogo = styled.img`
  height: 48px;
  object-fit: contain;
`;

const HeadMsg = styled.div`
  margin-top: 8px; font-weight: 700;
`;

const ThumbWrap = styled.div`
  display: flex; justify-content: center;
  margin-top: -140px; /* 파란 영역에서 겹쳐 보이게 */
`;

const Thumb = styled.img`
  width: 280px; height: 280px; object-fit: cover;
  border-radius: 5px;
  box-shadow: 0 8px 18px rgba(0,0,0,0.12);
`;

const ThumbPlaceholder = styled.div`
  width: 280px; height: 280px; border-radius: 12px;
  border: 6px solid #fff; background: #F1F5F9;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; color: #94A3B8;
`;

const CenterText = styled.div`
  text-align: center; padding: 24px 18px 8px;
  font-size: 20px;
`;

const HostName = styled.div`
  font-weight: 700; color: black; margin-bottom: 6px;
`;

const BigMsg = styled.div`
  font-size: 26px; font-weight: 700;
`;

const Actions = styled.div`
  display: flex; padding: 18px;
  justify-content: center;
`;

const BaseBtn = styled.button`
  min-width: 140px; height: 44px;
  border-radius: 8px; font-weight: 800; font-size: 16px;
  cursor: pointer; transition: transform .06s ease, filter .15s ease;
  &:active { transform: scale(0.98); }
`;

const PrimaryBtn = styled(BaseBtn)`
  background: #2FB975; color: #fff; border: none;
  &:hover { filter: brightness(1.1); }
`;
