import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Question from "../../assets/icons/questionIcon.svg";

function FormComponent({
  addressInputs,
  handleAddressInputChange,
  onOpenSearchLocationModal,
  prompt,
  setPrompt,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  onSubmitRecommend,
}) {
  const [stepCompleted, setStepCompleted] = useState({
    step1: false,
    step2: false,
    step3: false,
  });

  const [stepEnabled, setStepEnabled] = useState({
    step1: true,
    step2: false,
    step3: false,
  });

  const [step2Text, setStep2Text] = useState(prompt || "");
  const [minBudget, setMinBudget] = useState(minPrice || "");
  const [maxBudget, setMaxBudget] = useState(maxPrice || "");

  const [minFocused, setMinFocused] = useState(false);
  const [maxFocused, setMaxFocused] = useState(false);

  useEffect(() => {
    const hasAddress = addressInputs.some((input) => input.trim() !== "");
    setStepCompleted((prev) => ({ ...prev, step1: hasAddress }));
    if (hasAddress) {
      setStepEnabled((prev) => ({ ...prev, step2: true }));
    }
  }, [addressInputs]);

  useEffect(() => {
    const isCompleted = step2Text.trim() !== "";
    setStepCompleted((prev) => ({ ...prev, step2: isCompleted }));
    setPrompt?.(step2Text);
    if (isCompleted) {
      setStepEnabled((prev) => ({ ...prev, step3: true }));
    }
  }, [step2Text]);

  useEffect(() => {
    const isCompleted = minBudget !== "" && maxBudget !== "";
    setStepCompleted((prev) => ({ ...prev, step3: isCompleted }));
    setMinPrice?.(minBudget);
    setMaxPrice?.(maxBudget);
  }, [minBudget, maxBudget]);

  const handleSkipStep = (stepNumber) => {
    if (stepNumber === 1) {
      setStepEnabled((prev) => ({ ...prev, step2: true }));
      setStepCompleted((prev) => ({ ...prev, step1: true }));
    } else if (stepNumber === 2) {
      setStepEnabled((prev) => ({ ...prev, step3: true }));
      setStepCompleted((prev) => ({ ...prev, step2: true }));
    } else if (stepNumber === 3) {
      setStepCompleted((prev) => ({ ...prev, step3: true }));
    }
  };

  const handleReset = () => {
    addressInputs.forEach((_, index) => {
      handleAddressInputChange(index, "");
    });
    setStep2Text("");
    setMinBudget("");
    setMaxBudget("");
    setStepCompleted({ step1: false, step2: false, step3: false });
    setStepEnabled({ step1: true, step2: false, step3: false });
  };

  const onlyDigits = (s) => (s || "").replace(/\D/g, "");
  const formatCurrency = (digits) =>
    digits ? Number(digits).toLocaleString("ko-KR") + "원" : "";

  const hasBudgetError =
    !!minBudget && !!maxBudget && Number(minBudget) > Number(maxBudget);

  return (
    <FormContainer>
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
          <StepBadge $completed={stepCompleted.step1}>Step 1</StepBadge>
          <ProcessBar $completed={stepCompleted.step1} />
        </LeftContainer>
        <RightContainer>
          <StepHeader>
            <StepTitle>위치를 지정해주세요.</StepTitle>
            <SkipButton onClick={() => handleSkipStep(1)}>Skip</SkipButton>
          </StepHeader>
          <StepDescription>내 위치를 선택하거나, 친구들의 위치를 알려주세요.</StepDescription>
          <StepContent $enabled={stepEnabled.step1}>
            <AddressListContainer>
              {addressInputs.map((input, index) => (
                <AddressInputContainer key={index}>
                  <Input
                    type="text"
                    placeholder="위치를 입력해주세요!"
                    value={input}
                    onChange={(e) =>
                      handleAddressInputChange(index, e.target.value)
                    }
                    readOnly
                    onClick={() => onOpenSearchLocationModal(index)}
                  />
                </AddressInputContainer>
              ))}
            </AddressListContainer>
          </StepContent>
        </RightContainer>
      </StepContainer>

      {/* Step 2 */}
      <StepContainer>
        <LeftContainer>
          <StepBadge
            $completed={stepCompleted.step2}
            $disabled={!stepEnabled.step2}
          >
            Step 2
          </StepBadge>
          <ProcessBar $completed={stepCompleted.step2} />
        </LeftContainer>
        <RightContainer>
          <StepHeader>
            <StepTitle $disabled={!stepEnabled.step2}>
              분위기와 목적을 작성해주세요.
            </StepTitle>
            <SkipButton
              onClick={() => handleSkipStep(2)}
              $disabled={!stepEnabled.step2}
            >
              Skip
            </SkipButton>
          </StepHeader>
          <StepDescription $disabled={!stepEnabled.step2}>
            원하는 공실의 분위기와 목적을 알려주세요.
          </StepDescription>
          <StepContent $enabled={stepEnabled.step2}>
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
                  <ExampleItem
                    onClick={() =>
                      setStep2Text("4명 회의할 수 있는 조용하고 밝은 공간 찾아줘")
                    }
                  >
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
          <StepBadge
            $completed={stepCompleted.step3}
            $disabled={!stepEnabled.step3}
          >
            Step 3
          </StepBadge>
        </LeftContainer>
        <RightContainer>
          <StepHeader>
            <StepTitle $disabled={!stepEnabled.step3}>
              예산을 설정해주세요.
            </StepTitle>
            <SkipButton
              onClick={() => handleSkipStep(3)}
              $disabled={!stepEnabled.step3}
            >
              Skip
            </SkipButton>
          </StepHeader>
          <StepDescription $disabled={!stepEnabled.step3}>
            예산 범위를 알려주시면, 그 안에서 최고의 공실을 찾아드릴게요.
          </StepDescription>
          <StepContent $enabled={stepEnabled.step3}>
            <BudgetInputContainer>
              <BudgetInputWrapper>
                <BudgetInput
                  type="text"
                  inputMode="numeric"
                  placeholder="직접 입력"
                  value={minFocused ? minBudget : formatCurrency(minBudget)}
                  onFocus={() => setMinFocused(true)}
                  onBlur={() => setMinFocused(false)}
                  onChange={(e) => setMinBudget(onlyDigits(e.target.value))}
                  disabled={!stepEnabled.step3}
                  $error={hasBudgetError}
                />
                <BudgetSeparator>~</BudgetSeparator>
                <BudgetInput
                  type="text"
                  inputMode="numeric"
                  placeholder="직접 입력"
                  value={maxFocused ? maxBudget : formatCurrency(maxBudget)}
                  onFocus={() => setMaxFocused(true)}
                  onBlur={() => setMaxFocused(false)}
                  onChange={(e) => setMaxBudget(onlyDigits(e.target.value))}
                  disabled={!stepEnabled.step3}
                  $error={hasBudgetError}
                />
              </BudgetInputWrapper>
            </BudgetInputContainer>
            {hasBudgetError && <ErrorMsg>알맞은 범위를 작성해주세요</ErrorMsg>}
          </StepContent>
        </RightContainer>
      </StepContainer>

      <Divider />

      <ButtonContainer>
        <ResetButton onClick={handleReset}>초기화</ResetButton>
        <RecommendButton onClick={onSubmitRecommend}>
          딱 맞는 공실 추천 받기
        </RecommendButton>
      </ButtonContainer>
    </FormContainer>
  );
}

