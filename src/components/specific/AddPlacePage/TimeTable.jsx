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
  setAllForDate,
}) {
  const noDate = !selectedDateArr || selectedDateArr.length === 0;

  if (noDate) {
    return (
      <TimeTableWrap>
        <Table cols={1}>
          <TableInfo cols={2}>가능 시간대 30min / 24 Hour</TableInfo>

          <TH>Time</TH>
          {/* 메시지를 헤더(요일/날짜 자리)에 표기 — 배경은 흰색 */}
          <TH $whitebg>
            <THMessage>위에서 날짜를 선택해주세요!</THMessage>
          </TH>

          {timeLabels.map((label, hour) => (
            <TR key={hour}>
              <TimeCell>{label}</TimeCell>
              {/* 시간표 옆 칸: 하얀 빈 칸(두 개, 30분 x 2) */}
              <EmptySlotColumn>
                <EmptySlotCell />
                <EmptySlotCell />
              </EmptySlotColumn>
            </TR>
          ))}
        </Table>
      </TimeTableWrap>
    );
  }

  return (
    <TimeTableWrap>
      <Table cols={selectedDateArr.length}>
        <TableInfo cols={selectedDateArr.length + 1}>
          가능 시간대 30min / 24 Hour
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

/* ===== styles ===== */

const TimeTableWrap = styled.div`
  margin-top: 16px;
  background: ${colors.surface};
  border-radius: 8px;
  padding: 18px;
  box-shadow: 0 -2px 23.9px 0 rgba(0, 0, 0, 0.10);
  font-family: 'Pretendard';

  /* 부모 그리드에서 1fr로 남은 공간을 채울 때 대비 */
  height: 500px;
  min-height: 0;
  overflow: hidden; /* 내부 표가 스크롤 담당 */
`;

const Table = styled.div`
  display: grid;
  grid-template-columns: 130px repeat(${({ cols }) => cols}, 1fr);
  border-radius: 5px;
  border: 1px solid ${colors.line};
  min-width: ${({ cols }) => 130 + cols * 100}px;

  /* 세로 스크롤 담당 */
  max-height: 100%;
  overflow: auto;
`;

/* 맨 위 안내 헤더 */
const TableInfo = styled.div`
  grid-column: span ${({ cols }) => cols};
  background: #EDEDED;
  text-align: left;
  font-weight: 700;
  padding: 12px;
  color: ${colors.text};
`;

const TH = styled.div`
  background: ${({ $whitebg }) => ($whitebg ? colors.surface : colors.surfaceSoft)};
  padding: 15px 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-right: 1px solid ${colors.line};
  font-weight: 700;
  color: ${colors.text};
  text-align: center;
`;

const THMessage = styled.div`
  padding: 25px 0;
  font-weight: 700;
`;

const THHead = styled.div`
  font-weight: 800;
  margin-bottom: 6px;
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
    align-items: center;
    gap: 4px;
    cursor: pointer;
  }

  input {
    transform: scale(1.1);
    accent-color: #00A453;
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
    background: ${({ active }) => (active ? colors.slotActiveHover : colors.slotHover)};
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${colors.line};
  }
`;

/* 날짜 미선택일 때 사용하는 빈 칸들 */
const EmptySlotColumn = styled.div`
  display: flex;
  flex-direction: column;
  border-right: 1px solid ${colors.line};
  background: ${colors.surface};
`;

const EmptySlotCell = styled.div`
  height: 24px;
  background: ${colors.surface};
`;