import React, { useState, useEffect } from "react";
import {
  Container as MapDiv,
  NaverMap,
  Marker,
  useNavermaps,
} from "react-naver-maps";
import "./../components/specific/CustomMarker.css";

// 기본 위치 (마커 없을 때 서울 시청)

const MapComponent = ({ recommendList, onMarkerClick, onMarkerMouseEnter, onMarkerMouseLeave, hoveredRoomId }) => {
  const navermaps = useNavermaps();
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (!map || !navermaps || !recommendList || recommendList.length === 0) {
      return;
    }

    if (recommendList.length === 1) {
      const p = recommendList[0].address;
      map.setCenter(new navermaps.LatLng(p.latitude, p.longitude));
      map.setZoom(15);
      return;
    }

    const latLngs = recommendList.map(
      (m) => new navermaps.LatLng(m.address.latitude, m.address.longitude)
    );

    const bounds = new navermaps.LatLngBounds(latLngs[0], latLngs[0]);
    latLngs.forEach((ll) => bounds.extend(ll));

    map.morph(bounds, 100);
  }, [recommendList, map, navermaps]);

  return (
    <MapDiv style={{ width: "100%", height: "100%" }}>
      <NaverMap
        defaultCenter={new navermaps.LatLng(37.5665, 126.978)}
        defaultZoom={15}
        onLoad={setMap}
      >
        {recommendList?.map((item) => (
          <Marker
            key={item.roomId}
            position={{ lat: parseFloat(item.address.latitude), lng: parseFloat(item.address.longitude) }}
            title={`장소 ${item.roomId}`}
            onClick={() => onMarkerClick(item.roomId)}
            onMouseover={() => onMarkerMouseEnter(item.roomId)}
            onMouseout={onMarkerMouseLeave}
            icon={{
              content: `<div class="custom-marker ${hoveredRoomId === item.roomId ? 'hovered' : ''}">${
                item.price
                  ? item.price.toLocaleString() + '원'
                  : '가격정보없음'
              }</div>`,
              anchor: new navermaps.Point(35, 45),
            }}
          />
        ))}
      </NaverMap>
    </MapDiv>
  );
};

export default MapComponent;