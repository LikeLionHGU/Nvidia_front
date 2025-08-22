import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import SelectionSummary from "./ResSelectionSummary";

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

export default function ResBasicInfo({
  name, setName,
  phoneNumber, setPhoneNumber,
  address, setAddress,
  account, setAccount,
  numPeople, setNumPeople,
  price, setPrice,
  memo, setMemo,
  selectedTags, // Changed from chipList
  onConfirmSelection, // New prop
  optionList, setOptionList,
  formWidth = "100%",
  columns = 2,
  slotsByDate,
  placeData
}) {

  // 기본값 4명
  useEffect(() => {
    const n = Number(numPeople);
    if (!Number.isFinite(n) || n <= 0) setNumPeople(4);
  }, [numPeople, setNumPeople]);

  const decPeople = () => {
    setNumPeople(prev => {
      const n = Math.max(0, Number(prev || 0) - 1);
      return n;
    });
  };
  const incPeople = () => {
    setNumPeople(prev => {
      const n = Math.min(99, Number(prev || 0) + 1);
      return n;
    });
  };

  const people = Number(numPeople || 0);

  const totalSlots = Array.from(slotsByDate.values()).reduce((acc, slots) => acc + slots.size, 0);
  const totalHours = totalSlots * 0.5;

  return (
    // 상단 입력 블럭만 교체 (컴포넌트 내부의 return 부분에서)
<InputField $formWidth={formWidth}>
  <Title>에약 정보</Title>
  
  {/* 좌 3칸 + 우 1칸(3행 합친 높이) */}
  <TopGrid>
    {/* 왼쪽 3개 */}
    <Field style={{ gridArea: 'name' }}>
      <Label htmlFor="rsvName">예약자 성함</Label>
      <Input
        id="rsvName"
        placeholder="예약자 성함을 작성해주세요."
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </Field>

    <Field style={{ gridArea: 'phone' }}>
      <Label htmlFor="rsvPhone">전화번호</Label>
      <Input
        id="rsvPhone"
        placeholder="전화번호를 입력해주세요. ( - 제외)"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
    </Field>

    <Field style={{ gridArea: 'people' }}>
      <Label>최대 가능 인원</Label>
      <StepperBox>
        <RoundBtn type="button" onClick={decPeople} aria-label="인원 감소">−</RoundBtn>
        <CountText><strong>{people}</strong>명</CountText>
        <RoundBtn type="button" onClick={incPeople} aria-label="인원 증가">＋</RoundBtn>
      </StepperBox>
    </Field>

    {/* 오른쪽: 왼쪽 3칸 높이를 전부 차지 */}
    <TallField>
      <Label>선택한 총 시간
        {/* 읽기 전용 요약 or 입력값 표시 (필요에 맞게 바꾸세요) */}
        <BigSummary>
          {totalHours}H
        </BigSummary>
      </Label>
      <SummaryWrapper>
        <SelectionSummary
            placeName={placeData?.name}
            slotsByDate={slotsByDate}
            price={placeData?.price}
        />
      </SummaryWrapper>
    </TallField>
  </TopGrid>

  {/* 아래부터는 기존처럼 이어서 다른 필드들 배치 */}
  <Grid $columns={columns}>
    {/* 약관 동의 */}
    <Field $span={columns}> 
      <CheckboxLabel>
        <Checkbox
          type="checkbox"
          id="agreement"
          required
        />
        <span>
          예약 서비스 이용을 위한 <strong>약관</strong>, 
          <strong> 개인정보 수집 및 제3자 제공 규정</strong>을 확인하였으며
          이에 동의합니다.
        </span>
      </CheckboxLabel>
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
  font-family: "Pretendard";
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns}, minmax(0, 1fr));
  gap: 15px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const TopGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;          /* 좌/우 반반 */
  grid-template-rows: auto auto auto;      /* 왼쪽 3행 */
  grid-template-areas:
    "name   total"
    "phone  total"
    "people total";
  gap: 12px;

  @media (max-width: 900px) {
    /* 모바일/협소 화면에선 세로 스택 */
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto auto;
    grid-template-areas:
      "name"
      "phone"
      "people"
      "total";
  }
`;

const TallField = styled.div`
  grid-area: total;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid ${colors.line};
  background: ${colors.surface};
  border-radius: 12px;
  padding: 12px 14px;
`;

const BigSummary = styled.span`
  font-size: 20px;
  font-weight: 900;
  color: ${colors.brandDark};
  line-height: 1.1;
  margin-left: 10px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  grid-column: span ${({ $span }) => $span || 1};
  min-width: 0;
`;

const Title = styled.label`
  font-size: 1.5vw;
  font-weight: 700;
  color: ${colors.text};
  margin-top: 3px;
`

const Label = styled.label`
  font-size: 1vw;
  font-weight: 600;
  color: ${colors.text};
  margin: 15px 0;
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

const CheckboxLabel = styled.label`
  display: flex;
  align-items: flex-start; /* 체크박스는 위쪽 정렬 */
  gap: 8px;
  font-size: 0.9vw;
  font-weight: 400;
  line-height: 1.5;
  color: ${colors.text};
  cursor: pointer;

  margin-top: 25px;

  span {
    flex: 1;              /* 텍스트 영역이 줄바꿈 되도록 */
    word-break: keep-all; /* 단어 단위 줄바꿈 */
  }

  strong {
    color: ${colors.brandDark};
  }
`;

const Checkbox = styled.input`
  margin-top: 3px; /* 텍스트 첫줄과 높이 맞추기 */
  accent-color: ${colors.brand};
  cursor: pointer;
`;

const SummaryWrapper = styled.div`
  width: 100%;
  overflow-y: hidden;
  flex-shrink: 0;
`