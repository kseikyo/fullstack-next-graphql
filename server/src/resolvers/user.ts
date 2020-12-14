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
import { COOKIE_NAME } from "../contants";
import { isEmailValid } from "src/utils/isEmailValid";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "src/utils/validateRegister";

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
  @Mutation(() => Boolean)
  async forgotPassword(@Arg("email") email: string, @Ctx() { em }: MyContext) {
    // const user = await em.findOne(User, { email });
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
            field: "username",
            message: "Username cannot be empty",
          },
        ],
      };
    }
    if (!password) {
      return {
        errors: [
          {
            field: "password",
            message: "Password cannot be empty",
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
            field: "username",
            message: "Username incorrect",
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
