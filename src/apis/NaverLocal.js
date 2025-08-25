import axios from "axios";

// Vercel Edge Function을 항상 타도록 동일 경로 사용
const NAVER_BASE = "/api";

// 로컬 개발 중에만 경고용으로 확인
const clientId = import.meta.env.VITE_SEARCH_CLIENT_ID;
const clientSecret = import.meta.env.VITE_SEARCH_CLIENT_SECRET;
if (import.meta.env.DEV && (!clientId || !clientSecret)) {
  console.warn(
    "VITE_SEARCH_CLIENT_ID / VITE_SEARCH_CLIENT_SECRET 미설정: Vercel proxy(Edge Function)를 통해 호출합니다."
  );
}

export const NaverLocal = axios.create({
  baseURL: NAVER_BASE,
  headers: { "Content-Type": "application/json" }, // 실제 자격증명 헤더는 Edge Function에서 세팅
});

export async function searchLocal({
  query,
  display = 5,
  start = 1,
  sort = "random",
}) {
  try {
    // Vercel Edge Function: /api/naver-local -> Naver OpenAPI로 서버사이드 프록시
    const res = await NaverLocal.get("/naver-local", {
      params: { query, display, start, sort },
    });
    return res.data;
  } catch (error) {
    // Axios 에러는 response에 디테일이 담기는 경우가 많음
    console.error("Naver API Error:", error?.response || error);
    throw error;
  }
}
// 백업용: 직접 fetch 사용 방식
export async function searchLocalFetch({
  query,
  display = 5,
  start = 1,
  sort = "random"
}) {
  try {
    const response = await fetch(`/api/naver-local?query=${encodeURIComponent(query)}&display=${display}&start=${start}&sort=${sort}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Naver API Fetch Error:', error);
    throw error;
  }
}