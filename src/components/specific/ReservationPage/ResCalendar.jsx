import React, { useState, useMemo } from 'react';
import styled, { css } from 'styled-components';
import ArrowLeft from "../../../assets/icons/ArrowIconLeft.svg";
import ArrowRight from "../../../assets/icons/ArrowIconRight.svg";
import {
  format,
  startOfMonth, endOfMonth,
  startOfWeek, endOfWeek,
  addDays, isSameMonth,
  addMonths, subMonths,
  isBefore, startOfToday, isSameDay,
  parseISO
} from "date-fns";
import { ko } from "date-fns/locale";

const colors = {
  brand: "#2FB975",
  brandSofter: "#F5FBF8",
  ink: "#111827",
  text: "#374151",
  sub: "#6B7280",
  line: "#E5E7EB",
  surface: "#FFFFFF",
  surfaceSoft: "#FAFBFC",
  selectedHover: "#00C66A",
};

export default function Calendar({ today, selectedDates, toggleDate, availableDays, setCurrentMonth }) {
  const [currentDate, setCurrentDateState] = useState(today);

  const handleSetCurrentDate = (date) => {
    setCurrentDateState(date);
    setCurrentMonth(date);
  }

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const availableDaysSet = useMemo(() => new Set(availableDays), [availableDays]);

  const calendarCells = useMemo(() => {
    const cells = [];
    let cur = gridStart;
    while (cur <= gridEnd) {
      cells.push(cur);
      cur = addDays(cur, 1);
    }
    return cells;
  }, [gridStart, gridEnd]);

  const selectedDatesArray = Array.from(selectedDates).sort();

  return (
    <Container>
      <ContentsContainer>
        <CalendarWrap>
          <CalendarHeader>
            <ArrowButton src={ArrowLeft} onClick={() => handleSetCurrentDate(subMonths(currentDate, 1))}/>
            <MonthText>{format(currentDate, "yyyy년 M월")}</MonthText>
            <ArrowButton src={ArrowRight} onClick={() => handleSetCurrentDate(addMonths(currentDate, 1))}/>
          </CalendarHeader>

          <CalendarGrid>
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((w, i) => (
              <DayCell key={i}>{w}</DayCell>
            ))}
            {calendarCells.map((d, idx) => {
              const key = format(d, "yyyy-MM-dd");
              const selected = selectedDates.has(key);
              const isPast = isBefore(d, startOfToday());
              const isCurrentMonth = isSameMonth(d, monthStart);
              const isAvailable = availableDaysSet.has(key);
              const disabled = isPast || (isCurrentMonth && !isAvailable);

              return (
                <DateCell
                  key={idx}
                  onClick={() => {
                    if (disabled || !isCurrentMonth) return;
                    if (!selected && selectedDates.size >= 5) {
                      alert("최대 5일까지 선택 가능합니다.");
                      return;
                    }
                    toggleDate(d);
                  }}
                  selected={selected}
                  $dim={!isCurrentMonth}
                  $disabled={disabled}
                  $isToday={isSameDay(d, startOfToday())}
                >
                  {format(d, "d")}
                </DateCell>
              );
            })}
          </CalendarGrid>
        </CalendarWrap>

        <VDivider />

        <SelectionPanel>
          <SelectionTitle>선택한 날짜</SelectionTitle>
          <SelectionSubtitle>최대 5일까지 선택 가능합니다.</SelectionSubtitle>
          <SelectedDatesList>
            {selectedDatesArray.map(dateStr => {
              const d = parseISO(dateStr); // 'yyyy-MM-dd'
              const label = format(d, "yyyy/MM/dd/EEEE", { locale: ko });
              return (
                <SelectedDateItem key={dateStr}>
                  <span>{label}</span>
                  <RemoveBtn
                    type="button"
                    aria-label={`${label} 삭제`}
                    onClick={() => toggleDate(d)}
                  >
                    ×
                  </RemoveBtn>
                </SelectedDateItem>
              );
            })}
          </SelectedDatesList>
        </SelectionPanel>
      </ContentsContainer>
    </Container>
  );
}

/* ======================= styles ======================= */

const Container = styled.div`
  font-family: Pretendard;
  box-shadow: 0 -2px 23.9px 0 rgba(0, 0, 0, 0.10);
  background: ${colors.surface};
  border-radius: 8px;
  overflow: hidden;
`;

const ContentsContainer = styled.div`
  display: flex;
  gap: 24px;
  padding: 8px 18px;
`;

const Panel = styled.div`
  padding: 18px;
`;

const CalendarWrap = styled(Panel)`
  flex: 2;
`;

const SelectionPanel = styled(Panel)`
  flex: 1;
`;

const SelectionTitle = styled.h3`
  font-size: 1.05vw;
  font-weight: 700;
  color: ${colors.ink};
  margin: 0 0 8px;
`;

const SelectionSubtitle = styled.p`
  font-size: 0.9vw;
  color: ${colors.sub};
  margin: 0 0 16px;
`;

const SelectedDatesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 13px;
`;

const SelectedDateItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.95vw;
  background-color: #ffffff;
  border: 1px solid #00A453;
  padding: 8px 12px;
  border-radius: 5px;
  font-weight: 700;
`;

const RemoveBtn = styled.button`
  width: 14px;
  height: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: ${colors.line};
  color: #ffffff;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s ease, color 0.15s ease, transform 0.05s ease;
  line-height: 1;
  font-size: 16px;

  &:active {
    transform: scale(0.96);
  }
`;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  position: relative;
  background-color: #F7F7F7;
  border-radius: 100px;
`;

const MonthText = styled.div`
  font-size: 1.09vw;
  font-weight: 700;
  color: ${colors.ink};
  text-align: center;
  flex-grow: 1;
`;

const ArrowButton = styled.img`
  border: none;
  border-radius: 100px;
  cursor: pointer;
  height: 40px;
  color: ${colors.sub};
  &:hover {
    color: ${colors.ink};
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
`;

const DayCell = styled.div`
  font-size: 0.90vw;
  text-align: center;
  font-weight: 700;
  border: none;
  color: #C4C4C4;
`;

const DateCell = styled.button`
  padding: 10px 5px;
  border-radius: 5px;
  background: ${colors.surface};
  color: ${colors.text};
  font-weight: 700;
  cursor: pointer;
  transition: 120ms ease;
  border: none;
  background: #F5F5F5;
  font-size: 0.90vw;

  &:hover {
    background: ${({ $disabled }) => !$disabled && colors.selectedHover};
  }

  ${({ $isToday }) => $isToday && css`
    color: #00A453;
  `}

  ${({ selected }) => selected && css`
    background: ${colors.brand};
    color: #fff;
  `}

  ${({ $dim }) => $dim && css`
    opacity: 0.35;
    background: #FFF;
    cursor: default;
    &:hover {
      background: #FFF;
    }
  `}

  ${({ $disabled }) => $disabled && css`
    cursor: not-allowed;
    opacity: 0.5;
    &:hover {
      background: #F5F5F5;
    }
  `}
`;

const VDivider = styled.div`
  margin-top: 15px;
  margin-bottom: 10px;
  width: 1px;
  align-self: stretch;
  background: #efefef;
  border-radius: 1px;
`;