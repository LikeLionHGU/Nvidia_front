import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import SearchResultItem, { ResultPhoto, ResultInfo, InfoContent, ResultDetails, ResultPrice } from "./SearchResultItem";
import Question from "../../assets/icons/questionIcon.svg";
import UpdateIcon from "../../assets/icons/Update.svg";
import OverviewIcon from "../../assets/icons/Overview.svg";
import MyMoodIcon from "../../assets/icons/MyMood.svg";
import VectorIcon from "../../assets/icons/Vector.svg";

function SearchResultContainer({
  handleBackClick,
  recommendList,
  moveToDetailPage,
  hoveredRoomId,
  prompt,
  centerAddress,
  isLoading,
  sortOrder,
  handleSortChange,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const onSortChange = (newOrder) => {
    handleSortChange(newOrder);
    setIsDropdownOpen(false);
  };

  if (isLoading) {
    return (
      <LoadingContainer>
        <Spinner />
        <LoadingText>AI가 최적의 장소를 찾고있습니다...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <>
      <FormContainer>
        <InfoContainer>
          <TopWrapper>
            <Title>오늘 딱 맞는 공실을 찾아보세요</Title>
            <img src={Question} alt="" />
          </TopWrapper>
          <Subtitle>간단한 조건 입력으로 맞춤 공실을 찾아보세요</Subtitle>
        </InfoContainer>
        <Divider />
        <TopContainer>
          <TopContent>
            <OverviewTitle>Overview</OverviewTitle>
            <div>
              <UpdateIconImg src={UpdateIcon} alt="수정" onClick={handleBackClick} />
            </div>
          </TopContent>
          <BottomContent>
            <OverviewIconImg src={OverviewIcon} alt="" />
            <RightContainer>
              <LocationText>
                {centerAddress?.roadName || "선택된 위치 없음"}
              </LocationText>
              <PromptBox>
                <MyMoodIconImg src={MyMoodIcon} alt="" />
                <PromptText>
                  {prompt || "입력된 프롬프트가 없습니다."}
                </PromptText>
              </PromptBox>
            </RightContainer>
          </BottomContent>
        </TopContainer>
        <BottomContainer>
          <Title>공실 추천 List</Title>
          <DropboxContainer>
            <ListSubtitle>오늘의 공간, 조건에 맞게 준비했어요 !</ListSubtitle>
            <DropdownWrapper>
              <Dropbox onClick={toggleDropdown}>
                <SortOrderText>{sortOrder}</SortOrderText>
                <SortOrderUnitText> 순으로</SortOrderUnitText>
                <DropdownArrowIcon
                  src={VectorIcon}
                  alt="정렬 순서"
                  $isOpen={isDropdownOpen}
                />
              </Dropbox>
              {isDropdownOpen && (
                <DropdownMenu>
                  <DropdownItem onClick={() => onSortChange("낮은 가격")} $selected={sortOrder === "낮은 가격"}>
                    낮은 가격 순으로
                  </DropdownItem>
                  <DropdownItem onClick={() => onSortChange("높은 가격")} $selected={sortOrder === "높은 가격"}>
                    높은 가격 순으로
                  </DropdownItem>
                </DropdownMenu>
              )}
            </DropdownWrapper>
          </DropboxContainer>
          <ScrollableItemContainer>
            {recommendList.map((item, index) => (
              <SearchResultItem
                key={item.roomId}
                onClick={() => moveToDetailPage(item.roomId)}
                $isHovered={hoveredRoomId === item.roomId}
              >
                <ResultPhotoContainer>
                  <StyledResultPhoto
                    src={item.photo}
                    alt="장소 사진"
                  />
                  <RankingBadge>{index + 1}</RankingBadge>
                </ResultPhotoContainer>
                <ResultInfo>
                  <InfoContent>
                    <AddressText>
                      {item.address?.roadName || "주소 정보 없음"}
                    </AddressText>
                    <div>
                      <PricePerTimeText>
                        per 30 min /
                      </PricePerTimeText>
                      <PriceText>
                        {item.price.toLocaleString()}원
                      </PriceText>
                    </div>
                    <PhoneNumberText>
                      {item.phoneNumber}
                    </PhoneNumberText>
                  </InfoContent>
                </ResultInfo>
              </SearchResultItem>
            ))}
          </ScrollableItemContainer>
        </BottomContainer>
      </FormContainer>
    </>
  );
}

export default SearchResultContainer;

const FormContainer = styled.div`
  padding: 25px 30px 0 30px;
  background-color: #fff;
  height: 100vh; /* 전체 높이 제한 */
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
`;

const InfoContainer = styled.div`
  margin-bottom: 2.29vh;
  flex-shrink: 0; /* 축소되지 않도록 */
`;

const TopWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.78vh;
  > img {
    width: 1.67vw;
    height: 2.34vh;
  }
`;

const Title = styled.div`
  font-family: "Pretendard";
  font-weight: 700;
  font-size: 1.5vw;
`;

const Subtitle = styled.div`
  font-size: 1.1vw;
  color: #4e4e4e;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: #efefef;
  margin-bottom: 2.78vh;
  flex-shrink: 0; /* 축소되지 않도록 */
`;

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

const TopContainer = styled.div`
  display: flex;
  width: 100%;
  height: 192px;
  flex-direction: column;
  align-items: center;
  border-radius: 8px;
  box-shadow: 0px 3px 57.5px rgba(0, 0, 0, 0.04);
  flex-shrink: 0; /* 축소되지 않도록 */
`;

const TopContent = styled.div`
  display: flex;
  width: 91%;
  margin-top: 12px;
  justify-content: space-between;
`;

const BottomContent = styled.div`
  display: flex;
  width: 85%;
  margin-top: 13px;
  margin-left: 7px;
`;

const RightContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 16px;
  margin-top: 8px;
  width: 87%;
`;

const PromptBox = styled.div`
  display: flex;
  flex-direction: column;
  padding: 5px;
  background-color: #fafafa;
  border-radius: 4px;
  width: 100%;
  height: 87px;
`;

const BottomContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 48%;
  border-radius: 8px;
  box-shadow: 0px 3px 57.5px rgba(0, 0, 0, 0.04);
  padding: 19px;
  margin-top: 15px;

  min-height: 0; /* flex 아이템이 축소될 수 있도록 */
`;

const DropboxContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-bottom: 19px;
  flex-shrink: 0; /* 축소되지 않도록 고정 */
`;

const DropdownWrapper = styled.div`
  position: relative;
`;

const Dropbox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 149px;
  height: 32px;
  border-radius: 6px;
  box-shadow: 0px 3px 57.5px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(27, 31, 36, 0.15);
  font-size: 14px;
  cursor: pointer;

  &:hover {
    border-color: rgba(27, 31, 36, 0.25);
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 149px;
  background-color: white;
  border: 1px solid rgba(27, 31, 36, 0.15);
  border-radius: 6px;
  box-shadow: 0px 3px 57.5px rgba(0, 0, 0, 0.04);
  z-index: 10;
`;

const DropdownItem = styled.div`
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  background-color: ${(props) => (props.$selected ? "#f8f9fa" : "white")};
  font-weight: ${(props) => (props.$selected ? "bold" : "normal")};

  &:hover {
    background-color: #f8f9fa;
  }

  &:first-child {
    border-radius: 6px 6px 0 0;
  }

  &:last-child {
    border-radius: 0 0 6px 6px;
  }
`;

const ResultPhotoContainer = styled.div`
  position: relative;
  width: 35%;
  height: 100%;
  flex-shrink: 0;
`;

const RankingBadge = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: #2fb975;
  color: white;
  font-weight: bold;
  font-size: 14px;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

/* 새로 추가된 스크롤 컨테이너 */
const ScrollableItemContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 5px; /* 스크롤바 공간 */
  overflow-x: hidden;

  /* 스크롤바 스타일링 (선택사항) */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

const OverviewTitle = styled.span`
  font-weight: bold;
  font-size: 17.21px;
`;

const UpdateIconImg = styled.img`
  width: 49px;
  height: 12px;
  cursor: pointer;
`;

const OverviewIconImg = styled.img`
  width: 26px;
  height: 121px;
`;

const LocationText = styled.span`
  font-weight: bold;
  font-size: 13px;
  color: #0089fc;
`;

const MyMoodIconImg = styled.img`
  width: 110px;
  height: 20px;
  margin-bottom: 7px;
`;

const PromptText = styled.span`
  font-weight: 600; /* semi-bold is not a standard value */
  font-size: 10px;
  color: #030303;
  line-height: 1.7;
`;

const ListSubtitle = styled(Subtitle)`
  margin-top: 7px;
`;

const SortOrderText = styled.span`
  font-weight: bold;
`;

const SortOrderUnitText = styled.span`
  color: rgba(36, 41, 47, 0.75);
  margin-left: 2px;
  margin-right: 8px;
`;

const DropdownArrowIcon = styled.img`
  margin-left: 4px;
  transform: ${(props) => (props.$isOpen ? "rotate(180deg)" : "rotate(0deg)")};
  transition: transform 0.2s ease;
`;

const StyledResultPhoto = styled(ResultPhoto)`
  width: 100%;
  height: 100%;
  object-fit: cover;
  margin-right: 10px;
  border-radius: 8px 0 0 8px;
`;

const AddressText = styled.div`
  color: #0089fc;
  font-family: "Pretendard";
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 100%;
  margin-bottom: 13px;
`;

const PricePerTimeText = styled.span`
  color: #77838f;
  text-align: right;
  font-family: "Pretendard";
  font-size: 10.525px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: 0.191px;
`;

const PriceText = styled.span`
  color: #2fb975;
  text-align: right;
  font-family: "Pretendard";
  font-size: 16.99px;
  font-style: normal;
  font-weight: 700;
  margin-left: 6px;
  margin-bottom: 6px;
`;

const PhoneNumberText = styled.div`
  color: #77838f;
  font-family: "Pretendard";
  font-size: 10.841px;
  font-style: normal;
  font-weight: 600;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: #fff;
`;

const Spinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #2fb975;
  animation: ${spin} 1s ease infinite;
  margin-bottom: 20px;
`;

const LoadingText = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
`;
