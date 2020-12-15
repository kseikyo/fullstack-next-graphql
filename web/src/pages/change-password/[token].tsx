import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { InputField } from "../../components/InputField";
import { Main } from "../../components/Main";
import { Wrapper } from "../../components/Wrapper";
import { useChangePasswordMutation } from "../../generated/graphql";
import { toErrorMap } from "../../utils/toErrorMap";
import { useToast } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../utils/createUrqlClient";

const ChangePassword: NextPage = () => {
  const router = useRouter();
  const [, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState("");
  const toast = useToast();

  return (
    <Main>
      {tokenError &&
        toast({
          title: "An error occured.",
          description: `${tokenError}. Try requesting a new password`,
          status: "error",
          duration: 6000,
          isClosable: true,
          position: "top",
          onCloseComplete: () => {router.push("/forgot-password");}
        })}
      <Wrapper variant="small">
        <Formik
          initialValues={{ newPassword: "", confirmPassword: "" }}
          onSubmit={async (values, { setErrors }) => {
            const response = await changePassword({
              newPassword: values.newPassword,
              token:
                typeof router.query.token === "string"
                  ? router.query.token
                  : "",
              confirmPassword: values.confirmPassword,
            });

            if (response.data?.changePassword.errors) {
              const errorMap = toErrorMap(response.data.changePassword.errors);
              if ("token" in errorMap) {
                setTokenError(errorMap.token);
              }
              setErrors(errorMap);
            } else if (response.data?.changePassword.user) {
              // User changed password successfully, redirecting...
              router.push("/");
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <InputField
                name="newPassword"
                placeholder="new password"
                label="New Password"
                type="password"
              />

              <Box mt={4}>
                <InputField
                  name="confirmPassword"
                  placeholder="confirm password"
                  label="Confirm password"
                  type="password"
                />
              </Box>

              <Button
                mt={4}
                type="submit"
                isLoading={isSubmitting}
                colorScheme="teal"
              >
                Reset password
              </Button>
            </Form>
          )}
        </Formik>
      </Wrapper>
    </Main>
  );
};

ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};

export default withUrqlClient(createUrqlClient)(ChangePassword);
