import { Button, useToast } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import React, { useState } from "react";
import { InputField } from "../components/InputField";
import { Layout } from "../components/Layout";
import { useForgotPasswordMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useRouter } from "next/router";

const ForgotPassword: React.FC<{}> = ({}) => {
  const [complete, setComplete] = useState(false);
  const [, forgotPassword] = useForgotPasswordMutation();
  const toast = useToast();
  const router = useRouter();
  return (
    <Layout wrapperVariant="small">
      {complete &&
        toast({
          title: "Request sent successfully",
          description:
            "If that email corresponds to an existing account, please check your inbox",
          status: "info",
          duration: 6000,
          isClosable: true,
          position: "top",
          onCloseComplete: () => {
            router.push("/");
          },
        })}
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async (values) => {
          await forgotPassword(values);
          setComplete(true);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="email" label="Email" type="email" />

            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              colorScheme="teal"
            >
              Send
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
