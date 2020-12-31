import { Box, Flex, Button, Spinner, Heading } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../../../components/InputField";
import { Layout } from "../../../components/Layout";
import {
  usePostQuery,
  useUpdatePostMutation,
} from "../../../generated/graphql";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { useGetIntId } from "../../../utils/hooks/useGetIntId";

const EditPost: React.FC = () => {
  const router = useRouter();
  const intId = useGetIntId();
  const [{ data, fetching }] = usePostQuery({
    pause: intId === -1,
    variables: {
      id: intId,
    },
  });
  const [, updatePost] = useUpdatePostMutation();

  if (fetching) {
    return (
      <Layout maxHeight="90.9vh" height="100%">
        <Spinner size="xl" />
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
    <Layout
      wrapperVariant="small"
      maxHeight="100vh"
      height="100%"
      overflow="hidden"
    >
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async (values) => {
          await updatePost({ id: intId, ...values });
          router.back();
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="title" placeholder="Title" label="Title" />
            <Box mt={4}>
              <InputField
                name="text"
                placeholder="description..."
                label="Body"
                textarea
              />
            </Box>
            <Flex mt={4} justifyContent="space-between" alignItems="center">
              <Button type="submit" isLoading={isSubmitting} colorScheme="teal">
                Update post
              </Button>
            </Flex>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(EditPost);
