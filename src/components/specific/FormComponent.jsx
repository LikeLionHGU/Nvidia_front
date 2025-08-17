import React from "react";
import styled from "styled-components";
import BudgetSlider from "./BudgetSlider";

function FormComponent({
  addressInputs,
  handleAddressInputChange,
  removeAddressInput,
  addAddressInput,
  budgetRange,
  setBudgetRange,
  handleRecommendClick,
}) {
  return (
    <FormContainer>
      <Step>
        <StepTitle>[Step 1] 위치 지정</StepTitle>
        <StepDescription>친구를 추가하여 여러 위치를 입력할 수 있습니다.</StepDescription>
        <AddressListContainer>
          {addressInputs.map((input, index) => (
            <AddressInputContainer key={index}>
              <Input
                type="text"
                placeholder="원하는 위치를 입력하세요."
                value={input}
                onChange={(e) => handleAddressInputChange(index, e.target.value)}
              />
              {index > 0 && <RemoveButton onClick={() => removeAddressInput(index)}>X</RemoveButton>}
            </AddressInputContainer>
          ))}
        </AddressListContainer>
        <AddFriendButton onClick={addAddressInput}>친구 추가하기</AddFriendButton>
      </Step>

      <Step>
        <StepTitle>[Step 2] 분위기와 목적</StepTitle>
        <StepDescription>원하는 장소의 특징을 자유롭게 알려주세요.</StepDescription>
        <Textarea placeholder="예: 강남역 근처에서 친구랑 조용히 얘기할 수 있는 카페" />
      </Step>

      <Step>
        <StepTitle>[Step 3] 예산 설정</StepTitle>
        <BudgetSlider value={budgetRange} onChange={setBudgetRange} />
      </Step>

      <RecommendButton onClick={handleRecommendClick}>추천받기</RecommendButton>
    </FormContainer>
  );
}

export default FormComponent;

const FormContainer = styled.div`
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
`;

const Step = styled.div`
  margin-bottom: 25px;
`;

const StepTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
`;

const StepDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
`;

const AddressListContainer = styled.div`
  margin-bottom: 10px;
`;

const AddressInputContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
`;

const RemoveButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  margin-left: 10px;
  cursor: pointer;

  &:hover {
    background-color: #c82333;
  }
`;

const AddFriendButton = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background-color: #218838;
  }
`;

const Textarea = styled.textarea`
  width: 95%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  min-height: 80px;
  resize: vertical;
  display: block;
  margin: 0 auto;
`;

const RecommendButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }
`;
