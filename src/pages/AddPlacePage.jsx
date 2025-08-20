import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { format, startOfMonth, isSameMonth, addDays, endOfMonth, startOfWeek, endOfWeek } from "date-fns";

import ImageUploader from "../components/specific/AddPlacePage/ImageUploader";
import BasicInfoForm from "../components/specific/AddPlacePage/BasicInfoForm";
import ChipInput from "../components/specific/AddPlacePage/ChipInput";
import Calendar from "../components/specific/AddPlacePage/Calendar";
import TimeTable from "../components/specific/AddPlacePage/TimeTable";
import SelectionSummary from "../components/specific/AddPlacePage/SelectionSummary";

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
  const [address, setAddress] = useState("");
  const [account, setAccount] = useState("");
  const [maxPeople, setMaxPeople] = useState("");
  const [price, setPrice] = useState("");
  const [memo, setMemo] = useState("");

  /* ---------- 칩/옵션 ---------- */
  const [chipList, setChipList] = useState([]);
  const [optionList, setOptionList] = useState([]);

  /* ---------- 사진 업로드 ---------- */
  const [photoList, setPhotoList] = useState([]);

  /* ---------- 캘린더 ---------- */
  const today = new Date();
  const [selectedDates, setSelectedDates] = useState(new Set());

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
        if(isSameMonth(cur, monthStart)){
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
    const enrollmentTimeTable = Array.from(selectedDates)
      .map((dateKey) => {
        const set = slotsByDate.get(dateKey) || new Set();
        const sorted = Array.from(set).sort((a, b) => a - b).map((s) => ({ slot: s }));
        return { date: dateKey, availableSlot: sorted };
      })
      .filter((row) => row.availableSlot.length > 0);

    const fd = new FormData();
    fd.append("name", name);
    fd.append("phoneNumber", phoneNumber);
    fd.append("address", address);
    fd.append("account", account);
    fd.append("maxPeople", parseInt(maxPeople || "0", 10));
    fd.append("price", parseInt(price || "0", 10));
    fd.append("memo", memo);
    fd.append("optionList", JSON.stringify(optionList));
    fd.append("chipList", JSON.stringify(chipList));
    fd.append("enrollmentTimeTable", JSON.stringify(enrollmentTimeTable));
    photoList.forEach((f) => fd.append("photoList", f));

    try {
      const res = await axios.post("/api/register", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("등록 완료!");
      console.log(res.data);
    } catch (e) {
      console.error(e);
      alert("등록 실패. 콘솔을 확인하세요.");
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

          <ImageUploader photoList={photoList} setPhotoList={setPhotoList} />
          
          <BasicInfoForm 
            name={name} setName={setName}
            phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber}
            address={address} setAddress={setAddress}
            account={account} setAccount={setAccount}
            maxPeople={maxPeople} setMaxPeople={setMaxPeople}
            price={price} setPrice={setPrice}
            memo={memo} setMemo={setMemo}
          />

          <ChipInput 
            label="칩 리스트"
            placeholder="예: 조용한, 햇살좋음, 반려동물가능…"
            hint="※ 등록자가 직접 추가합니다. 초기값은 없습니다."
            chipList={chipList}
            setChipList={setChipList}
          />

          <ChipInput
            label="옵션(편의시설) 입력"
            placeholder="예: 에어컨, 와이파이, 주차…"
            chipList={optionList}
            setChipList={setOptionList}
          />

        </FormWrap>

        <div>
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

          <SelectionSummary 
            selectedDateArr={selectedDateArr}
            slotsByDate={slotsByDate}
          />
        </div>
      </Page>

      <SubmitBar>
        <SubmitBtn onClick={onSubmit}>등록</SubmitBtn>
      </SubmitBar>
    </>
  );
}

const Page = styled.div`
  display: grid;
  grid-template-columns: 1fr 60%;
  gap: 20px;
  padding: 20px;
  margin: 0 auto;
  font-family: 'Pretendard';
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
`;

const InfoContainer = styled.div`
  margin-bottom: 2.49vh;
`;

const TopWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.98vh;
  > img {
    width: 1.67vw;
    height: 2.34vh;
  }
`;

const Title = styled.div`
  font-family: 'Pretendard';
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
  margin-bottom: 2.98vh;
`;

const SubmitBar = styled.div`
  grid-column: 1 / -1; 
  margin-top: 10px; 
  display: flex; 
  justify-content: center;
`;

const SubmitBtn = styled.button`
  width: 320px; 
  padding: 16px 20px; 
  font-size: 20px; 
  font-weight: 800;
  border-radius: 14px; 
  border: none; 
  background: ${colors.brand}; 
  color: #fff;
  box-shadow: 0 10px 24px rgba(47,185,117,0.28); 
  cursor: pointer;
  transition: 140ms ease;
  &:hover { background: ${colors.brandDark}; }
`;