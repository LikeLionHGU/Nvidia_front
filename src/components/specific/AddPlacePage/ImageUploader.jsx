
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ImgUploadField from '../../../assets/images/DragUploadImg.svg';

const colors = {
  brand: "#2FB975",
  brandSoft: "#EAF9F2",
  brandSofter: "#F5FBF8",
  ink: "#111827",
  text: "#374151",
  sub: "#6B7280",
  line: "#E5E7EB",
  lineSoft: "#EEF2F5",
  surface: "#FFFFFF",
  warn: "#F59E0B",
};

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function ImageUploader({ photoList, setPhotoList }) {
  const [dragging, setDragging] = useState(false);
  const [previews, setPreviews] = useState([]);

  const addFiles = (files) => {
    const arr = Array.from(files || []);
    if (!arr.length) return;
    setPhotoList((prev) => [...prev, ...arr]);
  };

  const onFileInput = (e) => {
    addFiles(e.target.files);
    e.target.value = null;
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  useEffect(() => {
    const urls = photoList.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    }));
    setPreviews((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));
      return urls;
    });
    return () => {
      urls.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [photoList]);

  const removePhoto = (idx) => setPhotoList((prev) => prev.filter((_, i) => i !== idx));

  return (
    <ImageUploadRow>
      <ImgUploadArea
        $dragging={dragging}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          type="file"
          multiple
          onChange={onFileInput}
          style={{ display: 'none' }}
          id="file-upload"
          accept="image/jpeg, image/png"
        />
        <label htmlFor="file-upload">
          <img src={ImgUploadField} alt="Upload" />
        </label>
      </ImgUploadArea>

      <PreviewContainer>
        <UploadTitle>등록할 사진을 업로드해주세요</UploadTitle>
        <UploadSubtitle>jpg, png 파일만 가능합니다</UploadSubtitle>
        <PreviewList>
          {previews.length > 0 ? (
            previews.map((p, i) => (
              <PreviewItem key={p.url}>
                <PreviewThumb src={p.url} alt={p.name} />
                <FileInfo>
                  <FileName>{p.name}</FileName>
                  <FileSize>{formatBytes(p.size)}</FileSize>
                </FileInfo>
                <DeleteBtn onClick={(e) => { e.stopPropagation(); removePhoto(i); }}>×</DeleteBtn>
              </PreviewItem>
            ))
          ) : (
            <div style={{ fontSize: '0.8rem', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.sub }}>
              업로드된 이미지가 없습니다.
            </div>
          )}
        </PreviewList>
      </PreviewContainer>
    </ImageUploadRow>
  );
}

const ImageUploadRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 0.7vw;
  height: 159px;
`;

const ImgUploadArea = styled.div`
  border-radius: 14px;
  background: ${({ $dragging }) => ($dragging ? colors.brandSofter : '#FBFBFB')};
  transition: all 0.2s ease-in-out;
  display: flex;
  cursor: pointer;

  label {
    cursor: pointer;
    display: flex;
    width: 100%;
    height: 100%;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const PreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #FBFBFB;
  padding: 8px 15px;
  overflow-y: auto;
`;

const UploadTitle = styled.div`
  font-weight: 700;
  font-size: 1vw;
  color: ${colors.ink};
`;

const UploadSubtitle = styled.div`
   font-size: 0.83vw;
  color: ${colors.sub};
  margin-bottom: 10px;
`;

const PreviewList = styled.div`
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #FBFBFB;
  height: 100%;
`;

const PreviewItem = styled.div`
  display: flex;
  align-items: center;
  background: ${colors.surface};
  border-radius: 8px;
  border: 1px solid ${colors.lineSoft};
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  width: 100%;
`;

const PreviewThumb = styled.img`
  width: 35px;
  height: 35px;
  padding: 4px;
  object-fit: fit;
  margin-right: 12px;
  flex-shrink: 0;
`;

const FileInfo = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-right: 8px;
`;

const FileName = styled.div`
  font-size: 14px;
  color: ${colors.text};
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FileSize = styled.div`
  font-size: 12px;
  color: ${colors.sub};
`;

const DeleteBtn = styled.button`
  width: 1px;
  height: 15px;
  margin-right: 10px;
  border: none;
  border-radius: 50%;
  background: ${colors.line};
  color: ${colors.sub};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 1;
  flex-shrink: 0;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: ${colors.warn};
    color: #fff;
  }
`;
