import React, { useState, useEffect } from "react";
import {
  Container as MapDiv,
  NaverMap,
  Marker,
  useNavermaps,
} from "react-naver-maps";

// 기본 위치 (마커 없을 때 서울 시청)
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };
const DEFAULT_ZOOM = 15;

const MapComponent = ({ markers, center }) => {
  const navermaps = useNavermaps();
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (!map || !navermaps) return;

    // 1) 외부 center가 있으면 → 그 위치로
    if (center) {
      map.setCenter(new navermaps.LatLng(center.lat, center.lng));
      map.setZoom(17);
      return;
    }

    // 2) 마커 없으면 → 기본 위치
    if (!markers || markers.length === 0) {
      map.setCenter(new navermaps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng));
      map.setZoom(DEFAULT_ZOOM);
      return;
    }

    // 3) 마커 1개면 → 그 마커로
    if (markers.length === 1) {
      const p = markers[0].position;
      map.setCenter(new navermaps.LatLng(p.lat, p.lng));
      map.setZoom(15);
      return;
    }

    // 4) 여러 개면 → bounds에 맞춰 모두 보이게 하기
    const latLngs = markers.map(
      m => new navermaps.LatLng(m.position.lat, m.position.lng)
    );

    const bounds = new navermaps.LatLngBounds(latLngs[0], latLngs[0]);
    latLngs.forEach(ll => bounds.extend(ll));

    map.morph(bounds, 100);
  }, [markers, center, map, navermaps]);

  return (
    <MapDiv style={{ width: "100%", height: "100%" }}>
      <NaverMap
        defaultCenter={DEFAULT_CENTER}
        defaultZoom={DEFAULT_ZOOM}
        onLoad={setMap}
      >
        {markers?.map((marker, index) => (
          <Marker key={index} position={marker.position} title={marker.title} />
        ))}
      </NaverMap>
    </MapDiv>
  );
};

export default MapComponent;