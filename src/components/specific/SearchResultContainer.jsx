import React from "react";
import styled from "styled-components";
import SearchResultItem, {
  ResultPhoto,
  ResultInfo,
  ResultAddress,
  ResultDetails,
  ResultPrice,
} from "./SearchResultItem";

function SearchResultContainer({ handleBackClick, recommendList, moveToDetailPage, hoveredRoomId }) {
  return (
    <>
      <BackButton onClick={handleBackClick}>수정하기</BackButton>
      {recommendList.map((item) => (
        <SearchResultItem
          key={item.roomId}
          onClick={() => moveToDetailPage(item.roomId)}
          isHovered={hoveredRoomId === item.roomId}
        >
          <ResultPhoto src={item.photo} alt="장소 사진" />
          <ResultInfo>
            <ResultAddress>주소: {item.roadName}</ResultAddress>
            <ResultDetails>
              최대인원: {item.maxPeople}명 | 연락처: {item.phoneNumber}
            </ResultDetails>
            <ResultPrice>{item.price.toLocaleString()}원</ResultPrice>
          </ResultInfo>
        </SearchResultItem>
      ))}
    </>
  );
}

export default SearchResultContainer;

const BackButton = styled.button`
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 15px;
  margin: 10px;
  cursor: pointer;
  align-self: flex-start;

  &:hover {
    background-color: #5a6268;
  }
`;