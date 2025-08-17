import React, { useState } from "react";
import Header from "../components/common/Header";
import BackgroundImg from "../assets/images/LandingBack.svg";
import styled from "styled-components";

function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const SearchEnterHandle = (e) => {
    if (e.key === "Enter") {
      console.log("Search triggered:", searchQuery);
    }
  };

  return (
    <div>
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} SearchEnterHandle={SearchEnterHandle} />
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
