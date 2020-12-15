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
    @Ctx() { redis, em, req }: MyContext
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

    const user = await em.findOne(User, { id: parseInt(userId) });

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

    user.password = await argon2.hash(newPassword);

    await em.persistAndFlush(user);

    // Log in user after change password
    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { em, redis }: MyContext
  ) {
    const user = await em.findOne(User, { email });
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
  async me(@Ctx() { req, em }: MyContext) {
    const id = req.session.userId;
    // User not logged in
    if (!id) {
      return null;
    }
    const user = await em.findOne(User, { id });
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      email: options.email,
      password: hashedPassword,
    });
    //let user;
    try {
      /**
       * If anything goes wrong with this em.persistAndFlush use this ⬇⬇
       * const result = await (em as EntityManager).createQueryBuilder(User).getKnexQuery().insert({
       * username: options.username,
       * password: hashedPassword,
       * created_at: new Date(),
       * updated_at: new Date()
       * })
       * .returning("*");
       * user = result[0];
       */
      await em.persistAndFlush(user);
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
    @Ctx() { em, req }: MyContext
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
    if (!password || password.length < 8) {
      return {
        errors: [
          {
            field: "password",
            message: "Password must be greater than 7 characters",
          },
        ],
      };
    }
    const isEmail = isEmailValid(usernameOrEmail);

    // If field is not a valid email, use it as username
    // else, use it as email
    const user = await em.findOne(
      User,
      !isEmail ? { username: usernameOrEmail } : { email: usernameOrEmail }
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
