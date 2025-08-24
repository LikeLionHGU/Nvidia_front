import api from "../apis/client";

export async function postMain(body) {
  const res = await api.post("/main", body);
  return res.data; // ★ 여기!
}

export async function postRecommend({ center, prompt, minPrice, maxPrice }) {
  const req = {
    addressList: [
      {
        roadName: center?.roadName || "",
        latitude: Number(center?.latitude),
        longitude: Number(center?.longitude),
      },
    ],
    prompt: prompt || "",
    minPrice: Number(minPrice) || 0,
    maxPrice: Number(maxPrice) || 0,
  };
  const res = await api.post("/recommend", req);
  return res.data; // ★ 여기!
}

/** 상세 조회: /recommend/detail/{roomId} */
export async function getRecommendDetail(roomId) {
  const { data } = await api.get(`/recommend/detail/${roomId}`);
  return data; // 상세 스펙 그대로
}
