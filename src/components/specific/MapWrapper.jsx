import React from "react";
import styled from "styled-components";
import { NavermapsProvider } from "react-naver-maps";
import MapComponent from "../../apis/MapComponent";
import MyLocationIcon from "../../assets/images/my_location.svg";

function MapWrapper({
  mapClientId,
  markers,
  moveToDetailPage,
  handleMarkerHover,
  currentLocation,
  handleGetCurrentLocation,
  isDetailModalOpen,
  isSearchLocationModalOpen,
}) {
  const center = currentLocation || { lat: 37.5665, lng: 126.978 };
  return (
    <MapContainer>
      <NavermapsProvider ncpClientId={mapClientId}>
        <MapComponent
          markers={markers} // 마커가 0개여도 OK
          onMarkerClick={moveToDetailPage}
          onMarkerHover={handleMarkerHover}
          currentLocation={center} // 항상 중심 전달
        />
        +{" "}
      </NavermapsProvider>
      <CurrentLocationButton
        onClick={handleGetCurrentLocation}
        isDetailModalOpen={isDetailModalOpen}
        isSearchLocationModalOpen={isSearchLocationModalOpen}
      >
        <Icon src={MyLocationIcon} alt="Current Location" />내 위치 불러오기
      </CurrentLocationButton>
    </MapContainer>
  );
}

export default MapWrapper;

const MapContainer = styled.div`
  width: 60%;
  box-shadow: 0 -2px 23.9px 0 rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  margin: 20px 20px 20px 10px;

  position: relative;
`;

const CurrentLocationButton = styled.button`
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: ${({ isDetailModalOpen, isSearchLocationModalOpen }) =>
    isDetailModalOpen || isSearchLocationModalOpen ? 1 : 1000};
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 20px;
  padding: 10px 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  font-size: 16px;
  color: #333;
  white-space: nowrap;

  color: #2fb975;
  font-family: Inter;
  font-size: 12.426px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const Icon = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 8px;
`;