export default FormComponent;

/* ================= styles ================= */

const FormContainer = styled.div`
  padding: 40px;
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
  font-family: "Pretendard";
  font-weight: 700;
  font-size: 1.5vw;
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
  border-right: ${(p) =>
    p.$completed ? "1.5px solid #2FB975" : "1.5px dashed #bebebe"};
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
  background-color: ${(p) =>
    p.$disabled ? "#f5f5f5" : p.$completed ? "#2FB975" : "#f5f5f5"};
  color: ${(p) =>
    p.$disabled ? "#ccc" : p.$completed ? "white" : "#666"};
`;

const StepTitle = styled.div`
  font-size: 1.15vw;
  font-weight: bold;
  color: ${(p) => (p.$disabled ? "#ccc" : "#333")};
  flex: 1;
`;

const SkipButton = styled.button`
  background: none;
  border: none;
  color: ${(p) => (p.$disabled ? "#ccc" : "#2FB975")};
  font-size: 0.69vw;
  cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
  &:hover {
    text-decoration: ${(p) => (p.$disabled ? "none" : "underline")};
  }
`;

const StepDescription = styled.p`
  font-size: 14px;
  color: ${(p) => (p.$disabled ? "#ccc" : "#666")};
  margin-bottom: 16px;
`;

const StepContent = styled.div`
  opacity: ${(p) => (p.$enabled ? 1 : 0.5)};
  pointer-events: ${(p) => (p.$enabled ? "auto" : "none")};
  display: flex;
  flex-direction: column;
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

const TextareaContainer = styled.div`
  position: relative;
  width: 100%;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  padding-bottom: ${(p) =>
    p.value && p.value.trim() === "" ? "60px" : "12px"};
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

const BudgetInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 90%;
`;

const BudgetInput = styled.input`
  width: 10.83vw;
  height: 3.15vh;
  border: 1px solid ${(p) => (p.$error ? "#FF3C3C" : "#ccc")};
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  color: ${(p) => (p.$error ? "#FF3C3C" : "inherit")};
  &:focus {
    outline: none;
    border-color: ${(p) => (p.$error ? "#FF3C3C" : "#2fb975")};
  }
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  &[type="number"] {
    -moz-appearance: textfield;
  }
`;

const ErrorMsg = styled.div`
  margin-top: 8px;
  color: #ff3c3c;
  font-size: 12px;
  text-align: center;
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