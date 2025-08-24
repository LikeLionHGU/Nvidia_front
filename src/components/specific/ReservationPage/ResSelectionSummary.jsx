// src/components/specific/ReservationPage/ResSelectionSummary.jsx
import React from "react";
import styled from "styled-components";
import { format, parseISO } from "date-fns";

const colors = {
  brand: "#2FB975",
  brandDark: "#269964",
  brandSoft: "#EAF9F2",
  sub: "#6B7280",
  line: "#E5E7EB",
  surface: "#FFFFFF",
  text: "#374151",
};

/** 단일 슬롯(1~48)을 HH:mm~HH:mm 라벨로 변환 (끝은 다음 슬롯 시작시간) */
const slotToRangeLabel = (startSlot, endSlot) => {
  // endSlot은 포함 구간의 마지막 슬롯 번호 (1~48)
  // 실제 표시 종료 시각은 endSlot의 다음 슬롯 시작시각
  const sIdx = startSlot - 1;
  const eIdx = endSlot; // 다음 슬롯 시작

  const sMin = sIdx * 30;
  const eMin = eIdx * 30;

  const sh = String(Math.floor(sMin / 60)).padStart(2, "0");
  const sm = String(sMin % 60).padStart(2, "0");
  const eh = String(Math.floor(eMin / 60)).padStart(2, "0");
  const em = String(eMin % 60).padStart(2, "0");

  return `${sh}:${sm}~${eh}:${em}`;
};

/** 같은 날의 슬롯 배열(숫자)을 연속 구간으로 병합 */
const mergeContinuousSlots = (slots = []) => {
  if (!slots.length) return [];
  const sorted = [...slots].sort((a, b) => a - b);

  // 풀타임(1~48)인 경우 바로 리턴
  if (sorted.length === 48 && sorted[0] === 1 && sorted[47] === 48) {
    return [];
  }

  const ranges = [];
  let start = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i];
    if (cur === prev + 1) {
      // 연속
      prev = cur;
    } else {
      // 끊김 → 구간 확정
      ranges.push({ start, end: prev });
      start = cur;
      prev = cur;
    }
  }
  // 마지막 구간
  ranges.push({ start, end: prev });

  return ranges.map(({ start, end }) => ({
    label: slotToRangeLabel(start, end),
  }));
};

export default function ResSelectionSummary({ slotsByDate }) {
  // slotsByDate: Map<"yyyy-MM-dd", Set<number>>
  const rows = [];

  if (slotsByDate instanceof Map) {
    const dateKeys = Array.from(slotsByDate.keys()).sort();
    for (const dateKey of dateKeys) {
      const set = slotsByDate.get(dateKey);
      if (!set || set.size === 0) continue;

      const dayLabel = format(parseISO(dateKey), "yyyy/MM/dd");
      const merged = mergeContinuousSlots(Array.from(set));

      if (merged.length === 1 && merged[0].full) {
        rows.push({ date: dayLabel, text: "FULL-TIME", full: true });
      } else {
        for (const r of merged) {
          rows.push({ date: dayLabel, text: r.label, full: false });
        }
      }
    }
  }

  return (
    <Box>
      <List aria-label="예약 요약 목록">
        {rows.length === 0 ? (
          <Empty>날짜와 시간을 선택하면 요약이 표시됩니다.</Empty>
        ) : (
          rows.map((r, i) => (
            <Item key={`${r.date}-${i}`}>
              <DateText>{r.date}</DateText>
              <TimeText $full={r.full}>{r.full ? "FULL-TIME" : r.text}</TimeText>
            </Item>
          ))
        )}
      </List>
    </Box>
  );
}

/* ===== styles ===== */

const BOX_WIDTH = 230;     //  오른쪽 요약 박스 고정 폭
const BOX_HEIGHT = 240;    //  박스 높이 제한 (내부 스크롤)

const Box = styled.div`
  width: 100%;
`;

const List = styled.div`
  height: 31vh;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: ${colors.surface};
  border: 1px solid ${colors.line};
  border-radius: 10px;
  padding: 8px 10px;
`;

const Empty = styled.div`
  font-size: 12.5px;
  color: ${colors.sub};
  padding: 6px 2px;
`;

const Item = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 9px 10px;
  margin: 6px 0;
  border-radius: 8px;
  background: #f7f7f7;

  &:nth-child(odd) {
    background: #f9fafb;
  }
`;

const DateText = styled.span`
  flex: 0 0 auto;
  font-weight: 700;
  color: ${colors.text};
  font-size: 12px;
`;

const TimeText = styled.span`
  flex: 1 1 auto;
  font-weight: 800;
  font-size: 13px;
  color: ${({ $full }) => ($full ? colors.brandDark : colors.brand)};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;