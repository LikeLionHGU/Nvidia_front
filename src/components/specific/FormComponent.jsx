import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Question from "../../assets/icons/questionIcon.svg";
import AddIcon from "../../assets/icons/addLocation.svg";

function FormComponent({
  addressInputs,
  handleAddressInputChange,
  removeAddressInput,
  addAddressInput,
  budgetRange,
  setBudgetRange,
  handleRecommendClick,
}) {
  // 각 스텝의 완료 상태 관리
  const [stepCompleted, setStepCompleted] = useState({
    step1: false,
    step2: false,
    step3: false,
  });

  // 각 스텝의 활성화 상태 관리
  const [stepEnabled, setStepEnabled] = useState({
    step1: true,
    step2: false,
    step3: false,
  });

  // Step 2 텍스트 입력 상태
  const [step2Text, setStep2Text] = useState("");

  // Step 3 예산 입력 상태
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");

  // Step 1 완료 여부 체크
  useEffect(() => {
    const hasAddress = addressInputs.some((input) => input.trim() !== "");
    setStepCompleted((prev) => ({
      ...prev,
      step1: hasAddress,
    }));

    // Step 1이 완료되면 Step 2 활성화
    if (hasAddress) {
      setStepEnabled((prev) => ({
        ...prev,
        step2: true,
      }));
    }
  }, [addressInputs]);

  // Step 2 완료 여부 체크
  useEffect(() => {
    const isCompleted = step2Text.trim() !== "";
    setStepCompleted((prev) => ({
      ...prev,
      step2: isCompleted,
    }));

    // Step 2가 완료되면 Step 3 활성화
    if (isCompleted) {
      setStepEnabled((prev) => ({
        ...prev,
        step3: true,
      }));
    }
  }, [step2Text]);

  // Step 3 완료 여부 체크
  useEffect(() => {
    const isCompleted = minBudget !== "" && maxBudget !== "";
    setStepCompleted((prev) => ({
      ...prev,
      step3: isCompleted,
    }));
  }, [minBudget, maxBudget]);

  // Skip 버튼 핸들러
  const handleSkipStep = (stepNumber) => {
    if (stepNumber === 1) {
      setStepEnabled((prev) => ({
        ...prev,
        step2: true,
      }));
    } else if (stepNumber === 2) {
      setStepEnabled((prev) => ({
        ...prev,
        step3: true,
      }));
    }
  };

  // 초기화 함수
  const handleReset = () => {
    // 모든 input 초기화
    addressInputs.forEach((_, index) => {
      handleAddressInputChange(index, "");
    });
    setStep2Text("");
    setMinBudget("");
    setMaxBudget("");

    // 상태 초기화
    setStepCompleted({
      step1: false,
      step2: false,
      step3: false,
    });
    setStepEnabled({
      step1: true,
      step2: false,
      step3: false,
    });
  };

  return (
    <FormContainer>
      {/* 헤더 정보 */}
      <InfoContainer>
        <TopWrapper>
          <Title>오늘 딱 맞는 공실을 찾아보세요</Title>
          <img src={Question} alt="" />
        </TopWrapper>
        <Subtitle>간단한 조건 입력으로 맞춤 공실을 찾아보세요</Subtitle>
      </InfoContainer>

      <Divider />

      {/* Step 1 */}
      <StepContainer>
        <LeftContainer>
          <StepBadge completed={stepCompleted.step1}>Step 1</StepBadge>
          <ProcessBar />
        </LeftContainer>
        <RightContainer>
          <StepHeader>
            <StepTitle>위치를 지정해주세요.</StepTitle>
            <SkipButton onClick={() => handleSkipStep(1)}>Skip</SkipButton>
          </StepHeader>

          <StepDescription>내 위치를 선택하거나, 친구들의 위치를 알려주세요.</StepDescription>

          <StepContent enabled={stepEnabled.step1}>
            <AddressListContainer>
              {addressInputs.map((input, index) => (
                <AddressInputContainer key={index}>
                  <Input
                    type="text"
                    placeholder={index === 0 ? "양덕동" : "친구 위치"}
                    value={input}
                    onChange={(e) => handleAddressInputChange(index, e.target.value)}
                  />
                  {index > 0 && <RemoveButton onClick={() => removeAddressInput(index)}>X</RemoveButton>}
                </AddressInputContainer>
              ))}
            </AddressListContainer>
            <AddBtnContainer>
              <AddFriendButton onClick={addAddressInput}> </AddFriendButton>
              <img src={AddIcon} alt="" style={{ marginRight: "0.49vh" }} /> <span> 위치 추가하기 </span>
            </AddBtnContainer>
          </StepContent>
        </RightContainer>
      </StepContainer>

      {/* Step 2 */}
      <StepContainer>
        <LeftContainer>
          <StepBadge completed={stepCompleted.step2} disabled={!stepEnabled.step2}>
            Step 2
          </StepBadge>
          <ProcessBar />
        </LeftContainer>
        <RightContainer>
          <StepHeader>
            <StepTitle disabled={!stepEnabled.step2}>분위기와 목적을 작성해주세요.</StepTitle>
            <SkipButton onClick={() => handleSkipStep(2)} disabled={!stepEnabled.step2}>
              Skip
            </SkipButton>
          </StepHeader>

          <StepDescription disabled={!stepEnabled.step2}>원하는 공실의 분위기와 목적을 알려주세요.</StepDescription>

          <StepContent enabled={stepEnabled.step2}>
            <TextareaContainer>
              <Textarea
                placeholder="이용 목적과 원하는 분위기를 자유롭게 작성해보세요!"
                value={step2Text}
                onChange={(e) => setStep2Text(e.target.value)}
                disabled={!stepEnabled.step2}
              />
              {step2Text.trim() === "" && stepEnabled.step2 && (
                <ExampleContainer>
                  <ExampleItem onClick={() => setStep2Text("카페 감성의 스터디룸 찾아줘")}>
                    카페 감성의 스터디룸 찾아줘
                  </ExampleItem>
                  <ExampleItem onClick={() => setStep2Text("4명 회의할 수 있는 조용하고 밝은 공간 찾아줘")}>
                    4명 회의할 수 있는 조용하고 밝은 공간 찾아줘
                  </ExampleItem>
                </ExampleContainer>
              )}
            </TextareaContainer>
          </StepContent>
        </RightContainer>
      </StepContainer>

      {/* Step 3 */}
      <StepContainer>
        <LeftContainer>
          <StepBadge completed={stepCompleted.step3} disabled={!stepEnabled.step3}>
            Step 3
          </StepBadge>
        </LeftContainer>
        <RightContainer>
          <StepHeader>
            <StepTitle disabled={!stepEnabled.step3}>예산을 설정해주세요.</StepTitle>
            <SkipButton onClick={() => handleSkipStep(3)} disabled={!stepEnabled.step3}>
              Skip
            </SkipButton>
          </StepHeader>

          <StepDescription disabled={!stepEnabled.step3}>
            예산 범위를 알려주시면, 그 안에서 최고의 공실을 찾아드릴게요.
          </StepDescription>

          <StepContent enabled={stepEnabled.step3}>
            <BudgetInputContainer>
              <BudgetLabel>예산 범위</BudgetLabel>
              <BudgetInputWrapper>
                <BudgetInput
                  type="number"
                  placeholder="5,000원"
                  value={minBudget}
                  onChange={(e) => setMinBudget(e.target.value)}
                  disabled={!stepEnabled.step3}
                />
                <BudgetSeparator>~</BudgetSeparator>
                <BudgetInput
                  type="number"
                  placeholder="15,000원"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  disabled={!stepEnabled.step3}
                />
              </BudgetInputWrapper>
            </BudgetInputContainer>
          </StepContent>
        </RightContainer>
      </StepContainer>
      <Divider />

      {/* 버튼 컨테이너 */}
      <ButtonContainer>
        <ResetButton onClick={handleReset}>초기화</ResetButton>
        <RecommendButton onClick={handleRecommendClick}>딱 맞는 공실 추천 받기</RecommendButton>
      </ButtonContainer>
    </FormContainer>
  );
}

