import { User } from "../entities/User";
import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import argon2 from "argon2";
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from "../constants";
import { isEmailValid } from "../utils/isEmailValid";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";
import { getConnection } from "typeorm";

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Arg("confirmPassword") confirmPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    if (!newPassword || newPassword.length < 8) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "Password must be greater than 7 characters",
          },
        ],
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        errors: [
          {
            field: "confirmPassword",
            message: "Passwords must match",
          },
        ],
      };
    }

    const userId = await redis.get(FORGOT_PASSWORD_PREFIX + token);

    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token expired",
          },
        ],
      };
    }

    const userIdNum = parseInt(userId);
    const user = await User.findOne(userIdNum);

    // Shouldnt fall for this case, but checking anyway
    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "User no longer exists",
          },
        ],
      };
    }

    await User.update(
      { id: userIdNum },
      {
        password: await argon2.hash(newPassword),
      }
    );

    // Log in user after change password
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // the user is not registered
      // do nothing
      return true;
    }
    // Generate uuid token
    const token = v4();
    // Set the key as the token with prefix, the value being the user id
    // And the expiration date to three days
    await redis.set(
      FORGOT_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 60 * 24 * 3
    );

    const body = `<a href="http://localhost:3000/change-password/${token}" >Reset password</a>`;
    await sendEmail(email, body);
    return true;
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    const id = req.session.userId;
    // User not logged in
    if (!id) {
      return null;
    }
    return User.findOne(id);
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon2.hash(options.password);
    let user;
    try {
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: options.username,
          email: options.email,
          password: hashedPassword,
        })
        .returning("*")
        .execute();

      user = result.raw[0];
    } catch (err) {
      if (err.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "That username is taken",
            },
          ],
        };
      }
    }

    // store user id session
    // TODO remove session and use JWT
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    if (!usernameOrEmail) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "This field cannot be empty",
          },
        ],
      };
    }
    const isEmail = isEmailValid(usernameOrEmail);

    // If field is not a valid email, use it as username
    // else, use it as email
    const user = await User.findOne(
      !isEmail
        ? { where: { username: usernameOrEmail } }
        : { where: { email: usernameOrEmail } }
    );

    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "Username or email incorrect",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "Password incorrect",
          },
        ],
      };
    }

    // Store the userId on session
    req.session.userId = user.id;

    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) => {
      req.session.destroy((err) => {
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        res.clearCookie(COOKIE_NAME);
        resolve(true);
      });
    });
  }
}
