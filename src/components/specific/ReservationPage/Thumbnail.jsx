import React from 'react';
import styled from 'styled-components';

export default function ResBasicInfo({ placeData }) {
  if (!placeData) return null;

  const {
    account,
    photoList,
    address,
    chipList = [],
    phoneNumber,
    price,
    maxPeople,
    optionList = [],
  } = placeData || {};

  // 썸네일 결정
  let firstPhoto = null;
  if (Array.isArray(photoList) && photoList.length > 0) {
    if (typeof photoList[0] === 'string') firstPhoto = photoList[0];
    else if (photoList[0] instanceof File || photoList[0] instanceof Blob)
      firstPhoto = URL.createObjectURL(photoList[0]);
  } else if (typeof photoList === 'string') {
    firstPhoto = photoList;
  }

  const safeChips = Array.isArray(chipList) ? chipList : [];
  const safeOptions = Array.isArray(optionList) ? optionList : [];

  return (
    <Wrapper>
      <PhotoDisplayWrapper>
        {firstPhoto ? (
          <ImgWrapper src={firstPhoto} alt="thumbnail" />
        ) : (
          <EmptyThumb>이미지 없음</EmptyThumb>
        )}

        {safeChips.length > 0 && (
          <ChipRow>
            {safeChips.map((chip, i) => (
              <Chip key={`${chip}-${i}`}>{chip}</Chip>
            ))}
          </ChipRow>
        )}
      </PhotoDisplayWrapper>

      <RightCol>
        <TextRow>
          주소: <strong>{address?.roadName ?? '-'}</strong>
        </TextRow>
        <TextRow>
          연락처: <strong>{phoneNumber ?? '-'}</strong>
        </TextRow>
        <TextRow>
          가격: <strong>{typeof price === 'number' ? price.toLocaleString() : price ?? '-'}</strong>
        </TextRow>
        <TextRow>
          최대 수용 인원: <strong>{maxPeople ?? '-'}</strong>명
        </TextRow>
        <TextRow>
          계좌: <strong>{account ?? '-'}</strong>
        </TextRow>

        {safeOptions.length > 0 && (
          <OptionsBox>
            <OptTitle>옵션</OptTitle>
            <ul>
              {safeOptions.map((opt, i) => (
                <li key={`${opt}-${i}`}>{opt}</li>
              ))}
            </ul>
          </OptionsBox>
        )}
      </RightCol>
    </Wrapper>
  );
}

/* ===== styles ===== */
const Wrapper = styled.div`
  width: calc(100% - 30px);
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  display: flex;
  gap: 23px;
`;

const PhotoDisplayWrapper = styled.div`
  flex: 1;
  max-width: 50%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: flex-start;
  align-items: stretch;
`;

const RightCol = styled.div`
  flex: 1;
  max-width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
`;

const ImgWrapper = styled.img`
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
  display: block;
`;

const EmptyThumb = styled.div`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  background: #f3f4f6;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Chip = styled.span`
  padding: 4px 8px;
  border-radius: 999px;
  background: #f3faf6;
  border: 1px solid #e5f4ea;
  color: #2fb975;
  font-size: 12px;
  font-weight: 700;
`;

const TextRow = styled.div`
  color: #374151;
  font-size: 14px;
`;

const OptionsBox = styled.div`
  margin-top: 6px;

  ul {
    margin: 6px 0 0;
    padding-left: 18px;
  }
  li {
    line-height: 1.6;
    color: #374151;
    font-size: 14px;
  }
`;

const OptTitle = styled.div`
  color: #6b7280;
  font-size: 13px;
  font-weight: 700;
`;