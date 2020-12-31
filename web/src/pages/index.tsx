import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Stack,
  Text,
  Link,
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import React, { useState } from "react";
import EditDeletePostButtons from "../components/EditDeletePostButtons";
import { Layout } from "../components/Layout";
import { UpdootSection } from "../components/UpdootSection";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
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
      <Stack spacing={8}>
        {data!.posts.posts.map((post) => {
          return !post ? null : (
            <Flex
              key={post.id}
              style={{ gap: "1rem" }}
              p={5}
              shadow="md"
              borderWidth="2px"
            >
              <UpdootSection post={post} />
              <Box flex={1}>
                <NextLink href="/post/[id]" as={`/post/${post.id}`}>
                  <Link>
                    <Heading fontSize="xl">{post.title}</Heading>
                  </Link>
                </NextLink>
                <Text>Posted by: {post.creator.username}</Text>
                <Flex align="center">
                  <Text flex={1} mt={4}>
                    {post.textSnippet}
                  </Text>

                  <Flex ml="auto" justifyContent="space-between">
                    <EditDeletePostButtons
                      id={post.id}
                      title={post.title}
                      creatorId={post.creator.id}
                    />
                  </Flex>
                </Flex>
              </Box>
            </Flex>
          );
        })}
      </Stack>
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
