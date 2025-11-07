import axios from "axios";

const api = axios.create({
  // baseURL: "https://janghong.asia", // 직접 서버 호출
  baseURL: "https://jinjigui.info:4443/", // 직접 서버 호출
  timeout: 30000, // 업로드면 넉넉하게
  transformRequest: [(data, headers) => {
    // FormData일 경우 Content-Type을 제거 → 브라우저가 자동으로 boundary 붙여줌
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      delete headers['Content-Type'];
      delete headers['content-type'];
      return data;
    }

    // 일반 객체일 경우 JSON 직렬화
    if (data !== undefined && data !== null) {
      headers['Content-Type'] = 'application/json';
      return JSON.stringify(data);
    }

    return data;
  }],

});

export default api;
