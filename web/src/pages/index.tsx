import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Stack,
  Text,
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import React, { useState } from "react";
import { Layout } from "../components/Layout";
import { Wrapper } from "../components/Wrapper";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
const Index = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as string | null,
  });
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  if (!data) {
    return (
      <Layout maxHeight="90.9vh" height="100%">
        <Grid h="100%" placeItems="center">
          <Heading as="h2">
            {!fetching ? "Server error, please try again later!" : "Loading..."}
          </Heading>
        </Grid>
      </Layout>
    );
  }

  if (!data.posts.posts.length) {
    return (
      <Layout maxHeight="90.9vh" height="100%">
        <Grid h="100%" placeItems="center">
          <Heading as="h2">No posts have been created 😞</Heading>
        </Grid>
      </Layout>
    );
  }

  return (
    <Layout>
      <Wrapper variant="regular">
        <Stack spacing={8}>
          {data!.posts.posts.map((post) => {
            return (
              <Box key={post.id} p={5} shadow="md" borderWidth="1px">
                <Heading fontSize="xl">{post.title}</Heading>
                <Text mt={4}>{post.textSnippet}</Text>
              </Box>
            );
          })}
        </Stack>
      </Wrapper>
      {data && data.posts.hasMore && (
        <Flex justifyContent="center">
          <Button
            isLoading={fetching}
            onClick={() => {
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              });
            }}
            colorScheme="teal"
            my={8}
          >
            Load more
          </Button>
        </Flex>
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
