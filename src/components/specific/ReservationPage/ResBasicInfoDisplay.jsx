
import React from 'react';
import styled from 'styled-components';
// ResBasicInfoDisplay.jsx

const ResBasicInfoDisplay = ({
  photoList,
  address,
  maxPeople,
  phoneNumber,
  memo,
  chipList,
  optionList,
  price,
  account
}) => {
  return (
    <Container>
      {photoList && photoList.length > 0 && (
        <PhotoSection>
          <img src={photoList[0].photo} alt="대표 이미지" />
        </PhotoSection>
      )}
      <InfoGrid>
        <Label>주소</Label>
        <Value>{address?.roadName}</Value>

        <Label>가격</Label>
        <Value>{price?.toLocaleString()}원 / 시간</Value>
        
        <Label>최대 인원</Label>
        <Value>{maxPeople}명</Value>
        
        <Label>연락처</Label>
        <Value>{phoneNumber}</Value>

        <Label>계좌번호</Label>
        <Value>{account}</Value>
      </InfoGrid>
      
      {chipList && chipList.length > 0 && (
        <>
          <Divider />
          <Label>주요 특징</Label>
          <ChipContainer>
            {chipList.map((chip, index) => <Chip key={index}>{chip}</Chip>)}
          </ChipContainer>
        </>
      )}

      {optionList && optionList.length > 0 && (
        <>
          <Divider />
          <Label>제공 옵션</Label>
          <ChipContainer>
            {optionList.map((opt, index) => <Chip key={index}>{opt}</Chip>)}
          </ChipContainer>
        </>
      )}

      {memo && (
        <>
          <Divider />
          <Label>메모</Label>
          <Value>{memo}</Value>
        </>
      )}
    </Container>
  );
};

export default ResBasicInfoDisplay;


const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-family: 'Pretendard';
`;

const PhotoSection = styled.div`
  /* 간단한 이미지 표시. 필요 시 캐러셀 라이브러리 사용 */
  img {
    width: 100%;
    height: auto;
    max-height: 300px;
    object-fit: cover;
    border-radius: 8px;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 8px 12px;
`;

const Label = styled.span`
  font-weight: 700;
  color: #374151;
`;

const Value = styled.span`
  color: #111827;
`;

const ChipContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.span`
  background-color: #EAF9F2;
  color: #269964;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 600;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #E5E7EB;
  margin: 8px 0;
`;

