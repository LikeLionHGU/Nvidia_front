import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import LogoWhite from '../../../assets/icons/LogoWhite.svg';
import ResSelectionSummary from './ResSelectionSummary';

const ResSuccessModal = ({ isOpen, onClose, details, slotsByDate }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const {
    name = '사용자',
    phone = '010-0000-0000',
    headcount = 1,
    totalPrice = 0,
    pricePer30min = 0,
    hours = 0,
    date,
    time,
  } = details || {};

  const money = (n) => n.toLocaleString();
  const navigate = useNavigate();

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <GreenSection>
          <Logo src={LogoWhite} alt="SPACEON" />
          <ModalText>
            해당 공실이 예약되었습니다. <br/> 호스트의 전화번호는 예약조회에서 확인하실 수 있습니다!
          </ModalText>
        </GreenSection>

        <WhiteSection>
          {/* --- 예약자 세부 정보 --- */}
          <SectionRow>
            <SectionTitle>예약자 세부 정보</SectionTitle>

            <SectionBody>
              <DetailsBox>
                <InfoColumn>
                  <InfoPair>
                    <InfoLabel>예약자 성함</InfoLabel>
                    <InputLike>{name}</InputLike>
                  </InfoPair>
                  <InfoPair>
                    <InfoLabel>전화번호</InfoLabel>
                    <InputLike>{phone}</InputLike>
                  </InfoPair>
                  <InfoPair>
                    <InfoLabel>사용 인원</InfoLabel>
                    <InputLikeHeadcount>{headcount}명</InputLikeHeadcount>
                  </InfoPair>
                </InfoColumn>

                <SummaryColumn>
                  <SummaryHeader>
                    선택한 총 시간 <SummaryHour>{hours}H</SummaryHour>
                  </SummaryHeader>

                  {/* 우측 요약 리스트: 컴포넌트 있으면 사용, 없으면 플레이스홀더 */}
                  <SummaryScroll>
                    {details ? (
                      <ResSelectionSummary
                        slotsByDate={slotsByDate}
                      />
                    ) : (
                      <SummaryEmpty>날짜와 시간을 선택하면 요약이 표시됩니다.</SummaryEmpty>
                    )}
                  </SummaryScroll>
                </SummaryColumn>
              </DetailsBox>
            </SectionBody>
          </SectionRow>

          {/* --- 요금 세부 정보 --- */}
          <SectionRow>
            <SectionTitle>요금 세부 정보</SectionTitle>

            <SectionBody>
              <DetailsBox>
                <FeeLeft>
                  <TotalAmount>
                    {money(totalPrice)} <Won>원</Won>
                  </TotalAmount>
                </FeeLeft>

                <FeeRight>
                  <FeeItem>30min당 {money(pricePer30min)}원</FeeItem>
                  <FeeItem>{hours}h X {money(pricePer30min * 2)} W</FeeItem>
                </FeeRight>
              </DetailsBox>
            </SectionBody>
          </SectionRow>

          {/* --- 버튼 --- */}
          <ButtonContainer>
            <ConfirmButton onClick={()=>navigate("/manage-page")}>확인</ConfirmButton>
          </ButtonContainer>
        </WhiteSection>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ResSuccessModal;

/* ================= Styled ================= */
const ModalOverlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,.5);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Pretendard';
  z-index: 1000;
`;

const ModalContent = styled.div`
  height: 655px;
  width: 800px;
  background: #fff; border-radius: 16px; overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,.15);
`;

const GreenSection = styled.div`
  background: #34cd82;
  padding: 28px 16px 20px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
`;

const Logo = styled.img`
  width: 240px; height: auto;
`;

const ModalText = styled.p`
  margin: 14px 0 0;
  color: #fff; font-weight: 700; font-size: 18px; text-align: center;
`;

const WhiteSection = styled.div`
  padding: 26px 28px 24px;
`;

const SectionRow = styled.div`
  display: grid;
  grid-template-columns: 160px 1fr;
  align-items: start;
  gap: 18px 22px;
  margin-bottom: 22px;
`;

const SectionTitle = styled.h3`
  margin: 8px 0 0;
  font-size: 16px; font-weight: 600; color: #000;
  white-space: nowrap;
  margin-left: 30px;
`;

const SectionBody = styled.div``;

const DetailsBox = styled.div`
  background: #fafafa;
  border-radius: 10px;
  padding: 22px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

const InfoColumn = styled.div`
  display: grid; gap: 14px;
`;

const InfoPair = styled.div``;

const InfoLabel = styled.div`
  font-size: 13px; color: #666; margin: 0 0 6px;
`;

const InputLike = styled.div`
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 15px; color: #030303;
  font-weight: 600;
`;

const InputLikeHeadcount = styled.div`
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 16px; color: #030303;
  font-weight: 700;
  font-family: Inter;
`;

const SummaryColumn = styled.div`
  display: flex; flex-direction: column; gap: 10px;
`;

const SummaryHeader = styled.div`
  font-size: 14px; color: #666; font-weight: 600;
`;

const SummaryHour = styled.span`
  margin-left: 6px; font-size: 20px;
  color: #2FB975; font-weight: 700;
`;

const SummaryScroll = styled.div`
  background: #fff; border: none; border-radius: 8px;
min-height: 150px; max-height: 210px; overflow: auto;
`;

const SummaryEmpty = styled.div`
  color: #9aa3af; font-size: 14px; padding: 12px 6px;
`;

const FeeLeft = styled.div`
  display: flex; align-items: center;
`;

const TotalAmount = styled.div`
  font-size: 26px; font-weight: 600; color: #000;
  letter-spacing: .5px;
`;

const Won = styled.span`
  font-size: 19px; font-weight: 600; margin-left: 1px;
`;

const FeeRight = styled.div`
  display: flex; flex-direction: column; align-items: flex-start; gap: 6px;
  margin-left: 20px;
`;

const FeeItem = styled.div`
  font-size: 13px; color: #000; font-weight: 600;
  line-height: 16px;
`;

const ButtonContainer = styled.div`
  display: flex; justify-content: center; margin-top: 1px;
`;

const Button = styled.button`
  padding: 13px 52px;
  border-radius: 8px; border: none; cursor: pointer;
  font-size: 16px; font-weight: 800;
  transition: transform .06s ease;
`;

const ConfirmButton = styled(Button)`
  background: #34cd82; color: #fff;
  &:hover { filter: brightness(1.1); }
`;