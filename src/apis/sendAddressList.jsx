import api from "./client";

export async function postAddressList(addressList) {
  const payload = { addressList };
  const res = await api.post("/spaceon/search/middle", payload);
  return res.data;
}
