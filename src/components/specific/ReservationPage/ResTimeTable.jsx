
import React from 'react';
import styled from 'styled-components';

const colors = {
  brand: "#2FB975",
  ink: "#111827",
  sub: "#6B7280",
  line: "#E5E7EB",
  surface: "#FFFFFF",
  slotActive: "#CFF3E1",
  slotActiveHover: "#B7E8D2",
  slotHover: "#F4FAF7",
  slotDisabled: "#F3F4F6",
};

const FULL_DAY_SLOTS = Array.from({ length: 48 }, (_, i) => i + 1);

const labelForSlot = (slot) => {
  const idx = slot - 1, startMin = idx * 30;
  const h = String(Math.floor(startMin / 60)).padStart(2, "0");
  const m = String(startMin % 60).padStart(2, "0");
  return `${h}:${m}`;
};

export default function ResTimeTable({
  availableSlots, // number[]
  selectedSlots,  // Set<number>
  onSlotClick,
  isLoading
}) {

  if (isLoading) {
    return (
      <TimeTableWrap>
        <LoadingOverlay>시간 정보를 불러오는 중...</LoadingOverlay>
      </TimeTableWrap>
    );
  }

  return (
    <TimeTableWrap>
      <Table>
        <TableInfo>선택 가능 시간 (30분 단위)</TableInfo>
        {FULL_DAY_SLOTS.map(slot => {
          const isAvailable = availableSlots.includes(slot);
          const isSelected = selectedSlots.has(slot);
          return (
            <SlotButton
              key={slot}
              disabled={!isAvailable}
              $selected={isSelected}
              onClick={() => isAvailable && onSlotClick(slot)}
            >
              {labelForSlot(slot)}
            </SlotButton>
          );
        })}
      </Table>
    </TimeTableWrap>
  );
}

// Styles
const TimeTableWrap = styled.div`
  margin-top: 16px;
  background: ${colors.surface};
  border-radius: 8px;
  padding: 18px;
  font-family: 'Pretendard';
  height: 400px;
  min-height: 0;
  overflow-y: auto;
  position: relative;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
`;

const Table = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
`;

const TableInfo = styled.div`
  grid-column: 1 / -1;
  font-weight: 700;
  padding-bottom: 12px;
  color: ${colors.ink};
`;

const SlotButton = styled.button`
  padding: 10px;
  border: 1px solid ${colors.line};
  border-radius: 4px;
  cursor: pointer;
  background-color: ${colors.surface};
  font-weight: 600;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background-color: ${props => !props.disabled && colors.slotHover};
  }

  ${props => props.$selected && `
    background-color: ${colors.brand};
    color: white;
    border-color: ${colors.brand};
  `}

  &:disabled {
    background-color: ${colors.slotDisabled};
    color: ${colors.sub};
    cursor: not-allowed;
    text-decoration: line-through;
  }
`;
