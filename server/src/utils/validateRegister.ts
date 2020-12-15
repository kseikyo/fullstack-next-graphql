import { UsernamePasswordInput } from "src/resolvers/UsernamePasswordInput";
import { isEmailValid } from "./isEmailValid";

export const validateRegister = (options: UsernamePasswordInput) => {
  // Validate email format
  if (!isEmailValid(options.email)) {
    return [
      {
        field: "email",
        message: "Invalid email address",
      },
    ];
  }

  // Making sure the username is not an email
  if (isEmailValid(options.username)) {
    return [
      {
        field: "username",
        message: "Username cannot be an email address",
      },
    ];
  }

  if (options.username.length === 0) {
    return [
      {
        field: "username",
        message: "Username cannot be empty",
      },
    ];
  }

  if (!options.password || options.password.length < 8) {
    return [
      {
        field: "password",
        message: "Password must be greater than 7 characters",
      },
    ];
  }

  return null;
};
