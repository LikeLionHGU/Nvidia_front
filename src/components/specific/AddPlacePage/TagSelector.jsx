import React, { useState } from "react";
import styled from "styled-components";

/* ====== Theme ====== */
const colors = {
  brand: "#2FB975",
  brandDark: "#269964",
  ink: "#111827",
  text: "#374151",
  sub: "#6B7280",
  line: "#E5E7EB",
  surface: "#FFFFFF",
  surfaceSoft: "#FAFBFC",
};

/* 제공된 태그 목록 */
const availableTags = [
  "활기찬💪", "따뜻한☀️", "포근한🧸", "여유로운🌿",
  "레트로📻", "영감을 주는✨", "모던한🏙️", "로맨틱🌹",
  "세련된🧳", "컬러풀한🌈", "깔끔한🧼", "심플⛵", "감성적인🎵",
  "회의📒", "스터디📚", "촬영📷", "상담💬", "연습🎤",
  "시험📝", "이벤트🎉", "럭셔리💎", 
  "유니크🦄", "창의적인🤹", "빈티지🕰️"
];

/**
 * props
 * - selectedTags: string[] 선택된 태그
 * - onTagToggle: (tag: string) => void  // 선택/해제 토글 콜백
 * - placeholder?: string
 */
export default function TagSelector({
  selectedTags = [],
  onTagToggle, // This will still be used for the pills outside the modal
  onConfirmSelection, // New prop for confirming selection
  placeholder = "이 공간을 어떻게 쓰고 싶으신가요? 무드와 목적을 선택해주세요!",
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempSelectedTags, setTempSelectedTags] = useState([]); // Local state for modal selection

  const open = () => {
    setTempSelectedTags(selectedTags); // Initialize temp state with current selected tags
    setIsModalOpen(true);
  };
  const close = () => setIsModalOpen(false);

  const handlePick = (tag) => {
    const isSelected = tempSelectedTags.includes(tag);
    if (isSelected) {
      setTempSelectedTags(tempSelectedTags.filter((t) => t !== tag));
      return;
    }
    // 새로 선택: 최대 3개 제한
    if (tempSelectedTags.length >= 3) {
      alert("태그는 최대 3개까지 선택 가능합니다.");
      return;
    }
    setTempSelectedTags([...tempSelectedTags, tag]);
  };

  const handleConfirm = () => {
    onConfirmSelection(tempSelectedTags); // Pass confirmed tags to parent
    close();
  };

  const handleCancel = () => {
    close(); // Just close, no state update
  };

  return (
    <>
      {/* 상단 선택 칸 */}
      <Wrap>
        <Inner>
          {selectedTags.length === 0 ? (
            <Placeholder>{placeholder}</Placeholder>
          ) : (
            <Pills role="list">
              {selectedTags.map((t) => (
                <Pill key={t} role="listitem">
                  <span>{t}</span>
                  <RemoveBtn
                    type="button"
                    aria-label={`${t} 삭제`}
                    onClick={() => onTagToggle(t)}
                  >
                    ×
                  </RemoveBtn>
                </Pill>
              ))}
            </Pills>
          )}
        </Inner>
        <PlusBtn type="button" aria-label="태그 추가" onClick={open}>
          +
        </PlusBtn>
      </Wrap>

      {/* 모달 */}
      {isModalOpen && (
        <ModalOverlay onClick={handleCancel}> {/* Click outside to cancel */}
          <ModalCard onClick={(e) => e.stopPropagation()}>
            {/* 제목 */}
            <ModalTitle>나의 공실 TAG</ModalTitle>

            {/* 인풋형 가이드 */}
            <GuideBar $hasTags={tempSelectedTags.length > 0}>
              {tempSelectedTags.length > 0
                ? tempSelectedTags.map((t) => <PillPreview key={t}>{t}</PillPreview>)
                : <Placeholder style={{ margin: 0 }}>이 공간을 어떻게 쓰고 싶으신가요? 무드와 목적을 선택해주세요!</Placeholder>
              }
            </GuideBar>

            {/* 패널 */}
            <Panel>
              <PanelHint>최대 3개까지만 선택할 수 있어요!</PanelHint>

              <TagsGrid>
                {availableTags.map((tag) => {
                  const selected = tempSelectedTags.includes(tag); // Use tempSelectedTags
                  const disabled = !selected && tempSelectedTags.length >= 3; // Use tempSelectedTags
                  return (
                    <ChipButton
                      key={tag}
                      $selected={selected}
                      $disabled={disabled}
                      onClick={() => !disabled && handlePick(tag)}
                      title={disabled ? "최대 3개까지 선택 가능합니다." : ""}
                    >
                      {tag}
                    </ChipButton>
                  );
                })}
              </TagsGrid>
            </Panel>

            {/* 하단 액션 */}
            <Actions>
              <CancelBtn type="button" onClick={handleCancel}>취소</CancelBtn>
              <ConfirmBtn type="button" onClick={handleConfirm}>확인</ConfirmBtn>
            </Actions>
          </ModalCard>
        </ModalOverlay>
      )}
    </>
  );
}

