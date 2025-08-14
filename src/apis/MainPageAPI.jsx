import axios from "axios";

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: "http://your-api-server.com", // TODO: 실제 API 서버 주소로 변경해야 합니다.
  timeout: 10000,
});

/**
 * 현재 위치 기반으로 추천 장소 목록을 가져오는 API
 * @param {number} latitude 위도
 * @param {number} longitude 경도
 * @returns {Promise<{recommendList: Array<{roomId: number, photo: string, address: {latitude: string, longitude: string}, maxPeople: number, phoneNumber: string, price: number}>}>}
 */
export const getRecommendList = async (latitude, longitude) => {
  try {
    // TODO: API 엔드포인트 및 요청/응답 형식을 서버에 맞게 수정해야 합니다.
    // 아래는 예시 데이터 형식입니다.
    const response = await apiClient.post("/api/recommend-list", {
      latitude,
      longitude,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching recommend list:", error);
    // API 호출 실패 시 예시 데이터를 반환합니다.
    return {
      recommendList: [
        {
          roomId: 1,
          photo: "https://via.placeholder.com/150",
          address: {
            latitude: "37.4582",
            longitude: "127.0282",
          },
          maxPeople: 4,
          phoneNumber: "010-1234-5678",
          price: 50000,
        },
        {
          roomId: 2,
          photo: "https://via.placeholder.com/150",
          address: {
            latitude: "37.4592",
            longitude: "127.0292",
          },
          maxPeople: 2,
          phoneNumber: "010-8765-4321",
          price: 30000,
        },
      ],
    };
  }
};

/**
 * 키워드로 장소를 검색하는 API
 * @param {string} keyword 검색어
 * @returns {Promise<Array>} 검색된 장소 목록
 */
export const searchPlacesByKeyword = async (keyword) => {
  try {
    // TODO: API 엔드포인트 및 요청/응답 형식을 서버에 맞게 수정해야 합니다.
    const response = await apiClient.get(`/api/search-places?keyword=${keyword}`);
    
    // 예시: 서버가 { data: [{ position: { lat, lng }, title: '장소 이름' }, ...] } 형식으로 응답한다고 가정
    return response.data;
  } catch (error) {
    console.error("Error searching places:", error);
    return [];
  }
};
