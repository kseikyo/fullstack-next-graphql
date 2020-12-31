import DataLoader from "dataloader";
import { User } from "../entities/User";

// keys is an array, e.g., [1, 78, 3]
// return objects that are the user, e.g., [{id: 1, username: "admin"}, {id: 78...}...]
export const createUserLoader = () =>
  new DataLoader<number, User>(async (keys) => {
    // Get all users from keys array
    const users = await User.findByIds(keys as number[]);
    const userIdToUser: Record<number, User> = {};

    // populate userIdToUser by creating an object with id and the data
    users.forEach((user) => {
      userIdToUser[user.id] = user;
    });

    // map the keys (or ids) and return each user data given the id
    return keys.map((userId) => userIdToUser[userId]);
  });
