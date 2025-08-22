import React, { useEffect, useState, useCallback, useMemo } from "react";
import styled from "styled-components";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { format, getYear, getMonth, getDate, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, addDays } from "date-fns";

import BasicInfo from "../components/specific/ReservationPage/ResBasicInfo";
import Calendar from "../components/specific/ReservationPage/ResCalendar";
import TimeTable from "../components/specific/ReservationPage/ResTimeTable";

const colors = {
  brand: "#2FB975",
  brandDark: "#269964",
  surface: "#FFFFFF",
  line: "#E5E7EB",
  text: "#374151",
};

export default function ReservationPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  // 로딩 및 에러 상태
  const [loading, setLoading] = useState({ page: true, days: false, slots: false });
  const [error, setError] = useState(null);

  // 데이터 상태
  const [placeData, setPlaceData] = useState(null);
  const [availableDays, setAvailableDays] = useState([]); // YYYY-MM-DD 형식
  const [availableSlotsByDate, setAvailableSlotsByDate] = useState(new Map());

  // 사용자 입력 및 선택 상태
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [numPeople, setNumPeople] = useState();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState(new Set());
  const [slotsByDate, setSlotsByDate] = useState(new Map());

  const today = new Date();

  const handleCancel = () => {
    navigate('/');
  };

  const toggleDate = (d) => {
    const key = format(d, "yyyy-MM-dd");
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };
  
  const selectAllThisMonth = () => {
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const all = new Set();
    let cur = gridStart;
    while (cur <= gridEnd) {
      if (isSameMonth(cur, monthStart)) {
        all.add(format(cur, "yyyy-MM-dd"));
      }
      cur = addDays(cur, 1);
    }
    setSelectedDates(all);
  };

  /* ---------- 날짜별 슬롯 상태 ---------- */
  const setSlotState = (dateKey, slot, on) => {
    setSlotsByDate(prev => {
      const next = new Map(prev);
      const set = new Set(next.get(dateKey) || []);
      if (on) set.add(slot); else set.delete(slot);
      next.set(dateKey, set);
      return next;
    });
  };

  const setAllForDate = (dateKey, on) => {
    setSlotsByDate(prev => {
      const next = new Map(prev);
      const availableSlots = availableSlotsByDate.get(dateKey) || [];
      const slotsToSet = on ? availableSlots : [];
      next.set(dateKey, new Set(slotsToSet));
      return next;
    });
  };

  /* ---------- 드래그 선택 ---------- */
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState(null);
  const dragVisitedRef = React.useRef(new Set());
  const cellKey = (dateKey, slot) => `${dateKey}#${slot}`;

  useEffect(() => {
    const onUp = () => {
      setIsDragging(false);
      setDragMode(null);
      dragVisitedRef.current.clear();
    };
    window.addEventListener("mouseup", onUp);
    return () => window.removeEventListener("mouseup", onUp);
  }, []);

  const handleSlotMouseDown = (dateKey, slot, isActive) => {
    const availableSlots = availableSlotsByDate.get(dateKey) || [];
    if (!availableSlots.includes(slot)) return;

    setIsDragging(true);
    const mode = isActive ? "remove" : "add";
    setDragMode(mode);
    const key = cellKey(dateKey, slot);
    dragVisitedRef.current.add(key);
    setSlotState(dateKey, slot, mode === "add");
  };

  const handleSlotMouseEnter = (dateKey, slot) => {
    if (!isDragging || !dragMode) return;

    const availableSlots = availableSlotsByDate.get(dateKey) || [];
    if (!availableSlots.includes(slot)) return;

    const key = cellKey(dateKey, slot);
    if (dragVisitedRef.current.has(key)) return;
    dragVisitedRef.current.add(key);
    setSlotState(dateKey, slot, dragMode === "add");
  };

  // 1. 페이지 진입 시 장소 기본 정보 조회
  useEffect(() => {
    const fetchAvailableDays = async () => {
      try {
        setLoading(prev => ({ ...prev, days: true }));
  
        // 현재 보고 있는 달(또는 원하는 달)
        const month = (new Date().getMonth() + 1); // 1~12
  
        const { data } = await axios.post(
          `/spaceon/reservation/3`, // 테스트용
          // `http://janghong.asia/reservation/available/days/${roomId}`,
        );
  
        // API 응답 예: { "days": [20, 21] }
        setAvailableDays(
          (data?.days ?? []).map(d =>
            // 필요하다면 YYYY-MM-DD 형태로 변환
            // 예시는 올해/이번달 기준
            format(new Date(new Date().getFullYear(), month - 1, d), "yyyy-MM-dd")
          )
        );
  
        console.log("available days:", data);
      } catch (err) {
        setError(err);
        console.error("Failed to fetch available days:", err);
        setAvailableDays([]);
      } finally {
        setLoading(prev => ({ ...prev, days: false }));
      }
    };
  
    if (roomId) fetchAvailableDays();
  }, [roomId]);

  // 2. 월(month) 변경 시 예약 가능한 날짜 조회
  useEffect(() => {
    const fetchAvailableDays = async () => {
      try {
        setLoading(prev => ({ ...prev, days: true }));
        const year = getYear(currentMonth);
        const month = getMonth(currentMonth) + 1;
        const response = await axios.post(`/api/reservation/available/days/${roomId}`, {
          params: { month },
        });
        const formattedDates = (response.data.availableDay || []).map(day => 
          format(new Date(year, month - 1, day), "yyyy-MM-dd")
        );
        setAvailableDays(formattedDates);
      } catch (err) {
        console.error("Failed to fetch available days:", err);
        setAvailableDays([]);
      } finally {
        setLoading(prev => ({ ...prev, days: false }));
      }
    };
    if (roomId) fetchAvailableDays();
  }, [roomId, currentMonth]);

  // 3. 날짜 선택 시 예약 가능한 시간 조회
  useEffect(() => {
    const fetchSlotsForSelectedDates = async () => {
      setLoading(prev => ({ ...prev, slots: true }));
      const newSlotsByDate = new Map(availableSlotsByDate);
      let needsUpdate = false;

      for (const dateKey of selectedDates) {
        if (!newSlotsByDate.has(dateKey)) {
          try {
            const dateObj = new Date(dateKey);
            const month = getMonth(dateObj) + 1;
            const day = getDate(dateObj);
            const response = await axios.post(`/api/reservation/available/timeslots/${roomId}`, {
              params: { month, day },
            });
            newSlotsByDate.set(dateKey, response.data.schedule || []);
            needsUpdate = true;
          } catch (err) {
            console.error(`Failed to fetch slots for ${dateKey}:`, err);
            newSlotsByDate.set(dateKey, []); // 에러 시 빈 배열
            needsUpdate = true;
          }
        }
      }
      if(needsUpdate) {
        setAvailableSlotsByDate(newSlotsByDate);
      }
      setLoading(prev => ({ ...prev, slots: false }));
    };

    if (roomId && selectedDates.size > 0) {
      fetchSlotsForSelectedDates();
    }
  }, [roomId, selectedDates]);


  // 4. 예약 완료 처리
  const handleReservation = async () => {
    if (!name || !phoneNumber) {
      alert("예약자 이름과 연락처를 입력해주세요.");
      return;
    }
    
    const reservedScheduleList = [];
    for (const [date, slots] of slotsByDate.entries()) {
      if (slots.size > 0) {
        reservedScheduleList.push({
          date: date,
          schedule: Array.from(slots).sort((a, b) => a - b),
        });
      }
    }

    if (reservedScheduleList.length === 0) {
      alert("날짜와 시간을 선택해주세요.");
      return;
    }
  
    const payload = {
      name,
      phoneNumber,
      numPeople: Number(numPeople),
      reservedScheduleList,
    };
  
    try {
      await axios.post(`/api/reservation/done/${roomId}`, payload);
      alert("예약이 완료되었습니다!");
      navigate('/');
    } catch (err) {
      console.error("Reservation failed:", err);
      alert(`예약에 실패했습니다: ${err.response?.data?.message || err.message}`);
    }
  };

  const selectedDateArr = useMemo(() => Array.from(selectedDates).sort(), [selectedDates]);

  return (
    <>
      <Page>
        <FormWrap>
          <InfoContainer>
            <TopWrapper>
              <Title>호스트이신가요? 나의 공실을 등록해보세요!</Title>
            </TopWrapper>
            <Subtitle>간단한 조건 입력으로 맞춤 공실을 찾아보세요</Subtitle>
          </InfoContainer>

          <Divider/>

          <BasicInfo 
            setName={setName}
            setPhoneNumber={setPhoneNumber}
            numPeople={numPeople} setNumPeople={setNumPeople}
            placeData={placeData}
          />

          <ButtonContainer>
            <CancelButton type="button" onClick={handleCancel}>취소</CancelButton>
            <SubmitButton type="submit" onClick={handleReservation}>등록</SubmitButton>
          </ButtonContainer>
        </FormWrap>

        <RightCol>
          <Calendar 
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
            today={today}
            selectedDates={selectedDates}
            toggleDate={toggleDate}
            selectAllThisMonth={selectAllThisMonth}
            availableDays={availableDays}
          />
          <TimeTable 
            selectedDateArr={selectedDateArr}
            availableSlotsByDate={availableSlotsByDate}
            slotsByDate={slotsByDate}
            handleSlotMouseDown={handleSlotMouseDown}
            handleSlotMouseEnter={handleSlotMouseEnter}
            setAllForDate={setAllForDate}
          />
        </RightCol>
      </Page>
    </>
  );
}
/* ========= styles ========= */
const Page = styled.div`
  display: grid;
  grid-template-columns: 1fr 60%;
  gap: 20px;
  padding: 20px;
  margin: 0 auto;
  font-family: 'Pretendard';
  align-items: stretch;
`;

