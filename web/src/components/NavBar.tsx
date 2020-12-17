import { Button, Flex, Link, Text, useColorMode } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { DarkModeSwitch } from "./DarkModeSwitch";
import { isServer } from "../utils/isServer";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(), // Disables server side rendering when fetching this query
  });
  const { colorMode } = useColorMode();
  let body = null;

  if (fetching) {
    // data is loading
  } else if (!data?.me) {
    //user is not logged in
    body = (
      <Flex mr={4}>
        <NextLink href="/login">
          <Link mr={3}>Sign in</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>Sign up</Link>
        </NextLink>
      </Flex>
    );
  } else {
    //user is logged in
    body = (
      <Flex mr={4}>
        <NextLink href="/create-post">
          <Link mr={4}>Create post</Link>
        </NextLink>
        <Button
          mr={4}
          variant="link"
          onClick={() => {
            logout();
          }}
          isLoading={logoutFetching}
          fontWeight="normal"
        >
          Logout
        </Button>
        <Text mr={4} display="inline-block">
          {data.me.username}
        </Text>
      </Flex>
    );
  }

  return (
    <Flex
      justifyContent="space-between"
      boxShadow={colorMode === "dark" ? "dark-lg" : "lg"}
      p={4}
      w="100%"
    >
      <Flex alignItems="center" ml={4}>
        <NextLink href="/">
          <Link mr={3}>Home</Link>
        </NextLink>
      </Flex>
      <Flex alignItems="center">
        {body}
        <DarkModeSwitch />
      </Flex>
    </Flex>
  );
};
