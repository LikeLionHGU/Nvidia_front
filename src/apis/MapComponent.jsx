import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactDOMServer from "react-dom/server";
import { Container as MapDiv, NaverMap, useNavermaps, Marker } from "react-naver-maps";
import PriceMarker from "../components/specific/PriceMarker"; // PriceMarker 가져오기

// 기본 위치 (마커 없을 때 서울 시청)
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };
const DEFAULT_ZOOM = 15;

const MapComponent = ({ markers, center, onMarkerClick, onMarkerHover, currentLocation }) => {
  const navermaps = useNavermaps();
  const [map, setMap] = useState(null);
  const mapRef = useRef(null);
  const [hoveredPlaceId, setHoveredPlaceId] = useState(null); // 호버된 마커를 관리하는 상태

  // 카드 리스트가 가리는 높이(px). 상황에 맞게 조절(예: 220~300)
  const BOTTOM_UI_PADDING = 80;

  // 지도 이동 함수
  const moveToMarkers = useCallback(
    (mapInstance) => {
      if (!mapInstance || !navermaps || !markers || markers.length === 0) {
        return;
      }

      try {
        if (markers.length === 1) {
          const pos = markers[0].position;
          mapInstance.setCenter(new navermaps.LatLng(pos.lat, pos.lng));
          mapInstance.setZoom(14);
          // 아래 카드 영역만큼 위로 올려서(=화면을 위쪽으로 팬) 마커가 안 가리게
          mapInstance.panBy(new navermaps.Point(0, BOTTOM_UI_PADDING));
        } else {
          const bounds = new navermaps.LatLngBounds();
          markers.forEach((marker) => {
            bounds.extend(new navermaps.LatLng(marker.position.lat, marker.position.lng));
          });
          mapInstance.fitBounds(bounds, { padding: 50 });
          // 범위 맞춘 뒤 추가로 위로 올리기
          mapInstance.panBy(new navermaps.Point(0, BOTTOM_UI_PADDING));
          // fitBounds가 너무 딱 맞으면 아래 박스에 걸릴 수 있어서 한 단계 줌 아웃
          const currentZoom = mapInstance.getZoom();
          mapInstance.setZoom(currentZoom - 1);
        }
      } catch (error) {
        console.error("Error moving map:", error);
      }
    },
    [navermaps, markers]
  );

  // 지도 로드 핸들러들
  const handleMapLoad = useCallback(
    (loadedMap) => {
      setMap(loadedMap);

      setTimeout(() => {
        moveToMarkers(loadedMap);
      }, 300);
    },
    [moveToMarkers]
  );

  const handleMapLoadEnd = useCallback(
    (loadedMap) => {
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

    // 만약 지도가 아직 로드되지 않았지만 navermaps는 준비되었다면
    // 직접 지도 인스턴스에 접근 시도
    if (navermaps && markers && markers.length > 0) {
      const checkMapInterval = setInterval(() => {
        // 지도 컨테이너에서 직접 지도 인스턴스 찾기
        const mapContainer = document.querySelector('[data-cy="container"]');
        if (mapContainer && mapContainer._naverMap) {
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

    if (map && navermaps && markers && markers.length > 0) {

      const timeoutId = setTimeout(() => {
        moveToMarkers(map);
      }, 200);

      return () => clearTimeout(timeoutId);
    }
  }, [map, navermaps, markers, moveToMarkers]);

  const currentLocationCircleRef = useRef(null);

  useEffect(() => {
    if (map && navermaps && currentLocation) {
      // Remove previous circle if exists
      if (currentLocationCircleRef.current) {
        currentLocationCircleRef.current.setMap(null);
        currentLocationCircleRef.current = null;
      }

      const currentLatLng = new navermaps.LatLng(currentLocation.lat, currentLocation.lng);
      map.setCenter(currentLatLng);
      map.setZoom(14); // Zoom in to the current location

      // 현재 위치도 카드에 안 가리게 위로 올리기
      map.panBy(new navermaps.Point(0, BOTTOM_UI_PADDING));

      // Add a custom marker/circle for current location
      const circle = new naver.maps.Circle({
        map: map,
        center: currentLatLng,
        radius: 0, // meters
        fillColor: 'rgba(47, 185, 117, 0.3)',
        strokeColor: 'rgba(47, 185, 117, 0.8)',
        strokeWeight: 2,
      });
      currentLocationCircleRef.current = circle;
    }
  }, [map, navermaps, currentLocation]);

  // New handler for marker click
  const handlePriceMarkerClick = useCallback((placeId) => {
    if (onMarkerClick) {
      onMarkerClick(placeId);
    }
  }, [onMarkerClick]);

  // New handlers for marker hover
  const handlePriceMarkerMouseEnter = useCallback((placeId) => {
    setHoveredPlaceId(placeId);
    if (onMarkerHover) {
      onMarkerHover(placeId, true); // Pass true for hover start
    }
  }, [onMarkerHover]);

  const handlePriceMarkerMouseLeave = useCallback(() => {
    setHoveredPlaceId(null);
    if (onMarkerHover) {
      onMarkerHover(null, false); // Pass false for hover end
    }
  }, [onMarkerHover]);

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
            icon={{
              content: ReactDOMServer.renderToString(
                <PriceMarker
                  price={marker.price}
                  number={index + 1}
                  onClick={() => handlePriceMarkerClick(marker.id)}
                  onMouseEnter={() => handlePriceMarkerMouseEnter(marker.id)}
                  onMouseLeave={handlePriceMarkerMouseLeave}
                />
              ),
              anchor: new navermaps.Point(0, 0),
            }}
            onClick={() => handlePriceMarkerClick(marker.id)}
          />
        ))}
      </NaverMap>
    </MapDiv>
  );
};

export default MapComponent;