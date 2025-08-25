// src/pages/ReservationPage.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import styled from "styled-components";
import api from "../apis/client";
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
import ResSuccessModal from "../components/specific/ReservationPage/ResSuccessModal";

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
  const [isAgreed, setIsAgreed] = useState(false);

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reservationDetails, setReservationDetails] = useState(null);

  const today = new Date();

  const handleCancel = () => navigate("/");

  const handleReset = () => {
    setName("");
    setPhoneNumber("");
    setNumPeople(undefined);
    setSelectedDates(new Set());
    setSlotsByDate(new Map());
    setIsAgreed(false);
  };

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
  // ReservationPage.jsx (일부발췌)
useEffect(() => {
  const fetchPlace = async () => {
    try {
      setLoading((p) => ({ ...p, page: true }));
      const { data } = await api.post(`/reservation/${roomId}`);

      // --- 응답 정규화: Thumbnail이 기대하는 형태로 맞추기 ---
      const normalize = (d) => {
        // d.photoList가 문자열, 배열(문자열/객체), 혹은 다른 키로 올 수 있으니 안전 처리
        let photos = [];
        if (Array.isArray(d?.photoList)) {
          photos = d.photoList.map((p) => (typeof p === 'string' ? p : p?.url)).filter(Boolean);
        } else if (typeof d?.photoList === 'string') {
          photos = [d.photoList];
        } else if (Array.isArray(d?.photos)) {           // 혹시 photos라는 키로 올 때
          photos = d.photos.map((p) => (typeof p === 'string' ? p : p?.url)).filter(Boolean);
        } else if (typeof d?.thumbnailUrl === 'string') { // 썸네일만 단일 키로 올 때
          photos = [d.thumbnailUrl];
        }

        return {
          ...d,
          photoList: photos,
          // 주소 키도 안전 처리
          address: d.address ?? {
            roadName: d.roadName ?? d.addressRoad ?? '',
            latitude: d.latitude ?? null,
            longitude: d.longitude ?? null,
          },
          chipList: Array.isArray(d.chipList) ? d.chipList : [],
          optionList: Array.isArray(d.optionList) ? d.optionList : [],
        };
      };

      const normalized = normalize(data);
      setPlaceData(normalized); 

    } catch (err) {
      console.error("Failed to fetch place data:", err);
      setError(err);
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

        const { data } = await api.post(
          `/reservation/available/days/${roomId}`,
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

            const resp = await api.post(
              `/reservation/available/timeslots/${roomId}`,
              { month, day }
            );
            const schedule = Array.from(resp?.data?.schedule ?? []);
            newSlotsByDate.set(dateKey, schedule);
            needsUpdate = true;
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

  /* ========== 4) 예약 완료 (POST body: List<ReservationRequest>) ========== */
  const handleReservation = async () => {
    if (!isAgreed) {
      alert("예약 서비스 이용 약관에 동의해주세요.");
      return;
    }

    if (!name || !phoneNumber) {
      alert("예약자 이름과 연락처를 입력해주세요.");
      return;
    }

    // 서버가 받는 List<ReservationRequest> 형태로 배열 생성
    const requests = [];
    let totalSlots = 0;
    for (const [date, slots] of slotsByDate.entries()) {
      if (slots.size > 0) {
        totalSlots += slots.size;
        requests.push({
          // ReservationRequest 필드에 맞춰 명명
          name,
          phoneNumber,
          date, // "yyyy-MM-dd"
          schedule: Array.from(slots).sort((a, b) => a - b), // number[]
        });
      }
    }

    if (requests.length === 0) {
      alert("날짜와 시간을 선택해주세요.");
      return;
    }

    try {
      // 배열을 그대로 전송
      await api.post(
        `/reservation/done/${roomId}`,
        requests
      );

      // 예약 성공 시 모달에 필요한 정보 구성
      const pricePer30min = placeData?.price || 0;
      const totalPrice = totalSlots * pricePer30min;
      const hours = totalSlots * 0.5;

      setReservationDetails({
        name,
        phone: phoneNumber,
        headcount: numPeople,
        totalPrice,
        pricePer30min,
        hours,
        // ResSelectionSummary에 필요한 정보 추가 (대표 날짜와 시간으로 단순화)
        date: requests.length > 0 ? new Date(requests[0].date) : new Date(),
        time: requests.length > 0 ? { start: requests[0].schedule[0], end: requests[0].schedule[requests[0].schedule.length - 1] } : {start: 0, end: 0}
      });
      
      setIsModalOpen(true);

    } catch (err) {
      console.error("Reservation failed:", err);
      alert(`예약에 실패했습니다: ${err.response?.data || err.message}`);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    navigate("/"); // 모달 닫으면 홈으로 이동
  };

  const selectedDateArr = useMemo(() => Array.from(selectedDates).sort(), [selectedDates]);

  return (
    <>
      <Page>
        <FormWrap>
          <InfoContainer>
            <TopWrapper>
              <Title>나의 맞춤 공간을 예약해보세요!</Title>
            </TopWrapper>
            <Subtitle>간편하고 빠르게 예약할 수 있어요</Subtitle>
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
            isAgreed={isAgreed}
            setIsAgreed={setIsAgreed}
          />

          <ButtonContainer>
            <CancelButton type="button" onClick={handleReset}>
              초기화
            </CancelButton>
            <SubmitButton type="button" onClick={handleReservation}>
              예약
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
      <ResSuccessModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        details={reservationDetails}
        slotsByDate={slotsByDate}
      />
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
