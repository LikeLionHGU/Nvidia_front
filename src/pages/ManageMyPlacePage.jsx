import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import AdImg from "../assets/images/AdImg.svg";

/* ================= API: POST + JSON + 정규화 ================= */
function pickFirstPhoto(x) {
  if (typeof x?.photo === 'string') return x.photo;
  if (Array.isArray(x?.photoList) && x.photoList.length) {
    const first = x.photoList[0];
    return typeof first === 'string' ? first : first?.url;
  }
  if (typeof x?.thumbnailUrl === 'string') return x.thumbnailUrl;
  if (Array.isArray(x?.photos) && x.photos.length) {
    const first = x.photos[0];
    return typeof first === 'string' ? first : first?.url;
  }
  return undefined;
}

function normalizeAddress(x) {
  if (x?.address && typeof x.address === 'object') return x.address;
  return {
    roadName: x?.roadName ?? x?.addressRoad ?? '',
    latitude: x?.latitude ?? null,
    longitude: x?.longitude ?? null,
  };
}

function normalizeEnroll(item) {
  return {
    roomId: item.roomId ?? item.id ?? item.spaceId,
    title: item.title ?? item.placeName ?? item.roomName ?? '등록한 공간',
    photo: pickFirstPhoto(item),
    address: normalizeAddress(item),
    maxPeople: item.maxPeople ?? item.capacity ?? '-',
    phoneNumber: item.phoneNumber ?? item.ownerPhone ?? item.contact ?? '-',
    account: item.account ?? item.bankAccount ?? '-',
    price: item.price ?? item.unitPrice ?? 0,
    enrolledDate: item.enrolledDate ?? item.date ?? '',
    enrolledTime: Array.isArray(item?.enrolledTime)
      ? item.enrolledTime
      : Array.from(item?.enrolledTime ?? []),
  };
}

function normalizeReserve(item) {
  const reservedTimeArr = Array.isArray(item?.reservedTime)
    ? item.reservedTime
    : Array.from(item?.reservedTime ?? []);
  const selectedHour = item?.selectedHour ?? reservedTimeArr.length ?? 0;

  return {
    roomId: item.roomId ?? item.id ?? item.spaceId,
    title: item.title ?? item.placeName ?? item.roomName ?? '예약한 공간',
    photo: pickFirstPhoto(item),
    address: normalizeAddress(item),
    maxPeople: item.maxPeople ?? item.capacity ?? '-',
    phoneNumber: item.phoneNumber ?? item.ownerPhone ?? item.contact ?? '-',
    account: item.account ?? item.bankAccount ?? '-',
    totalPrice: item.totalPrice ?? item.price ?? 0,
    selectedHour,
    reservedDate: item.reservedDate ?? item.date ?? '',
    reservedTime: reservedTimeArr,
  };
}

async function fetchEnrollments(phoneNumber) {
  const res = await fetch('/spaceon/enrollment/confirmation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber }),
  });
  if (!res.ok) throw new Error('Network error');
  const data = await res.json();
  const list = data?.enrollmentList ?? [];
  return list.map(normalizeEnroll);
}

async function fetchReservations(phoneNumber) {
  const res = await fetch('/spaceon/reservation/confirmation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber }),
  });
  if (!res.ok) throw new Error('Network error');
  const data = await res.json();
  const list = data?.reservationList ?? [];
  return list.map(normalizeReserve);
}

