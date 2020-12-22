import { FlexProps, Flex } from "@chakra-ui/react";

export const Container = (props: FlexProps) => {
  return (
    <>
      <Flex
        as="main"
        w="100%"
        height="100%"
        flexDirection="column"
        {...props}
      />
    </>
  );
};
