// RegisterFormStyled.jsx
import React, { useEffect, useMemo, useState } from "react";
import styled, { css } from "styled-components";
import axios from "axios";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, isSameMonth
} from "date-fns";
import ImgUploadField from "../assets/images/DragUploadImg.svg";

/* ===================== Palette / Tokens ===================== */
const colors = {
  brand: "#2FB975",
  brandDark: "#269964",
  brandSoft: "#EAF9F2",
  brandSofter: "#F5FBF8",
  ink: "#111827",
  text: "#374151",
  sub: "#6B7280",
  line: "#E5E7EB",
  lineSoft: "#EEF2F5",
  surface: "#FFFFFF",
  surfaceSoft: "#FAFBFC",
  warn: "#F59E0B",

  // timetable
  slotActive: "#CFF3E1",      // active 셀 배경 (밝은 그린)
  slotActiveHover: "#B7E8D2", // active hover
  slotHover: "#F4FAF7",       // 비활성 hover
};

/* ---------- 24시간/30분 슬롯 ---------- */
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
  for (let i=1;i<arr.length;i++) {
    if (arr[i] === prev + 1) prev = arr[i];
    else { ranges.push([start, prev]); start = prev = arr[i]; }
  }
  ranges.push([start, prev]);
  return ranges;
};

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function RegisterFormStyled() {
  /* ---------- 기본 정보 ---------- */
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [account, setAccount] = useState("");
  const [maxPeople, setMaxPeople] = useState("");
  const [price, setPrice] = useState("");
  const [memo, setMemo] = useState("");

  /* ---------- 칩/옵션 ---------- */
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

  /* ---------- 사진 업로드 ---------- */
  const [dragging, setDragging] = useState(false);
  const [photoList, setPhotoList] = useState([]);
  const [previews, setPreviews] = useState([]);

  const addFiles = (files) => {
    const arr = Array.from(files || []); if (!arr.length) return;
    setPhotoList((prev) => [...prev, ...arr]);
  };
  const onFileInput = (e) => {
    addFiles(e.target.files);
    e.target.value = null;
  };
  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); };

  useEffect(() => {
    const urls = photoList.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    }));
    setPreviews((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));
      return urls;
    });
    return () => {
      urls.forEach((p) => URL.revokeObjectURL(p.url));
    };
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
    const all = new Set();
    calendarCells.forEach((d) => { if (isSameMonth(d, monthStart)) all.add(format(d, "yyyy-MM-dd")); });
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
        {/* 왼쪽: 입력 폼 */}
        <FormWrap>

        <InfoContainer>
          <TopWrapper>
            <Title>호스트이신가요? 나의 공실을 등록해보세요!</Title>
          </TopWrapper>
          <Subtitle>간단한 조건 입력으로 맞춤 공실을 찾아보세요</Subtitle>
        </InfoContainer>

        <Divider/>

          <ImageUploadRow>
            <ImgUploadArea
              $dragging={dragging}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <input
                type="file"
                multiple
                onChange={onFileInput}
                style={{ display: 'none' }}
                id="file-upload"
                accept="image/jpeg, image/png"
              />
              <label htmlFor="file-upload">
                <img src={ImgUploadField} alt="Upload" />
              </label>
            </ImgUploadArea>

            <PreviewContainer>
              <UploadTitle>등록할 사진을 업로드해주세요</UploadTitle>
              <UploadSubtitle>jpg, png 파일만 가능합니다</UploadSubtitle>
              <PreviewList>
                {previews.length > 0 ? (
                  previews.map((p, i) => (
                    <PreviewItem key={p.url}>
                      <PreviewThumb src={p.url} alt={p.name} />
                      <FileInfo>
                        <FileName>{p.name}</FileName>
                        <FileSize>{formatBytes(p.size)}</FileSize>
                      </FileInfo>
                      <DeleteBtn onClick={(e) => { e.stopPropagation(); removePhoto(i); }}>×</DeleteBtn>
                    </PreviewItem>
                  ))
                ) : (
                  <div style={{ fontSize: '0.8rem', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.sub }}>
                    업로드된 이미지가 없습니다.
                  </div>
                )}
              </PreviewList>
            </PreviewContainer>
          </ImageUploadRow>
          <InputField>
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
          
            <SectionLabel>칩 리스트</SectionLabel>
            <Pills>{chipList.map((c)=> <Pill key={c}>{c}</Pill>)}</Pills>
            <AddPillWrap>
              <Input placeholder="예: 조용한, 햇살좋음, 반려동물가능…" value={chipInput} onChange={(e)=>setChipInput(e.target.value)} />
              <SmallButton onClick={addChip}>＋ 추가</SmallButton>
            </AddPillWrap>
            <Hint>※ 등록자가 직접 추가합니다. 초기값은 없습니다.</Hint>
          
            <SectionLabel>옵션(편의시설) 입력</SectionLabel>
            <ChipsInputWrap>
              <Input placeholder="예: 에어컨, 와이파이, 주차…" value={optionInput} onChange={(e)=>setOptionInput(e.target.value)} />
              <SmallButton onClick={addOption}>＋ 추가</SmallButton>
            </ChipsInputWrap>
            <Pills style={{marginTop: 8}}>{optionList.map((o)=> <Pill key={o}>{o}</Pill>)}</Pills>
          
            <SectionLabel>하실 말씀이 있으시다면 편하게 적어주세요.</SectionLabel>
            <TextArea value={memo} onChange={(e)=>setMemo(e.target.value)} placeholder="예) 야외 소음이 있을 수 있습니다." />
          </InputField>
        </FormWrap>

        {/* 오른쪽: 캘린더 + 타임테이블 + 선택 요약 */}
        <div>
          <CalendarWrap>
            <CalendarHeader>
              <MonthText>{format(today, "yyyy. MM")}</MonthText>
              <GhostButton onClick={selectAllThisMonth}>전체 선택</GhostButton>
            </CalendarHeader>

            <CalendarGrid>
              {["SUN","MON","TUE","WED","THU","FRI","SAT"].map((w,i)=> (
                <DayCell
                  key={i}
                  $dim={i===0}
                  style={{color: i===0 ? "#ff6b6b" : i===6 ? "#4a7bff" : colors.sub}}
                >
                  {w}
                </DayCell>
              ))}
              {calendarCells.map((d, idx) => {
                const key = format(d, "yyyy-MM-dd");
                const selected = selectedDates.has(key);
                return (
                  <DateCell
                    key={idx}
                    onClick={()=>toggleDate(d)}
                    selected={selected}
                    $dim={!isSameMonth(d, monthStart)}
                  >
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
                      <GhostButton onClick={()=>setAllForDate(d, false)}>전체 해제</GhostButton>
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
                        onClick={(e) => e.preventDefault()}
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
      </Page>

      <SubmitBar>
        <SubmitBtn onClick={onSubmit}>등록</SubmitBtn>
      </SubmitBar>
    </>
  );
}

/* ===================== Styles ===================== */


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
const SectionLabel = styled.div`
  font-weight: 700;
  margin-bottom: 10px;
  color: ${colors.text};
`;
const GhostButton = styled.button`
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid ${colors.line};
  background: ${colors.surface};
  font-weight: 600;
  color: ${colors.text};
  cursor: pointer;
  &:hover { background: ${colors.surfaceSoft}; }
`;

/* ---------- 캘린더 ---------- */
const CalendarWrap = styled(Panel)``;
const CalendarHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;
`;
const MonthText = styled.div`font-size: 20px; font-weight: 800; color: ${colors.ink};`;
const CalendarGrid = styled.div`display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px;`;
const DayCell = styled.div`
  padding: 8px 0; text-align: center; border-radius: 10px; font-weight: 700;
  ${({ $dim }) => $dim && css`opacity: 0.95;`}
`;
const DateCell = styled.button`
  padding: 10px 0;
  border-radius: 10px;
  background: ${colors.surface};
  border: 1px solid ${colors.line};
  color: ${colors.text};
  font-weight: 700;
  cursor: pointer;
  transition: 120ms ease;
  &:hover { background: ${colors.brandSofter}; border-color: ${colors.brand}; }
  ${({ selected }) => selected && css`
    background: ${colors.brand};
    color: #fff;
    border-color: ${colors.brand};
    box-shadow: 0 6px 16px rgba(47,185,117,0.28);
  `}
  ${({ $dim }) => $dim && css`opacity: 0.55;`}
`;

/* ---------- 타임테이블 ---------- */
const TimeTableWrap = styled(Panel)`margin-top: 16px; overflow: auto;`;
const Table = styled.div`
  min-width: 860px;
  display: grid; grid-template-columns: 130px repeat(${({ cols }) => cols}, 1fr);
  border-radius: 12px; overflow: hidden; border: 1px solid ${colors.line};
`;
const TH = styled.div`
  background: ${colors.surfaceSoft};
  padding: 10px 12px; text-align: center; border-right: 1px solid ${colors.line};
  font-weight: 700; color: ${colors.text};
`;
const THHead = styled.div`font-weight: 800; margin-bottom: 6px;`;
const THControls = styled.div`
  display: flex; gap: 8px; justify-content: center; align-items: center;
  font-size: 12px; color: ${colors.sub};
  input { transform: scale(1.1); margin-right: 4px; }
`;
const TR = styled.div`display: contents;`;
const TimeCell = styled.div`
  background: ${colors.surface};
  padding: 10px 12px;
  border-right: 1px solid ${colors.line};
  border-top: 1px solid ${colors.line};
  font-weight: 600; color: ${colors.sub};
`;
const SlotCell = styled.button`
  padding: 10px 12px;
  border-right: 1px solid ${colors.line};
  border-top: 1px solid ${colors.line};
  cursor: pointer;
  background: ${({ active }) => (active ? colors.slotActive : colors.surface)};
  color: ${colors.ink};
  font-weight: 600; user-select: none;
  transition: 120ms ease;
  &:hover {
    background: ${({ active }) => (active ? colors.slotActiveHover : colors.slotHover)};
  }
`;

/* ---------- 폼 입력 ---------- */
const FormWrap = styled(Panel)`
  display: grid; grid-template-rows: auto auto 1fr auto; gap: 14px; height: fit-content;
  padding: 24px;
`;
const Row = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 12px;`;

const InputField = styled.div`
  border-radius: 4px;
  border: 1px solid #FBFBFB;
  background: #FBFBFB;
  padding: 18px 11px 18px 12px;
`

const Input = styled.input`
  width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid ${colors.line};
  background: ${colors.surface}; font-size: 15px; color: ${colors.ink};
  transition: 120ms ease;
  &::placeholder { color: ${colors.sub}; }
  &:focus { outline: none; border-color: ${colors.brand}; box-shadow: 0 0 0 3px ${colors.brandSoft}; }
`;
const TextArea = styled.textarea`
  width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid ${colors.line};
  background: ${colors.surface}; min-height: 100px; resize: vertical; color: ${colors.ink};
  &:focus { outline: none; border-color: ${colors.brand}; box-shadow: 0 0 0 3px ${colors.brandSoft}; }
`;
const Pills = styled.div`display: flex; flex-wrap: wrap; gap: 8px;`;
const Pill = styled.span`
  background: ${colors.brandSoft};
  color: ${colors.brandDark};
  padding: 8px 12px;
  border-radius: 999px;
  font-weight: 700; font-size: 13px;
  border: 1px solid rgba(47,185,117,0.25);
`;
const ChipsInputWrap = styled.div`display: flex; gap: 8px; align-items: center;`;
const AddPillWrap = styled.div`display: flex; gap: 8px; align-items: center; margin-top: 6px;`;
const SmallButton = styled(GhostButton)`padding: 8px 10px;` ;
const Hint = styled.div`font-size: 12px; color: ${colors.sub}; margin-top: 6px;`;

/* ---------- 사진 업로드 ---------- */
const ImageUploadRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;
  height: 159px;
`;

const ImgUploadArea = styled.div`
  border-radius: 14px;
  background: ${({ $dragging }) => ($dragging ? colors.brandSofter : '#FBFBFB')};
  transition: all 0.2s ease-in-out;
  display: flex;
  cursor: pointer;

  label {
    cursor: pointer;
    display: flex;
    width: 100%;
    height: 100%;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const PreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #FBFBFB;
  padding: 8px 15px;
  overflow-y: auto;
`;

const UploadTitle = styled.div`
  font-weight: 700;
  font-size: 1rem;
  color: ${colors.ink};
`;

const UploadSubtitle = styled.div`
  font-size: 0.7rem;
  color: ${colors.sub};
  margin-bottom: 10px;
`;

const PreviewList = styled.div`
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #FBFBFB;
  height: 100%;
`;

const PreviewItem = styled.div`
  display: flex;
  align-items: center;
  background: ${colors.surface};
  border-radius: 8px;
  border: 1px solid ${colors.lineSoft};
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  width: 100%;
`;

const PreviewThumb = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  margin-right: 12px;
  flex-shrink: 0;
`;

const FileInfo = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-right: 8px;
`;

const FileName = styled.div`
  font-size: 14px;
  color: ${colors.text};
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FileSize = styled.div`
  font-size: 12px;
  color: ${colors.sub};
`;

const DeleteBtn = styled.button`
  width: 1px;
  height: 15px;
  margin-right: 10px;
  border: none;
  border-radius: 50%;
  background: ${colors.line};
  color: ${colors.sub};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 1;
  flex-shrink: 0;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: ${colors.warn};
    color: #fff;
  }
`;

/* ---------- 선택 요약 ---------- */
const SelectedWrap = styled(Panel)`margin-top: 16px;`;
const SelectedGrid = styled.div`display: grid; grid-template-columns: 140px 1fr; row-gap: 10px; column-gap: 12px;`;
const DateBadge = styled.div`font-weight: 800; color: ${colors.brandDark}; align-self: center;`;
const RangeChips = styled.div`display: flex; flex-wrap: wrap; gap: 8px;`;
const RangeChip = styled.span`
  background: ${colors.brandSofter};
  color: ${colors.brandDark};
  padding: 6px 10px; border-radius: 999px;
  font-weight: 700; font-size: 12px; border: 1px solid ${colors.brandSoft};
`;

/* ---------- 제출 버튼 ---------- */
const SubmitBar = styled.div`grid-column: 1 / -1; margin-top: 10px; display: flex; justify-content: center;`;
const SubmitBtn = styled.button`
  width: 320px; padding: 16px 20px; font-size: 20px; font-weight: 800;
  border-radius: 14px; border: none; background: ${colors.brand}; color: #fff;
  box-shadow: 0 10px 24px rgba(47,185,117,0.28); cursor: pointer;
  transition: 140ms ease;
  &:hover { background: ${colors.brandDark}; }
`;
