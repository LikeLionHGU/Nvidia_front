
import React from 'react';
import styled from 'styled-components';

const colors = {
  brandDark: "#269964",
  brandSoft: "#EAF9F2",
  sub: "#6B7280",
  line: "#E5E7EB",
  surface: "#FFFFFF",
  text: "#374151",
};

const Panel = styled.div`
  background: ${colors.surface};
  border-radius: 8px;
  padding: 18px;
  border: 1px solid ${colors.line};
  box-shadow: 0 6px 22px rgba(0,0,0,0.05);
`;

const labelForSlot = (slot) => {
  const idx = slot - 1, startMin = idx * 30, endMin = startMin + 30;
  const sh = String(Math.floor(startMin / 60)).padStart(2, "0");
  const sm = String(startMin % 60).padStart(2, "0");
  const eh = String(Math.floor(endMin / 60)).padStart(2, "0");
  const em = String(endMin % 60).padStart(2, "0");
  return `${sh}:${sm}~${eh}:${em}`;
};

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

export default function SelectionSummary({ selectedDateArr, slotsByDate }) {
  return (
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
  );
}

const SectionLabel = styled.div`
  font-weight: 700;
  margin-bottom: 10px;
  color: ${colors.text};
`;

const Hint = styled.div`font-size: 12px; color: ${colors.sub}; margin-top: 6px;`;

const SelectedWrap = styled(Panel)`margin-top: 16px;`;
const SelectedGrid = styled.div`display: grid; grid-template-columns: 140px 1fr; row-gap: 10px; column-gap: 12px;`;
const DateBadge = styled.div`font-weight: 800; color: ${colors.brandDark}; align-self: center;`;
const RangeChips = styled.div`display: flex; flex-wrap: wrap; gap: 8px;`;
const RangeChip = styled.span`
  background: ${colors.brandSoft};
  color: ${colors.brandDark};
  padding: 6px 10px; border-radius: 999px;
  font-weight: 700; font-size: 12px; border: 1px solid ${colors.brandSoft};
`;
