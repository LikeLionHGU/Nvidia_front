// apis/recommend.js
import api from "../apis/client";

// 내부 유틸: 숫자 변환 안전 처리 (NaN 방지)
function toNumberOrUndefined(v) {
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : undefined;
}

// 내부 유틸: center 정규화 (latitude/longitude가 유효할 때만 포함)
function normalizeCenter(center) {
  const lat = toNumberOrUndefined(center?.latitude);
  const lng = toNumberOrUndefined(center?.longitude);

  return {
    roadName: center?.roadName || "",
    ...(lat !== undefined ? { latitude: lat } : {}),
    ...(lng !== undefined ? { longitude: lng } : {}),
  };
}

/** 메인: POST /spaceon/main */
export async function postMain(body) {
  try {
    const res = await api.post("/main", body);
    return res.data; // 서버 응답 그대로 리턴
  } catch (err) {
    // 호출부에서 메시지 확인할 수 있게 그대로 던지기
    throw err?.response?.data ?? err;
  }
}

/** 추천: POST /spaceon/recommend */
export async function postRecommend({ center, prompt, minPrice, maxPrice }) {
  try {
    const req = {
      addressList: [normalizeCenter(center)],
      prompt: prompt || "",
      minPrice: toNumberOrUndefined(minPrice) ?? 0,
      maxPrice: toNumberOrUndefined(maxPrice) ?? 0,
    };

    const res = await api.post("/recommend", req);
    return res.data;
  } catch (err) {
    throw err?.response?.data ?? err;
  }
}

/** 상세: GET /spaceon/recommend/detail/{roomId} */
export async function getRecommendDetail(roomId) {
  if (!roomId && roomId !== 0) {
    throw new Error("roomId가 필요합니다.");
  }
  try {
    const { data } = await api.get(`/recommend/detail/${roomId}`);
    return data; // 상세 스펙 그대로
  } catch (err) {
    throw err?.response?.data ?? err;
  }
}