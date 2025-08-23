import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import TagSelector from './TagSelector';

const colors = {
  brand: "#2FB975",
  brandDark: "#269964",
  brandSoft: "#EAF9F2",
  ink: "#111827",
  text: "#374151",
  sub: "#6B7280",
  line: "#E5E7EB",
  surface: "#FFFFFF",
  surfaceSoft: "#FAFBFC",
  grayBtn: "#BDBDBD",
  grayBtnHover: "#A8A8A8",
};

export default function BasicInfoForm({
  name, setName,
  phoneNumber, setPhoneNumber,
  address, setAddress,
  account, setAccount,
  maxPeople, setMaxPeople,
  price, setPrice,
  memo, setMemo,
  selectedTags, // Changed from chipList
  onConfirmSelection, // New prop
  optionList, setOptionList,
  formWidth = "100%",
  columns = 2
}) {

  // 기본값 4명
  useEffect(() => {
    const n = Number(maxPeople);
    if (!Number.isFinite(n) || n <= 0) setMaxPeople(4);
  }, [maxPeople, setMaxPeople]);

  const decPeople = () => {
    setMaxPeople(prev => {
      const n = Math.max(0, Number(prev || 0) - 1);
      return n;
    });
  };
  const incPeople = () => {
    setMaxPeople(prev => {
      const n = Math.min(99, Number(prev || 0) + 1);
      return n;
    });
  };

  const people = Number(maxPeople || 0);

  const toggleTag = (t) => {
    // This toggleTag is for removing tags from the displayed pills, not for the modal selection
    onConfirmSelection(prev => (prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]));
  };

  return (
    <InputField $formWidth={formWidth}>
      <Grid $columns={columns}>
        {/* 호스트명 */}
        <Field>
          <Label htmlFor="placeName">호스트명</Label>
          <Input
            id="placeName"
            placeholder="호스트명을 입력해주세요."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        {/* 주소 */}
        <Field>
          <Label htmlFor="address">주소</Label>
          <Input
            id="address"
            placeholder="주소를 입력해주세요."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </Field>

        {/* 계좌번호 */}
        <Field>
          <Label htmlFor="account">계좌번호</Label>
          <Input
            id="account"
            placeholder="계좌번호를 입력해주세요. (은행 포함)"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
          />
        </Field>

        {/* 전화번호 */}
        <Field>
          <Label htmlFor="phoneNumber">전화번호</Label>
          <Input
            id="phoneNumber"
            placeholder="01000000000  ( - 제외)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </Field>

        {/* TAG */}
        <Field $span={columns}>
          <Label>나의 공실 TAG</Label>
          <TagSelector
            selectedTags={selectedTags}
            onTagToggle={toggleTag}
            onConfirmSelection={onConfirmSelection} // Pass the new prop
            placeholder="공실과 관련된 무드와 목적을 칩으로 나타내보세요!"
          />
        </Field>

        {/* 최대 가능 인원 – 스텝퍼 */}
        <Field>
          <Label>최대 가능 인원</Label>
          <StepperBox>
            <RoundBtn type="button" onClick={decPeople} aria-label="인원 감소">−</RoundBtn>
            <CountText><strong>{people}</strong>명</CountText>
            <RoundBtn type="button" onClick={incPeople} aria-label="인원 증가">＋</RoundBtn>
          </StepperBox>
        </Field>

        {/* 금액 */}
        <Field>
          <Label htmlFor="price">금액</Label>
          <Input
            id="price"
            type="number"
            placeholder="30분 당 금액을 작성해주세요."
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
          />
        </Field>

        {/* 옵션 */}
        <Field>
          <Label>옵션</Label>
            <TextArea
              placeholder="예: 에어컨, 와이파이, 주차…"
              value={optionList}
              onChange={(e) => setOptionList(e.target.value)}
            />
        </Field>

        {/* 메모 */}
        <Field>
          <Label htmlFor="memo">주의사항</Label>
          <TextArea
            id="memo"
            placeholder="하실 말씀이 있으시다면 편하게 적어주세요."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </Field>
      </Grid>
    </InputField>
  );
}

/* ===================== styles ===================== */
const InputField = styled.div`
  border-radius: 8px;
  background: #FBFBFB;
  padding: 18px 12px;
  width: ${({ $formWidth }) => $formWidth};
  box-sizing: border-box;
  max-width: 100%;
  overflow: hidden;
  margin-top: 1.5vw;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns}, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  grid-column: span ${({ $span }) => $span || 1};
  min-width: 0;
`;

const Label = styled.label`
  font-size: 1vw;
  font-weight: 700;
  color: ${colors.text};
  margin-top: 3px;
`;

const Input = styled.input`
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid ${colors.line};
  background: ${colors.surface};
  font-size: 15px;
  color: ${colors.ink};
  transition: 120ms ease;

  &::placeholder {
    color: ${colors.sub};
    font-size: 0.9vw;
  }
  &:focus {
    outline: none;
    border-color: ${colors.brand};
    box-shadow: 0 0 0 3px ${colors.brandSoft};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid ${colors.line};
  background: ${colors.surface};
  min-height: 100px;
  resize: vertical;
  color: ${colors.ink};
  resize: none;

  &::placeholder { color: ${colors.sub}; }
  &:focus {
    outline: none;
    border-color: ${colors.brand};
    box-shadow: 0 0 0 3px ${colors.brandSoft};
  }
`;

const GhostButton = styled.button`
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid ${colors.line};
  background: ${colors.surface};
  font-weight: 600;
  color: ${colors.text};
  cursor: pointer;
  &:hover { background: ${colors.surfaceSoft}; }
`;
const SmallButton = styled(GhostButton)`padding: 8px 10px;`;
const Hint = styled.div`font-size: 12px; color: ${colors.sub}; margin-top: 6px;`;

/* 인원 스텝퍼 */
const StepperBox = styled.div`
  width: 100%;
  border: 1px solid ${colors.line};
  background: ${colors.surface};
  border-radius: 12px;
  padding: 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
`;

const RoundBtn = styled.button`
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  background: ${colors.grayBtn};
  color: #fff;
  font-size: 20px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background .15s ease, transform .05s ease;

  &:hover { background: ${colors.grayBtnHover}; }
  &:active { transform: scale(0.96); }
`;

const CountText = styled.div`
  font-size: 18px;
  font-weight: 800;
  color: ${colors.ink};
`;