import React from 'react';
import styled from 'styled-components';

const RecommendationBox = ({ recommendList, isDetailModalOpen, onCardClick }) => {
  // Slice the list to only show the first 3 items
  const displayList = recommendList.slice(0, 3);

  return (
    <FloatingBox isDetailModalOpen={isDetailModalOpen}>
      <TextBox>
        <BoldText>
          내 주변 여기 공실이
          <br />
          제일 가까워요!
        </BoldText>
        <LightText>거리기반으로 추천해줘요</LightText>
      </TextBox>
      <CardContainer>
        {displayList.map((item, index) => (
          <Card key={item.roomId} onClick={() => onCardClick(item.roomId)}>
            <NumberBadge>{index + 1}</NumberBadge>
            <CardImage src={item.photo} alt={`장소 ${item.roomId}`} />
            <CardInfo>
              <Address>{item.roadName}</Address>
              <Price>per 30min / {item.price.toLocaleString()}원</Price>
            </CardInfo>
          </Card>
        ))}
      </CardContainer>
    </FloatingBox>
  );
};

export default RecommendationBox;

const FloatingBox = styled.div`
  position: absolute;
  bottom: 40px;
  left: 70%;
  transform: translateX(-50%);
  width: 33%;
  max-width: 700px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: ${({ isDetailModalOpen }) => (isDetailModalOpen ? 1 : 1000)};
`;

const TextBox = styled.div`
  display: flex;
  flex-direction: column;
`;

const BoldText = styled.p`
  font-weight: bold;
  font-size: 1rem;
  color: #333;
  margin: 0;
`;

const LightText = styled.p`
  font-size: 0.75rem;
  color: #888;
  margin: 5px 0 0 0;
`;

const CardContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const Card = styled.div`
  position: relative;
  width: 140px;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-5px);
  }
`;

const NumberBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #28a745;
  color: white;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
  z-index: 2;
`;

const CardImage = styled.img`
  width: 100%;
  height: 90px;
  object-fit: cover;
`;

const CardInfo = styled.div`
  padding: 10px;
`;

const Address = styled.p`
  font-size: 0.8rem;
  color: #555;
  margin: 0 0 5px 0;
`;

const Price = styled.p`
  font-size: 0.75rem;
  font-weight: bold;
  color: #333;
  margin: 0;
`;
