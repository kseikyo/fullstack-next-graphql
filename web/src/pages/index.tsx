import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import React from "react";
import { Layout } from "../components/Layout";
import { Wrapper } from "../components/Wrapper";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
const Index = () => {
  const [{ data, fetching }] = usePostsQuery({
    variables: {
      limit: 10,
    },
  });

  if (!data) {
    return (
      <Layout maxHeight="100vh" height="100%" overflow="hidden">
        <Flex justifyContent="center">
          <Heading as="h2">
            {!fetching ? "Server error, please try again later!" : "Loading..."}
          </Heading>
        </Flex>
      </Layout>
    );
  }

  return (
    <Layout>
      <Wrapper variant="regular">
        <Stack spacing={8}>
          {data!.posts.map((post) => {
            return (
              <Box key={post.id} p={5} shadow="md" borderWidth="1px">
                <Heading fontSize="xl">{post.title}</Heading>
                <Text mt={4}>{post.textSnippet}</Text>
              </Box>
            );
          })}
        </Stack>
      </Wrapper>
      {data && (
        <Flex justifyContent="center">
          <Button isLoading={fetching} colorScheme="teal" my={8}>
            Load more
          </Button>
        </Flex>
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
