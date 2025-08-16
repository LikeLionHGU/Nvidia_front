import React, { useState, useEffect, useCallback, useRef } from "react";
import { Container as MapDiv, NaverMap, Marker, useNavermaps } from "react-naver-maps";

// 기본 위치 (마커 없을 때 서울 시청)
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };
const DEFAULT_ZOOM = 15;

const MapComponent = ({ markers, center }) => {
  const navermaps = useNavermaps();
  const [map, setMap] = useState(null);
  const mapRef = useRef(null);

  // 지도 이동 함수
  const moveToMarkers = useCallback(
    (mapInstance) => {
      if (!mapInstance || !navermaps || !markers || markers.length === 0) {
        console.log("Cannot move to markers - missing dependencies");
        return;
      }

      console.log("Moving to markers with", markers.length, "markers");

      try {
        if (markers.length === 1) {
          const pos = markers[0].position;
          console.log("Moving to single marker:", pos);
          mapInstance.setCenter(new navermaps.LatLng(pos.lat, pos.lng));
          mapInstance.setZoom(15);
        } else {
          console.log("Fitting bounds for multiple markers");
          const bounds = new navermaps.LatLngBounds();
          markers.forEach((marker) => {
            bounds.extend(new navermaps.LatLng(marker.position.lat, marker.position.lng));
          });
          mapInstance.fitBounds(bounds, { padding: 50 });
        }
        console.log("Map movement completed successfully");
      } catch (error) {
        console.error("Error moving map:", error);
      }
    },
    [navermaps, markers]
  );

  // 지도 로드 핸들러들
  const handleMapLoad = useCallback(
    (loadedMap) => {
      console.log("=== onLoad FIRED ===");
      console.log("Map instance:", !!loadedMap);
      setMap(loadedMap);

      setTimeout(() => {
        moveToMarkers(loadedMap);
      }, 300);
    },
    [moveToMarkers]
  );

  const handleMapLoadEnd = useCallback(
    (loadedMap) => {
      console.log("=== onLoadEnd FIRED ===");
      console.log("Map instance:", !!loadedMap);
      if (!map) {
        setMap(loadedMap);
      }

      setTimeout(() => {
        moveToMarkers(loadedMap);
      }, 300);
    },
    [map, moveToMarkers]
  );

  const handleMapReady = useCallback(
    (loadedMap) => {
      console.log("=== onReady FIRED ===");
      console.log("Map instance:", !!loadedMap);
      if (!map) {
        setMap(loadedMap);
      }

      setTimeout(() => {
        moveToMarkers(loadedMap);
      }, 300);
    },
    [map, moveToMarkers]
  );

  // ref를 사용한 대안 방법
  const handleMapRef = useCallback(
    (mapInstance) => {
      if (mapInstance && !map) {
        console.log("=== MAP REF SET ===");
        setMap(mapInstance);
        mapRef.current = mapInstance;

        setTimeout(() => {
          moveToMarkers(mapInstance);
        }, 500);
      }
    },
    [map, moveToMarkers]
  );

  // navermaps와 markers가 모두 준비되었을 때 실행
  useEffect(() => {
    console.log("=== CHECKING FOR DIRECT ACCESS ===");
    console.log("navermaps ready:", !!navermaps);
    console.log("markers:", markers?.length || 0);

    // 만약 지도가 아직 로드되지 않았지만 navermaps는 준비되었다면
    // 직접 지도 인스턴스에 접근 시도
    if (navermaps && markers && markers.length > 0) {
      const checkMapInterval = setInterval(() => {
        // 지도 컨테이너에서 직접 지도 인스턴스 찾기
        const mapContainer = document.querySelector('[data-cy="container"]');
        if (mapContainer && mapContainer._naverMap) {
          console.log("=== FOUND MAP VIA DIRECT ACCESS ===");
          const foundMap = mapContainer._naverMap;
          setMap(foundMap);
          moveToMarkers(foundMap);
          clearInterval(checkMapInterval);
        }
      }, 100);

      // 5초 후 정리
      setTimeout(() => {
        clearInterval(checkMapInterval);
      }, 5000);

      return () => clearInterval(checkMapInterval);
    }
  }, [navermaps, markers, moveToMarkers]);

  // 마커 변경 시 기존 map으로 이동
  useEffect(() => {
    console.log("=== EFFECT TRIGGERED ===");
    console.log("Map ready:", !!map);
    console.log("Navermaps ready:", !!navermaps);
    console.log("Markers count:", markers?.length || 0);

    if (map && navermaps && markers && markers.length > 0) {
      console.log("Moving to markers via effect");

      const timeoutId = setTimeout(() => {
        moveToMarkers(map);
      }, 200);

      return () => clearTimeout(timeoutId);
    } else {
      console.log("Conditions not met, skipping effect");
    }
  }, [map, navermaps, markers, moveToMarkers]);

  return (
    <MapDiv style={{ width: "100%", height: "100%" }}>
      <NaverMap
        defaultCenter={DEFAULT_CENTER}
        defaultZoom={DEFAULT_ZOOM}
        onLoad={handleMapLoad}
        onLoadEnd={handleMapLoadEnd}
        onReady={handleMapReady}
        ref={handleMapRef}
      >
        {markers?.map((marker, index) => (
          <Marker
            key={`marker-${index}-${marker.position.lat}-${marker.position.lng}`}
            position={marker.position}
            title={marker.title}
          />
        ))}
      </NaverMap>
    </MapDiv>
  );
};

export default MapComponent;