export default FormComponent;

const FormContainer = styled.div`
  padding: 2.73vh;
  background-color: #fff;
`;

const InfoContainer = styled.div`
  margin-bottom: 2.49vh;
`;

const TopWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.98vh;
  > img {
    width: 1.67vw;
    height: 2.34vh;
  }
`;

const Title = styled.div`
  font-size: 1.5vw;
  font-weight: bold;
`;

const Subtitle = styled.div`
  font-size: 1.1vw;
  color: #4e4e4e;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: #efefef;
  margin-bottom: 2.98vh;
`;

const StepContainer = styled.div`
  position: relative;
  display: flex;
`;

const LeftContainer = styled.div`
  margin-right: 0.98vh;
  width: 10vw;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ProcessBar = styled.div`
  border-right: 1.5px solid #2fb975;
  height: 100%;
`;

const RightContainer = styled.div`
  width: 90vw;
  padding-bottom: 5.64vh;
`;

const StepHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1.02vh;
  margin-bottom: 0.51vh;
`;

const StepBadge = styled.div`
  padding: 0.2vh 0.62vh;
  border-radius: 7.35px;
  width: 2.43vw;
  font-size: 0.8vw;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  background-color: ${(props) => (props.disabled ? "#f5f5f5" : props.completed ? "#2FB975" : "#f5f5f5")};
  color: ${(props) => (props.disabled ? "#ccc" : props.completed ? "white" : "#666")};
