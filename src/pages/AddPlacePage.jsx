// RegisterFormStyled.jsx
import React, { useEffect, useMemo, useState } from "react";
import styled, { css } from "styled-components";
import axios from "axios";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, isSameMonth
} from "date-fns";

/* ---------- 24시간/30분 슬롯 ---------- */
// 1~48 슬롯: 00:00~00:30 -> 1, 23:30~24:00 -> 48
const FULL_DAY_SLOTS = Array.from({ length: 48 }, (_, i) => i + 1);
const labelForSlot = (slot) => {
  const idx = slot - 1, startMin = idx * 30, endMin = startMin + 30;
  const sh = String(Math.floor(startMin / 60)).padStart(2, "0");
  const sm = String(startMin % 60).padStart(2, "0");
  const eh = String(Math.floor(endMin / 60)).padStart(2, "0");
  const em = String(endMin % 60).padStart(2, "0");
  return `${sh}:${sm}~${eh}:${em}`;
};
const timeRows = FULL_DAY_SLOTS.map((slot) => ({ slot, label: labelForSlot(slot) }));

/* ---------- 유틸 ---------- */
const compressSlots = (slotsArr) => {
  if (slotsArr.length === 0) return [];
  const arr = [...slotsArr].sort((a,b)=>a-b);
  const ranges = [];
  let start = arr[0], prev = arr[0];
  for (let i=1;i<arr.length;i++){
    if (arr[i] === prev + 1) prev = arr[i];
    else { ranges.push([start, prev]); start = prev = arr[i]; }
  }
  ranges.push([start, prev]);
  return ranges; // [ [s1,e1], ... ]
};

