
import React, { useState } from 'react';
import styled from 'styled-components';

const colors = {
  brand: "#2FB975",
  brandDark: "#269964",
  brandSoft: "#EAF9F2",
  ink: "#111827",
  text: "#374151",
  sub: "#6B7280",
  line: "#E5E7EB",
  surface: "#FFFFFF",
  surfaceSoft: "#FAFBFC",
};

export default function ChipInput({ label, placeholder, hint, chipList, setChipList }) {
  const [input, setInput] = useState("");

  const addChip = () => {
    const value = input.trim();
    if (!value) return;
    setChipList((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setInput("");
  };

  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <Pills>{chipList.map((c) => <Pill key={c}>{c}</Pill>)}</Pills>
      <AddPillWrap>
        <Input placeholder={placeholder} value={input} onChange={(e) => setInput(e.target.value)} />
        <SmallButton onClick={addChip}>＋ 추가</SmallButton>
      </AddPillWrap>
      {hint && <Hint>{hint}</Hint>}
    </div>
  );
}

const SectionLabel = styled.div`
  font-weight: 700;
  margin-bottom: 10px;
  color: ${colors.text};
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

const AddPillWrap = styled.div`display: flex; gap: 8px; align-items: center; margin-top: 6px;`;

const Input = styled.input`
  width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid ${colors.line};
  background: ${colors.surface}; font-size: 15px; color: ${colors.ink};
  transition: 120ms ease;
  &::placeholder { color: ${colors.sub}; }
  &:focus { outline: none; border-color: ${colors.brand}; box-shadow: 0 0 0 3px ${colors.brandSoft}; }
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

const SmallButton = styled(GhostButton)`padding: 8px 10px;` ;

const Hint = styled.div`font-size: 12px; color: ${colors.sub}; margin-top: 6px;`;
