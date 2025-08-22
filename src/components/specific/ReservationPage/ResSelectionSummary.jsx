import React from 'react';
import styled from 'styled-components';

const colors = {
  brandDark: "#269964",
  brandSoft: "#EAF9F2",
  sub: "#6B7280",
  line: "#E5E7EB",
  surface: "#FFFFFF",
  text: "#374151",
};

const labelForSlot = (slot) => {
  const idx = slot - 1, startMin = idx * 30, endMin = startMin + 30;
  const sh = String(Math.floor(startMin / 60)).padStart(2, "0");
  const sm = String(startMin % 60).padStart(2, "0");
  const eh = String(Math.floor(endMin / 60)).padStart(2, "0");
  const em = String(endMin % 60).padStart(2, "0");
  return `${sh}:${sm}~${eh}:${em}`;
};

const compressSlots = (slotsArr) => {
  if (slotsArr.length === 0) return [];
  const arr = [...slotsArr].sort((a, b) => a - b);
  const ranges = [];
  let start = arr[0], prev = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] === prev + 1) {
      prev = arr[i];
    } else {
      ranges.push([start, prev]);
      start = prev = arr[i];
    }
  }
  ranges.push([start, prev]);
  return ranges;
};

export default function ResSelectionSummary({ placeName, selectedDate, selectedSlots, price }) {
  const slotsArray = Array.from(selectedSlots);
  const compressed = compressSlots(slotsArray);
  const totalHours = slotsArray.length * 0.5;
  const totalPrice = totalHours * price;

  return (
    <SummaryContainer>
      <SectionLabel>예약 요약</SectionLabel>
      {!selectedDate ? (
        <Hint>날짜와 시간을 선택하면 요약이 표시됩니다.</Hint>
      ) : (
        <DetailsGrid>
          <Label>공간</Label>
          <Value>{placeName}</Value>

          <Label>날짜</Label>
          <Value>{selectedDate}</Value>

          <Label>시간</Label>
          <Value>
            {compressed.length > 0 ? 
              compressed.map(([start, end], i) => (
                <div key={i}>
                  {labelForSlot(start).split('~')[0]} - {labelForSlot(end).split('~')[1]}
                </div>
              )) : '시간을 선택해주세요.'
            }
          </Value>

          <Label>총 시간</Label>
          <Value>{totalHours} 시간</Value>

          <Divider />

          <Label>총 금액</Label>
          <TotalPrice>{totalPrice.toLocaleString()} 원</TotalPrice>
        </DetailsGrid>
      )}
    </SummaryContainer>
  );
}

const SummaryContainer = styled.div`
  border: 1px solid ${colors.line};
  border-radius: 8px;
  padding: 16px;
  background-color: ${colors.brandSoft};
`;

const SectionLabel = styled.div`
  font-weight: 700;
  margin-bottom: 12px;
  color: ${colors.text};
  font-size: 1.1rem;
`;

const Hint = styled.div`
  font-size: 0.9rem;
  color: ${colors.sub};
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 12px;
  align-items: center;
`;

const Label = styled.span`
  font-weight: 600;
  color: ${colors.sub};
`;

const Value = styled.span`
  font-weight: 600;
  color: ${colors.text};
`;

const TotalPrice = styled(Value)`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${colors.brandDark};
`;

const Divider = styled.hr`
  grid-column: 1 / -1;
  border: none;
  border-top: 1px solid ${colors.line};
  margin: 4px 0;
`;