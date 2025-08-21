// src/apis/geocode.jsx
// 네이버 지도 JS SDK 방식 (window.naver.maps.Service.geocode)
// - 별도 서버 프록시/시크릿 불필요
// - 반드시 네이버 지도 SDK가 로드되어 있어야 함
//   예) <script src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=YOUR_KEY&submodules=geocoder"></script>

function waitForNaverService(timeoutMs = 8000, intervalMs = 100) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const tick = () => {
        if (window?.naver?.maps?.Service) {
          resolve(window.naver.maps.Service);
          return;
        }
        if (Date.now() - start > timeoutMs) {
          reject(new Error("[geocode] Naver Maps SDK not loaded (timeout)"));
          return;
        }
        setTimeout(tick, intervalMs);
      };
      tick();
    });
  }
  
  /**
   * 주소(혹은 키워드)를 좌표로 변환
   * @param {Object} params
   * @param {string} params.query - 지오코딩할 주소/키워드 (예: "서울특별시 중구 세종대로 110")
   * @param {boolean} [params.preferRoad=true] - roadAddress 우선 여부
   * @returns {Promise<{
   *   address: string,      // 대표 주소(도로명 우선)
   *   latitude: number,
   *   longitude: number,
   *   raw: any              // 원본 응답
   * }>}
   */
  export async function Geocode({ query, preferRoad = true }) {
    if (!query || typeof query !== "string") {
      throw new Error("[geocode] query string required");
    }
  
    const Service = await waitForNaverService();
  
    return new Promise((resolve, reject) => {
      Service.geocode(
        { query },
        (status, response) => {
          if (status !== window.naver.maps.Service.Status.OK) {
            reject(new Error(`[geocode] Service status ${status}`));
            return;
          }
  
          // v2.addresses 배열: 각 항목 { roadAddress, jibunAddress, x(lng), y(lat), ... }
          const list = response?.v2?.addresses || [];
          if (!list.length) {
            reject(new Error("[geocode] No results"));
            return;
          }
  
          // 대표 결과 선택 로직: 도로명 우선(옵션), 없으면 지번, 그래도 없으면 첫 항목
          const pick =
            (preferRoad && list.find(a => a.roadAddress)) ||
            list.find(a => a.jibunAddress) ||
            list[0];
  
          const address =
            (preferRoad ? (pick.roadAddress || pick.jibunAddress) : (pick.jibunAddress || pick.roadAddress)) || "";
  
          const lat = Number(pick.y);
          const lng = Number(pick.x);
  
          resolve({
            address: address || "주소 미확인",
            latitude: lat,
            longitude: lng,
            raw: response,
          });
        }
      );
    });
  }