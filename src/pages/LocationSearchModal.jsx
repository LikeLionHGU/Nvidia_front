import React, { useState } from "react";
import styled from "styled-components";
import { X, Plus, MapPin } from "lucide-react";

import AddLocationIcon from "../assets/icons/addLocation.svg";

function LocationSearchModal({ onClose, onConfirm }) {
  const [locations, setLocations] = useState([{ id: 1, value: "" }]);

  const addLocation = () => {
    setLocations((prev) => [...prev, { id: prev.length + 1, value: "" }]);
  };

  const updateLocation = (idx, v) => {
    setLocations((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, value: v } : it))
    );
  };

  // X 동작: 첫 줄은 입력만 비우고, 2번째 줄부터는 줄 삭제
  const clickX = (idx) => {
    if (idx === 0) {
      setLocations((prev) =>
        prev.map((it, i) => (i === 0 ? { ...it, value: "" } : it))
      );
    } else {
      setLocations((prev) => {
        const next = prev.filter((_, i) => i !== idx);
        return next.map((it, i) => ({ ...it, id: i + 1 }));
      });
    }
  };

  const handleConfirm = () => {
    const values = locations.map((l) => l.value.trim());
    onConfirm ? onConfirm(values) : onClose?.();
  };

  return (
    <ModalBackground>
      <Overlay onClick={onClose} />
      <Wrapper>
        <Header>
            <TopRow>
                <StepPill>Step 1</StepPill>
                <Title>위치를 지정해주세요.</Title>
            </TopRow>
            <Subtitle>
                내 위치를 선택하거나, 친구와의 중간 지점을 작성해주세요.
            </Subtitle>
        </Header>

        {/* 스크롤은 이 박스에서만 발생 */}
        <ContentCard>
          <RowsScrollArea>
            {locations.map((loc, idx) => (
              <Row key={`${loc.id}-${idx}`}>
                <IndexBadge>{loc.id}</IndexBadge>

                <SearchArea>
                  <SearchBox>
                    <MapPin size={18} color="#2fb975" />
                    <SearchInput
                      value={loc.value}
                      onChange={(e) => updateLocation(idx, e.target.value)}
                      placeholder="위치를 입력해주세요."
                    />
                    {/* 1번째 줄은 X 숨김, 2번째 줄부터 X로 '줄 삭제' */}
                    {idx > 0 ? (
                      <IconBtn
                        type="button"
                        aria-label={`${loc.id}번 줄 삭제`}
                        onClick={() => clickX(idx)}
                        title="삭제"
                      >
                        <X size={18} />
                      </IconBtn>
                    ) : (
                      <IconBtn
                        type="button"
                        aria-label="입력 지우기"
                        onClick={() => clickX(idx)}
                        title="지우기"
                        style={{ visibility: "hidden" }} // 자리 유지(정렬용)
                      >
                        <X size={18} />
                      </IconBtn>
                    )}
                  </SearchBox>
                </SearchArea>
              </Row>
            ))}
          </RowsScrollArea>

          <AddMore onClick={addLocation}>
            <img src={AddLocationIcon} alt="" style={{ marginRight: "0.49vh" }} /> <span> 위치 추가하기 </span>
          </AddMore>
        </ContentCard>

        <Footer>
          <GhostButton type="button" onClick={onClose}>
            취소
          </GhostButton>
          <PrimaryButton type="button" onClick={handleConfirm}>
            확인
          </PrimaryButton>
        </Footer>
      </Wrapper>
    </ModalBackground>
  );
}

export default LocationSearchModal;

/* ================= styles ================= */

const modalBase = `
  width: 100vw; height: 100vh;
  position: fixed; inset: 0;
`;

const ModalBackground = styled.div`
  ${modalBase}
  background: rgba(0,0,0,0.35);
  z-index: 1000;
`;

const Overlay = styled.div`
  ${modalBase}
`;

const Wrapper = styled.div`
  position: absolute;
  left: 50%; top: 50%;
  transform: translate(-50%, -50%);
  width: 800px;           /* 고정 */
  height: 600px;          /* 고정 */
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.18);
  display: flex; flex-direction: column;
  overflow: hidden;       /* 전체 모달 스크롤 막기 */
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Header = styled.div`
  padding: 24px 28px 8px 28px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 0 0 auto;
`;

const StepPill = styled.span`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 72px;     /* 고정 너비 */
    height: 28px;
    border-radius: 10px;
    background: #2fb975;
    color: #fff;
    font-weight: 700;
    font-size: 14px;
    flex-shrink: 0;
    font-family: Inter;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: #111827;
`;

const Subtitle = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  padding-left: calc(72px + 12px); /* StepPill 너비 + gap만큼 들여쓰기 */
`;

const ContentCard = styled.div`
  margin: 14px 28px 0 28px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 12px;
  /* 헤더/푸터를 제외한 영역에서만 늘어나도록 */
  flex: 1 1 auto;
  min-height: 0; /* 자식 스크롤 위해 필요 */
`;

const RowsScrollArea = styled.div`
  /* 이 영역에서만 스크롤 */
  overflow-y: auto;
  padding-right: 2px; /* 스크롤바 공간 미세 여백 */
  /* 높이는 부모(ContentCard)의 flex 레이아웃에 의해 자동 */
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: 12px;
  align-items: start;
  & + & { margin-top: 12px; }
`;

const IndexBadge = styled.div`
  width: 36px; height: 36px;
  border-radius: 10px;
  background: #2fb975;
  color: #fff; font-weight: 800;
  display: grid; place-items: center;
  flex: 0 0 auto;
`;

const SearchArea = styled.div`
  display: flex; flex-direction: column; gap: 8px;
`;

const SearchBox = styled.div`
  border: 2px solid #2fb975;
  border-radius: 10px;
  height: 48px;
  display: grid;
  grid-template-columns: 28px 1fr 32px;
  align-items: center;
  padding: 0 6px;
`;

const SearchInput = styled.input`
  height: 100%;
  border: none; outline: none;
  padding: 0 6px; font-size: 14px;
  &::placeholder { color: #9ca3af; }
`;

const IconBtn = styled.button`
  justify-self: center;
  width: 28px; height: 28px;
  border: none; background: transparent;
  color: #9ca3af; border-radius: 6px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  &:hover { background: #f3f4f6; }
  &:active { background: #e5e7eb; }
`;

const AddMore = styled.button`
  align-self: center; /* 가운데 정렬 */
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px; /* 배경 어두워질 때 둥글게 */

  &:hover {
    background-color: #f3f4f6; /* hover 시 약간 어두운 배경 */
    color: #6b7280;           /* 글자색은 유지 */
    text-decoration: none;    /* 밑줄 제거 */
  }

  &:active {
    background-color: #e5e7eb; /* 클릭 시 좀 더 어두운 배경 */
  }

  flex: 0 0 auto;
`;

const Footer = styled.div`
  display: flex; gap: 12px; justify-content: center;
  padding: 16px 28px 24px;
  border-top: 1px solid #f3f4f6;
  flex: 0 0 auto;
`;

const BaseBtn = styled.button`
  min-width: 120px; height: 44px;
  border-radius: 5.5px; font-weight: 700; font-size: 14px;
  cursor: pointer; outline: none; border: 1px solid transparent;
`;

const GhostButton = styled(BaseBtn)`
  background: #fff; border: 1px solid #e5e7eb; color: #374151;
  &:hover { background: #f9fafb; }
  &:active { background: #f3f4f6; }
`;

const PrimaryButton = styled(BaseBtn)`
  background: #2fb975; color: #fff;
  &:hover { filter: brightness(0.96); }
  &:active { background: #26945e; }
`;