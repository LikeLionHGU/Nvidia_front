import React from "react";
import styled from "styled-components";
import { NavermapsProvider } from "react-naver-maps";
import MapComponent from "../../apis/MapComponent";

function MapWrapper({
  mapClientId,
  markers,
  moveToDetailPage,
  handleMarkerHover,
  currentLocation,
  handleGetCurrentLocation,
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
      <CurrentLocationButton onClick={handleGetCurrentLocation}>📍 현재 위치 불러오기</CurrentLocationButton>
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
  top: 120px;
  right: 20%;
  transform: translateX(-50%);
  z-index: 1000;
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
  &:hover {
    background-color: #f0f0f0;
  }
`;
