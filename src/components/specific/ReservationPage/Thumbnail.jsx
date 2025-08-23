import React from 'react';
import styled from 'styled-components';

import AddressIcon from '../../../assets/icons/AddressIcon.svg';
import AccountIcon from '../../../assets/icons/AccountIcon.svg';
import ScheduleIcon from '../../../assets/icons/ScheduleIcon.svg';
import MaxPeopleIcon from '../../../assets/icons/MaxPeopleIcon.svg';
import CheckboxIcon from '../../../assets/icons/CheckBoxIcon.svg';

export default function Thumbnail({ placeData }) {
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

  // Determine thumbnail
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
        <InfoList>
          <IconTextRow>
            <Icon src={AddressIcon} alt="주소" />
            <strong>{address?.roadName ?? '-'}</strong>
          </IconTextRow>
          <IconTextRow>
            <Icon src={ScheduleIcon} alt="영업시간" />
            <strong>영업시간</strong>
          </IconTextRow>
          <IconTextRow>
            <Icon src={AccountIcon} alt="계좌" />
            <strong>{account ?? '-'}</strong>
          </IconTextRow>
          <IconTextRow>
            <Icon src={MaxPeopleIcon} alt="최대 인원" />
            <strong>최대 수용 인원 {maxPeople ?? '-'}명</strong>
          </IconTextRow>
        </InfoList>

        {safeOptions.length > 0 && (
          <OptionsBox>
            <OptTitle>제공되는 항목</OptTitle>
            <OptionList>
              {safeOptions.map((opt, i) => (
                <OptionItem key={`${opt}-${i}`}>
                  <CheckBox src={CheckboxIcon} alt="체크" />
                  <span>{opt}</span>
                </OptionItem>
              ))}
            </OptionList>
          </OptionsBox>
        )}
      </RightCol>
    </Wrapper>
  );
}

/* ===== styles ===== */
const Wrapper = styled.div`
  width: 100%;
  background: #fff;
  display: flex;
  gap: 0.8vw;
  box-sizing: border-box;

`;

const PhotoDisplayWrapper = styled.div`
  flex: 1;
  max-width: 50%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
`;

const RightCol = styled.div`
  flex: 1;
  max-width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 5px 0;
  aspect-ratio: 1 / 1;
`;

const ImgWrapper = styled.img`
  width: 100%;
  aspect-ratio: 1 / 1;   /* 가로:세로 비율 1:1 */
  object-fit: cover;
  border-radius: 8px;
  display: block;
  background-color: #f3f4f6;
`;

const EmptyThumb = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 8px;
  background: #f3f4f6;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 14px;
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 5px;
  position: absolute;
  bottom: 30px;
  left: 50%;              /* 가로 중앙 */
  transform: translateX(-50%); /* 중앙 정렬 */
`;

const Chip = styled.span`
  display: inline-flex;   /*  칩이 가로로만 배치되게 */
  align-items: center;
  justify-content: center;
  white-space: nowrap;    /*  텍스트 줄바꿈 방지 */
  padding: 4px 8px;
  border-radius: 4px;
  color: #F3F3F3;
  font-size: 0.85vw;
  font-weight: 700;
  border: 1px solid #F2F2F2;
  background: rgba(155, 155, 155, 0.7);
  box-shadow: 0 1.22px 4.879px rgba(0, 0, 0, 0.05);
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const IconTextRow = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: #374151;
  font-size: 0.85vw;

  strong {
    font-weight: 500;
  }
`;

const OptionsBox = styled.div`
  margin-top: 12px;
  border-radius: 4px;
  border: 1px solid #F7F7F7;
  padding: 10px;
`;

const OptTitle = styled.div`
  color: #6b7280;
  font-size: 1vw;
  font-weight: 600;
  margin-bottom: 8px;
  text-align: center;
`;

const OptionList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 7.32vh;
  overflow-y: auto;
`;

const OptionItem = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #374151;
  font-size: 0.9vw;
`;

const Icon = styled.img`
  width: 1.81vw;
  height: 1.81vw;
`;

const CheckBox = styled.img`
  width: 0.8vw;
  height: 0.8vw;
`