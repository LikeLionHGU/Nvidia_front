import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import AdImg from "../assets/images/AdImg.svg";
import LoadingImg from "../assets/images/ManagePageLoadingImg.svg";
import PhoneInputIcon from "../assets/icons/PhoneInputIcon.svg";
import PhoneInputFocusIcon from "../assets/icons/PhoneInputFocusIcon.svg";
import ContactInfoIcon from "../assets/icons/ContactInfoIcon.svg";

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
  photo:pickFirstPhoto(item),
  address:normalizeAddress(item),
  maxPeople:item.maxPeople??item.capacity??'-',
  phoneNumber:item.phoneNumber??item.ownerPhone??item.contact??'-',
  account:item.account??item.bankAccount??'-',
  price:item.price??item.unitPrice??0,
  enrolledDate:item.enrolledDate??item.date??'',
  enrolledTime:Array.isArray(item?.enrolledTime)?item.enrolledTime:Array.from(item?.enrolledTime??[]),
};}
function normalizeReserve(item){
  const reservedTimeArr=Array.isArray(item?.reservedTime)?item.reservedTime:Array.from(item?.reservedTime??[]);
  const selectedHour=item?.selectedHour??reservedTimeArr.length??0;
  return{
    roomId:item.roomId??item.id??item.spaceId,
    title:item.title??item.placeName??item.roomName??'예약한 공간',
    photo:pickFirstPhoto(item),
    address:normalizeAddress(item),
    maxPeople:item.maxPeople??item.capacity??'-',
    phoneNumber:item.phoneNumber??item.ownerPhone??item.contact??'-',
    account:item.account??item.bankAccount??'-',
    totalPrice:item.totalPrice??item.price??0,
    selectedHour,
    reservedDate:item.reservedDate??item.date??'',
    reservedTime:reservedTimeArr,
  };
}

