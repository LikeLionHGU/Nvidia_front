import React from 'react';
import styled from 'styled-components';

const SearchResultItem = ({ children, onClick }) => {
  return <ItemContainer onClick={onClick}>{children}</ItemContainer>;
};

export default SearchResultItem;

const ItemContainer = styled.div`
  display: flex;
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;

  &:hover {
    background-color: #f5f5f5;
  }
`;

export const ResultPhoto = styled.img`
  width: 100px;
  height: 100px;
  margin-right: 10px;
`;

export const ResultInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ResultAddress = styled.div`
  font-size: 14px;
  color: #333;
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
