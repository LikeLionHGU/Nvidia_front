
import React from 'react';
import styled from 'styled-components';

const colors = {
  brand: "#2FB975",
  brandSoft: "#EAF9F2",
  ink: "#111827",
  text: "#374151",
  sub: "#6B7280",
  line: "#E5E7EB",
  surface: "#FFFFFF",
};

export default function BasicInfoForm({ 
  name, setName, 
  phoneNumber, setPhoneNumber, 
  address, setAddress, 
  account, setAccount, 
  maxPeople, setMaxPeople, 
  price, setPrice, 
  memo, setMemo 
}) {
  return (
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
      <SectionLabel>하실 말씀이 있으시다면 편하게 적어주세요.</SectionLabel>
      <TextArea value={memo} onChange={(e)=>setMemo(e.target.value)} placeholder="예) 야외 소음이 있을 수 있습니다." />
    </InputField>
  );
}

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

const SectionLabel = styled.div`
  font-weight: 700;
  margin-top: 10px;
  margin-bottom: 10px;
  color: ${colors.text};
`;
