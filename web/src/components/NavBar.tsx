import { Box, Button, Flex, Link, Text } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { DarkModeSwitch } from "./DarkModeSwitch";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery();
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
        <Text mr={4} display="inline-block">
          {data.me.username}
        </Text>
        <Button
          mb={1}
          variant="link"
          onClick={() => {
            logout();
          }}
          isLoading={logoutFetching}
        >
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex justifyContent="space-between" boxShadow="lg" p={4} w="100%">
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