export default function RegisterFormStyled() {
  /* ---------- 기본 정보 ---------- */
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [account, setAccount] = useState("");
  const [maxPeople, setMaxPeople] = useState("");
  const [price, setPrice] = useState("");
  const [memo, setMemo] = useState("");

  /* ---------- 칩/옵션: 등록자가 입력 ---------- */
  const [chipInput, setChipInput] = useState("");
  const [chipList, setChipList] = useState([]);
  const addChip = () => {
    const v = chipInput.trim(); if (!v) return;
    setChipList((prev) => (prev.includes(v) ? prev : [...prev, v]));
    setChipInput("");
  };

  const [optionInput, setOptionInput] = useState("");
  const [optionList, setOptionList] = useState([]);
  const addOption = () => {
    const v = optionInput.trim(); if (!v) return;
    setOptionList((prev) => (prev.includes(v) ? prev : [...prev, v]));
    setOptionInput("");
  };

  /* ---------- 사진 업로드(드래그 앤 드롭 + 썸네일) ---------- */
  const [dragging, setDragging] = useState(false);
  const [photoList, setPhotoList] = useState([]);   // File[]
  const [previews, setPreviews] = useState([]);     // { url, name }[]

  const addFiles = (files) => {
    const arr = Array.from(files || []);
    if (!arr.length) return;
    setPhotoList((prev) => [...prev, ...arr]);
  };
  const onFileInput = (e) => addFiles(e.target.files);
  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); };
  useEffect(() => {
    const urls = photoList.map((file) => ({ url: URL.createObjectURL(file), name: file.name }));
    setPreviews((prev) => { prev.forEach((p) => URL.revokeObjectURL(p.url)); return urls; });
    return () => { urls.forEach((p) => URL.revokeObjectURL(p.url)); };
  }, [photoList]);
  const removePhoto = (idx) => setPhotoList((prev) => prev.filter((_, i) => i !== idx));

  /* ---------- 캘린더 ---------- */
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarCells = useMemo(() => {
    const cells = []; let cur = gridStart;
    while (cur <= gridEnd) { cells.push(cur); cur = addDays(cur, 1); }
    return cells;
  }, [gridStart, gridEnd]);

  const [selectedDates, setSelectedDates] = useState(new Set()); // Set<yyyy-MM-dd>
  const toggleDate = (d) => {
    const key = format(d, "yyyy-MM-dd");
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };
  const selectAllThisMonth = () => {
    const all = new Set();
    calendarCells.forEach((d) => { if (isSameMonth(d, monthStart)) all.add(format(d, "yyyy-MM-dd")); });
    setSelectedDates(all);
  };

  /* ---------- 날짜별 슬롯 상태 ---------- */
  const [slotsByDate, setSlotsByDate] = useState(new Map()); // Map<dateKey, Set<number>>
  const setSlotState = (dateKey, slot, on) => {
    setSlotsByDate(prev => {
      const next = new Map(prev);
      const set = new Set(next.get(dateKey) || []);
      if (on) set.add(slot); else set.delete(slot);
      next.set(dateKey, set);
      return next;
    });
  };
  const toggleSlot = (dateKey, slot) => {
    setSlotsByDate(prev => {
      const next = new Map(prev);
      const set = new Set(next.get(dateKey) || []);
      if (set.has(slot)) set.delete(slot); else set.add(slot);
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
  const [dragMode, setDragMode] = useState(null); // 'add' | 'remove' | null
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
    if (dragVisitedRef.current.has(key)) return; // 중복 처리 방지
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
      <Title>등록</Title>
      <Page>
        {/* 좌측: 캘린더 + 타임테이블 + 선택 요약 */}
        <div>
          <CalendarWrap>
            <CalendarHeader>
              <MonthText>{format(today, "yyyy. MM")}</MonthText>
              <Button onClick={selectAllThisMonth}>전체 선택</Button>
            </CalendarHeader>

            <CalendarGrid>
              {["SUN","MON","TUE","WED","THU","FRI","SAT"].map((w,i)=>(
                <DayCell key={i} dim={i===0} style={{color: i===0 ? "#ff6b6b" : i===6 ? "#4a7bff" : "#7a7e8b"}}>{w}</DayCell>
              ))}
              {calendarCells.map((d, idx) => {
                const key = format(d, "yyyy-MM-dd");
                const selected = selectedDates.has(key);
                return (
                  <DateCell key={idx} onClick={()=>toggleDate(d)} selected={selected} dim={!isSameMonth(d, monthStart)}>
                    {format(d, "d")}
                  </DateCell>
                );
              })}
            </CalendarGrid>
          </CalendarWrap>

          <TimeTableWrap>
            <SectionLabel>가능 시간대 (30분 단위 / 24시간)</SectionLabel>
            <Table cols={selectedDateArr.length}>
              <TH>Time</TH>
              {selectedDateArr.map((d) => {
                const allSelected = (slotsByDate.get(d)?.size || 0) === FULL_DAY_SLOTS.length;
                return (
                  <TH key={d}>
                    <THHead>{d}</THHead>
                    <THControls>
                      <label>
                        <input type="checkbox" checked={allSelected} onChange={(e)=>setAllForDate(d, e.target.checked)} />
                        전체 가능
                      </label>
                      <Button onClick={()=>setAllForDate(d, false)}>전체 해제</Button>
                    </THControls>
                  </TH>
                );
              })}

              {timeRows.map(({ slot, label }) => (
                <TR key={slot}>
                  <TimeCell>{label}</TimeCell>
                  {selectedDateArr.map((d) => {
                    const active = (slotsByDate.get(d) || new Set()).has(slot);
                    return (
                      <SlotCell
                        key={`${d}-${slot}`}
                        active={active}
                        onMouseDown={() => handleSlotMouseDown(d, slot, active)}
                        onMouseEnter={() => handleSlotMouseEnter(d, slot)}
                        onClick={(e) => e.preventDefault()} // 드래그 중 클릭 토글 중복 방지
                      >
                        {active ? slot : ""}
                      </SlotCell>
                    );
                  })}
                </TR>
              ))}
            </Table>
          </TimeTableWrap>

          <SelectedWrap>
            <SectionLabel>선택한 시간대 요약</SectionLabel>
            {selectedDateArr.length === 0 ? (
              <Hint>날짜를 선택하면 이곳에 요약이 표시됩니다.</Hint>
            ) : (
              <SelectedGrid>
                {selectedDateArr.map((d) => {
                  const set = slotsByDate.get(d) || new Set();
                  const slots = Array.from(set);
                  const ranges = compressSlots(slots);
                  return (
                    <React.Fragment key={d}>
                      <DateBadge>{d}</DateBadge>
                      <RangeChips>
                        {ranges.length === 0 ? (
                          <Hint>선택된 시간이 없습니다.</Hint>
                        ) : (
                          ranges.map(([s, e], idx) => {
                            const startLabel = labelForSlot(s).split("~")[0];
                            const endLabel = labelForSlot(e).split("~")[1];
                            return (
                              <RangeChip key={`${d}-${s}-${e}-${idx}`}>
                                {startLabel}~{endLabel} (슬롯 {s}–{e})
                              </RangeChip>
                            );
                          })
                        )}
                      </RangeChips>
                    </React.Fragment>
                  );
                })}
              </SelectedGrid>
            )}
          </SelectedWrap>
        </div>

        {/* 우측: 입력 폼 */}
        <FormWrap>
          {/* 기본 입력 */}
          <div>
            <Row>
              <Input placeholder="장소명을 입력해주세요." value={name} onChange={(e)=>setName(e.target.value)} />
              <Input placeholder="전화번호를 입력해주세요." value={phoneNumber} onChange={(e)=>setPhoneNumber(e.target.value)} />
            </Row>
            <Row style={{marginTop: 10}}>
              <Input placeholder="주소를 입력해주세요." value={address} onChange={(e)=>setAddress(e.target.value)} />
              <Input placeholder="계좌번호를 입력해주세요. (은행 포함)" value={account} onChange={(e)=>setAccount(e.target.value)} />
            </Row>
            <Row style={{marginTop: 10}}>
              <Input type="number" placeholder="최대 가능 인원은 몇 명인가요?" value={maxPeople} onChange={(e)=>setMaxPeople(e.target.value)} />
              <Input type="number" placeholder="30분 당 금액을 알려주세요." value={price} onChange={(e)=>setPrice(e.target.value)} />
            </Row>
          </div>

          {/* 칩 리스트 (등록자가 입력) */}
          <div>
            <SectionLabel>칩 리스트</SectionLabel>
            <Pills>{chipList.map((c)=> <Pill key={c}>{c}</Pill>)}</Pills>
            <AddPillWrap>
              <Input placeholder="예: 조용한, 햇살좋음, 반려동물가능…" value={chipInput} onChange={(e)=>setChipInput(e.target.value)} />
              <SmallButton onClick={addChip}>＋ 추가</SmallButton>
            </AddPillWrap>
            <Hint>※ 등록자가 직접 추가합니다. 초기값은 없습니다.</Hint>
          </div>

          {/* 옵션 리스트 (등록자가 입력) */}
          <div>
            <SectionLabel>옵션(편의시설) 입력</SectionLabel>
            <ChipsInputWrap>
              <Input placeholder="예: 에어컨, 와이파이, 주차…" value={optionInput} onChange={(e)=>setOptionInput(e.target.value)} />
              <SmallButton onClick={addOption}>＋ 추가</SmallButton>
            </ChipsInputWrap>
            <Pills style={{marginTop: 8}}>{optionList.map((o)=> <Pill key={o}>{o}</Pill>)}</Pills>
            <Hint>※ 선택식이 아니라 등록자가 직접 작성합니다.</Hint>
          </div>

          {/* 메모 */}
          <div>
            <SectionLabel>하실 말씀이 있으시다면 편하게 적어주세요.</SectionLabel>
            <TextArea value={memo} onChange={(e)=>setMemo(e.target.value)} placeholder="예) 야외 소음이 있을 수 있습니다." />
          </div>

          {/* 사진 드래그 앤 드롭 + 썸네일 */}
          <div>
            <SectionLabel>사진 업로드</SectionLabel>
            <PhotosBox
              dragging={dragging}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <DropArea>파일을 여기로 드래그 앤 드롭하거나, 아래에서 선택하세요.</DropArea>
              <div style={{marginTop: 10}}>
                <input type="file" multiple onChange={onFileInput} />
              </div>

              {previews.length > 0 && (
                <PreviewGrid>
                  {previews.map((p, i) => (
                    <Thumb key={p.url}>
                      <img src={p.url} alt={p.name} />
                      <RemoveBtn onClick={()=>removePhoto(i)}>×</RemoveBtn>
                    </Thumb>
                  ))}
                </PreviewGrid>
              )}
            </PhotosBox>
          </div>
        </FormWrap>
      </Page>

      <SubmitBar>
        <SubmitBtn onClick={onSubmit}>등록</SubmitBtn>
      </SubmitBar>
    </>
  );
}


/* ---------- 레이아웃 / 공통 ---------- */
const Page = styled.div`
  display: grid; grid-template-columns: 1.1fr 1.9fr;
  gap: 24px; padding: 24px; max-width: 1200px; margin: 0 auto;
`;
const Title = styled.h1`
  grid-column: 1 / -1; font-size: 48px; font-weight: 800; margin: 8px 0 0;
`;
const Panel = styled.div`
  background: #f7f7fb; border-radius: 20px; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.06);
`;
const SectionLabel = styled.div`font-weight: 700; margin-bottom: 10px; color: #222;`;
const Button = styled.button`
  padding: 8px 12px; border-radius: 12px; border: none; background: #eef1ff; font-weight: 600; cursor: pointer;
  &:hover { background: #e2e6ff; }
`;

/* ---------- 캘린더 ---------- */
const CalendarWrap = styled(Panel)``;
const CalendarHeader = styled.div`display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;`;
const MonthText = styled.div`font-size: 22px; font-weight: 700;`;
const CalendarGrid = styled.div`display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px;`;
const DayCell = styled.div`
  padding: 10px 0; text-align: center; border-radius: 10px; font-weight: 600;
  ${({ dim }) => dim && css`color: #b8b8c6;`}
`;
const DateCell = styled.button`
  padding: 10px 0; border-radius: 12px; background: #fff; border: 1px solid #ececf3; font-weight: 600; cursor: pointer;
  ${({ selected }) => selected && css`background: #2f6bff; color: #fff; border-color: #2f6bff;`}
  ${({ dim }) => dim && css`opacity: 0.55;`}
`;

/* ---------- 타임테이블 ---------- */
const TimeTableWrap = styled(Panel)`margin-top: 16px; overflow: auto;`;
const Table = styled.div`
  min-width: 860px; display: grid; grid-template-columns: 130px repeat(${({ cols }) => cols}, 1fr);
  border-radius: 12px; overflow: hidden; border: 1px solid #e8e8f3;
`;
const TH = styled.div`background: #eef0f7; padding: 10px 12px; text-align: center; border-right: 1px solid #e8e8f3;`;
const THHead = styled.div`font-weight: 800; margin-bottom: 6px;`;
const THControls = styled.div`
  display: flex; gap: 8px; justify-content: center; align-items: center; font-size: 12px; color: #5d5f6d;
  input { transform: scale(1.1); margin-right: 4px; }
`;
const TR = styled.div`display: contents;`;
const TimeCell = styled.div`
  background: #fdfdff; padding: 10px 12px; border-right: 1px solid #f0f0f7; border-top: 1px solid #f0f0f7;
  font-weight: 600; color: #6c6e7a;
`;
const SlotCell = styled.button`
  padding: 10px 12px; border-right: 1px solid #f0f0f7; border-top: 1px solid #f0f0f7;
  cursor: pointer; background: ${({ active }) => (active ? "#ffd9a8" : "#ffffff")};
  font-weight: 600; user-select: none;
  &:hover { background: ${({ active }) => (active ? "#ffc788" : "#f7f8ff")}; }
`;

/* ---------- 폼 입력 ---------- */
const FormWrap = styled(Panel)`display: grid; grid-template-rows: auto auto 1fr auto; gap: 14px; height: fit-content;`;
const Row = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 12px;`;
const Input = styled.input`
  width: 100%; padding: 14px 16px; border-radius: 14px; border: 1px solid #e7e7f1; background: #fff; font-size: 15px;
  &::placeholder { color: #b6b6c6; }
`;
const TextArea = styled.textarea`
  width: 100%; padding: 14px 16px; border-radius: 14px; border: 1px solid #e7e7f1; background: #fff; min-height: 100px; resize: vertical;
`;
const Pills = styled.div`display: flex; flex-wrap: wrap; gap: 8px;`;
const Pill = styled.span`background: #ffefe9; color: #e85b34; padding: 8px 12px; border-radius: 999px; font-weight: 700; font-size: 13px;`;
const ChipsInputWrap = styled.div`display: flex; gap: 8px; align-items: center;`;
const AddPillWrap = styled.div`display: flex; gap: 8px; align-items: center; margin-top: 6px;`;
const SmallButton = styled(Button)`padding: 8px 10px; border-radius: 10px;`;
const Hint = styled.div`font-size: 12px; color: #8a8fa3; margin-top: 6px;`;

/* ---------- 사진 업로드(드래그 앤 드롭 + 썸네일) ---------- */
const PhotosBox = styled.div`
  border: 2px dashed ${({ dragging }) => (dragging ? "#2f6bff" : "#d9dcf5")};
  border-radius: 16px; padding: 16px; background: #fbfbff; transition: 0.15s;
`;
const DropArea = styled.div`
  display: flex; align-items: center; justify-content: center;
  height: 120px; border-radius: 12px; background: #f4f6ff; color: #6e77a7;
`;
const PreviewGrid = styled.div`display: grid; grid-template-columns: repeat(auto-fill, 120px); gap: 10px; margin-top: 12px;`;
const Thumb = styled.div`
  width: 120px; height: 120px; border-radius: 12px; overflow: hidden; position: relative; background: #e9ecff;
  img { width: 100%; height: 100%; object-fit: cover; display: block; }
`;
const RemoveBtn = styled.button`
  position: absolute; top: 6px; right: 6px; width: 24px; height: 24px;
  border: none; border-radius: 50%; background: rgba(0,0,0,0.6); color: #fff; cursor: pointer;
`;

/* ---------- 선택 요약 ---------- */
const SelectedWrap = styled(Panel)`margin-top: 16px;`;
const SelectedGrid = styled.div`display: grid; grid-template-columns: 140px 1fr; row-gap: 10px; column-gap: 12px;`;
const DateBadge = styled.div`font-weight: 800; color: #2f6bff; align-self: center;`;
const RangeChips = styled.div`display: flex; flex-wrap: wrap; gap: 8px;`;
const RangeChip = styled.span`
  background: #e9f0ff; color: #1746d1; padding: 6px 10px; border-radius: 999px;
  font-weight: 700; font-size: 12px; border: 1px solid #d2defc;
`;

/* ---------- 제출 버튼 ---------- */
const SubmitBar = styled.div`grid-column: 1 / -1; margin-top: 10px; display: flex; justify-content: center;`;
const SubmitBtn = styled.button`
  width: 320px; padding: 16px 20px; font-size: 22px; font-weight: 800;
  border-radius: 16px; border: none; background: #2f6bff; color: #fff;
  box-shadow: 0 12px 26px rgba(47,107,255,0.35); cursor: pointer;
  &:hover { filter: brightness(1.05); }
`;
