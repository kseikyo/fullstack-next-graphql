import { Box, Flex } from "@chakra-ui/react";
import React from "react";

interface WrapperProps {
  variant?: "small" | "regular";
}

export const Wrapper: React.FC<WrapperProps> = ({
  children,
  variant = "regular",
}) => {
  return (
    <Flex
      my={8}
      mx="auto"
      maxW={variant === "regular" ? "800px" : "400px"}
      w="100%"
      justifyContent="center"
    >
      <Box w="80%">
        {children}
      </Box>
    </Flex>
  );
};
