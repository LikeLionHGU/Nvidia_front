import axios from "axios";

// 프로덕션에서도 Vercel 함수를 통해 프록시 호출
const NAVER_BASE =
  import.meta.env.PROD
    ? '/api'                           // 프로덕션: Vercel 함수 사용
    : '/api';                          // 로컬: 동일하게 Vercel 함수 사용 (또는 Vite 프록시)

// 프로덕션에서는 환경변수가 필요 없음 (Vercel 함수에서 처리)
// 로컬에서만 확인용으로 사용
const clientId = import.meta.env.VITE_SEARCH_CLIENT_ID;
const clientSecret = import.meta.env.VITE_SEARCH_CLIENT_SECRET;

// 로컬 개발 환경에서만 환경변수 체크 (선택사항)
if (import.meta.env.DEV && (!clientId || !clientSecret)) {
  console.warn("VITE_SEARCH_CLIENT_ID and VITE_SEARCH_CLIENT_SECRET are not set - using Vercel proxy");
}

export const NaverLocal = axios.create({
  baseURL: NAVER_BASE,
  // 프로덕션에서는 헤더 불필요 (Vercel 함수에서 처리)
  headers: {
    "Content-Type": "application/json"
  },
});

export async function searchLocal({
  query,
  display = 5,   // 1~5
  start = 1,     // 1~1000
  sort = "random" // random | comment
}) {
  try {
    // Vercel 함수 엔드포인트 호출
    const res = await NaverLocal.get("/naver-local", {
      params: { query, display, start, sort },
    });
    console.log(res.data);
    return res.data; // { items: [...] }
  } catch (error) {
    console.error('Naver API Error:', error);
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
    console.log(data);
    return data;
  } catch (error) {
    console.error('Naver API Fetch Error:', error);
    throw error;
  }
}