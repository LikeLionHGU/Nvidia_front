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
}) {
  return (
    <MapContainer>
      <NavermapsProvider ncpKeyId={mapClientId}>
        {markers.length > 0 ? (
          <MapComponent
            markers={markers}
            onMarkerClick={moveToDetailPage}
            onMarkerHover={handleMarkerHover}
            currentLocation={currentLocation}
          />
        ) : (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
            지도 로딩 중...
          </div>
        )}
      </NavermapsProvider>
      <CurrentLocationButton onClick={handleGetCurrentLocation} isDetailModalOpen={isDetailModalOpen}>
        <Icon src={MyLocationIcon} alt="Current Location" />
        현재 위치 불러오기
      </CurrentLocationButton>
    </MapContainer>
  );
}

export default MapWrapper;

const MapContainer = styled.div`
  width: 60%;
  margin: 10px;
`;

const CurrentLocationButton = styled.button`
  position: absolute;
  top: 50px;
  right: 20%;
  transform: translateX(-50%);
  z-index: ${({ isDetailModalOpen }) => (isDetailModalOpen ? 1 : 1000)};
  background-color: #fff;
  border: 1px solid #2FB975;
  border-radius: 30px;
  padding: 10px 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 5.38px 29.726px 0 rgba(0, 0, 0, 0.25);
  cursor: pointer;
  font-size: 16px;
  color: #333;
  white-space: nowrap;

  color: #2FB975;
  font-family: Inter;
  font-size: 15px;
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

