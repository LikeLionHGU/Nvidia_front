// src/pages/ReservationPage.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import styled from "styled-components";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  format,
  getYear,
  getMonth,
  getDate,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  addDays,
} from "date-fns";

import BasicInfo from "../components/specific/ReservationPage/ResBasicInfo";
import Calendar from "../components/specific/ReservationPage/ResCalendar";
import TimeTable from "../components/specific/ReservationPage/ResTimeTable";
import Thumbnail from "../components/specific/ReservationPage/Thumbnail";

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

  const handleCancel = () => navigate("/");

  const toggleDate = (d) => {
    const key = format(d, "yyyy-MM-dd");
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
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
      if (isSameMonth(cur, monthStart)) all.add(format(cur, "yyyy-MM-dd"));
      cur = addDays(cur, 1);
    }
    setSelectedDates(all);
  };

  /* ---------- 날짜별 슬롯 상태 ---------- */
  const setSlotState = (dateKey, slot, on) => {
    setSlotsByDate((prev) => {
      const next = new Map(prev);
      const set = new Set(next.get(dateKey) || []);
      if (on) set.add(slot);
      else set.delete(slot);
      next.set(dateKey, set);
      return next;
    });
  };

  const setAllForDate = (dateKey, on) => {
    setSlotsByDate((prev) => {
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

  /* ========== 1) 장소 기본 정보 (POST) ========== */
  useEffect(() => {
    const fetchPlace = async () => {
      try {
        setLoading((p) => ({ ...p, page: true }));
        const { data } = await axios.post(`/spaceon/reservation/${roomId}`);
        
        // ==================================================================
        // ============== 더미 데이터 삽입 (디자인 확인용) =================
        // ============== 나중에 이 부분만 지우면 됩니다 ===================
        const modifiedData = {
            ...data,
            optionList: ["WiFi", "주차", "에어컨", "냉장고"],
            chipList: ["컬러풀한🎨", "포근하안🕊️", "활기이찬💪"],
        };
        setPlaceData(modifiedData);

        const dummyEnrollmentData = [
            {
                "date": "2025-08-24",
                "selectedTimeSlotIndex": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 
                  11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 
                  21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 
                  31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 
                  41, 42, 43, 44, 45, 46, 47, 48]
            },
            {
                "date": "2025-08-27",
                "selectedTimeSlotIndex": [3,4,21,22,23,24,25]
            }
        ];

        const dummyAvailableDays = dummyEnrollmentData.map(item => item.date);
        setAvailableDays(dummyAvailableDays);

        const dummySlotsByDate = new Map();
        dummyEnrollmentData.forEach(item => {
            dummySlotsByDate.set(item.date, item.selectedTimeSlotIndex);
        });
        setAvailableSlotsByDate(dummySlotsByDate);
        // ==================================================================

      } catch (err) {
        console.error("Failed to fetch place data:", err);
        setError(err);
        // 더미 폴백
        const dummy = {
          roomId: Number(roomId),
          photoList: [
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop",
          ],
          address: {
            roadName: "서울특별시 강남구 테헤란로 521",
            latitude: 37.5061,
            longitude: 127.0537,
          },
          maxPeople: 6,
          phoneNumber: "010-1234-5678",
          price: 40000,
          account: "신한 110-123-456789",
          chipList: ["WIFI", "주차 가능"],
          optionList: ["TV", "화이트보드"],
        };
        setPlaceData(dummy);
      } finally {
        setLoading((p) => ({ ...p, page: false }));
      }
    };
    if (roomId) fetchPlace();
  }, [roomId]);

  /* ========== 2) 월 변경 시 가능 날짜 (POST body:{month}) ========== */
  useEffect(() => {
    const fetchAvailableDays = async () => {
      try {
        setLoading((p) => ({ ...p, days: true }));
        const year = getYear(currentMonth);
        const month = getMonth(currentMonth) + 1;

        const { data } = await axios.post(
          `/spaceon/reservation/available/days/${roomId}`,
          { month }
        );

        // 서버 스펙: { availableDay: Set<int, ...> }
        const list = Array.from(data?.availableDay ?? []);
        const formatted = list.map((day) =>
          format(new Date(year, month - 1, day), "yyyy-MM-dd")
        );
        setAvailableDays(formatted);
        // 월이 바뀌면 해당 월 외의 선택은 초기화(선택 유지 원하면 제거)
        setSelectedDates((prev) => {
          const next = new Set(
            Array.from(prev).filter((d) => getMonth(new Date(d)) + 1 === month)
          );
          return next;
        });
      } catch (err) {
        console.error("Failed to fetch available days:", err);
        setAvailableDays([]);
      } finally {
        setLoading((p) => ({ ...p, days: false }));
      }
    };
    if (roomId) fetchAvailableDays();
  }, [roomId, currentMonth]);

  /* ========== 3) 날짜 선택 시 가능 슬롯 (POST body:{month,day}) ========== */
  useEffect(() => {
    const fetchSlotsForSelectedDates = async () => {
      setLoading((p) => ({ ...p, slots: true }));
      const newSlotsByDate = new Map(availableSlotsByDate);
      let needsUpdate = false;

      for (const dateKey of selectedDates) {
        if (!newSlotsByDate.has(dateKey)) {
          try {
            const dateObj = new Date(dateKey);
            const month = getMonth(dateObj) + 1;
            const day = getDate(dateObj);

            const resp = await axios.post(
              `/spaceon/reservation/available/timeslots/${roomId}`,
              { month, day }
            );
            const schedule = Array.from(resp?.data?.schedule ?? []);
            newSlotsByDate.set(dateKey, schedule);
            needsUpdate = true;
            console.log("slots for", dateKey, "=>", schedule);
          } catch (err) {
            console.error(`Failed to fetch slots for ${dateKey}:`, err);
            newSlotsByDate.set(dateKey, []); // 에러 시 빈 배열
            needsUpdate = true;
          }
        }
      }
      if (needsUpdate) setAvailableSlotsByDate(newSlotsByDate);
      setLoading((p) => ({ ...p, slots: false }));
    };

    if (roomId && selectedDates.size > 0) {
      fetchSlotsForSelectedDates();
    }
  }, [roomId, selectedDates]); // eslint-disable-line

  /* ========== 4) 예약 완료 (POST body: reservedScheduleList[]) ========== */
  const handleReservation = async () => {
    if (!name || !phoneNumber) {
      alert("예약자 이름과 연락처를 입력해주세요.");
      return;
    }

    // spec: reservedScheduleList : List[{ name, phoneNumber, reservation:{ date, schedule:int[] } }]
    const reservedScheduleList = [];
    for (const [date, slots] of slotsByDate.entries()) {
      if (slots.size > 0) {
        reservedScheduleList.push({
          name,
          phoneNumber,
          reservation: {
            date, // "yyyy-MM-dd"
            schedule: Array.from(slots).sort((a, b) => a - b),
          },
        });
      }
    }

    if (reservedScheduleList.length === 0) {
      alert("날짜와 시간을 선택해주세요.");
      return;
    }

    try {
      await axios.post(`/spaceon/reservation/done/${roomId}`, {
        reservedScheduleList,
      });
      alert("예약이 완료되었습니다!");
      navigate("/");
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
              <Title>오늘의 공간을 찾아보세요</Title>
            </TopWrapper>
            <Subtitle>간단한 조건 입력으로 맞춤 공실을 찾아보세요</Subtitle>
          </InfoContainer>

          <Divider />

          <Thumbnail placeData={placeData} />

          <BasicInfo
            setName={setName}
            setPhoneNumber={setPhoneNumber}
            numPeople={numPeople}
            setNumPeople={setNumPeople}
            placeData={placeData}
            slotsByDate={slotsByDate}
          />

          <ButtonContainer>
            <CancelButton type="button" onClick={handleCancel}>
              취소
            </CancelButton>
            <SubmitButton type="button" onClick={handleReservation}>
              등록
            </SubmitButton>
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
  font-family: "Pretendard";
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
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.05);
`;

const FormWrap = styled(Panel)`
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  gap: 14px;
  height: fit-content;
  padding: 24px;
  box-shadow: 0 -2px 23.9px 0 rgba(0, 0, 0, 0.1);
`;

const InfoContainer = styled.div`
  margin-bottom: 2.49vh;
`;

const TopWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  width: 100%;
  height: 1px;
  background-color: #efefef;
  margin-bottom: 1vh;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
`;

const SubmitButton = styled.button`
  padding: 15px;
  background-color: #27D580;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1.1em;
  cursor: pointer;
  transition: background-color 0.3s ease;
  flex: 1;
  width: 100px;
  &:hover {
    background-color: #23c172;
  }
`;

const CancelButton = styled.button`
  padding: 15px;
  background-color: #f7f7f7;
  color: #b3b3b3;
  border: none;
  border-radius: 5px;
  flex: 1;
  font-size: 1.1em;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100px;
  &:hover {
    background-color: #ededed;
  }
`;