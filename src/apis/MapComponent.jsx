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

    // 4) 여러 개면 → bounds로 모두 보이게 맞춘 뒤, idle에서 평균 중심으로 이동(줌 유지)
    const latLngs = markers.map(
      m => new navermaps.LatLng(m.position.lat, m.position.lng)
    );

    // bounds 계산
    const bounds = new navermaps.LatLngBounds(latLngs[0], latLngs[0]);
    latLngs.forEach(ll => bounds.extend(ll));

    // 평균 중심 계산
    const { sumLat, sumLng } = markers.reduce(
      (acc, m) => ({
        sumLat: acc.sumLat + m.position.lat,
        sumLng: acc.sumLng + m.position.lng,
      }),
      { sumLat: 0, sumLng: 0 }
    );
    const avgLat = sumLat / markers.length;
    const avgLng = sumLng / markers.length;
    const avgCenter = new navermaps.LatLng(avgLat, avgLng);

    // a) 모두 보이도록 맞추기 (패딩 100)
    map.morph(bounds, 100);

    // b) 한 번만 실행되는 idle 리스너로 평균 중심으로 이동(줌은 유지)
    const listener = navermaps.Event.addListener(map, "idle", () => {
      const currentZoom = map.getZoom();
      map.setCenter(avgCenter);
      map.setZoom(currentZoom);
      navermaps.Event.removeListener(listener);
    });

    // 의존성 변경 시 리스너 정리
    return () => {
      if (listener) navermaps.Event.removeListener(listener);
    };
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