import DataLoader from "dataloader";
import { Updoot } from "../entities/Updoot";

// keys is an array of objects, e.g., [{postId: 174, userId: 1}]
// return the updoot, e.g., [{value: 1, postId: 174, userId: 1}]
export const createUpdootLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Updoot | null>(
    async (keys) => {
      // Get all updoots from keys array
      // Literally typeorm black magic that fetches all updoots using
      // the array shaped like this => [{postId: 174, userId: 1}]
      const updoots = await Updoot.findByIds(keys as any);
      const updootIdToUpdoot: Record<string, Updoot> = {};

      // populate updootIdToUpdoot by creating an object with
      // userId and postId as key and the data as the value
      updoots.forEach((updoot) => {
        updootIdToUpdoot[`${updoot.userId}|${updoot.postId}`] = updoot;
      });

      return keys.map((key) => updootIdToUpdoot[`${key.userId}|${key.postId}`]);
    }
  );
