import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { format, getYear, getMonth, getDate } from "date-fns";

import ResBasicInfoDisplay from "../components/specific/ReservationPage/ResBasicInfoDisplay";
import ResCalendar from "../components/specific/ReservationPage/ResCalendar";
import ResTimeTable from "../components/specific/ReservationPage/ResTimeTable";
import ResSelectionSummary from "../components/specific/ReservationPage/ResSelectionSummary";

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
  const [availableSlots, setAvailableSlots] = useState([]);

  // 사용자 입력 및 선택 상태
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null); // YYYY-MM-DD 형식
  const [selectedSlots, setSelectedSlots] = useState(new Set());

  // 1. 페이지 진입 시 장소 기본 정보 조회
  useEffect(() => {
    const fetchPlaceData = async () => {
      try {
        setLoading(prev => ({ ...prev, page: true }));
        const response = await axios.get(`/api/reservation/${roomId}`);
        setPlaceData(response.data);
      } catch (err) {
        setError(err);
        console.error("Failed to fetch place data:", err);
      } finally {
        setLoading(prev => ({ ...prev, page: false }));
      }
    };
    if (roomId) fetchPlaceData();
  }, [roomId]);

  // 2. 월(month) 변경 시 예약 가능한 날짜 조회
  useEffect(() => {
    const fetchAvailableDays = async () => {
      try {
        setLoading(prev => ({ ...prev, days: true }));
        const year = getYear(currentMonth);
        const month = getMonth(currentMonth) + 1;
        const response = await axios.get(`/api/reservation/available/days/${roomId}`, {
          params: { month }, // API 명세에 year가 없으므로 month만 전송
        });
        // 숫자 배열을 YYYY-MM-DD 형식으로 변환
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
    const fetchAvailableSlots = async () => {
      if (!selectedDate) {
        setAvailableSlots([]);
        return;
      }
      try {
        setLoading(prev => ({ ...prev, slots: true }));
        const dateObj = new Date(selectedDate);
        const month = getMonth(dateObj) + 1;
        const day = getDate(dateObj);
        const response = await axios.get(`/api/reservation/available/timeslots/${roomId}`, {
          params: { month, day },
        });
        setAvailableSlots(response.data.schedule || []);
      } catch (err) {
        console.error("Failed to fetch available slots:", err);
        setAvailableSlots([]);
      } finally {
        setLoading(prev => ({ ...prev, slots: false }));
      }
    };
    if (roomId) fetchAvailableSlots();
  }, [roomId, selectedDate]);

  const handleDateClick = useCallback((dateKey) => {
    setSelectedDate(dateKey);
    setSelectedSlots(new Set());
  }, []);

  const handleSlotClick = useCallback((slot) => {
    setSelectedSlots(prev => {
      const next = new Set(prev);
      if (next.has(slot)) next.delete(slot); else next.add(slot);
      return next;
    });
  }, []);

  // 4. 예약 완료 처리
  const handleReservation = async () => {
    if (!name || !phoneNumber) {
      alert("예약자 이름과 연락처를 입력해주세요.");
      return;
    }
    if (!selectedDate || selectedSlots.size === 0) {
      alert("날짜와 시간을 선택해주세요.");
      return;
    }

    const payload = {
      reservedScheduleList: [
        {
          name: name,
          phoneNumber: phoneNumber,
          reservation: {
            date: selectedDate, // "yyyy-MM-dd"
            schedule: Array.from(selectedSlots).sort((a, b) => a - b),
          },
        },
      ],
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

  if (loading.page) return <LoadingContainer>페이지 정보를 불러오는 중...</LoadingContainer>;
  if (error) return <ErrorContainer>오류가 발생했습니다: {error.message}</ErrorContainer>;
  if (!placeData) return <Container>데이터가 없습니다.</Container>;

  return (
    <Page>
      <FormWrap>
        <InfoContainer>
          <TopWrapper><Title>공실 예약하기</Title></TopWrapper>
          <Subtitle>원하는 날짜와 시간을 선택하여 예약하세요</Subtitle>
        </InfoContainer>
        <Divider />
        
        <ResBasicInfoDisplay {...placeData} />
        
        <UserInputSection>
          <InputLabel>예약자 이름</InputLabel>
          <StyledInput type="text" value={name} onChange={e => setName(e.target.value)} placeholder="이름을 입력하세요" />
          <InputLabel>연락처</InputLabel>
          <StyledInput type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="연락처를 입력하세요 ('-' 제외)" />
        </UserInputSection>

        <ResSelectionSummary
          placeName={placeData.enName || "선택된 공간"}
          selectedDate={selectedDate}
          selectedSlots={selectedSlots}
          price={placeData.price}
        />
        <ButtonContainer>
          <CancelButton type="button" onClick={() => navigate('/')}>취소</CancelButton>
          <SubmitButton type="button" onClick={handleReservation}>예약하기</SubmitButton>
        </ButtonContainer>
      </FormWrap>

      <RightCol>
        <ResCalendar
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          availableDates={availableDays}
          selectedDate={selectedDate}
          onDateClick={handleDateClick}
          isLoading={loading.days}
        />
        {selectedDate && (
          <ResTimeTable
            availableSlots={availableSlots}
            selectedSlots={selectedSlots}
            onSlotClick={handleSlotClick}
            isLoading={loading.slots}
          />
        )}
      </RightCol>
    </Page>
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
  grid-template-rows: auto auto 1fr auto auto;
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

const UserInputSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const InputLabel = styled.label`
  font-weight: 600;
  font-size: 0.9rem;
  color: #374151;
`;

const StyledInput = styled.input`
  padding: 10px;
  border: 1px solid #D1D5DB;
  border-radius: 4px;
  font-size: 1rem;
  font-family: 'Pretendard';
  &::placeholder {
    color: #9CA3AF;
  }
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

const LoadingContainer = styled.div`
  display: flex; justify-content: center; align-items: center; height: 100vh; font-size: 1.5rem;
`;

const ErrorContainer = styled(LoadingContainer)`
  color: red;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 680px;
  margin: 0 auto;
`;
