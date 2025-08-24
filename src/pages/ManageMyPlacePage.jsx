import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import api from '../apis/client';
import AdImg from "../assets/images/AdImg.svg";
import LoadingImg from "../assets/images/ManagePageLoadingImg.svg";
import PhoneInputIcon from "../assets/icons/PhoneInputIcon.svg";
import PhoneInputFocusIcon from "../assets/icons/PhoneInputFocusIcon.svg";
import ContactInfoIcon from "../assets/icons/ContactInfoIcon.svg";
import CreditCardIconSvg from "../assets/icons/CreditCardIcon.svg";
import CallIconSvg from "../assets/icons/CallIcon.svg";
import ContactIconSvg from "../assets/icons/ContactIcon.svg";

/* ================= 공통 파서 & 정규화 ================= */
async function readJson(res){const t=await res.text();try{return JSON.parse(t);}catch{throw new Error('Invalid JSON');}}
function extractList(payload, keys=[]){
  if(Array.isArray(payload)) return payload;
  for(const k of keys){const v=payload?.[k]; if(Array.isArray(v)) return v;}
  if(Array.isArray(payload?.data)) return payload.data;
  return [];
}
function pickFirstPhoto(x){
  if(typeof x?.photo==='string') return x.photo;
  if(Array.isArray(x?.photoList)&&x.photoList.length){const f=x.photoList[0]; return typeof f==='string'?f:f?.url;}
  if(typeof x?.thumbnailUrl==='string') return x.thumbnailUrl;
  if(Array.isArray(x?.photos)&&x.photos.length){const f=x.photos[0]; return typeof f==='string'?f:f?.url;}
  return undefined;
}
function normalizeAddress(x){if(x?.address&&typeof x.address==='object')return x.address;return{roadName:x?.roadName??x?.addressRoad??'',latitude:x?.latitude??null,longitude:x?.longitude??null};}
function normalizeEnroll(item){return{
  roomId:item.roomId??item.id??item.spaceId,
  title:item.title??item.placeName??item.roomName??'등록한 공간',
  guestName: item.guestName,
  photo:pickFirstPhoto(item),
  address:normalizeAddress(item),
  maxPeople:item.maxPeople??item.capacity??'-',
  guestPhoneNum:item.guestPhoneNum??'-',
  account:item.account??item.bankAccount??'-',
  price:item.price??item.unitPrice??0,             // 30분 단가
  enrolledDate:item.enrolledDate??item.date??'',
  enrolledTime:Array.isArray(item?.enrolledTime)?item.enrolledTime:Array.from(item?.enrolledTime??[]), // number[] 1~48
};}
function normalizeReserve(item){
  const reservedTimeArr=Array.isArray(item?.reservedTime)?item.reservedTime:Array.from(item?.reservedTime??[]);
  const selectedHour=item?.selectedHour??reservedTimeArr.length??0;
  return{
    roomId:item.roomId??item.id??item.spaceId,
    title:item.title??item.placeName??item.roomName??'예약한 공간',
    hostName: item.hostName,
    photo:pickFirstPhoto(item),
    address:normalizeAddress(item),
    maxPeople:item.maxPeople??item.capacity??'-',
    hostPhoneNum:item.hostPhoneNum??'-',
    account:item.account??item.bankAccount??'-',
    totalPrice:item.totalPrice??item.price??0,
    selectedHour,
    reservedDate:item.reservedDate??item.date??'',
    reservedTime:reservedTimeArr, // number[] 1~48
  };
}

/* ========= 30분 슬롯 유틸 (1-based: 1..48) =========
   1 => 00:00~00:30, 2 => 00:30~01:00 ... 48 => 23:30~24:00 */
const pad2 = (n)=>String(n).padStart(2,'0');
const minToHHMM = (mins)=>`${pad2(Math.floor(mins/60))}:${pad2(mins%60)}`;

