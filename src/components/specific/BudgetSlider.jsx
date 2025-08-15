
import React from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import styled from 'styled-components';

const BudgetSliderContainer = styled.div`
  padding: 20px;
  max-width: 500px;
  margin: auto;
`;

const SliderWrapper = styled.div`
  margin-bottom: 20px;
`;

const InputWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Input = styled.input`
  width: 100px;
  text-align: right;
`;

const BudgetSlider = ({ value, onChange }) => {
  const MIN = 500;
  const MAX = 1000000;
  const STEP = 500;

  const handleSliderChange = (newRange) => {
    onChange(newRange);
  };

  const handleMinInputChange = (e) => {
    const inputValue = Number(e.target.value);
    if (inputValue >= MIN && inputValue <= value[1]) {
      onChange([inputValue, value[1]]);
    }
  };

  const handleMaxInputChange = (e) => {
    const inputValue = Number(e.target.value);
    if (inputValue <= MAX && inputValue >= value[0]) {
      onChange([value[0], inputValue]);
    }
  };

  return (
    <BudgetSliderContainer>
      <SliderWrapper>
        <Slider
          range
          min={MIN}
          max={MAX}
          step={STEP}
          value={value}
          onChange={handleSliderChange}
        />
      </SliderWrapper>
      <InputWrapper>
        <div>
          <label>최소: </label>
          <Input type="number" value={value[0]} onChange={handleMinInputChange} step={STEP} />
          <span>원</span>
        </div>
        <div>
          <label>최대: </label>
          <Input type="number" value={value[1]} onChange={handleMaxInputChange} step={STEP} />
          <span>원</span>
        </div>
      </InputWrapper>
    </BudgetSliderContainer>
  );
};

export default BudgetSlider;
