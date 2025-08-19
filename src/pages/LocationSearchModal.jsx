import React from "react";
import styled from "styled-components";

const LocationSearchModal = ({ onClose }) => {
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <h2>위치 검색</h2>
        <p>여기에 위치 검색 UI가 들어갑니다.</p>
        <CloseButton onClick={onClose}>닫기</CloseButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export default LocationSearchModal;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
`;

const CloseButton = styled.button`
  margin-top: 10px;
`;