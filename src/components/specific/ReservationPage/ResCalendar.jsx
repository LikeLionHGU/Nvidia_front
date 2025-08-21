
import React, { useMemo } from 'react';
import styled, { css } from 'styled-components';
import {
  format,
  startOfMonth, endOfMonth,
  startOfWeek, endOfWeek,
  addDays, isSameMonth,
  addMonths, subMonths,
  isSameDay, parseISO
} from "date-fns";

const colors = {
  brand: "#2FB975",
  ink: "#111827",
  text: "#374151",
  sub: "#6B7280",
  line: "#E5E7EB",
  surface: "#FFFFFF",
  selectedHover: "#00C66A",
};

const ArrowButton = ({ onClick, direction }) => (
  <ArrowBtn onClick={onClick}>
    {direction === 'left' ? '<' : '>'}
  </ArrowBtn>
);

export default function ResCalendar({
  currentMonth,
  setCurrentMonth,
  availableDates, // 'YYYY-MM-DD'[]
  selectedDate,   // 'YYYY-MM-DD'
  onDateClick,
  isLoading
}) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarCells = useMemo(() => {
    const cells = [];
    let cur = gridStart;
    while (cur <= gridEnd) {
      cells.push(cur);
      cur = addDays(cur, 1);
    }
    return cells;
  }, [gridStart, gridEnd]);

  const availableDatesSet = useMemo(() => new Set(availableDates), [availableDates]);

  return (
    <Container>
      <CalendarHeader>
        <ArrowButton direction="left" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} />
        <MonthText>{format(currentMonth, "yyyy년 M월")}</MonthText>
        <ArrowButton direction="right" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} />
      </CalendarHeader>

      <CalendarGrid>
        {["S", "M", "T", "W", "T", "F", "S"].map((w, i) => (
          <DayCell key={i}>{w}</DayCell>
        ))}
        {calendarCells.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const isSelected = selectedDate === dateKey;
          const isAvailable = availableDatesSet.has(dateKey);
          const isDimmed = !isSameMonth(day, monthStart);
          
          return (
            <DateCell
              key={dateKey}
              onClick={() => isAvailable && !isDimmed && onDateClick(dateKey)}
              $selected={isSelected}
              $dim={isDimmed}
              $disabled={!isAvailable || isDimmed}
              $isToday={isSameDay(day, new Date())}
            >
              {format(day, "d")}
            </DateCell>
          );
        })}
      </CalendarGrid>
      {isLoading && <LoadingOverlay>월별 데이터를 불러오는 중...</LoadingOverlay>}
    </Container>
  );
}

// Styles
const Container = styled.div`
  font-family: Pretendard;
  background: ${colors.surface};
  border-radius: 8px;
  padding: 18px;
  position: relative;
  overflow: hidden;
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
`;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const MonthText = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${colors.ink};
`;

const ArrowBtn = styled.button`
  border: 1px solid ${colors.line};
  border-radius: 50%;
  width: 32px;
  height: 32px;
  background-color: ${colors.surface};
  cursor: pointer;
  font-size: 1rem;
  color: ${colors.sub};
  &:hover {
    background-color: #f3f4f6;
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
`;

const DayCell = styled.div`
  font-size: 0.9rem;
  text-align: center;
  font-weight: 600;
  color: ${colors.sub};
`;

const DateCell = styled.button`
  padding: 8px 0;
  border-radius: 50%;
  background: transparent;
  color: ${colors.text};
  font-weight: 600;
  cursor: pointer;
  transition: 120ms ease;
  border: 2px solid transparent;
  font-size: 0.9rem;

  &:hover {
    background: ${({ $disabled }) => !$disabled && '#EAF9F2'};
  }

  ${({ $isToday }) => $isToday && css`
    border-color: ${colors.brand};
  `}

  ${({ $selected }) => $selected && css`
    background: ${colors.brand};
    color: #fff;
    border-color: ${colors.brand};
  `}

  ${({ $dim }) => $dim && css`
    opacity: 0.4;
  `}

  ${({ $disabled }) => $disabled && css`
    cursor: not-allowed;
    text-decoration: line-through;
    opacity: 0.4;
    &:hover {
      background: transparent;
    }
  `}
`;
