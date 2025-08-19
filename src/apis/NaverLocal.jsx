import axios from "axios";

const NAVER_BASE = "/api/v1/search";

const clientId = import.meta.env.VITE_SEARCH_CLIENT_ID;
const clientSecret = import.meta.env.VITE_SEARCH_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  throw new Error("VITE_SEARCH_CLIENT_ID and VITE_SEARCH_CLIENT_SECRET must be set in .env");
}

export const NaverLocal = axios.create({
  baseURL: NAVER_BASE,
  headers: {
    "X-Naver-Client-Id": clientId,
    "X-Naver-Client-Secret": clientSecret,
  },
});

export async function searchLocal({
  query,
  display = 5,   // 1~5
  start = 1,     // 1~1000
  sort = "random" // random | comment
}) {
  const res = await NaverLocal.get("/local.json", {
    params: { query, display, start, sort },
  });
  console.log(res.data);
  return res.data; // { items: [...] }
}
