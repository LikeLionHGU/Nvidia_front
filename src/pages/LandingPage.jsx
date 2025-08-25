import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";

import LandingWhite from "../assets/images/LandingWhite/LandingWhite.svg";
import SpaceWhite from "../assets/images/LandingWhite/SPACEWhite.svg";
import FWhite from "../assets/images/LandingWhite/FWhite.svg";

import LandingGreen from "../assets/images/LandingGreen/LandingGreen.svg";
import SpaceGreen from "../assets/images/LandingGreen/SPACEGreen.svg";
import NGreen from "../assets/images/LandingGreen/NGreen.svg";

import LandingBtn from "../assets/images/LandingBtn.svg";

function LandingPage() {
  const [isOn, setIsOn] = useState(false); // false: WHITE(OFF), true: GREEN(ON)
  const [isFadingOut, setIsFadingOut] = useState(false); // 배경 페이드아웃 제어

  const navigate = useNavigate();

  const handleToggle = () => {
    setIsOn((v) => !v);

    // 1초 뒤 navigate 실행
    setTimeout(() => {
      setIsFadingOut(true); // 페이드아웃 시작
      setTimeout(() => {
        navigate("/main");
      }, 800); // 페이드아웃 애니메이션 끝나고 페이지 이동
    }, 1000);
  };

  return (
    <Stage>
      {/* 배경 크로스 페이드 */}
      <BgLayer
        $active={!isOn && !isFadingOut}
        style={{ backgroundImage: `url(${LandingWhite})` }}
      />
      <BgLayer
        $active={isOn && !isFadingOut}
        style={{ backgroundImage: `url(${LandingGreen})` }}
      />

      <Center>
        <LogoRow>
          <LogoImg src={isOn ? SpaceGreen : SpaceWhite} alt="SPACE" />

          {/* 토글 버튼 */}
          <ToggleShell
            type="button"
            aria-pressed={isOn}
            onClick={handleToggle}
            title="Space On/Off"
            style={{
              "--knob-y": isOn ? "calc(100% - 10% - 50%)" : "10%",
              "--knob-color": isOn ? "#F2D406" : "#FFFFFF",
            }}
          >
            <BtnImg src={LandingBtn} alt="toggle" />
            <Knob />
          </ToggleShell>

          {/* Tail */}
          <div>
            <TailImg src={isOn ? NGreen : FWhite} alt={isOn ? "N" : "FF"} isOn={isOn} />
            {!isOn && <TailImg src={FWhite} alt="F" isOn={isOn} />}
          </div>
        </LogoRow>
      </Center>
    </Stage>
  );
}

export default LandingPage;

/* =============== styles =============== */

const Stage = styled.div`
  position: relative;
  width: 100%;
  height: 90vh;
  overflow: hidden;
`;

const BgLayer = styled.div`
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transition: opacity 800ms ease, transform 900ms cubic-bezier(0.17, 0.67, 0.21, 1);
  opacity: 0;
  transform: scale(1.03);
  ${({ $active }) =>
    $active &&
    css`
      opacity: 1;
      transform: scale(1);
    `}
`;

const Center = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
`;

const LogoRow = styled.div`
  display: flex;
  align-items: center;
  gap: clamp(16px, 3vw, 32px);
  padding: 0 20px;
`;

const LogoImg = styled.img`
  width: clamp(320px, 42vw, 700px);
  height: auto;
  filter: drop-shadow(0 3px 24px rgba(0, 0, 0, 0.08));
`;

const ToggleShell = styled.button`
  position: relative;
  width: clamp(64px, 7.2vw, 110px);
  aspect-ratio: 9 / 14;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
`;

const BtnImg = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.12));
`;

const bounce = `
  0%   { transform: translate(-50%, 0) scale(1); }
  60%  { transform: translate(-50%, 0) scale(1.02); }
  100% { transform: translate(-50%, 0) scale(1); }
`;

const Knob = styled.div`
  position: absolute;
  left: 50%;
  top: var(--knob-y, 10%);
  transform: translate(-50%, 0);
  width: 80%;
  aspect-ratio: 1 / 1;
  border-radius: 999px;
  background: var(--knob-color, #fff);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15), inset 0 -3px 6px rgba(0, 0, 0, 0.08);
  transition: top 1000ms cubic-bezier(0.2, 0.8, 0.2, 1.02), background-color 240ms ease;
  animation: knob-bounce 420ms ease-out;
  @keyframes knob-bounce {
    ${bounce}
  }
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: currentColor;
    opacity: 0;
    filter: blur(6px);
    transition: opacity 200ms ease;
  }
  ${ToggleShell}:active &::after {
    opacity: 0.12;
  }
`;

const TailImg = styled.img`
  width: ${({ isOn }) => (isOn ? "clamp(90px, 7vw, 150px)" : "clamp(70px, 6vw, 120px)")};
  height: auto;
  filter: drop-shadow(0 3px 24px rgba(0, 0, 0, 0.08));
`;