/* ================= 페이지 ================= */
const ManageMyPlacePage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [activeTab, setActiveTab] = useState('enroll'); // 'enroll' | 'reserve'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchData = useCallback(async (tab, phone) => {
    if (!phone.trim()) {
      alert('전화번호를 입력해주세요.');
      return;
    }
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      if (tab === 'enroll') {
        const results = await fetchEnrollments(phone);
        setItems(results);
      } else {
        const results = await fetchReservations(phone);
        setItems(results);
      }
    } catch (e) {
      console.error(e);
      setError('데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = () => fetchData(activeTab, phoneNumber);
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (phoneNumber.trim()) fetchData(tab, phoneNumber);
  };

  const formatMoney = (n) => (n ?? 0).toLocaleString('ko-KR') + '원';
  const subPriceText = '(30min당 5,000원)';

  const renderItemCard = (item) => {
    const isEnroll = activeTab === 'enroll'; // 등록=파랑, 예약=초록
    const imgSrc = item.photo || 'https://placehold.co/600x600?text=No+Image';

    return (
      <ListCard key={`${activeTab}-${item.roomId}`}>
        <ThumbLarge>
          <img
            src={imgSrc}
            alt=""
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/600x600?text=Image+Error';
            }}
          />
        </ThumbLarge>

        <CardRight>
          <CardRightContainer>
            <HeaderRow>
              <PlaceTitle isEnroll={isEnroll}>{item.title}</PlaceTitle>
              <GhostGap />
              <PillButton isEnroll={isEnroll}>{isEnroll ? '등록' : '예약'}</PillButton>
            </HeaderRow>

            <SubAddress>{item?.address?.roadName ?? '-'}</SubAddress>

            <Divider />

            <InfoRow>
              <InfoItem>
                <Icon>💲</Icon>
                <strong>{formatMoney(isEnroll ? item.price : item.totalPrice)}</strong>
                {isEnroll && <SubSmall>{' '}{subPriceText}</SubSmall>}
              </InfoItem>
              <InfoItem>
                <Icon>📞</Icon>
                <span>{item.phoneNumber ?? '-'}</span>
              </InfoItem>
            </InfoRow>

            <Divider />

            <InfoRow>
              <InfoItem>
                <Icon>💳</Icon>
                <span>{item.account ?? '-'}</span>
              </InfoItem>
              <InfoItem>
                <Icon>👥</Icon>
                <span>
                  {isEnroll
                    ? `신청 인원 ${item.maxPeople}명`
                    : `인원수 ${item.maxPeople}명 / ${(item.selectedHour ?? item.reservedTime?.length ?? 0)}시간`}
                </span>
              </InfoItem>
            </InfoRow>
            <Divider />
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
        <LP_Divider />
      </LP_Header>

      <LP_Section>
        <LP_SectionTop>
          <LP_Icon role="img" aria-label="user">👤</LP_Icon>
          <LP_SectionTitle>예약자 정보 확인</LP_SectionTitle>
          <LP_Help title="도움말">❔</LP_Help>
        </LP_SectionTop>
        <LP_SectionDesc>전화번호로 등록 및 예약관리를 확인해보세요</LP_SectionDesc>

        <LP_Field>
          <LP_FieldIcon role="img" aria-label="phone">📞</LP_FieldIcon>
          <LP_PhoneInput
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="01000000000  (’하이픈 제외’)"
          />
        </LP_Field>
      </LP_Section>

      <LP_FlexSpacer />

      {/* 👇 광고 이미지 추가 */}
      <AdImageWrapper>
        <img src={AdImg} alt="광고" />
      </AdImageWrapper>

      <LP_BtnRow>
        <LP_Cancel disabled>취소</LP_Cancel>
        <LP_Search onClick={handleSearch}>조회하기</LP_Search>
      </LP_BtnRow>
    </LeftPanel>

      <RightPanel>
        {error && <ErrorBanner>{error}</ErrorBanner>}

        <TabContainer>
          <TabButton active={activeTab === 'reserve'} onClick={() => handleTabChange('reserve')}>
            예약
          </TabButton>
          <TabButton active={activeTab === 'enroll'} onClick={() => handleTabChange('enroll')}>
            등록
          </TabButton>
        </TabContainer>

        <ContentArea>
          {loading ? (
            <InfoText>불러오는 중...</InfoText>
          ) : items.length > 0 ? (
            items.map(renderItemCard)
          ) : hasSearched ? (
            <InfoText>{activeTab === 'enroll' ? '등록된 장소가 없습니다.' : '예약 내역이 없습니다.'}</InfoText>
          ) : (
            <InfoText>전화번호를 입력하고 관리 버튼을 눌러주세요.</InfoText>
          )}
        </ContentArea>
      </RightPanel>
    </PageContainer>
  );
};

export default ManageMyPlacePage;

/* ================= Styled Components ================= */
const PageContainer = styled.div`
  display: flex;
  gap: 20px;
  margin: 0 auto;
  font-family: 'Pretendard', sans-serif;
  padding: 20px;
`;

const LeftPanel = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 80vh;
  border-radius: 8px;
  background: #FDFDFD;
  box-shadow: 0 -2px 23.9px 0 rgba(0, 0, 0, 0.10);
  padding: 20px;
`;

const RightPanel = styled.div`
  flex: 3;
  display: flex;
  flex-direction: column;
  height: 80vh;
  border-radius: 8px;
  background: #FDFDFD;
  box-shadow: 0 -2px 23.9px 0 rgba(0, 0, 0, 0.10);
  padding: 50px;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 36px;
  border-radius: 8px;
  background-color: #F2F4F5;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: ${p => (p.active ? '#fff' : '#666')};
  background-color: ${p => (p.active ? '#2FB975' : 'transparent')};
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: auto;
`;

/* ====== 카드 레이아웃 (왼쪽 큰 썸네일 + 오른쪽 정보) ====== */
const ListCard = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 4px 18px rgba(0,0,0,.06);
  height: 200px;
`;

