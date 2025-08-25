// apis/recommend.js
import api from "../apis/client";

/* ================== 내부 유틸 ================== */
// 안전 숫자 변환 (NaN 방지)
function toNumberOrZero(v) {
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : 0;
}
function toNumberOrUndefined(v) {
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : undefined;
}

// center 정규화: 유효한 값만 포함해 서버에 쓰레기 값 전달 방지
function normalizeCenter(center) {
  const lat = toNumberOrUndefined(center?.latitude);
  const lng = toNumberOrUndefined(center?.longitude);
  return {
    roadName: center?.roadName || "",
    ...(lat !== undefined ? { latitude: lat } : {}),
    ...(lng !== undefined ? { longitude: lng } : {}),
  };
}

/* ================== API ================== */
/** 메인: POST /main  (현재 위치 기반 추천) */
export async function postMain(body) {
  try {
    const res = await api.post("/main", body);
    return res.data;
  } catch (err) {
    // 호출부에서 잡을 수 있게 서버 메시지 우선 던지기
    throw err?.response?.data ?? err;
  }
}

/** 추천: POST /recommend  (주소 리스트 + 조건 기반 추천) */
export async function postRecommend({ center, prompt, minPrice, maxPrice }) {
  try {
    const req = {
      addressList: [normalizeCenter(center)], // 단일 중간 위치를 리스트에 넣어 전달
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

/** 상세: GET /recommend/detail/{roomId} */
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