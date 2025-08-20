import React from 'react';
import styled from 'styled-components';

const colors = {
  brand: "#2FB975",
  ink: "#111827",
  text: "#374151",
  sub: "#6B7280",
  line: "#E5E7EB",
  surface: "#FFFFFF",
  surfaceSoft: "#FAFBFC",
  slotActive: "#CFF3E1",
  slotActiveHover: "#B7E8D2",
  slotHover: "#F4FAF7",
};

const timeLabels = Array.from({ length: 24 }, (_, i) => {
  const start = String(i).padStart(2, '0');
  const end = String(i + 1).padStart(2, '0');
  return `${start}:00~${end}:00`;
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dayOfWeek = new Intl.DateTimeFormat('ko-KR', { weekday: 'long' }).format(date);
  return (
    <>
      {`${year}/${month}/${day}`}
      <br />
      {dayOfWeek}
    </>
  );
};

export default function TimeTable({
  selectedDateArr,
  slotsByDate,
  handleSlotMouseDown,
  handleSlotMouseEnter,
  setAllForDate
}) {
  return (
    <TimeTableWrap>
      <Table cols={selectedDateArr.length}>
        {/* 👉 맨 위 안내 헤더 */}
        <TableInfo cols={selectedDateArr.length + 1}>
          가능 시간대 (30min / 24 Hour)
        </TableInfo>

        <TH>Time</TH>
        {selectedDateArr.map((d) => {
          const allSelected = (slotsByDate.get(d)?.size || 0) === 48;
          return (
            <TH key={d}>
              <THHead>{formatDate(d)}</THHead>
              <THControls>
                <label>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => setAllForDate(d, e.target.checked)}
                  />
                  전체 선택
                </label>
              </THControls>
            </TH>
          );
        })}

        {timeLabels.map((label, hour) => {
          const slot1 = hour * 2 + 1;
          const slot2 = hour * 2 + 2;
          return (
            <TR key={hour}>
              <TimeCell>{label}</TimeCell>
              {selectedDateArr.map((d) => {
                const slots = slotsByDate.get(d) || new Set();
                const active1 = slots.has(slot1);
                const active2 = slots.has(slot2);
                return (
                  <SlotColumn key={d}>
                    <SlotCell
                      active={active1}
                      onMouseDown={() => handleSlotMouseDown(d, slot1, active1)}
                      onMouseEnter={() => handleSlotMouseEnter(d, slot1)}
                      onClick={(e) => e.preventDefault()}
                    />
                    <SlotCell
                      active={active2}
                      onMouseDown={() => handleSlotMouseDown(d, slot2, active2)}
                      onMouseEnter={() => handleSlotMouseEnter(d, slot2)}
                      onClick={(e) => e.preventDefault()}
                    />
                  </SlotColumn>
                );
              })}
            </TR>
          );
        })}
      </Table>
    </TimeTableWrap>
  );
}

const TimeTableWrap = styled.div`
  margin-top: 16px;
  overflow-x: auto;
  background: ${colors.surface};
  border-radius: 8px;
  padding: 18px;
  border: 1px solid ${colors.line};
  box-shadow: 0 6px 22px rgba(0,0,0,0.05);
`;

const Table = styled.div`
  display: grid;
  grid-template-columns: 130px repeat(${({ cols }) => cols}, 1fr);
  border-radius: 5px;
  overflow: hidden;
  border: 1px solid ${colors.line};
  min-width: ${({ cols }) => 130 + cols * 100}px;
`;

/* 👉 새로 추가된 안내 헤더 */
const TableInfo = styled.div`
  grid-column: span ${({ cols }) => cols};
  background: #EDEDED;
  text-align: left;
  font-weight: 700;
  padding: 12px;
  color: ${colors.text};
`;
const TH = styled.div`
  background: ${colors.surfaceSoft};
  padding: 12px 12px;
  display: flex;
  flex-direction: column;   /* 세로 방향으로 쌓기 */
  justify-content: center;
  align-items: center;
  border-right: 1px solid ${colors.line};
  font-weight: 700;
  color: ${colors.text};
  text-align: center;
`;

const THHead = styled.div`
  font-weight: 800;
  margin-bottom: 6px; /* 날짜와 버튼 사이 간격 */
  line-height: 1.4;
`;

const THControls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  color: ${colors.sub};

  label {
    display: flex;
    align-items: center;   /* 체크박스랑 텍스트를 세로 중앙 정렬 */
    gap: 4px;
    cursor: pointer;
  }

  input {
    transform: scale(1.1);
  }
`;

const TR = styled.div`
  display: contents;
`;

const TimeCell = styled.div`
  background: ${colors.surface};
  padding: 10px 12px;
  border-right: 1px solid ${colors.line};
  border-top: 1px solid ${colors.line};
  font-weight: 600;
  color: ${colors.sub};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SlotColumn = styled.div`
  display: flex;
  flex-direction: column;
  border-right: 1px solid ${colors.line};
`;

const SlotCell = styled.button`
  padding: 10px 12px;
  border: none;
  border-top: 1px solid ${colors.line};
  cursor: pointer;
  background: ${({ active }) => (active ? colors.slotActive : colors.surface)};
  color: ${colors.ink};
  font-weight: 600;
  user-select: none;
  transition: 120ms ease;
  height: 24px;

  &:hover {
    background: ${({ active }) =>
      active ? colors.slotActiveHover : colors.slotHover};
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${colors.line};
  }
`;