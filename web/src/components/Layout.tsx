import React from "react";
import { Container } from "./Container";
import { NavBar } from "./NavBar";

export const Layout: React.FC<{}> = ({children}) => {
  return (
    <Container height="100vh">
      <NavBar />
      {children}
    </Container>
  );
};