const RightCol = styled.div`
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 0;
  height: 100%;
`;

const Panel = styled.div`
  background: ${colors.surface};
  border-radius: 8px;
  padding: 18px;
  border: 1px solid ${colors.line};
  box-shadow: 0 6px 22px rgba(0,0,0,0.05);
`;

const FormWrap = styled(Panel)`
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  gap: 14px;
  height: fit-content;
  padding: 24px;
  box-shadow: 0 -2px 23.9px 0 rgba(0, 0, 0, 0.10);
`;

const InfoContainer = styled.div`
  margin-bottom: 2.49vh;
`;

const TopWrapper = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 0.98vh;
`;

const Title = styled.div`
  font-weight: 700;
  font-size: 1.5vw;
`;

const Subtitle = styled.div`
  font-size: 1.1vw;
  color: #4e4e4e;
`;

const Divider = styled.div`
  width: 100%; height: 1px; background-color: #efefef; margin-bottom: 2.98vh;
`;

const ButtonContainer = styled.div`
  display: flex; justify-content: center; gap: 10px;
`;

const SubmitButton = styled.button`
  padding: 15px;
  background-color: #27D580;
  color: white;
  border: none; border-radius: 5px;
  font-size: 1.1em; cursor: pointer;
  transition: background-color 0.3s ease;
  flex: 1; width: 100px;
  &:hover { background-color: #23C172; }
`;

const CancelButton = styled.button`
  padding: 15px;
  background-color: #F7F7F7; color: #B3B3B3;
  border: none; border-radius: 5px;
  flex: 1; font-size: 1.1em; cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100px;
  &:hover { background-color: #EDEDED; }
`;
