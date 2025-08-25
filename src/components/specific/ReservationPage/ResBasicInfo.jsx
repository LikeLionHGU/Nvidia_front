import React, { useEffect } from 'react';
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
  numPeople, setNumPeople,
  formWidth = "100%",
  columns = 2,
  slotsByDate,
  placeData,
  isAgreed,
  setIsAgreed,
}) {
  useEffect(() => {
    const n = Number(numPeople);
    if (!Number.isFinite(n) || n <= 0) setNumPeople(4);
  }, [numPeople, setNumPeople]);

  const decPeople = () => {
    setNumPeople(prev => Math.max(1, Number(prev || 0) - 1));
  };
  const incPeople = () => {
    const maxPeople = placeData?.maxPeople || 99;
    setNumPeople(prev => Math.min(maxPeople, Number(prev || 0) + 1));
  };

  const people = Number(numPeople || 0);

  // 선택된 총 시간(H)
  const totalSlots = Array.from(slotsByDate.values()).reduce((acc, s) => acc + s.size, 0);
  const totalHours = totalSlots * 0.5;

  // 단가(시간당)과 총 금액
  const unitPrice = Number((placeData?.price * 2) || 0);
  const totalPrice = Math.max(0, totalHours * unitPrice);

  return (
    <InputField $formWidth={formWidth}>
      <Divider />

      <Title>에약 정보</Title>

      <TopGrid>
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
            placeholder="01000000000  ( - 제외)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </Field>

        <Field style={{ gridArea: 'people' }}>
          <Label>사용 인원</Label>
          <StepperBox>
            <RoundBtn type="button" onClick={decPeople} aria-label="인원 감소">−</RoundBtn>
            <CountText><strong>{people}</strong>명</CountText>
            <RoundBtn type="button" onClick={incPeople} aria-label="인원 증가">＋</RoundBtn>
          </StepperBox>
        </Field>

        <TallField>
          <Label>
            선택한 총 시간
            <BigSummary>{totalHours}H</BigSummary>
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

      <Grid $columns={columns}>
        <Field $span={columns}>
          <CheckboxLabel>
            <Checkbox 
              type="checkbox" 
              id="agreement" 
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
            />
            <span>
              예약 서비스 이용을 위한 <strong>약관</strong>, 
              <strong> 개인정보 수집 및 제3자 제공 규정</strong>을 확인하였으며
              이에 동의합니다.
            </span>
          </CheckboxLabel>
        </Field>
      </Grid>

      {/* ▼ 요금 세부 정보 */}
      <BreakLine />

      <PriceSection>
        <PriceHeader>요금 세부 정보</PriceHeader>

        <PriceRow>
          <PriceFormula>
            <strong>{totalHours || 0}h</strong>
            <span>&nbsp;X&nbsp;</span>
            <strong>{unitPrice.toLocaleString('ko-KR')}</strong>
            <span>&nbsp;₩</span>
          </PriceFormula>

          <TotalPriceWrap>
            <TotalPrice>{totalPrice.toLocaleString('ko-KR')}</TotalPrice>
            <TotalUnit>원</TotalUnit>
          </TotalPriceWrap>
        </PriceRow>
      </PriceSection>
    </InputField>
  );
}

/* ===================== styles ===================== */
const InputField = styled.div`
  border-radius: 8px;
  width: ${({ $formWidth }) => $formWidth};
  box-sizing: border-box;
  max-width: 100%;
  overflow: hidden;
  margin-top: 0.8vw;
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
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto auto;
  grid-template-areas:
    "name   total"
    "phone  total"
    "people total";
  gap: 12px;

  @media (max-width: 900px) {
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
  border-radius: 12px;
  padding: 0;
`;

const BigSummary = styled.span`
  font-size: 18px;
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
`;

const Label = styled.label`
  font-size: 1vw;
  font-weight: 600;
  color: ${colors.text};
  margin: 15px 0 10px 0;
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
  align-items: flex-start;
  gap: 8px;
  font-size: 0.9vw;
  font-weight: 400;
  line-height: 1.5;
  color: ${colors.text};
  cursor: pointer;
  margin-top: 25px;

  span {
    flex: 1;
    word-break: keep-all;
  }
  strong {
    color: ${colors.brandDark};
  }
`;

const Checkbox = styled.input`
  margin-top: 3px;
  cursor: pointer;
  accent-color: #00A453;
`;

const SummaryWrapper = styled.div`
  width: 100%;
  overflow-y: hidden;
  flex-shrink: 0;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: #efefef;
  margin-bottom: 2.5vh;
`;

/* --- Price Section --- */
const BreakLine = styled.div`
  width: 100%;
  height: 1px;
  background-color: #efefef;
  margin: 12px 0 8px;
`;

const PriceSection = styled.div`
  width: 100%;
  box-sizing: border-box;
  margin: 15px 0;
`;

const PriceHeader = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${colors.ink};
  margin-bottom: 10px;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
`;

const PriceFormula = styled.div`
  font-size: 1.05rem;
  font-weight: 600;
  color: ${colors.ink};
  letter-spacing: 0.2px;

  strong { font-weight: 600; }
`;

const TotalPriceWrap = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
`;

const TotalPrice = styled.div`
  font-size: 2.1rem;
  font-weight: 600;
  color: ${colors.ink};
  line-height: 1;
`;

const TotalUnit = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${colors.ink};
`;