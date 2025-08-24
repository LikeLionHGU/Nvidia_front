// src/apis/naver.js
import axios from "axios";

// 프런트는 서버리스 프록시만 호출 (배포/개발 공통)
const NAVER_SEARCH_PROXY = "/api/naver-local";

export const NaverLocal = axios.create({
  baseURL: NAVER_SEARCH_PROXY,
});

export async function searchLocal({
  query,
  display = 5,   // 1~5
  start = 1,     // 1~1000
  sort = "random" // random | comment
}) {
  const res = await NaverLocal.get("", {
    params: { query, display, start, sort },
  });
  return res.data; // { items: [...] }
}