/* ========== 상단 선택 바 ========== */
const Wrap = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 10px;

  width: calc(100% - 30px);
  border: 1px solid ${colors.line};
  background: ${colors.surface};
  border-radius: 10px;
  padding: 10px 12px;
  font-family: 'Pretendard';
`;

const Inner = styled.div`
  min-height: 28px;
  display: flex;
  align-items: center;
  overflow-x: auto;
  overflow-y: hidden;
  gap: 8px;

  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 999px; }
`;

const Placeholder = styled.div`
  color: ${colors.sub};
  font-size: 14px;
  white-space: nowrap;
`;

const Pills = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: nowrap; /* 한 줄 스크롤 */
`;

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  font-size: 13px;
  font-weight: 600;
  color: ${colors.ink};
  background: ${colors.surfaceSoft};
  border: 1px solid #EEF2F5;
  border-radius: 5px;
  white-space: nowrap;
`;

const PillPreview = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  font-size: 15px;
  font-weight: 600;
  color: ${colors.ink};
  background: ${colors.surface};
  border: 1px solid #EEF2F5;
  border-radius: 5px;
  white-space: nowrap;
`;

const RemoveBtn = styled.button`
  border: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #e5e7eb;
  color: ${colors.text};
  font-size: 14px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  &:hover { background: #d1d5db; }
`;

const PlusBtn = styled.button`
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  background: ${colors.brand};
  color: #fff;
  font-size: 20px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform .06s ease, filter .15s ease;
  &:hover { filter: brightness(0.95); }
  &:active { transform: scale(0.96); }
`;

/* ========== Modal 스타일 ========== */
const ModalOverlay = styled.div`
  position: fixed; inset: 0;
  background-color: rgba(0,0,0,0.45);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
`;

const ModalCard = styled.div`
  width: 700px;
  height: 430px;
  background: ${colors.surface};
  border-radius: 16px;
  border: 1px solid ${colors.line};
  padding: 70px;
  box-shadow: 0 18px 48px rgba(0,0,0,0.18);
`;

const ModalTitle = styled.h3`
  margin: 0 0 16px;
  font-size: 20px;
  font-weight: 700;
  color: black;
  text-align: center;
`;

const GuideBar = styled.div`
  margin: 20px auto;
  width: 620px;
  min-height: 30px;
  border-radius: 10px;
  border: 1px solid ${({ $hasTags }) => ($hasTags ? colors.brand : colors.line)};
  background: ${({ $hasTags }) => ($hasTags ? '#F0FFF9' : '#F7F7F7')};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 14px;
  color: #979BA5;
  font-weight: 600;
  transition: background-color 0.2s, border-color 0.2s;
  flex-wrap: wrap;
  gap: 8px;
`;

/* 패널 */
const Panel = styled.div`
  background: #F8FAF9;
  border-radius: 12px;
  padding: 22px 18px;
  border: 1px solid #F0F2F3;
`;

const PanelHint = styled.div`
  text-align: center;
  font-size: 16px;
  color: #A2A2A2;
  font-weight: 700;
  margin-bottom: 30px;
`;

const TagsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 13px 14px;
  justify-content: center;
`;

const ChipButton = styled.button`
  border: 1px solid ${({ $selected }) => ($selected ? colors.brand : "#EEF2F5")};
  background: ${({ $selected }) => ($selected ? colors.brand : colors.surface)};
  color: ${({ $selected }) => ($selected ? "#fff" : colors.ink)};
  padding: 7px 10px;
  border-radius: 5px;
  font-weight: 700;
  font-size: 16px;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  transition: transform .06s ease, filter .15s ease, background .15s ease, border-color .15s ease;

  &:hover { filter: ${({ $disabled }) => ($disabled ? "none" : "brightness(0.98)")}; }
  &:active { transform: ${({ $disabled }) => ($disabled ? "none" : "scale(0.98)")}; }
`;

/* 하단 액션 */
const Actions = styled.div`
  margin-top: 18px;
  display: flex; gap: 10px;
  justify-content: center;
`;

const BaseBtn = styled.button`
  min-width: 140px;
  height: 44px;
  border-radius: 10px;
  font-weight: 800;
  font-size: 16px;
  cursor: pointer;
  transition: transform .06s ease, filter .15s ease;
  &:active { transform: scale(0.98); }
`;

const CancelBtn = styled(BaseBtn)`
  background: #F2F4F5;
  color: #B3B3B3;
  border: 1px solid ${colors.line};
  &:hover { filter: brightness(0.98); }
`;

const ConfirmBtn = styled(BaseBtn)`
  background: ${colors.brand};
  color: #fff;
  border: none;
  &:hover { filter: brightness(0.95); }
`;
