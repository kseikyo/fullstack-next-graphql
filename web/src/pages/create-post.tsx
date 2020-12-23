import { Box, Flex, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import React from "react";
import { InputField } from "../components/InputField";
import { Layout } from "../components/Layout";
import { Wrapper } from "../components/Wrapper";
import { useCreatePostMutation } from "../generated/graphql";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useIsAuth } from "../utils/hooks/useIsAuth";

const CreatePost: React.FC<{}> = ({}) => {
  const [, createPost] = useCreatePostMutation();
  const router = useRouter();

  useIsAuth();
  return (
    <Layout maxHeight="100vh" height="100%" overflow="hidden">
      <Wrapper variant="small">
        <Formik
          initialValues={{ title: "", text: "" }}
          onSubmit={async (values) => {
            const { error } = await createPost({ input: values });
            if (!error) {
              router.push("/");
            }
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
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  colorScheme="teal"
                >
                  Create post
                </Button>
              </Flex>
            </Form>
          )}
        </Formik>
      </Wrapper>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(CreatePost);
