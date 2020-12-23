import {
  Button,
  Flex,
  HStack,
  IconButton,
  Link,
  Text,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";

interface NavBarProps {
  bg?: string;
  color?: string;
}

export const NavBar: React.FC<NavBarProps> = ({ bg, color }) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(), // Disables server side rendering when fetching this query
  });
  const { toggleColorMode: toggleMode } = useColorMode();
  const text = useColorModeValue("dark", "light");

  const SwitchIcon = useColorModeValue(MoonIcon, SunIcon);
  let body = null;

  if (fetching) {
    // data is loading
  } else if (!data?.me) {
    //user is not logged in
    body = (
      <HStack mr={4} alignItems="start">
        <NextLink href="/login">
          <Link mr={4}>Sign in</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>Sign up</Link>
        </NextLink>
      </HStack>
    );
  } else {
    //user is logged in
    body = (
      <HStack mr={4}>
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
        <Text display="inline-block">{data.me.username}</Text>
      </HStack>
    );
  }
  return (
    <Flex
      justifyContent="space-between"
      boxShadow={text === "dark" ? "lg" : "dark-lg"}
      p={6}
      zIndex={1}
      position="sticky"
      top={0}
      color={color}
      bg={bg}
    >
      <Flex justifyContent="center">
        <NextLink href="/">
          <Link mt={3}>LiReddit</Link>
        </NextLink>
      </Flex>
      <HStack>
        {body}
        <IconButton
          aria-label={`Switch to ${text} mode`}
          variant="ghost"
          onClick={toggleMode}
          icon={<SwitchIcon />}
        />
      </HStack>
    </Flex>
  );
};
