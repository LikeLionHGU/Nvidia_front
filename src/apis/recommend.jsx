// apis/recommend.js
import api from "../apis/client";

// 안전 숫자 변환 (NaN 방지)
function toNumberOrZero(v) {
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : 0;
}
function toNumberOrUndefined(v) {
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export async function postMain(body) {
  try {
    const res = await api.post("/main", body);
    return res.data;
  } catch (err) {
    // 호출부에서 잡을 수 있게 서버 메시지 우선 던지기

    throw err?.response?.data ?? err;
  }
}

/** 추천: POST /spaceon/recommend */
export async function postRecommend({ center, prompt, minPrice, maxPrice }) {
  try {
    const normalizedCenter = {
      roadName: center?.roadName || "",
      // 위/경도가 없거나 잘못된 경우는 아예 누락하여 백엔드에 쓰레기 값이 안 가게
      ...(toNumberOrUndefined(center?.latitude) !== undefined && {
        latitude: toNumberOrUndefined(center?.latitude),
      }),
      ...(toNumberOrUndefined(center?.longitude) !== undefined && {
        longitude: toNumberOrUndefined(center?.longitude),
      }),
    };

    const req = {
      addressList: [normalizedCenter],
      prompt: prompt || "",
      minPrice: toNumberOrZero(minPrice),
      maxPrice: toNumberOrZero(maxPrice),
    };

    const res = await api.post("/recommend", req);
    return res.data;
  } catch (err) {
    throw err?.response?.data ?? err;
  }
}

/** 상세 조회: /spaceon/recommend/detail/{roomId} */
export async function getRecommendDetail(roomId) {
  if (roomId === undefined || roomId === null) {

    throw new Error("roomId가 필요합니다.");
  }
  try {
    const { data } = await api.get(`/recommend/detail/${roomId}`);

    return data;

  } catch (err) {
    throw err?.response?.data ?? err;
  }
}