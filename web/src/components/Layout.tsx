import { Box, useColorMode } from "@chakra-ui/react";
import React from "react";
import { Container } from "./Container";
import { NavBar } from "./NavBar";

interface LayoutProps {
  maxHeight?: "auto" | "100vh" | "90.9vh";
  height?: "auto" | "100%";
  overflow?: "hidden" | "auto";
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  maxHeight,
  height,
  overflow,
}) => {
  const { colorMode } = useColorMode();

  const bgColor = { light: "gray.50", dark: "gray.900" };

  const colorOptions = { light: "black", dark: "white" };
  const color = colorOptions[colorMode];
  const bg = bgColor[colorMode];
  return (
    <Box h={maxHeight} overflow={overflow}>
      <NavBar bg={bg} color={color} />
      <Box h={height} bg={bg} color={color}>
        <Container>{children}</Container>
      </Box>
    </Box>
  );
};
