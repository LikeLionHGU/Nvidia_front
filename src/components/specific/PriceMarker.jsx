import React from 'react';
import styled from 'styled-components';
import MarkerPoint from "../../assets/icons/MarkerPoint.svg";

const MarkerContainer = styled.div`
  background-color: #2FB975; /* Green background */
  color: white;
  padding: 10px 20px;
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  white-space: nowrap;
  transform: translate(-50%, -100%); /* Adjust to position the marker correctly relative to its point */

  display: flex;             
  flex-direction: column;     
  align-items: center;        
  justify-content: center;    

  color: #FFF;
  font-family: Roboto;
  font-size: 16.308px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;

  /* Pointy bottom */
  &::after {
    content: '';
    position: absolute;
    bottom: -7px; /* 👈 조금만 내려오게 */
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 12px;  /* 👈 크기 줄여서 얄상하게 */
    height: 16px; /* 👈 크기 줄여서 얄상하게 */
    background-color: #2FB975; /* Same as background */
    border-bottom-right-radius: 2px; /* 👈 라운드도 살짝 줄임 */
    z-index: 21; /* Send behind the text */
  }
`;

const Per30min = styled.div`
  color: #FFF;
  font-family: Roboto;
  font-size: 7.725px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  margin-top: -2px;
`;

const MarkerTail = styled.img`
  position: absolute;
  bottom: -25px;   /* 박스 아래 조금 내려오게 */
  left: calc(50% - 1.5px);
  transform: translateX(-50%);
  width: 30px;    /* 아이콘 크기 조절 */
  height: auto;
  z-index: 10;    /* MarkerContainer 뒤로 */
`;

const NumberCircle = styled.div`
  position: absolute;
  top: -15px;            
  left: 50%;               
  transform: translateX(-50%); 
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: white;
  color: black;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
`;

const PriceMarker = ({ price, onClick, onMouseEnter, onMouseLeave, number }) => {
  return (
    <MarkerContainer onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <NumberCircle>{number}</NumberCircle>
      {price}원
      <Per30min>30min</Per30min>
      <MarkerTail src={MarkerPoint} alt="Marker Tail" />
    </MarkerContainer>
  );
};

export default PriceMarker;