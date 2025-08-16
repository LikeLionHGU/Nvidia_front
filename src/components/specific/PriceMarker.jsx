import React from 'react';
import styled from 'styled-components';

const MarkerContainer = styled.div`
  background-color: #4CAF50; /* Green background */
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  font-weight: bold;
  position: relative;
  cursor: pointer;
  white-space: nowrap;
  transform: translate(-50%, -100%); /* Adjust to position the marker correctly relative to its point */

  /* Pointy bottom */
  &::after {
    content: '';
    position: absolute;
    bottom: -10px; /* Adjust to control how far down the point goes */
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 20px; /* Size of the point */
    height: 20px; /* Size of the point */
    background-color: #4CAF50; /* Same as background */
    border-bottom-right-radius: 3px; /* Slightly rounded point */
    z-index: -1; /* Send behind the text */
  }
`;

const PriceMarker = ({ price, onClick, onMouseEnter, onMouseLeave }) => {
  return (
    <MarkerContainer onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {price} /30분
    </MarkerContainer>
  );
};

export default PriceMarker;
