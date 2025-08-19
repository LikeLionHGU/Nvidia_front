import React from "react";
import styled from "styled-components";

function commonDetailModal({ title, content, onClose, children }) {
  return (
    <div>
      <ModalBackground>
        <Overlay onClick={onClose} />
        <Wrapper>
          <div className="title">{title}</div>
          <div className="save-content">
            {content}
            {children}
          </div>
          <CompleteBtn>
            <button onClick={onClose}>확인하기</button>
          </CompleteBtn>
        </Wrapper>
      </ModalBackground>
    </div>
  );
}

export default commonDetailModal;

const modalBase = `
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: fixed;
`;

const ModalBackground = styled.div`
  ${modalBase}
  background: rgba(0, 0, 0, 0.2);
  z-index: 4;
  cursor: default;
`;

const Overlay = styled.div`
  ${modalBase}
  cursor: default;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #ffffff;
  width: 80vw;
  max-width: 800px;
  min-height: 500px;
  max-height: 90vh;
  border-radius: 12px;
  overflow-y: auto;

  .title {
    font-size: 18px;
    font-weight: bold;
    margin-top: 18px;
    margin-bottom: 8px;
    line-height: 150%;
  }

  .save-content {
    width: 90%;
    font-size: 14px;
    text-align: center;
    line-height: 150%;
    flex: 1;
    overflow-y: auto;
  }
`;

const CompleteBtn = styled.div`
  display: flex;
  width: 100%;
  height: auto;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
  margin-bottom: 16px;

  > button {
    display: flex;
    justify-content: center;
    align-items: center;
    outline: none;
    border: none;
    border-radius: 8px;
    width: 201px;
    height: 37px;
    font-size: 14px;
    font-weight: bold;
    color: white;
    background-color: #2FB975;
    cursor: pointer;

    &:active {
      background-color: #26945E;
    }
`;
