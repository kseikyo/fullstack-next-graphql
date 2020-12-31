import { Box, Heading, Spinner, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import React from "react";
import EditDeletePostButtons from "../../components/EditDeletePostButtons";
import { Layout } from "../../components/Layout";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { useGetPostFromUrl } from "../../utils/hooks/useGetPostFromUrl";

const Post: React.FC = ({}) => {
  const [{ data, error, fetching }] = useGetPostFromUrl();

  if (fetching) {
    return (
      <Layout maxHeight="90.9vh" height="100%">
        <Spinner size="xl" />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout maxHeight="90.9vh" height="100%">
        {error}
      </Layout>
    );
  }

  if (!data?.post) {
    return (
      <Layout maxHeight="90.9vh" height="100%">
        <Heading as="h1">Could not find post 😞</Heading>
      </Layout>
    );
  }

  return (
    <Layout maxHeight="90.9vh" height="100%">
      <Heading mb={4} as="h3">
        {data.post.title}
      </Heading>
      <Text>{data.post.text}</Text>
      <Box mt={4}>
        <EditDeletePostButtons
          id={data.post.id}
          title={data.post.title}
          creatorId={data.post.creator.id}
        />
      </Box>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
