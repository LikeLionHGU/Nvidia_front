import React, { useState, useCallback, useRef, useEffect } from "react";
import styled from "styled-components";
import { X, MapPin, Navigation } from "lucide-react";
import { debounce } from "lodash";
import { searchLocal } from "../apis/NaverLocal";
import { reverseGeocode } from "../apis/reverseGeocode";
import AddLocationIcon from "../assets/icons/addLocation.svg";
import MyLocationIcon from "../assets/images/my_location.svg";
import EnterLocation from "../assets/icons/EnterLocation.svg";
import EnterFinished from "../assets/icons/EnterFinished.svg";
import { postAddressList } from "../apis/sendAddressList";

function LocationSearchModal({ onClose, onConfirm }) {
  const [locations, setLocations] = useState([]);
  const [addressList, setAddressList] = useState([]); // {roadName, latitude, longitude}[]
  const [activeIndex, setActiveIndex] = useState(null); // 포커스된 줄 인덱스
  const [items, setItems] = useState([]); // 드롭다운 결과
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [confirmedRows, setConfirmedRows] = useState([]);

  const searchBoxRefs = useRef([]);

  // 네이버 mapx/mapy 좌표 스케일 정규화
  const normalizeCoord = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    return Math.abs(n) > 1000 ? n / 1e7 : n;
  };

  const toAddressEntry = (item) => ({
    roadName: item.roadAddress || "",
    latitude: normalizeCoord(item.mapy), // 네이버: mapy=위도
    longitude: normalizeCoord(item.mapx), // 네이버: mapx=경도
  });

  const addLocation = () => {
    // 현재까지 줄들에 선택된 주소가 모두 있는지 체크
    const hasEmpty = addressList.some((a, idx) => idx < locations.length && (!a || !a.roadName));
    if (hasEmpty) {
      alert("모든 위치를 선택한 후 추가해주세요.");
      return;
    }
    setLocations((prev) => [...prev, { id: prev.length + 1, value: "" }]);
    setConfirmedRows((prev) => {
      const next = [...prev];
      next[prev.length] = false; // 새 줄은 미완료
      return next;
    });
  };

  const runSearch = async (query) => {
    const q = (query || "").trim();
    if (!q) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await searchLocal({ query: q, display: 5, sort: "random" });
      setItems(data.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };
  const debouncedSearch = useCallback(debounce(runSearch, 250), []);

  const updateDropdownPosition = (idx) => {
    const searchBox = searchBoxRefs.current[idx];
    if (!searchBox) return;
    const rect = searchBox.getBoundingClientRect();
    setDropdownPosition({ top: rect.bottom + 6, left: rect.left, width: rect.width });
  };

  const updateLocation = (idx, v) => {
    setLocations((prev) => prev.map((it, i) => (i === idx ? { ...it, value: v } : it)));
    setActiveIndex(idx);
    updateDropdownPosition(idx);

    setConfirmedRows((prev) => {
      const next = [...prev];
      next[idx] = false;
      return next;
    });
    setAddressList((prev) => {
      const next = [...prev];
      next[idx] = undefined;
      return next;
    });

    debouncedSearch(v);
  };

  const handleFocus = (idx, loc) => {
    setActiveIndex(idx);
    updateDropdownPosition(idx);
    if (loc.value) debouncedSearch(loc.value);
  };

  // X: 첫 줄은 입력만 지우고, 2번째 줄부터는 줄 삭제
  const clickX = (idx) => {
    if (idx === 0) {
      // 첫 줄은 값만 지움
      setLocations((prev) => prev.map((it, i) => (i === 0 ? { ...it, value: "" } : it)));
      setAddressList((prev) => {
        const n = [...prev];
        n[0] = undefined;
        return n;
      });
      setConfirmedRows((prev) => {
        const n = [...prev];
        n[0] = false;
        return n;
      });
    } else {
      setLocations((prev) => prev.filter((_, i) => i !== idx).map((it, i) => ({ ...it, id: i + 1 })));
      setAddressList((prev) => prev.filter((_, i) => i !== idx));
      setConfirmedRows((prev) => prev.filter((_, i) => i !== idx)); // ✅ 같이 제거
    }
    setItems([]);
  };

  // 제안 클릭 시: 입력 채우고 addressList 업데이트
  const clickSuggestion = (idx, item) => {
    const plainTitle = (item?.title || "").replace(/<\/?b>/g, "");
    setLocations((prev) => prev.map((it, i) => (i === idx ? { ...it, value: plainTitle } : it)));
    setAddressList((prev) => {
      const next = [...prev];
      next[idx] = toAddressEntry(item);
      return next;
    });
    setConfirmedRows((prev) => {
      const next = [...prev];
      next[idx] = true; // ✅ 완료
      return next;
    });
    setItems([]);
    setActiveIndex(null);
  };

  // 현재 위치(브라우저 geolocation) → reverseGeocode 활용
  const getCurrentLocation = (idx) => {
    if (!navigator.geolocation) {
      alert("이 브라우저에서는 위치 서비스를 지원하지 않습니다.");
      return;
    }
    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;
        try {
          const info = await reverseGeocode({ lat: latitude, lng: longitude }); // 헬퍼 사용
          setLocations((prev) => prev.map((it, i) => (i === idx ? { ...it, value: info.roadName } : it)));
          setAddressList((prev) => {
            const next = [...prev];
            next[idx] = { roadName: info.roadName, latitude: info.latitude, longitude: info.longitude };
            return next;
          });
          setItems([]);
          setActiveIndex(null);
          setConfirmedRows((prev) => {
            const next = [...prev];
            next[idx] = true;
            return next;
          });
        } catch (e) {
          console.error(e);
          alert("주소를 가져오는데 실패했습니다.");
        } finally {
          setLocationLoading(false);
        }
      },
      (err) => {
        setLocationLoading(false);
        let msg = "위치를 가져올 수 없습니다.";
        if (err.code === err.PERMISSION_DENIED)
          msg = "위치 접근이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.";
        else if (err.code === err.POSITION_UNAVAILABLE) msg = "위치 정보를 사용할 수 없습니다.";
        else if (err.code === err.TIMEOUT) msg = "위치 요청 시간이 초과되었습니다.";
        alert(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleConfirm = async () => {
    const confirmed = addressList
      .map((addr, idx) => ({ addr, ok: !!confirmedRows[idx] }))
      .filter(({ addr, ok }) => ok && addr && typeof addr.latitude === "number" && typeof addr.longitude === "number")
      .map(({ addr }) => ({
        latitude: addr.latitude,
        longitude: addr.longitude,
      }));

    if (confirmed.length === 0) {
      alert("완료된 위치가 없습니다. 연관검색어 선택 또는 내 위치 불러오기를 사용해주세요.");
      return;
    }

    try {
      const centerLL = await postAddressList(confirmed); // { latitude, longitude }
      if (!centerLL || typeof centerLL.latitude !== "number" || typeof centerLL.longitude !== "number") {
        alert("중간 좌표를 가져오지 못했습니다.");
        return;
      }
      // 2) 여기서 reverseGeocode로 도로명 변환
      const info = await reverseGeocode({ lat: centerLL.latitude, lng: centerLL.longitude });
      const center = {
        roadName: info?.roadName || "",
        latitude: centerLL.latitude,
        longitude: centerLL.longitude,
      };
      onConfirm ? onConfirm(center) : onClose?.();
    } catch (e) {
      console.error("API error:", e);
      alert("서버 요청 중 오류가 발생했습니다.");
    }
  };

  const handleClose = () => {
    setActiveIndex(null);
    onClose?.();
  };

  // 스크롤/리사이즈 시에도 드롭다운 위치 유지
  useEffect(() => {
    if (activeIndex === null) return;
    const onScrollOrResize = () => updateDropdownPosition(activeIndex);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    updateDropdownPosition(activeIndex);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [activeIndex]);

  return (
    <ModalBackground>
      <Overlay onClick={handleClose} />
      <Wrapper>
        <Header>
          <TopRow>
            <StepPill>Step 1</StepPill>
            <Title>위치를 지정해주세요.</Title>
          </TopRow>
          <Subtitle>내 위치를 선택하거나, 친구와의 중간 지점을 작성해주세요.</Subtitle>
        </Header>

        <ContentCard>
          <RowsScrollArea>
            {locations.map((loc, idx) => {
              const confirmed = !!confirmedRows[idx]; // 🔸 이 줄 추가
              return (
                <Row key={`${loc.id}-${idx}`}>
                  <LeftContainer>
                    <IndexBadge $confirmed={confirmed}>{loc.id}</IndexBadge>
                    <ProcessBar $show={idx !== locations.length - 1} />
                  </LeftContainer>
                  <SearchArea>
                    <SearchBox $confirmed={confirmed} ref={(el) => (searchBoxRefs.current[idx] = el)}>
                      <LeftStateIcon src={confirmed ? EnterFinished : EnterLocation} alt="" />

                      <SearchInput
                        value={loc.value}
                        onChange={(e) => updateLocation(idx, e.target.value)}
                        onFocus={() => handleFocus(idx, loc)}
                        onBlur={() => {
                          setTimeout(() => {
                            const withinPanel = document.activeElement?.closest('[data-suggest-panel="true"]');
                            if (!withinPanel) setActiveIndex(null);
                          }, 120);
                        }}
                        placeholder="위치를 입력해주세요."
                        $confirmed={confirmed} // 🔸 배경 변경용
                      />

                      {/* 기존 X 버튼은 오른쪽 아이콘 뒤에 배치 */}
                      {idx > 0 ? (
                        <IconBtn aria-label={`${loc.id}번 줄 삭제`} onMouseDown={() => clickX(idx)} title="삭제">
                          <X size={18} />
                        </IconBtn>
                      ) : (
                        <IconBtn
                          aria-label="입력 지우기"
                          onMouseDown={() => clickX(idx)}
                          title="지우기"
                          style={{ visibility: loc.value ? "visible" : "hidden" }}
                        >
                          <X size={18} />
                        </IconBtn>
                      )}
                    </SearchBox>
                  </SearchArea>
                </Row>
              );
            })}
          </RowsScrollArea>

          <AddMore onClick={addLocation}>
            <img src={AddLocationIcon} alt="" style={{ marginRight: "0.49vh" }} />
            <span> 위치 추가하기 </span>
          </AddMore>
        </ContentCard>

        <Footer>
          <GhostButton type="button" onClick={handleClose}>
            취소
          </GhostButton>
          <PrimaryButton type="button" onClick={handleConfirm}>
            확인
          </PrimaryButton>
        </Footer>
      </Wrapper>

      {/* 🔽 드롭다운: 모달 밖 최상위 레벨에 고정 렌더링 */}
      {activeIndex !== null && (
        <SuggestPanel
          data-suggest-panel="true"
          style={{
            position: "fixed",
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
          }}
        >
          {/* 내 위치 불러오기 */}
          <MyLocationButton onMouseDown={() => getCurrentLocation(activeIndex)} disabled={locationLoading}>
            <Icon src={MyLocationIcon} alt="Current Location" />
            <span>{locationLoading ? "위치 가져오는 중..." : "내 위치 불러오기"}</span>
          </MyLocationButton>

          <Divider />

          {loading && <SuggestLoading>검색 중…</SuggestLoading>}

          {!loading && items.length === 0 && locations[activeIndex]?.value.trim() && (
            <NoResults>검색 결과가 없습니다.</NoResults>
          )}

          {!loading && items.length > 0 && (
            <SuggestList>
              {items.map((it, i) => (
                <SuggestItem key={i} onMouseDown={() => clickSuggestion(activeIndex, it)}>
                  <SuggestItemTitle dangerouslySetInnerHTML={{ __html: (it.title || "").replace(/<\/?b>/g, "") }} />
                  <SuggestItemAddress>{it.roadAddress || "-"}</SuggestItemAddress>
                </SuggestItem>
              ))}
            </SuggestList>
          )}
        </SuggestPanel>
      )}
    </ModalBackground>
  );
}

export default LocationSearchModal;

/* ================= styles ================= */

const modalBase = `
  width: 100vw; height: 100vh;
  position: fixed; inset: 0;
`;

const ModalBackground = styled.div`
  ${modalBase}
  background: rgba(0,0,0,0.35);
  z-index: 1000;
`;
const Overlay = styled.div`
  ${modalBase}
`;

const Wrapper = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 800px;
  height: 600px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 24px 28px 8px 28px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 0 0 auto;
`;
const TopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;
const StepPill = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 72px;
  height: 28px;
  border-radius: 10px;
  background: #2fb975;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
`;
const Title = styled.h2`
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: #111827;
`;
const Subtitle = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  padding-left: calc(72px + 12px);
`;

const LeftContainer = styled.div`
  width: 40px;
  position: relative; /* ✅ absolute bar의 기준 */
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: stretch; /* ✅ Row의 전체 높이를 채워서 bottom:0 기준 확보 */
`;

const ProcessBar = styled.div`
  position: absolute; /* ✅ 레이아웃에서 분리 */
  left: 50%;
  transform: translateX(-50%);
  top: 44px; /* 배지(40px) 바로 아래에서 시작 */
  bottom: 0; /* Row 하단까지 자동으로 연결 */
  width: 0;
  height: 50px;
  pointer-events: none;
  border-right: 1.5px dashed #2fb975;
  display: ${(p) => (p.$show ? "block" : "none")}; /* 마지막 줄 숨김 */
`;

const ContentCard = styled.div`
  margin: 14px 28px 0 28px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1 1 auto;
  min-height: 0;
`;
const RowsScrollArea = styled.div`
  overflow-y: auto;
  padding-right: 2px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: 12px;
  align-items: center;
  & + & {
    padding-bottom: 10px;
    margin-top: 0;
  }
  padding-bottom: 10px;
  overflow: visible;
  width: 450px;
  margin: 50px auto 0 auto;
`;
const IndexBadge = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 4px;
  background: ${(p) => (p.$confirmed ? "#2FB975" : "#B0F0D0")};
  color: ${(p) => (p.$confirmed ? "#FFFFFF" : "#2FB975")};
  font-weight: 700;
  display: grid;
  place-items: center;
  z-index: 1;
  margin-top: 5px;
`;
const SearchArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: visible;
`;

const SearchBox = styled.div`
  border: 2px solid #2fb975;
  border-radius: 10px;
  overflow: visible;
  height: 48px;
  display: grid;
  grid-template-columns: auto 1fr auto; /* LeftStateIcon | input | X */
  align-items: center;
  padding: 0 8px 0 10px;
  gap: 8px;
  background: ${(p) => (p.$confirmed ? "#F5F5F7" : "#fff")}; /* ✅ 완료 시 박스 배경도 바꾸고 싶으면 */
`;

const LeftStateIcon = styled.img`
  width: 18px;
  height: 18px;
`;

const SearchInput = styled.input`
  height: 100%;
  border: none;
  outline: none;
  padding: 0 6px;
  font-size: 14px;
  background: ${(p) => (p.$confirmed ? "#F5F5F7" : "transparent")}; /* ✅ 완료 시 F5F5F7 */
  &::placeholder {
    color: #9ca3af;
  }
`;

const IconBtn = styled.button`
  justify-self: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #9ca3af;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: #f3f4f6;
  }
  &:active {
    background: #e5e7eb;
  }
`;

const SuggestPanel = styled.div`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
  max-height: 320px;
  overflow-y: auto;
  z-index: 10000;
`;

const MyLocationButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8fffe;
  border: none;
  cursor: pointer;
  justify-content: center;
  font-size: 14px;
  color: #2fb975;
  font-weight: 600;
  &:hover {
    background: #f0fdf4;
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: #e5e7eb;
  margin: 0;
`;

const SuggestList = styled.ul`
  list-style: none;
  padding: 6px 0;
  margin: 0;
`;
const SuggestItem = styled.li`
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 8px;
  &:hover {
    background: #f3f4f6;
  }
`;
const SuggestItemTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
`;
const SuggestItemAddress = styled.div`
  margin-top: 2px;
  font-size: 12px;
  color: #6b7280;
`;
const SuggestLoading = styled.div`
  padding: 12px;
  font-size: 13px;
  color: #6b7280;
`;
const NoResults = styled.div`
  padding: 12px;
  font-size: 13px;
  color: #6b7280;
  text-align: center;
`;

const AddMore = styled.button`
  align-self: center;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  &:hover {
    background-color: #f3f4f6;
  }
  &:active {
    background-color: #e5e7eb;
  }
  flex: 0 0 auto;
`;

const Footer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 16px 28px 24px;
  border-top: 1px solid #f3f4f6;
  flex: 0 0 auto;
`;
const BaseBtn = styled.button`
  min-width: 120px;
  height: 44px;
  border-radius: 5.5px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  outline: none;
  border: 1px solid transparent;
`;
const GhostButton = styled(BaseBtn)`
  background: #fff;
  border: 1px solid #e5e7eb;
  color: #374151;
  &:hover {
    background: #f9fafb;
  }
  &:active {
    background: #f3f4f6;
  }
`;
const PrimaryButton = styled(BaseBtn)`
  background: #2fb975;
  color: #fff;
  &:hover {
    filter: brightness(0.96);
  }
  &:active {
    background: #26945e;
  }
`;

const Icon = styled.img`
  width: 16px;
  height: 16px;
`;
