import React from "react";
import styled from "styled-components";

const SearchResultItem = ({ children, onClick, onMouseEnter, onMouseLeave, isHovered }) => {
  return (
    <ItemContainer onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} isHovered={isHovered}>
      {children}
    </ItemContainer>
  );
};

export default SearchResultItem;

const ItemContainer = styled.div`
  display: flex;
  width: 100%;
  height: 120px;
  border-radius: 8px;
  border: 0.8px solid #f3f3f3;
  background: #fff;
  box-shadow: 0 0 13.5px 0 rgba(0, 0, 0, 0.03);
  &:hover {
    background-color: #f5f5f5;
  }
  margin-bottom: 14px;
`;

export const ResultPhoto = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  margin-right: 10px;
  border-radius: 10px;
  border-radius: 8px 0 0 8px;
`;

export const ResultInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28px 24px 28px 16px;
`;

export const InfoContent = styled.div`
  font-size: 14px;
  color: #333;
  display: flex;
  flex-direction: column;
`;

export const ResultDetails = styled.div`
  font-size: 12px;
  color: #666;
`;

export const ResultPrice = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: #000;
`;
