import React, { useState, useCallback, useRef, useEffect } from "react";
import styled from "styled-components";
import { X, MapPin } from "lucide-react";
import { debounce } from "lodash";
import { searchLocal } from "../apis/NaverLocal"; // 네이버 로컬 검색 함수
import AddLocationIcon from "../assets/icons/addLocation.svg";

function LocationSearchModal({ onClose, onConfirm }) {
  const [locations, setLocations] = useState([{ id: 1, value: "" }]);
  const [addressList, setAddressList] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null); // null when no input is active
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [panelStyle, setPanelStyle] = useState({ display: "none" });
  const inputRefs = useRef([]);

  useEffect(() => {
    if (activeIndex === null || !inputRefs.current[activeIndex]) {
      setPanelStyle({ display: "none" });
      return;
    }
    const rect = inputRefs.current[activeIndex].getBoundingClientRect();
    setPanelStyle({
      position: "fixed",
      top: `${rect.bottom + 6}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      display: "block",
    });
  }, [activeIndex, items, loading]);

  const addLocation = () => {
    setLocations((prev) => [...prev, { id: prev.length + 1, value: "" }]);
  };

  const normalizeCoord = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    return Math.abs(n) > 1000 ? n / 1e7 : n;
  };

  const toAddressEntry = (item) => ({
    roadName: item.roadAddress || "",
    latitude: normalizeCoord(item.mapy),
    longitude: normalizeCoord(item.mapx),
  });

  const runSearch = async (query) => {
    const q = (query || "").trim();
    if (!q) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await searchLocal({ query: q, display: 5, sort: "comment" });
      setItems(data.items || []);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(debounce(runSearch, 250), []);

  const updateLocation = (idx, v) => {
    setLocations((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, value: v } : it))
    );
    setActiveIndex(idx);
    debouncedSearch(v);
  };

  const clickX = (idx) => {
    if (idx === 0) {
      setLocations((prev) =>
        prev.map((it, i) => (i === 0 ? { ...it, value: "" } : it))
      );
      setAddressList((prev) => {
        const next = [...prev];
        next[0] = undefined;
        return next;
      });
    } else {
      setLocations((prev) => {
        const next = prev.filter((_, i) => i !== idx);
        return next.map((it, i) => ({ ...it, id: i + 1 }));
      });
      setAddressList((prev) => prev.filter((_, i) => i !== idx));
    }
    setItems([]);
  };

  const clickSuggestion = (idx, item) => {
    const plainTitle = (item?.title || "").replace(/<\/?b>/g, "");
    setLocations((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, value: plainTitle } : it))
    );
    setAddressList((prev) => {
      const next = [...prev];
      next[idx] = toAddressEntry(item);
      return next;
    });
    setItems([]);
    setActiveIndex(null); // Close dropdown after selection
  };

  const handleConfirm = () => {
    const values = locations.map((l) => l.value.trim());
    const payload = { locations: values, addressList };
    onConfirm ? onConfirm(payload) : onClose?.();
  };

  const handleClose = () => {
    setActiveIndex(null);
    onClose?.();
  };

  return (
    <ModalBackground>
      <Overlay onClick={handleClose} />
      <Wrapper>
        <Header>
          <TopRow>
            <StepPill>Step 1</StepPill>
            <Title>위치를 지정해주세요.</Title>
          </TopRow>
          <Subtitle>
            내 위치를 선택하거나, 친구와의 중간 지점을 작성해주세요.
          </Subtitle>
        </Header>

        <ContentCard>
          <RowsScrollArea>
            {locations.map((loc, idx) => (
              <Row key={`${loc.id}-${idx}`}>
                <IndexBadge>{loc.id}</IndexBadge>
                <SearchArea>
                  <SearchBox>
                    <MapPin size={18} color="#2fb975" />
                    <SearchInput
                      ref={(el) => (inputRefs.current[idx] = el)}
                      value={loc.value}
                      onChange={(e) => updateLocation(idx, e.target.value)}
                      onFocus={() => {
                        setActiveIndex(idx);
                        if (loc.value) debouncedSearch(loc.value);
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          // Check if the new focused element is part of the suggestion panel
                          if (!document.activeElement.closest('[data-suggest-panel="true"]')) {
                            setActiveIndex(null);
                          }
                        }, 150); // A small delay to allow click on suggestion item
                      }}
                      placeholder="위치를 입력해주세요."
                    />
                    {idx > 0 ? (
                      <IconBtn
                        type="button"
                        aria-label={`${loc.id}번 줄 삭제`}
                        onClick={() => clickX(idx)}
                        title="삭제"
                      >
                        <X size={18} />
                      </IconBtn>
                    ) : (
                      <IconBtn
                        type="button"
                        aria-label="입력 지우기"
                        onClick={() => clickX(idx)}
                        title="지우기"
                        style={{ visibility: loc.value ? "visible" : "hidden" }}
                      >
                        <X size={18} />
                      </IconBtn>
                    )}
                  </SearchBox>
                </SearchArea>
              </Row>
            ))}
          </RowsScrollArea>

          <AddMore onClick={addLocation}>
            <img
              src={AddLocationIcon}
              alt=""
              style={{ marginRight: "0.49vh" }}
            />
            <span> 위치 추가하기 </span>
          </AddMore>
        </ContentCard>

        {/* Suggestion Panel is now rendered here, outside the clipping containers */}
        {activeIndex !== null && (items.length > 0 || loading) && (
          <SuggestPanel style={panelStyle} data-suggest-panel="true">
            {loading && <SuggestLoading>검색 중…</SuggestLoading>}
            {!loading && (
              <SuggestList>
                {items.map((it, i) => (
                  <SuggestItem
                    key={i}
                    onMouseDown={() => clickSuggestion(activeIndex, it)}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: (it.title || "").replace(/<\/?b>/g, ""),
                      }}
                    />
                  </SuggestItem>
                ))}
              </SuggestList>
            )}
          </SuggestPanel>
        )}

        <Footer>
          <GhostButton type="button" onClick={handleClose}>
            취소
          </GhostButton>
          <PrimaryButton type="button" onClick={handleConfirm}>
            확인
          </PrimaryButton>
        </Footer>
      </Wrapper>
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
  left: 50%; top: 50%;
  transform: translate(-50%, -50%);
  width: 800px;
  height: 600px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.18);
  display: flex; flex-direction: column;
  /* overflow: hidden; */ /* Removed to prevent clipping the suggestion panel */
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
  & + & { margin-top: 10px; }
`;

const IndexBadge = styled.div`
  width: 40px; height: 40px;
  border-radius: 4px;
  background: #2fb975;
  color: #fff; font-weight: 600;
  display: grid; place-items: center;
  flex: 0 0 auto;
`;

const SearchArea = styled.div`
  display: flex; flex-direction: column; gap: 8px;
`;

const SearchBox = styled.div`
  position: relative;
  border: 2px solid #2fb975;
  border-radius: 10px;
  overflow: visible;
  height: 48px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  padding: 0 12px;
  gap: 8px;
`;

const SearchInput = styled.input`
  height: 100%;
  border: none; outline: none;
  padding: 0 6px; font-size: 14px;
  &::placeholder { color: #9ca3af; }
`;

const IconBtn = styled.button`
  justify-self: center;
  width: 28px; height: 28px;
  border: none; background: transparent;
  color: #9ca3af; border-radius: 6px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  &:hover { background: #f3f4f6; }
  &:active { background: #e5e7eb; }
`;

const SuggestPanel = styled.div`
  /* position, top, left, right are now controlled by inline styles */
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 12px 28px rgba(0,0,0,0.08);
  max-height: 220px;
  overflow-y: auto;
  z-index: 1001; /* Must be higher than ModalBackground's z-index (1000) */
`;

const SuggestList = styled.ul`
  list-style: none;
  padding: 6px 0;
  margin: 0;
`;

const SuggestItem = styled.li`
  padding: 10px 12px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 6px;
  &:hover { background: #f3f4f6; }
`;

const SuggestLoading = styled.div`
  padding: 12px;
  font-size: 13px;
  color: #6b7280;
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
    color: #6b7280;
    text-decoration: none;
  }
  &:active { background-color: #e5e7eb; }
  flex: 0 0 auto;
`;

const Footer = styled.div`
  display: flex; gap: 12px; justify-content: center;
  padding: 16px 28px 24px;
  border-top: 1px solid #f3f4f6;
  flex: 0 0 auto;
`;

const BaseBtn = styled.button`
  min-width: 120px; height: 44px;
  border-radius: 5.5px; font-weight: 700; font-size: 14px;
  cursor: pointer; outline: none; border: 1px solid transparent;
`;

const GhostButton = styled(BaseBtn)`
  background: #fff; border: 1px solid #e5e7eb; color: #374151;
  &:hover { background: #f9fafb; }
  &:active { background: #f3f4f6; }
`;

const PrimaryButton = styled(BaseBtn)`
  background: #2fb975; color: #fff;
  &:hover { filter: brightness(0.96); }
  &:active { background: #26945e; }
`;
