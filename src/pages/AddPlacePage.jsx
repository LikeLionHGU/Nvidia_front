// ... 기존 import 그대로
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import api from "../apis/client";
import {
  format,
  startOfMonth, isSameMonth, addDays,
  endOfMonth, startOfWeek, endOfWeek
} from "date-fns";
import { useNavigate } from 'react-router-dom';

import ImageUploader from "../components/specific/AddPlacePage/ImageUploader";
import BasicInfoForm from "../components/specific/AddPlacePage/BasicInfoForm";
import Calendar from "../components/specific/AddPlacePage/Calendar";
import TimeTable from "../components/specific/AddPlacePage/TimeTable";
import { Geocode } from "../apis/Geocode";
import SuccessModal from "../components/specific/AddPlacePage/SuccessModal";

const colors = {
  brand: "#2FB975",
  brandDark: "#269964",
  surface: "#FFFFFF",
  line: "#E5E7EB",
  text: "#374151",
};

const FULL_DAY_SLOTS = Array.from({ length: 48 }, (_, i) => i + 1);

export default function AddPlacePage() {
  /* ---------- 기본 정보 ---------- */
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [roadName, setRoadName] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [account, setAccount] = useState("");
  const [maxPeople, setMaxPeople] = useState("");
  const [price, setPrice] = useState("");
  const [memo, setMemo] = useState("");

  /* ---------- 칩/옵션 ---------- */
  const [chipList, setChipList] = useState([]);
  const [optionList, setOptionList] = useState("");

  /* ---------- 사진 업로드 ---------- */
  const [photoList, setPhotoList] = useState([]);

  /* ---------- 캘린더 ---------- */
  const today = new Date();
  const [selectedDates, setSelectedDates] = useState(new Set());

  const navigate = useNavigate();

  const [showSuccess, setShowSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (showSuccess) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showSuccess]);

  const openSuccess = (url) => {
    setPreviewUrl(url || null);
    setShowSuccess(true);
  };
  const closeSuccess = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setShowSuccess(false);
  };

  const handleCancel = () => {
    navigate('/');
  };

  const handleReset = () => {
    setName("");
    setPhoneNumber("");
    setRoadName("");
    setLatitude(null);
    setLongitude(null);
    setAccount("");
    setMaxPeople("");
    setPrice("");
    setMemo("");
    setChipList([]);
    setOptionList("");
    setPhotoList([]);
    setSelectedDates(new Set());
    setSlotsByDate(new Map());
  };

  const toggleDate = (d) => {
    const key = format(d, "yyyy-MM-dd");
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
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
  const [slotsByDate, setSlotsByDate] = useState(new Map());
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
      next.set(dateKey, new Set(on ? FULL_DAY_SLOTS : []));
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
    setIsDragging(true);
    const mode = isActive ? "remove" : "add";
    setDragMode(mode);
    const key = cellKey(dateKey, slot);
    dragVisitedRef.current.add(key);
    setSlotState(dateKey, slot, mode === "add");
  };

  const handleSlotMouseEnter = (dateKey, slot) => {
    if (!isDragging || !dragMode) return;
    const key = cellKey(dateKey, slot);
    if (dragVisitedRef.current.has(key)) return;
    dragVisitedRef.current.add(key);
    setSlotState(dateKey, slot, dragMode === "add");
  };

  /* ---------- 제출 ---------- */
  const onSubmit = async () => {
    // 1) 필수값 검증
    if (
      !name || !phoneNumber || !roadName || !account ||
      !maxPeople || !price || chipList.length === 0 ||
      photoList.length === 0 || selectedDates.size === 0
    ) {
      alert("필수 입력 항목을 모두 채워주세요. (옵션과 주의사항 제외)");
      return;
    }
  
    // 2) 날짜별 슬롯 → DTO
    const enrollmentTimeDto = Array.from(selectedDates)
      .map((dateKey) => {
        const set = slotsByDate.get(dateKey) || new Set();
        const sorted = Array.from(set).sort((a, b) => a - b).map(Number);
        return { date: dateKey, selectedTimeSlotIndex: sorted };
      })
      .filter(row => row.selectedTimeSlotIndex.length > 0);
  
    if (enrollmentTimeDto.length === 0) {
      alert("선택된 시간이 없습니다. 시간 슬롯을 선택해주세요.");
      return;
    }
  
    // 3) 옵션 문자열 → 리스트
    const optionArray = (optionList || "")
      .split(",")
      .map(v => v.trim())
      .filter(Boolean);
  
    // 4) 주소 → 위경도
    let geoData = { roadName, latitude: null, longitude: null };
    try {
      const result = await Geocode({ query: roadName });
      geoData.latitude = result.latitude;
      geoData.longitude = result.longitude;
    } catch (err) {
      console.error("Geocoding error:", err);
      alert("올바른 주소를 입력해주세요.");
      return;
    }
  
    // 5) FormData 구성
    const requestPayload = {
      enName: name,
      enPhoneNumber: phoneNumber,
      roadName: geoData.roadName,
      latitude: geoData.latitude,
      longitude: geoData.longitude,
      account,
      maxPeople: parseInt(maxPeople || "0", 10),
      price: parseInt(price || "0", 10),
      memo,
      optionList: optionArray,     // List<String>
      chipList,                    // List<String>
      enrollmentTimeDto,           // List<{ date, selectedTimeSlotIndex:int[] }>
    };
  
    const fd = new FormData();
  
    // JSON 파트 (request)
    fd.append(
      "request",
      new Blob([JSON.stringify(requestPayload)], { type: "application/json" })
    );
  
    // 파일 파트 (imageFile 여러 번 추가) → @RequestPart("imageFile") List<MultipartFile> files
    photoList.forEach((file) => {
      fd.append("imageFile", file, file.name);
    });
  
    // 디버그: 실제 전송되는 FormData 확인
    for (const [k, v] of fd.entries()) {
    }
  
    // 6) 전송 (Content-Type 수동 지정 X)
    try {
      const res = await api.post("/enrollment/done", fd);
  
      const first = photoList[0];
      const url = first ? URL.createObjectURL(first) : null;
      openSuccess(url);
    } catch (e) {
      console.error("등록 실패:", e.response?.status, e.response?.data || e);
      alert(`등록 실패: ${e.response?.data?.error || e.message}`);
    }
  };

  // const onSubmit = async () => {
  //   // 1) 필수값 검증
  //   if (
  //     !name || !phoneNumber || !roadName || !account ||
  //     !maxPeople || !price || chipList.length === 0 ||
  //     photoList.length === 0 || selectedDates.size === 0
  //   ) {
  //     alert("필수 입력 항목을 모두 채워주세요. (옵션과 주의사항 제외)");
  //     return;
  //   }
  
  //   // 2) 날짜별 슬롯 → DTO
  //   const enrollmentTimeDto = Array.from(selectedDates)
  //     .map((dateKey) => {
  //       const set = slotsByDate.get(dateKey) || new Set();
  //       const sorted = Array.from(set).sort((a, b) => a - b).map(Number);
  //       return { date: dateKey, selectedTimeSlotIndex: sorted };
  //     })
  //     .filter(row => row.selectedTimeSlotIndex.length > 0);
  
  //   if (enrollmentTimeDto.length === 0) {
  //     alert("선택된 시간이 없습니다. 시간 슬롯을 선택해주세요.");
  //     return;
  //   }
  
  //   // 3) 옵션 문자열 → 리스트
  //   const optionArray = (optionList || "")
  //     .split(",")
  //     .map(v => v.trim())
  //     .filter(Boolean);
  
  //   // 4) 주소 → 위경도
  //   let geoData = { roadName, latitude: null, longitude: null };
  //   try {
  //     const result = await Geocode({ query: roadName });
  //     geoData.latitude = result.latitude;
  //     geoData.longitude = result.longitude;
  //   } catch (err) {
  //     console.error("Geocoding error:", err);
  //     alert("올바른 주소를 입력해주세요.");
  //     return;
  //   }
  
  //   // 5) FormData 구성 (★ JSON Blob 없이 폼필드로 전송)
  //   const fd = new FormData();
  
  //   // 단일 필드들
  //   fd.append("enName", name);
  //   fd.append("enPhoneNumber", phoneNumber);
  //   fd.append("roadName", geoData.roadName || roadName);
  //   if (geoData.latitude != null) fd.append("latitude", String(geoData.latitude));
  //   if (geoData.longitude != null) fd.append("longitude", String(geoData.longitude));
  //   fd.append("account", account);
  //   fd.append("maxPeople", String(parseInt(maxPeople || "0", 10)));
  //   fd.append("price", String(parseInt(price || "0", 10)));
  //   if (memo) fd.append("memo", memo);
  
  //   // 배열/리스트 필드들 (같은 키 반복 방식)
  //   optionArray.forEach(v => fd.append("optionList", v));
  //   chipList.forEach(v => fd.append("chipList", v));
  
  //   // 중첩 리스트: enrollmentTimeDto[i].date / enrollmentTimeDto[i].selectedTimeSlotIndex
  //   enrollmentTimeDto.forEach((row, i) => {
  //     fd.append(`enrollmentTimeDto[${i}].date`, row.date);
  //     row.selectedTimeSlotIndex.forEach((slotIdx) => {
  //       // 다중 값(반복 키)로 전달 → Spring 컬렉션 바인딩
  //       fd.append(`enrollmentTimeDto[${i}].selectedTimeSlotIndex`, String(slotIdx));
  //     });
  //   });
  
  //   // 파일 파트 (여러 장)
  //   photoList.forEach((file) => {
  //     fd.append("imageFile", file, file.name);
  //   });
  
  //   // 6) 전송 (Content-Type 수동 지정 X → 브라우저가 boundary 포함 자동 설정)
  //   try {
  //     const res = await api.post("/enrollment/done", fd);
  //     const first = photoList[0];
  //     const url = first ? URL.createObjectURL(first) : null;
  //     openSuccess(url);
  //   } catch (e) {
  //     console.error("등록 실패:", e.response?.status, e.response?.data || e);
  //     alert(`등록 실패: ${e.response?.data?.error || e.message}`);
  //   }
  // };

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

          <ImageUploader photoList={photoList} setPhotoList={setPhotoList} />
          <BasicInfoForm 
            name={name} setName={setName}
            phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber}
            address={roadName} setAddress={setRoadName}
            account={account} setAccount={setAccount}
            maxPeople={maxPeople} setMaxPeople={setMaxPeople}
            price={price} setPrice={setPrice}
            memo={memo} setMemo={setMemo}
            selectedTags={chipList}
            onConfirmSelection={setChipList}
            optionList={optionList}
            setOptionList={setOptionList}
          />

          <ButtonContainer>
            <CancelButton type="button" onClick={handleReset}>초기화</CancelButton>
            <SubmitButton type="submit" onClick={onSubmit}>등록</SubmitButton>
          </ButtonContainer>
        </FormWrap>

        <RightCol>
          <Calendar 
            today={today}
            selectedDates={selectedDates}
            toggleDate={toggleDate}
            selectAllThisMonth={selectAllThisMonth}
          />
          <TimeTable 
            selectedDateArr={selectedDateArr}
            slotsByDate={slotsByDate}
            handleSlotMouseDown={handleSlotMouseDown}
            handleSlotMouseEnter={handleSlotMouseEnter}
            setAllForDate={setAllForDate}
          />
        </RightCol>
      </Page>

      <SuccessModal 
        show={showSuccess}
        onClose={closeSuccess}
        previewUrl={previewUrl}
        name={name}
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