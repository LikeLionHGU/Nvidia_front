import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useLocation } from "react-router-dom";
import { searchLocal } from "../apis/NaverLocal";
import { debounce } from "lodash";

function SearchResult({ items }) {
  if (items.length === 0) {
    return <NoResult>검색 결과가 없습니다.</NoResult>;
  }

  return (
    <SearchResultList>
      {items.map((it, idx) => (
        <SearchResultItem key={idx}>
          <PlaceName dangerouslySetInnerHTML={{ __html: it.title }} />
          <Address>{it.roadAddress || "-"}</Address>
        </SearchResultItem>
      ))}
    </SearchResultList>
  );
}

export default function ReservationPage() {
  const location = useLocation();
  const roomId = location.state?.roomId;

  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const runSearch = async (query) => {
    if (!query.trim()) {
      setItems([]);
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const data = await searchLocal({ query: query.trim(), display: 5, sort: "comment" });
      console.log(data);
      setItems(data.items || []);
    } catch (e) {
      setErr(e?.response?.data?.errorMessage || e.message);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(debounce(runSearch, 300), []);

  useEffect(() => {
    debouncedSearch(q);
    return () => {
      debouncedSearch.cancel();
    };
  }, [q, debouncedSearch]);

  return (
    <Container>
      <SearchInputContainer>
        <SearchInput
          placeholder="예) 포항 카페"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </SearchInputContainer>

      <SearchResultWrapper>
        {loading && <LoadingMessage>불러오는 중…</LoadingMessage>}
        {err && <ErrorMessage>{err}</ErrorMessage>}
        <SearchResult items={items} />
      </SearchResultWrapper>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 680px;
  margin: 0 auto;
`;

const SearchInputContainer = styled.div`
  padding: 20px;
  background-color: white;
  z-index: 10;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
`;

const SearchResultWrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 50%;
  background-color: white;
  border-top: 1px solid #e0e0e0;
  overflow-y: auto;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 5;
`;

const SearchResultList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SearchResultItem = styled.li`
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const PlaceName = styled.div`
  font-weight: 600;
  font-size: 16px;
`;

const Address = styled.div`
  font-size: 14px;
  color: #666;
  margin-top: 4px;
`;

const NoResult = styled.p`
  padding: 20px;
  text-align: center;
  color: #888;
`;

const LoadingMessage = styled.p`
  padding: 20px;
  text-align: center;
  color: #888;
`;

const ErrorMessage = styled.p`
  padding: 20px;
  text-align: center;
  color: crimson;
`;
