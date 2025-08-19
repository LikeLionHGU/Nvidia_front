// src/apis/reverseGeocode.jsx
// 네이버 지도 JS SDK 방식 (window.naver.maps.Service.reverseGeocode)
// - NCP 키/프록시 불필요
// - 반드시 네이버 지도 SDK가 로드되어 있어야 함
//   (예: <script src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=YOUR_ID&submodules=geocoder"></script>)

function waitForNaverService(timeoutMs = 8000, intervalMs = 100) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const tick = () => {
        if (window?.naver?.maps?.Service) {
          resolve(window.naver.maps.Service);
          return;
        }
        if (Date.now() - start > timeoutMs) {
          reject(new Error("[reverseGeocode] Naver Maps SDK not loaded (timeout)"));
          return;
        }
        setTimeout(tick, intervalMs);
      };
      tick();
    });
  }
  
  export async function reverseGeocode({ lat, lng }) {
    if (lat == null || lng == null) {
      throw new Error("[reverseGeocode] lat/lng required");
    }
  
    const Service = await waitForNaverService();
  
    return new Promise((resolve, reject) => {
      const coords = new window.naver.maps.LatLng(lat, lng);
  
      Service.reverseGeocode(
        {
          coords,
          // 도로명/지번 모두 요청 (우선순위는 아래에서 처리)
          orders: [
            window.naver.maps.Service.OrderType.ROAD_ADDR, // roadaddr
            window.naver.maps.Service.OrderType.ADDR,      // addr (지번)
          ].join(","),
        },
        (status, response) => {
          if (status !== window.naver.maps.Service.Status.OK) {
            reject(new Error(`[reverseGeocode] Service status ${status}`));
            return;
          }
  
          // 1) v2.address에 roadAddress 또는 jibunAddress가 바로 들어오는 케이스
          const v2addr = response?.v2?.address;
          let roadName =
            v2addr?.roadAddress ||
            v2addr?.jibunAddress ||
            "";
  
          // 2) 없으면 v2.results에서 조립
          if (!roadName) {
            const results = response?.v2?.results || [];
            // roadaddr 우선, 없으면 addr, 그래도 없으면 첫 결과
            const pick =
              results.find(r => r.name === "roadaddr") ||
              results.find(r => r.name === "addr") ||
              results[0];
  
            if (pick) {
              // region + land 구성
              const r = pick.region || {};
              const l = pick.land || {};
              roadName = [
                r.area1?.name,
                r.area2?.name,
                r.area3?.name,
                l.name,
                l.number1,
                l.addition0?.value,
              ]
                .filter(Boolean)
                .join(" ");
            }
          }
  
          resolve({
            roadName: roadName || "주소 미확인",
            latitude: Number(lat),
            longitude: Number(lng),
            raw: response, // 디버깅용
          });
        }
      );
    });
  }