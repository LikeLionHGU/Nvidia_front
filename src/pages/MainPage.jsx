import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { NaverMap, Marker } from 'react-naver-maps';
import MainPageApi from '../apis/MainPageAPI';
import my_location from '../assets/images/my_location.svg';
import LocationSearchModal from './LocationSearchModal';
import FormComponent from '../components/specific/FormComponent';
import RecommendationBox from '../components/specific/RecommendationBox';

const MainPage = () => {
  const [isRecommendationVisible, setIsRecommendationVisible] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [mapInfo, setMapInfo] = useState({
    center: { lat: 37.5665, lng: 126.978 },
    level: 4,
  });
  const [offices, setOffices] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleMyLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCenter = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMapInfo((prev) => ({ ...prev, center: newCenter }));
        },
        (err) => {
          console.error(err);
        },
      );
    }
  };

  const handleMapDragEnd = (map) => {
    const newCenter = {
      lat: map.getCenter().getLat(),
      lng: map.getCenter().getLng(),
    };
    setMapInfo((prev) => ({ ...prev, center: newCenter }));
  };

  const handleRecommendationClick = () => {
    setIsRecommendationVisible(!isRecommendationVisible);
    setIsFormVisible(!isFormVisible);
  };

  const handleSearchClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const openLocationModal = () => {
    setIsLocationModalOpen(true);
  };

  const closeLocationModal = () => {
    setIsLocationModalOpen(false);
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setMapInfo((prev) => ({ ...prev, center: location }));
    setShowModal(false); // also closes the modal
    setIsLocationModalOpen(false);
  };

  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const response = await MainPageApi.getOfficeListByLocation(
          mapInfo.center.lat,
          mapInfo.center.lng,
        );
        setOffices(response.data);
      } catch (error) {
        console.error('Failed to fetch offices:', error);
      }
    };

    fetchOffices();
  }, [mapInfo.center]);

  return (
    <MainPageContainer>
      {(showModal || isLocationModalOpen) && <div className="modal-overlay"></div>}
      <NaverMap
        center={mapInfo.center}
        style={{ width: '100%', height: '100vh' }}
        level={mapInfo.level}
        onDragEnd={handleMapDragEnd}
      >
        {offices.map((office) => (
          <Marker
            key={office.id}
            position={{ lat: office.latitude, lng: office.longitude }}
            icon={{
              url: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png',
              size: { width: 64, height: 69 },
              options: { offset: { x: 27, y: 69 } },
            }}
          />
        ))}
        {selectedLocation && (
          <Marker
            position={selectedLocation}
            icon={{
              url: 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_blue.png',
              size: { width: 64, height: 69 },
              options: { offset: { x: 27, y: 69 } },
            }}
          />
        )}
      </NaverMap>

      <OverlayContainer>
        <FormComponent onOpenLocationModal={openLocationModal} />
        <ShowRecommendationButton onClick={handleRecommendationClick}>
          {isRecommendationVisible ? '조건 접기' : '내 주변 추천'}
        </ShowRecommendationButton>
        {isRecommendationVisible && <RecommendationBox />}
      </OverlayContainer>

      <FloatingButton onClick={handleMyLocationClick}>
        <img src={my_location} alt="내 위치" />
      </FloatingButton>

      <FloatingBox>
        <p>내 주변 ‘여기’ 공실이 제일 가까워요!</p>
        <p>도보 5분</p>
      </FloatingBox>

      {showModal && (
        <LocationSearchModal
          onClose={handleCloseModal}
          onLocationSelect={handleLocationSelect}
        />
      )}
      {isLocationModalOpen && (
        <LocationSearchModal
          onClose={closeLocationModal}
          onLocationSelect={handleLocationSelect}
        />
      )}
    </MainPageContainer>
  );
};

export default MainPage;

const MainPageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }
`;

const OverlayContainer = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
`;

const ShowRecommendationButton = styled.button`
  background-color: white;
  border: 1px solid #ccc;
  padding: 10px;
  cursor: pointer;
  border-radius: 5px;
  margin-top: 10px;
`;

const FloatingButton = styled.button`
  position: absolute;
  bottom: 150px;
  right: 20px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  cursor: pointer;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  img {
    width: 30px;
    height: 30px;
  }
`;

const FloatingBox = styled.div`
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background-color: white;
  padding: 10px 20px;
  border-radius: 20px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  z-index: 10;
  p {
    margin: 0;
  }
`;