/* ================= API ================= */
const api = (p)=>`/spaceon${p}`;
async function fetchEnrollments(phoneNumber){
  const res=await fetch(api('/enrollment/confirmation'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phoneNumber})});
  if(!res.ok) throw new Error(`Network error: ${res.status}`);
  const payload=await readJson(res);
  return extractList(payload,['enrollmentList']).map(normalizeEnroll);
}
async function fetchReservations(phoneNumber){
  const res=await fetch(api('/reservation/confirmation'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phoneNumber})});
  if(!res.ok) throw new Error(`Network error: ${res.status}`);
  const payload=await readJson(res);
  return extractList(payload,['reservationList']).map(normalizeReserve);
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

  const fetchData=useCallback(async(tab,phone)=>{
    if(!phone.trim()){alert('전화번호를 입력해주세요.');return;}
    setLoading(true); setError(null); setHasSearched(true);
    try{
      const results = tab==='enroll' ? await fetchEnrollments(phone) : await fetchReservations(phone);
      setItems(results);
    }catch(e){
      console.error(e);
      setError('데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setItems([]);
    }finally{ setLoading(false); }
  },[]);

  const handleSearch=()=>fetchData(activeTab,phoneNumber);
  const handleTabChange=(tab)=>{ setActiveTab(tab); if(phoneNumber.trim()) fetchData(tab,phoneNumber); };

  const formatMoney=(n)=>(n??0).toLocaleString('ko-KR')+'원';
  const subPriceText='(30min당 5,000원)';

  const renderItemCard=(item)=>{
    const isEnroll=activeTab==='enroll';
    const imgSrc=item.photo || 'https://placehold.co/600x600?text=No+Image';
    return(
      <ListCard key={`${activeTab}-${item.roomId}`}>
        <ThumbLarge>
          <img
            src={imgSrc}
            alt=""
            loading="lazy"
            onError={(e)=>{e.currentTarget.src='https://placehold.co/600x600?text=Image+Error';}}
          />
        </ThumbLarge>

        <CardRight>
          <CardRightContainer>
            <HeaderRow>
              <PlaceTitle isEnroll={isEnroll}>{item.title}</PlaceTitle>
              <GhostGap/>
              <PillButton isEnroll={isEnroll}>{isEnroll?'등록':'예약'}</PillButton>
            </HeaderRow>

            <SubAddress>{item?.address?.roadName ?? '-'}</SubAddress>
            <Divider/>

            <InfoRow>
              <InfoItem>
                <Icon>💲</Icon>
                <strong>{formatMoney(isEnroll?item.price:item.totalPrice)}</strong>
                {isEnroll && <SubSmall>{' '}{subPriceText}</SubSmall>}
              </InfoItem>
              <InfoItem>
                <Icon>📞</Icon>
                <span>{item.phoneNumber ?? '-'}</span>
              </InfoItem>
            </InfoRow>

            <Divider/>

            <InfoRow>
              <InfoItem><Icon>💳</Icon><span>{item.account ?? '-'}</span></InfoItem>
              <InfoItem>
                <Icon>👥</Icon>
                <span>{isEnroll?`신청 인원 ${item.maxPeople}명`:`인원수 ${item.maxPeople}명 / ${(item.selectedHour ?? item.reservedTime?.length ?? 0)}시간`}</span>
              </InfoItem>
            </InfoRow>
            <Divider/>
          </CardRightContainer>
        </CardRight>
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
            <ContactIcon src={ContactInfoIcon} alt='contactinput'/>
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

        <LP_BtnRow>
          <LP_Cancel onClick={() => navigate('/')}>취소</LP_Cancel>
          <LP_Search onClick={handleSearch}>조회하기</LP_Search>
        </LP_BtnRow>
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
  height: 85vh;                  /* 두 상태 동일한 높이 */
  border-radius: 8px;
  background: #FDFDFD;
  box-shadow: 0 -2px 23.9px 0 rgba(0, 0, 0, 0.10);
  padding: 0;                    /* 항상 0 */
  overflow: hidden;              /* 모서리 라운드 깔끔하게 */
  box-sizing: border-box;
`;

const PanelInner = styled.div`
  width: 100%;
  height: 100%;
  padding: 50px 50px 0px 50px;                 /* 검색 후 컨텐츠에만 패딩 */
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
const ContentArea=styled.div`
  display:flex; flex-direction:column; gap:14px; overflow:auto;
`;
const LoadingWrap=styled.div`
  display:flex; justify-content:center; padding:30px 0;
  img{ width:180px; height:auto; }
`;

/* 카드 */
const ListCard=styled.div`
  display:grid; grid-template-columns:1fr 2fr; background:#fff; border:1px solid #e9ecef;
  border-radius:12px; box-shadow:0 4px 18px rgba(0,0,0,.06); height:200px;
`;
const ThumbLarge=styled.div`
  height:100%; aspect-ratio:1.1/1; border-radius:10px 0 0 10px; overflow:hidden; background:#f3f4f6;
  img{ width:100%; height:100%; object-fit:cover; display:block; }
`;
const CardRight=styled.div`
  display:flex; flex-direction:column; justify-content:center; align-items:stretch; height:100%; margin-right:50px;
`;
const CardRightContainer=styled.div` width:100%; padding:20px; `;
const HeaderRow=styled.div` display:grid; grid-template-columns:1fr auto auto; align-items:center; gap:12px; `;
const PlaceTitle=styled.h3`
  margin:0; font-size:20px; font-weight:800; color:${p=>p.isEnroll?'#0089FC':'#16a34a'};
`;
const GhostGap=styled.div``;
const PillButton=styled.button`
  padding:8px 20px; border-radius:17px;
  border:${p=>p.isEnroll?'1px solid #008AFE':'1px solid #16a34a'};
  background:${p=>p.isEnroll?'rgba(0, 138, 254, 0.22)':'#eafff2'};
  color:${p=>p.isEnroll?'#0089FC':'#16a34a'};
  font-weight:800;
`;
const SubAddress=styled.div` color:#6b7280; font-size:14px; `;
const Divider=styled.div` height:1px; background:#e5e7eb; margin:4px 0; `;
const InfoRow=styled.div` display:grid; grid-template-columns:1fr 1fr; gap:8px; `;
const InfoItem=styled.div` display:flex; align-items:center; gap:10px; color:#374151; font-size:15px; `;
const Icon=styled.span` width:28px; height:28px; border-radius:6px; background:#f3f4f6; display:inline-flex; align-items:center; justify-content:center; `;
const SubSmall=styled.span` color:#9ca3af; font-weight:600; font-size:12px; `;
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
const LP_BtnRow=styled.div` display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:6px; `;
const LP_Cancel=styled.button` height:48px; border-radius:6px; border:none; background:#f6f7f8; color:#B3B3B3; font-weight:800; cursor:pointer; `;
const LP_Search=styled.button`
  height:48px; border-radius:6px; border:none; background:#22c55e; color:#fff; font-weight:900; letter-spacing:.2px; cursor:pointer;
  transition:background-color .15s ease, transform .05s ease; &:hover{background:#1fb257;} &:active{transform:translateY(1px);}
`;
const AdImageWrapper=styled.div`
  width:100%; margin-bottom:14px;
  img{ width:100%; min-height:80px; object-fit:contain; display:block; border-radius:8px; }
`;

const InputIcon = styled.img`
  width: 2vw;
  object-fit: contain;
`;

const ContactIcon = styled.img`
  width: 2vw;
  object-fit: contain;
  margin-bottom: 10px;
`;