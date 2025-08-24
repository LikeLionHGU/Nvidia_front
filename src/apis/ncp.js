// src/apis/ncp.js
import axios from "axios";

// 네이버 지도 Reverse Geocode 프록시
const NCP_PROXY = "/api/ncp-reverse";

export const NcpClient = axios.create({
  baseURL: NCP_PROXY,
});

export async function reverseGeocode({ coords, orders = "roadaddr" }) {
  // coords: "127.1052133,37.3595316"
  const res = await NcpClient.get("/map-reversegeocode/v2/gc", {
    params: { coords, orders, output: "json" },
  });
  return res.data;
}