// (시작 경계) 슬롯 n의 시작 분: (n-1)*30, (끝 경계) 슬롯 n의 끝 분: n*30
function slotsToOneRange(slots){
  if(!slots?.length) return '';
  const s=[...slots].sort((a,b)=>a-b);
  const startMin = (s[0]-1)*30;      // inclusive start
  const endMin   = (s[s.length-1])*30; // exclusive end
  return `${minToHHMM(startMin)}~${minToHHMM(endMin)}`;
}
function slotsToRanges(input){
  const arr = Array.isArray(input)? input : Array.from(input||[]);
  if(arr.length===0) return [];
  const s=[...arr].sort((a,b)=>a-b);
  const ranges=[];
  let run=[s[0]];
  for(let i=1;i<s.length;i++){
    const cur=s[i], prev=s[i-1];
    if(cur===prev+1) run.push(cur);
    else{ ranges.push(slotsToOneRange(run)); run=[cur]; }
  }
  ranges.push(slotsToOneRange(run));
  return ranges;
}
function totalHoursFromSlots(input){
  const len = Array.isArray(input)? input.length : (input? input.size : 0);
  return len*0.5;
}

/* ================= API ================= */
async function fetchEnrollments(phoneNumber){
  const res = await api.post('/enrollment/confirmation', {phoneNumber});
  return extractList(res.data,['enrollmentList']).map(normalizeEnroll);
}
async function fetchReservations(phoneNumber){
  const res = await api.post('/reservation/confirmation', {phoneNumber});
  return extractList(res.data,['reservationList']).map(normalizeReserve);
}

