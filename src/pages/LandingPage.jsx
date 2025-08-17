import React from "react";
import BackgroundImg from "../assets/images/LandingBack.svg";
import styled from "styled-components";

function LandingPage() {
  return (
    <div>
      <BackgroundContainer bgImage={BackgroundImg} />
    </div>
  );
}

export default LandingPage;

const BackgroundContainer = styled.div`
  width: 100%;
  height: 90vh;
  background-image: url(${(props) => props.bgImage});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;
