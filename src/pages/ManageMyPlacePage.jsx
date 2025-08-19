// ManageMyPlacePage.jsx
import React, { useState, useCallback } from 'react';
import styled from 'styled-components';

// #region API Fetch Functions
/*
 * 서버 구현에 따라 GET 요청에 body를 포함해야 할 경우,
 * 아래 fetch 함수들을 POST 방식으로 변경해야 합니다.
 * 
 * 예시:
 * const response = await fetch('/api/enrollment/confirmation', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ phoneNumber })
 * });
 */

/**
 * 등록된 장소 목록을 가져오는 API 호출 함수
 * @param {string} phoneNumber - 조회할 전화번호
 * @returns {Promise<Array>} - 등록된 장소 목록
 */
async function fetchEnrollments(phoneNumber) {
  const response = await fetch(`/api/enrollment/confirmation?phoneNumber=${phoneNumber}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data.enrollmentList || [];
}

/**
 * 예약된 내역 목록을 가져오는 API 호출 함수
 * @param {string} phoneNumber - 조회할 전화번호
 * @returns {Promise<Array>} - 예약 내역 목록
 */
async function fetchReservations(phoneNumber) {
  const response = await fetch(`/api/reservation/confirmation?phoneNumber=${phoneNumber}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data.reservationList || [];
}
// #endregion

const dummyEnrollmentList = [
      {
        roomId: 1,
        photo: "https://pbs.twimg.com/media/GUyPp8eaYAAhzbz.jpg",
        address: { latitude: "37.4782", longitude: "127.0282", roadName: "서울특별시 서초구 서초중앙로 188" },
        maxPeople: 4,
        phoneNumber: "010-1234-5678",
        price: 50000,
        enrolledDate: '2025-08-17',
        enrolledTime: '10:00',
      },
      {
        roomId: 2,
        photo: "https://i.pinimg.com/736x/d5/43/5a/d5435a7ab5b8756ae76b048f9c7967a4.jpg",
        address: { latitude: "37.4592", longitude: "127.1292", roadName: "서울특별시 강남구 개포로 623" },
        maxPeople: 2,
        phoneNumber: "010-8765-4321",
        price: 30000,
        enrolledDate: '2025-08-16',
        enrolledTime: '15:30',
      },
      {
        roomId: 3,
        photo: "https://i.pinimg.com/736x/d5/43/5a/d5435a7ab5b8756ae76b048f9c7967a4.jpg",
        address: { latitude: "37.3947611", longitude: "127.1111361", roadName: "경기도 성남시 분당구 판교역로 160 " },
        maxPeople: 3,
        phoneNumber: "010-8765-2321",
        price: 35000,
        enrolledDate: '2025-08-15',
        enrolledTime: '18:00',
      },
    ];

// #region Styled Components
const PageContainer = styled.div`
  display: flex;
  padding: 40px;
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Pretendard', sans-serif;
`;

const LeftPanel = styled.div`
  flex: 0 0 300px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const RightPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const InputLabel = styled.label`
  font-weight: 600;
  font-size: 16px;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
`;

const ActionButton = styled.button`
  padding: 14px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 2px solid #eee;
  margin-bottom: 24px;
`;

const TabButton = styled.button`
  padding: 12px 24px;
  font-size: 18px;
  font-weight: 600;
  border: none;
  background-color: transparent;
  cursor: pointer;
  color: ${props => (props.active ? '#007bff' : '#666')};
  border-bottom: ${props => (props.active ? '3px solid #007bff' : '3px solid transparent')};
  margin-bottom: -2px; /* To align with the container's border */
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Card = styled.div`
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
`;

const CardRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const CardLabel = styled.span`
  font-weight: 500;
  color: #555;
`;

const CardValue = styled.span`
  font-weight: 700;
  color: #333;
`;

const DetailsButton = styled.button`
  background: none;
  border: none;
  color: #007bff;
  text-decoration: underline;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
`;

const InfoText = styled.p`
  text-align: center;
  color: #888;
  font-size: 18px;
  margin-top: 40px;
`;

const ErrorBanner = styled.div`
  background-color: #ffdddd;
  color: #d8000c;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 16px;
`;
// #endregion

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
        // 나중에 쓸거니까 삭제 금지
        // const results = await fetchEnrollments(phone);
        const results = dummyEnrollmentList;
        if (results.length === 0) {
          alert('등록된 장소가 없습니다.');
        }
        setItems(results);
      } else {
        const results = await fetchReservations(phone);
        if (results.length === 0) {
          alert('예약 내역이 없습니다.');
        }
        setItems(results);
      }
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = () => {
    fetchData(activeTab, phoneNumber);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (phoneNumber.trim()) {
      fetchData(tab, phoneNumber);
    }
  };

  const renderItemCard = (item) => {
    const isEnrollTab = activeTab === 'enroll';
    const details = isEnrollTab
      ? [
          { label: '최대 인원', value: `${item.maxPeople}명` },
          { label: '가격', value: `${item.price.toLocaleString('ko-KR')}원` },
          { label: '등록일', value: `${item.enrolledDate} ${item.enrolledTime}` },
        ]
      : [
          { label: '선택 시간', value: `${item.slectedHour}시간` },
          { label: '총 가격', value: `${item.totalPrice.toLocaleString('ko-KR')}원` },
          { label: '예약일', value: `${item.reservatedDate} ${item.reservatedTime}` },
        ];

    return (
      <Card key={item.roomId}>
        <CardRow>
          <CardLabel>장소 ID</CardLabel>
          <CardValue>{item.roomId}</CardValue>
        </CardRow>
        <CardRow>
          <CardLabel>주소</CardLabel>
          <CardValue>{item.address.roadName}</CardValue>
        </CardRow>
        {details.map(({ label, value }) => (
          <CardRow key={label}>
            <CardLabel>{label}</CardLabel>
            <CardValue>{value}</CardValue>
          </CardRow>
        ))}
        <CardRow style={{ marginTop: '20px' }}>
          <DetailsButton onClick={() => console.log('View details for', item)}>
            자세히보기
          </DetailsButton>
        </CardRow>
      </Card>
    );
  };

  return (
    <PageContainer>
      <LeftPanel>
        <InputLabel htmlFor="phone-input">전화번호</InputLabel>
        <Input
          id="phone-input"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="01000000000"
        />
        <ActionButton onClick={handleSearch}>
          내가 등록한 공실 관리하기
        </ActionButton>
      </LeftPanel>
      <RightPanel>
        {error && <ErrorBanner>{error}</ErrorBanner>}
        <TabContainer>
          <TabButton active={activeTab === 'enroll'} onClick={() => handleTabChange('enroll')}>
            등록
          </TabButton>
          <TabButton active={activeTab === 'reserve'} onClick={() => handleTabChange('reserve')}>
            예약
          </TabButton>
        </TabContainer>
        <ContentArea>
          {loading ? (
            <InfoText>불러오는 중...</InfoText>
          ) : items.length > 0 ? (
            items.map(renderItemCard)
          ) : hasSearched ? (
            <InfoText>
              {activeTab === 'enroll' ? '등록된 장소가 없습니다.' : '예약 내역이 없습니다.'}
            </InfoText>
          ) : (
            <InfoText>전화번호를 입력하고 관리 버튼을 눌러주세요.</InfoText>
          )}
        </ContentArea>
      </RightPanel>
    </PageContainer>
  );
};

export default ManageMyPlacePage;