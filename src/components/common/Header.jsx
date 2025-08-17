import React from "react";
import styled from "styled-components";
import Logo from "../../assets/icons/Logo.svg";
import SearchIcon from "../../assets/icons/Search.svg";
import { useNavigate } from "react-router-dom";

function Header({ searchQuery, setSearchQuery, SearchEnterHandle }) {
  const navigate = useNavigate();

  const moveToAddPlace = () => {
    navigate("/add-place");
  };

  const moveToManagePlace = () => {
    navigate("/manage-page");
  };

  const moveToHome = () => {
    navigate("/");
    window.location.reload();
  };

  return (
    <div>
      <Wrapper>
        <LogoImg onClick={moveToHome} src={Logo} alt="" />
        <Searchbar>
          <input
            className="search-bar"
            placeholder="찾으시는 공실을 검색해보세요!"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            onKeyDown={(e) => SearchEnterHandle(e)}
          ></input>
          <img src={SearchIcon} alt="" />
        </Searchbar>
        <BtnContainer>
          <Leftbtn onClick={moveToAddPlace}>내 공실 등록</Leftbtn>
          <Rightbtn onClick={moveToManagePlace}>등록/예약 조회</Rightbtn>
        </BtnContainer>
      </Wrapper>
    </div>
  );
}

export default Header;

const Wrapper = styled.div`
  width: 99vw;
  height: 7.71vh;
  min-height: 79px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const LogoImg = styled.img`
  cursor: pointer;
  width: clamp(204px, 14.23vw, 307px);
  height: clamp(41px, 4vh, 62px);
  margin-right: auto;
  margin-left: 2.83vh;
`;

const Searchbar = styled.div`
  display: flex;
  align-items: center;
  border-radius: 8px;
  width: clamp(407px, 47.08vw, 1017px);
  height: clamp(52px, 5.08vh, 78px);
  font-size: clamp(13px, 1.25vw, 25px);
  background-color: #f5f5f5;
  padding-left: 22px;
  > svg {
    font-size: 20px;
    color: gray;
  }
  .search-bar {
    margin-left: 5px;
    width: 92%;
    height: 90%;
    outline: none;
    border: none;
    background-color: #f5f5f5;
  }
`;

const BtnContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 14.72vw;
  height: 3.5vh;
  font-size: 0.83vw;
  margin-left: auto;
  margin-right: 2.83vh;
`;

const Leftbtn = styled.div`
  cursor: pointer;
  width: 6.67vw;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  border: 1px solid #398f68;
  border-radius: 7.25px;
  background-color: #2fb975;
  box-shadow: 2px 2px 9.87px 0px rgba(0, 0, 0, 0.1);
`;

const Rightbtn = styled.div`
  cursor: pointer;
  width: 6.67vw;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #2fb975;
  border-radius: 7.25px;
  box-shadow: 2px 2px 9.87px 0px rgba(0, 0, 0, 0.1);
`;
