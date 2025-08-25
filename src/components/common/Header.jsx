import React from "react";
import styled from "styled-components";
import Logo from "../../assets/icons/Logo.svg";
import SearchIcon from "../../assets/icons/Search.svg";
import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  const moveToAddPlace = () => {
    navigate("/add-place");
  };

  const moveToManagePlace = () => {
    navigate("/manage-page");
  };

  const moveToHome = () => {
    navigate("/main");
  };

  return (
    <div>
      <Wrapper>
        <LogoImg onClick={moveToHome} src={Logo} alt="" />
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
  width: 99.5vw;
  height: clamp(47px, 7.71vh, 119px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 10px;
  box-shadow: 0 -2px 23.9px 0 rgba(0, 0, 0, 0.10);
`;
const LogoImg = styled.img`
  cursor: pointer;
  width: clamp(200px, 14.23vw, 307px);
  height: clamp(25px, 4vh, 62px);
  margin-right: auto;
  margin-left: 2.83vh;
`;

const BtnContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 14.72vw;
  height: 3.5vh;
  font-size: 0.83vw;
  margin: 0 3vh 2vh auto;
`;

const Leftbtn = styled.div`
  cursor: pointer;
  width: 6.67vw;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  border: 1px solid #398f68;
  border-radius: 7.25px;
  background-color: #2fb975;
  box-shadow: 2px 2px 9.87px 0px rgba(0, 0, 0, 0.1);

  color: #FFF;
  font-family: Pretendard;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
`;

const Rightbtn = styled.div`
  cursor: pointer;
  width: 6.67vw;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #2fb975;
  border-radius: 7.25px;
  box-shadow: 2px 2px 9.87px 0px rgba(0, 0, 0, 0.1);

  color: #048B48;
  font-family: Pretendard;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
`;