`;

const StepTitle = styled.div`
  font-size: 1.15vw;
  font-weight: bold;
  color: ${(props) => (props.disabled ? "#ccc" : "#333")};
  flex: 1;
`;

const SkipButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => (props.disabled ? "#ccc" : "#2FB975")};
  font-size: 0.69vw;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};

  &:hover {
    text-decoration: ${(props) => (props.disabled ? "none" : "underline")};
  }
`;

const StepDescription = styled.p`
  font-size: 14px;
  color: ${(props) => (props.disabled ? "#ccc" : "#666")};
  margin-bottom: 16px;
`;

const StepContent = styled.div`
  opacity: ${(props) => (props.enabled ? 1 : 0.5)};
  pointer-events: ${(props) => (props.enabled ? "auto" : "none")};
`;

const AddressListContainer = styled.div`
  margin-bottom: 12px;
`;

const AddressInputContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #2fb975;
  }
`;

const RemoveButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  margin-left: 8px;
  cursor: pointer;

  &:hover {
    background-color: #c82333;
  }
`;

const AddBtnContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 1.46vh;
  color: #727272;
  font-size: 0.9vw;
`;

const AddFriendButton = styled.div`
  cursor: pointer;
`;

const TextareaContainer = styled.div`
  position: relative;
  width: 100%;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  padding-bottom: ${(props) => (props.value && props.value.trim() === "" ? "60px" : "12px")};
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
  height: 14.06vh;
  resize: none;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #2fb975;
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const ExampleContainer = styled.div`
  position: absolute;
  bottom: 8px;
  left: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  pointer-events: auto;
`;

const ExampleItem = styled.div`
  padding: 6px 10px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 16px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #2fb975;
    color: white;
    border-color: #2fb975;
  }
`;

const BudgetInputContainer = styled.div`
  margin-bottom: 16px;
  display: flex;
  align-items: center;
`;

const BudgetLabel = styled.div`
  font-size: 0.69vw;
  color: #007f41;
  margin-right: 0.69vw;
  font-weight: 500;
  width: 10%;
`;

const BudgetInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 90%;
`;

const BudgetInput = styled.input`
  width: 10.83vw;
  height: 3.15vh;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;

  &:focus {
    outline: none;
    border-color: #2fb975;
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const BudgetSeparator = styled.span`
  color: #666;
  font-size: 16px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 40px;
`;

const ResetButton = styled.button`
  padding: 12px 24px;
  background-color: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background-color: #e9ecef;
  }
`;

const RecommendButton = styled.button`
  flex: 1;
  padding: 12px 24px;
  background-color: #2fb975;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background-color: #28a745;
  }
`;
