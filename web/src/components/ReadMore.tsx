import { Button, Text } from "@chakra-ui/react";
import React, { useState } from "react";

interface ReadMoreProps {
  children: string;
}

export const ReadMore: React.FC<ReadMoreProps> = ({ children }) => {
  const [isTruncated, setIsTruncated] = useState(true);

  const resultString = isTruncated ? children.slice(0, 100) : children;

  const toggleIsTruncated = () => {
    setIsTruncated(!isTruncated);
  };

  return (
    <>
      <Text mt={4}>{resultString}</Text>
      <Button
        colorScheme="teal"
        variant="link"
        fontWeight="normal"
        onClick={toggleIsTruncated}
      >
        Read more
      </Button>
    </>
  );
};
