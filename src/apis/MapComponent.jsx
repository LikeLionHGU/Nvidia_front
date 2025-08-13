import React, { useState, useEffect } from "react";
import {
  Container as MapDiv,
  NaverMap,
  Marker,
  useNavermaps,
} from "react-naver-maps";
import { NavermapsProvider } from "react-naver-maps";

const MapComponent = ({ markers }) => {
  const mapClientId = import.meta.env.VITE_MAP_CLIENT_ID;
  const navermaps = useNavermaps();
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!markers || markers.length === 0) {
      setError("마커가 없습니다");
      setLoading(false);
      return;
    }

    // 마커 위치에 따른 줌 계산
    if (markers.length > 0) {
      if (markers.length === 1) {
        setMapCenter(markers[0].position);
        setMapZoom(15); // 마커 1개일때 줌
      } else {
        const bounds = new navermaps.LatLngBounds();
        markers.forEach((marker) => bounds.extend(marker.position));
        setMapCenter(bounds.getCenter());
        setMapZoom(10); // 마커 여러개 일때 줌
      }
    } else {
      setError("Could not find any valid markers.");
    }
    setLoading(false);
  }, [markers, navermaps]); // 마커나 주소 정보가 바뀔때마다 실행

  if (loading) {
    return <div>Loading map...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!mapCenter) {
    return <div>No map to display.</div>;
  }

  return (
    <MapDiv style={{ width: "100%", height: "100%" }}>
      <NaverMap
        center={mapCenter}
        zoom={mapZoom}
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={marker.position}
            title={marker.address}
          />
        ))}
      </NaverMap>
    </MapDiv>
  );
};

export default MapComponent;