const ThumbLarge = styled.div`
  height: 100%;
  aspect-ratio: 1.1 / 1;
  border-radius: 10px 0 0 10px;
  overflow: hidden;
  background: #f3f4f6;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const CardRight = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;   /* 세로 중앙 */
  align-items: stretch;      /* 가로 전체 */
  height: 100%;
  margin-right: 50px;
`;

const CardRightContainer = styled.div`
  width: 100%;
  padding: 20px;
`;

const HeaderRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 12px;
`;

/* 등록 탭: 파랑 / 예약 탭: 초록 */
const PlaceTitle = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: ${(p) => (p.isEnroll ? '#0089FC' : '#16a34a')};
`;

const GhostGap = styled.div``;

/* 등록 탭 뱃지(파랑) / 예약 탭 뱃지(초록) */
const PillButton = styled.button`
  padding: 8px 20px;
  border-radius: 17px;
  border: ${(p) => (p.isEnroll ? '1px solid #008AFE' : '1px solid #16a34a')};
  background: ${(p) => (p.isEnroll ? 'rgba(0, 138, 254, 0.22)' : '#eafff2')};
  color: ${(p) => (p.isEnroll ? '#0089FC' : '#16a34a')};
  font-weight: 800;
  cursor: pointer;
`;

const SubAddress = styled.div`
  color: #6b7280;
  font-size: 14px;
`;

const Divider = styled.div`
  height: 1px;
  background: #e5e7eb;
  margin: 4px 0;
`;

const InfoRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #374151;
  font-size: 15px;
`;

const Icon = styled.span`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #f3f4f6;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const SubSmall = styled.span`
  color: #9ca3af;
  font-weight: 600;
  font-size: 12px;
`;

const InfoText = styled.p`
  text-align: center;
  color: #888;
  font-size: 16px;
  margin-top: 20px;
`;

const ErrorBanner = styled.div`
  background: #ffefef;
  color: #b42318;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 12px;
`;

/* ===== LeftPanel UI ===== */
const LP_Header = styled.div`
  padding: 8px 4px 0;
`;

const LP_Title = styled.h2`
  margin: 0 0 6px;
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
`;

const LP_Sub = styled.p`
  margin: 0 0 12px;
  font-size: 14px;
  color: #9aa3af;
  font-weight: 700;
`;

const LP_Divider = styled.div`
  height: 1px;
  background: #efefef;
  margin: 8px 0 14px;
`;

const LP_Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const LP_SectionTop = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 8px;
`;

const LP_Icon = styled.span`
  font-size: 18px;
  line-height: 1;
`;

const LP_SectionTitle = styled.div`
  font-size: 16px;
  font-weight: 800;
  color: #111827;
`;

const LP_Help = styled.span`
  color: #a3a3a3;
  cursor: help;
  user-select: none;
`;

const LP_SectionDesc = styled.div`
  margin-left: 26px;
  color: #8f8f8f;
  font-size: 13px;
  font-weight: 600;
`;

const LP_Field = styled.div`
  position: relative;
  margin-left: 26px;
  display: flex;
  align-items: center;
  background: #f6f7f8;
  border: 1px solid #ececec;
  border-radius: 10px;
  padding: 12px 12px 12px 42px;
`;

const LP_FieldIcon = styled.span`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: #f1f5f9;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #22c55e;
  font-size: 13px;
`;

const LP_PhoneInput = styled.input`
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
  font-size: 15px;
  color: #111827;
  ::placeholder { color: #cfd4da; }
`;

const LP_FlexSpacer = styled.div`
  flex: 1;
`;

const LP_BtnRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-top: 6px;
`;

const LP_Cancel = styled.button`
  height: 48px;
  border-radius: 10px;
  border: none;
  background: #f6f7f8;
  color: #cfcfcf;
  font-weight: 800;
  cursor: not-allowed;
`;

const LP_Search = styled.button`
  height: 48px;
  border-radius: 10px;
  border: none;
  background: #22c55e;
  color: #fff;
  font-weight: 900;
  letter-spacing: .2px;
  cursor: pointer;
  transition: background-color .15s ease, transform .05s ease;
  &:hover { background: #1fb257; }
  &:active { transform: translateY(1px); }
`;

const AdImageWrapper = styled.div`
  width: 100%;
  margin-bottom: 14px;

  img {
    width: 100%;
    min-height: 80px;       /* 최소 높이 */
    object-fit: contain;    /* 원본 비율 유지 */
    display: block;
    border-radius: 8px;
  }
`;