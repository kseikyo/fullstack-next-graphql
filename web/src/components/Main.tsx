import React from "react";
import { Container } from "./Container";
import { NavBar } from "./NavBar";

interface MainProps {}

export const Main: React.FC<MainProps> = ({children}) => {
  return (
    <Container height="100vh">
      <NavBar />
      {children}
    </Container>
  );
};