/* ================= 페이지 ================= */
const ManageMyPlacePage = () => {
  const [phoneNumber,setPhoneNumber]=useState('');
  const [activeTab,setActiveTab]=useState('enroll'); // 'enroll' | 'reserve'
  const [items,setItems]=useState([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const [hasSearched,setHasSearched]=useState(false);

  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const fetchData = useCallback(async (tab, phone) => {
    if (!phone.trim()) { alert('전화번호를 입력해주세요.'); return; }
    setLoading(true); setError(null); setHasSearched(true);
    try {
      const results = tab==='enroll' ? await fetchEnrollments(phone) : await fetchReservations(phone);
      setItems(results);
    } catch (e) {
      console.error(e);
      setError('데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch=()=>fetchData(activeTab,phoneNumber);
  const handleTabChange=(tab)=>{ setActiveTab(tab); if(phoneNumber.trim()) fetchData(tab,phoneNumber); };
  const formatMoney=(n)=>(n??0).toLocaleString('ko-KR')+'원';
  const formatPhoneNumber = (phoneStr) => {
    if (!phoneStr) return '-';
    const cleaned = ('' + phoneStr).replace(/\D/g, '');
    if (cleaned.length === 11) return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    if (cleaned.length === 10) return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    return phoneStr;
  };

  const renderItemCard=(item)=>{
    const isEnroll=activeTab==='enroll';
    const imgSrc=item.photo || 'https://placehold.co/600x600?text=No+Image';

    // number[] (1~48)
    const slots = isEnroll ? item.enrolledTime : item.reservedTime;
    const ranges = slotsToRanges(slots);
    const totalH = totalHoursFromSlots(slots);

    return(
      <ListCard key={`${activeTab}-${item.roomId}`}>
        <ThumbLarge>
          <DateTag>{isEnroll ? item.enrolledDate : item.reservedDate}</DateTag>
          <img
            src={imgSrc}
            alt=""
            loading="lazy"
            onError={(e)=>{e.currentTarget.src='https://placehold.co/600x600?text=Image+Error';}}
          />
        </ThumbLarge>

        <MiddleColumn>
          <PlaceTitle>{item?.address?.roadName ?? '-'}</PlaceTitle>
          <SubAddress>공실 예약 정보</SubAddress>
          <Divider />
          <InfoGrid>
            <InfoBlock>
              <Icon src={ContactIconSvg} alt="contact" />
              <TextContainer>
                <Label>{isEnroll ? '게스트 이름' : '호스트 이름'}</Label>
                <Value>{isEnroll ? item.guestName : item.hostName}</Value>
              </TextContainer>
            </InfoBlock>
            <InfoBlock>
              <Icon src={CallIconSvg} alt="call" />
              <TextContainer>
                <Label>{isEnroll ? '게스트 전화번호' : '호스트 전화번호'}</Label>
                <Value>{isEnroll ? formatPhoneNumber(item.guestPhoneNum) : formatPhoneNumber(item.hostPhoneNum)}</Value>
              </TextContainer>
            </InfoBlock>
          </InfoGrid>
          <Divider />
          {isEnroll ? (
            <InfoGrid>
              <InfoBlock>
                <Icon src={CreditCardIconSvg} alt="credit card" />
                <TextContainer>
                  <Label>총 납부 금액</Label>
                  <Value>{formatMoney(totalH * item.price * 2)}</Value>
                </TextContainer>
              </InfoBlock>
              <InfoBlock>
                <TextContainer>
                  <Label>30min당 {formatMoney(item.price)}</Label>
                  <Value>{`${totalH}h X ${formatMoney(item.price * 2)}`}</Value>
                </TextContainer>
              </InfoBlock>
            </InfoGrid>
          ) : (
            <InfoGrid>
              <InfoBlock>
                <Icon src={CreditCardIconSvg} alt="credit card" />
                <TextContainer>
                  <Label>총 납부 금액</Label>
                  <Value>{formatMoney(item.totalPrice)}</Value>
                </TextContainer>
              </InfoBlock>
              <InfoBlock>
                <TextContainer>
                  <Label>입금 계좌번호</Label>
                  <Value>{item.account ?? '-'}</Value>
                </TextContainer>
              </InfoBlock>
            </InfoGrid>
          )}
          <Divider />
        </MiddleColumn>

        <RightColumn>
          <TimeListContainer>
            <TimeHeader>{totalH} H</TimeHeader>
            <TimeList>
              {ranges.length>0 ? (
                ranges.map((r, idx) => {
                  // "(nH)" 표기: 끝-시작 분차로 계산
                  const [s,e] = r.split('~');
                  const toMin = (t)=>{ const [hh,mm]=t.split(':').map(Number); return hh*60+(mm||0); };
                  const h = Math.round(((toMin(e)-toMin(s))/60)*10)/10;
                  return (
                    <TimeChip key={idx}>
                      <span>{r}</span>
                      <small>({h}H)</small>
                    </TimeChip>
                  );
                })
              ) : (
                <EmptyTimes>시간 정보 없음</EmptyTimes>
              )}
            </TimeList>
          </TimeListContainer>
        </RightColumn>
      </ListCard>
    );
  };

  return (
    <PageContainer>
      <LeftPanel>
        <LP_Header>
          <LP_Title>등록 및 예약 쉽게 관리해요!</LP_Title>
          <LP_Sub>전화번호만 치면 바로 나의 내역이 조회됩니다</LP_Sub>
          <LP_Divider/>
        </LP_Header>

        <LP_Section>
          <LP_SectionTop>
            <LP_ContactIcon src={ContactInfoIcon} alt='contactinput'/>
            <LP_SectionTopRight>
              <LP_SectionTitle>예약자 정보 확인</LP_SectionTitle>
              <LP_SectionDesc>전화번호로 등록 및 예약관리를 확인해보세요</LP_SectionDesc>
            </LP_SectionTopRight>
          </LP_SectionTop>
          <LP_Field>
            <InputIcon
                src={isFocused ? PhoneInputFocusIcon : PhoneInputIcon}
                alt="PhoneInputIcon"
              />
            <Input
              type="tel"
              value={phoneNumber}
              onFocus={()=>setIsFocused(true)}
              onBlur={()=>setIsFocused(false)}
              onChange={(e)=>setPhoneNumber(e.target.value)}
              placeholder="01000000000  ( - 제외)"
            />
          </LP_Field>
        </LP_Section>

        <LP_FlexSpacer/>

        <AdImageWrapper>
          <a href="https://mabinogi.nexon.com/page/event/2025/0812_newrise2/index.asp">
            <img src={AdImg} alt="광고" />
          </a>
        </AdImageWrapper>

        <LP_Search disabled={!phoneNumber.trim()} onClick={handleSearch}>조회하기</LP_Search>
      </LeftPanel>

      <RightPanel>
        {!hasSearched ? (
          <HeroImage>
            <img src={LoadingImg} alt="guide" />
          </HeroImage>
        ) : (
          <PanelInner>
            {error && <ErrorBanner>{error}</ErrorBanner>}

            <TabContainer>
              <TabButton active={activeTab==='reserve'} onClick={()=>handleTabChange('reserve')}>예약</TabButton>
              <TabButton active={activeTab==='enroll'} onClick={()=>handleTabChange('enroll')}>등록</TabButton>
            </TabContainer>

            <ContentArea>
              {loading ? (
                <LoadingWrap>정보 불러오는 중...</LoadingWrap>
              ) : items.length>0 ? (
                items.map(renderItemCard)
              ) : (
                <InfoText>{activeTab==='enroll'?'등록된 장소가 없습니다.':'예약 내역이 없습니다.'}</InfoText>
              )}
            </ContentArea>
          </PanelInner>
        )}
      </RightPanel>
    </PageContainer>
  );
};

export default ManageMyPlacePage;

/* ================= Styled Components ================= */
const PageContainer=styled.div`
  display:flex; gap:20px; margin:0 auto; font-family:'Pretendard',sans-serif; padding:20px;
`;
const LeftPanel=styled.div`
  flex:2; display:flex; flex-direction:column; gap:16px; height:80vh; border-radius:8px;
  background:#FDFDFD; box-shadow:0 -2px 23.9px 0 rgba(0,0,0,.10); padding:20px;
`;

const RightPanel = styled.div`
  flex: 3.3;
  display: flex;
  flex-direction: column;
  height: 85vh;
  border-radius: 8px;
  background: #FDFDFD;
  box-shadow: 0 -2px 23.9px 0 rgba(0, 0, 0, 0.10);
  padding: 0;
  overflow: hidden;
  box-sizing: border-box;
`;

const PanelInner = styled.div`
  width: 100%;
  height: 100%;
  padding: 50px 50px 0px 50px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;

const HeroImage = styled.div`
  flex: 1;
  height: 100%;
  width: 100%;
  display: flex;                 
  align-items: center;           
  justify-content: center;       
  overflow: hidden;
  img {
    width: 15.97vw;
    height: auto;
    display: block;
  }
`;

const TabContainer=styled.div`
  display:flex; margin-bottom:36px; border-radius:8px; background-color:#F2F4F5;
`;
const TabButton=styled.button`
  flex:1; padding:10px 20px; font-size:16px; font-weight:700; border:none; border-radius:8px; cursor:pointer;
  color:${p=>p.active?'#fff':'#666'}; background-color:${p=>p.active?'#2FB975':'transparent'};
`;
const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
  flex: 1;
  min-height: 0; /* 플렉스 컨테이너에서 오버플로우가 제대로 작동하도록 */
  padding-right: 8px; /* 스크롤바 공간 확보 */
  
  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;
const LoadingWrap=styled.div`
  display:flex; justify-content:center; padding:30px 0;
  img{ width:180px; height:auto; }
`;

/* 카드 */
const ListCard = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 4px 18px rgba(0,0,0,.06);
  height: 25vh; /* 고정 높이 설정 */
  min-height: 25vh; /* 최소 높이 보장 */
  flex-shrink: 0; /* 플렉스 아이템이 줄어들지 않도록 */
  overflow: hidden;
`;

const ThumbLarge = styled.div`
  position: relative;
  height: 100%;
  background: #f3f4f6;
  aspect-ratio:1/1.1;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const MiddleColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 20px 24px 0 24px;
  font-family: Inter;
`;

const PlaceTitle = styled.h3`
  margin: 0 0 4px;
  font-size: 1.25vw;
  font-weight: 700;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SubAddress = styled.div`
  color: #000;
  font-size: 0.7vw;
  text-align: left;
  margin-top: 15px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const InfoBlock = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 8px;
`;

const Label = styled.span`
  font-size: 0.7vw;
  color: #5c5c5c;
`;

const Value = styled.span`
  font-size: 12.5px;
  font-weight: 600;
  color: #333;
`;

const Divider = styled.div`
  height: 1px;
  background: #e5e7eb;
  margin: 8px 0;
`;

const InfoText=styled.p` text-align:center; color:#888; font-size:16px; margin-top:20px; `;
const ErrorBanner=styled.div` background:#ffefef; color:#b42318; padding:12px; border-radius:8px; text-align:center; margin-bottom:12px; `;

/* LeftPanel UI */
const LP_Header=styled.div` padding:8px 4px 0; `;
const LP_Title=styled.h2` margin:0 0 6px; font-size: 1.7vw; font-weight:700;`;
const LP_Sub=styled.p` margin:0 0 12px;  font-size: 1.3vw; color:#A5A5A5; font-weight:600; `;
const LP_Divider=styled.div` height:1px; background:#efefef; margin:8px 0 14px; `;
const LP_Section=styled.div` display:flex; flex-direction:column; gap:10px; `;
const LP_SectionTop=styled.div` display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:8px; `;
const LP_SectionTitle=styled.div` font-size:1.3vw; font-weight:800; color:#111827; margin-bottom: 5px; `;
const LP_SectionDesc=styled.div` color:#8f8f8f; font-size:1vw; font-weight:600; `;
const LP_Field=styled.div` display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:8px; margin-top: 10px; `;
const LP_SectionTopRight=styled.div`
  margin-left: 1.4vw;
`
const Input = styled.input`
  width: 83%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border-radius: 4px;
  background: #F4F4F4;
  font-size: 15px;
  transition: 12ms ease;
  margin-left: 1.4vw;
  border: none;

  &::placeholder {
    color: #9E9E9E;
    font-size: 0.9vw;
  }
  &:focus {
    outline: none;
    border: 1px solid #2FB975;
  }
`;

const LP_FlexSpacer=styled.div` flex:1; `;
const LP_Search = styled.button`
  height: 48px;
  border-radius: 6px;
  border: none;
  font-size: 1.2vw;
  font-weight: 700;
  letter-spacing: .2px;
  cursor: pointer;
  transition: background-color .15s ease, transform .05s ease;

  background: #27D580;
  color: #fff;

  &:disabled {
    background: #EEE;
    color: #B3B3B3;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    filter: brightness(0.95);
  }
  &:not(:disabled):active {
    transform: translateY(1px);
  }
`;

const AdImageWrapper=styled.div`
  width:100%; margin-bottom:14px;
  img{ width:100%; min-height:80px; object-fit:contain; display:block; border-radius:8px; }
`;

const InputIcon = styled.img`
  width: 2vw;
  object-fit: contain;
`;

const LP_ContactIcon = styled.img`
  width: 2vw;
  object-fit: contain;
  margin-bottom: 10px;
`;

const Icon = styled.img`
  width: 25px;
  height: 25px;
  margin-top: 5px;
`;

const RightColumn = styled.div`
  width: 100%;
  height: 100%;
  display:flex; align-items:center; justify-content:center;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

/* ===== 우측 시간 리스트 ===== */
const TimeListContainer = styled.div`
  width: 90%; height: 80%; background:#FAFAFA; border-radius: 3px;
  display:flex; flex-direction:column; gap:10px; overflow: hidden;
  margin-bottom: 10px;
`;
const TimeHeader = styled.div`
  background:#16a34a; color:#fff; font-weight:700; text-align:center;
  font-size: 14px; line-height:34px;
`;
const TimeList = styled.div`
  overflow-y: auto;
  padding: 5px;
`;
const TimeChip = styled.div`
  font-family: 'Pretendard';
  display:flex; align-items:center; justify-content:center; gap:10px;
  border:1px solid #16a34a; background:#fff; padding:7px 22px; border-radius:10px;
  font-weight:700; font-size:12px; white-space:nowrap; margin-bottom: 5px;
`;
const EmptyTimes = styled.div`
  color:#9ca3af; text-align:center; padding:10px 0; font-weight:700;
`;

const DateTag = styled.div`
  position: absolute;
  top: 20px;
  left: 0;
  background-color: #2FB975;
  color: white;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 700;
  z-index: 1;
`;
