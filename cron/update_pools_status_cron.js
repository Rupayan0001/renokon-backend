import cron from "node-cron";
import mongoose from "mongoose";
import GameModel from "../model/game_model/gamePool.model.js";
import JoinedPoolModel from "../model/game_model/joinedPool.model.js";
import { sendEmail } from "../lib/emailService.js";
import { gameStartsNotification, gamePoolNotFilledNotification } from "../emails/emailTemplate.js";

const startPoolStatusCron = () => {
  console.log("✅ Pool status update cron job initialized...");

  cron.schedule("* * * * *", async () => {
    try {
      const currentTime = new Date();
      const updateTime = new Date(Date.now() + 6 * 60 * 60 * 1000);
      const poolsToUpdate = await GameModel.find({ gameTime: { $lte: currentTime }, status: "active", full: true });
      const twoHoursAgo = new Date(Date.now() - (2 * 60 * 60 * 1000 + 30 * 60 * 1000));

      await JoinedPoolModel.deleteMany({
        gameStartTime: { $lte: twoHoursAgo },
        status: "live",
      });

      const oneMinuteLater = new Date(currentTime.getTime() + 1 * 60 * 1000);

      const notFilledFilter = {
        gameTime: { $lte: currentTime },
        status: "active",
        full: false,
        players: { $ne: [] },
        joinedPlayers: 1,
      };

      // Find the affected games
      const notFilledPools = await GameModel.find(notFilledFilter).populate("players");

      if (notFilledPools.length > 0) {
        const updatePromises = notFilledPools.map((pool) => {
          return GameModel.findOneAndUpdate(
            { _id: pool._id },
            {
              $set: { status: "active", joinedPlayers: 0, full: false, players: [], gameTime: updateTime },
            },
            { new: true }
          );
        });
        const arr = await Promise.all(updatePromises);
        for (const pool of notFilledPools) {
          const emailPromises = pool.players.map((player) => {
            const html = gamePoolNotFilledNotification(player.name.split(" ")[0], pool.title);
            return sendEmail(player.email, "Game pool is not filled", html);
          });

          const deleteJoinedPools = pool.players.map((player) => {
            return JoinedPoolModel.deleteOne({ gamePoolId: pool._id });
          });

          await Promise.all(emailPromises);
          await Promise.all(deleteJoinedPools);
        }
      }

      await GameModel.updateMany({ gameTime: { $lte: currentTime }, status: "active", full: false, joinedPlayers: 0 }, { $set: { gameTime: updateTime } });
      const before1Minute = await GameModel.find({ gameTime: { $gte: currentTime, $lte: oneMinuteLater }, status: "active", full: true }).populate("players");

      if (before1Minute.length > 0) {
        for (const pool of before1Minute) {
          const emailPromises = pool.players.map((player) => {
            const html = gameStartsNotification(player.name.split(" ")[0], pool.title);
            return sendEmail(player.email, "Game starts in 1 minute", html);
          });

          await Promise.all(emailPromises);
        }
      }

      if (poolsToUpdate.length === 0) {
        return;
      }
      const newPoolIds = poolsToUpdate.map((pool) => pool._id);
      const newPools = poolsToUpdate.map((pool) => {
        const obj = pool.toObject();
        delete obj._id;
        obj.players = [];
        obj.joinedPlayers = 0;
        obj.status = "active";
        obj.gameTime = new Date(Date.now() + 12 * 60 * 60 * 1000);
        obj.full = false;
        obj.entryFee = obj.entryFee;
        return obj;
      });
      const newPoolsCreated = await GameModel.insertMany(newPools);
      const updatedPools = await GameModel.updateMany({ _id: { $in: newPoolIds } }, { $set: { status: "live" } });
      await JoinedPoolModel.updateMany({ status: "active", gamePoolId: { $in: newPoolIds } }, { $set: { status: "live" } });

      if (updatedPools.modifiedCount > 0 || newPoolsCreated.length > 0) {
        console.log(`✅ Updated ${updatedPools.modifiedCount} pools to "live" status. and created ${newPoolsCreated.length} new pools`);
      }
    } catch (error) {
      console.error("❌ Error updating pool status:", error);
    }
  });
};

export default startPoolStatusCron;

// const startPoolStatusCron = () => {
//   console.log("✅ Pool status update cron job initialized...");

//   cron.schedule("* * * * *", async () => {
//     try {
//       const currentTime = new Date();
//       const updateTime = new Date(Date.now() + 6 * 60 * 60 * 1000);
//       const oneMinuteLater = new Date(currentTime.getTime() + 1 * 60 * 1000);

//       // Get pools that need updates
//       const notFilledPools = await GameModel.find({
//         gameTime: { $lte: currentTime },
//         status: "active",
//         full: false,
//         players: { $ne: [] },
//         joinedPlayers: 1,
//       }).populate("players");

//       const bulkOperations = [];

//       if (notFilledPools.length > 0) {
//         for (const pool of notFilledPools) {
//           // Update the pool status
//           bulkOperations.push({
//             updateOne: {
//               filter: { _id: pool._id },
//               update: { $set: { status: "active", joinedPlayers: 0, full: false, players: [], gameTime: updateTime } },
//             },
//           });

//           // Delete joined pools
//           bulkOperations.push({
//             deleteMany: {
//               filter: { gamePoolId: pool._id },
//             },
//           });

//           // Send emails (not part of bulkWrite, as it's outside MongoDB)
//           const emailPromises = pool.players.map((player) => {
//             const html = gamePoolNotFilledNotification(player.name.split(" ")[0], pool.title);
//             return sendEmail(player.email, "Game pool is not filled", html);
//           });
//           await Promise.allSettled(emailPromises);
//         }
//       }

//       // Schedule a new game for empty pools
//       bulkOperations.push({
//         updateMany: {
//           filter: { gameTime: { $lte: currentTime }, status: "active", full: false, joinedPlayers: 0 },
//           update: { $set: { gameTime: updateTime } },
//         },
//       });

//       // Find games starting in 1 minute & notify players
//       const before1Minute = await GameModel.find({
//         gameTime: { $gte: currentTime, $lte: oneMinuteLater },
//         status: "active",
//         full: true,
//       }).populate("players");

//       for (const pool of before1Minute) {
//         const emailPromises = pool.players.map((player) => {
//           const html = gameStartsNotification(player.name.split(" ")[0], pool.title);
//           return sendEmail(player.email, "Game starts in 1 minute", html);
//         });
//         await Promise.all(emailPromises);
//       }

//       // Update pools that are starting
//       const poolsToUpdate = await GameModel.find({
//         gameTime: { $lte: currentTime },
//         status: "active",
//         full: true,
//       });

//       if (poolsToUpdate.length > 0) {
//         const newPoolIds = poolsToUpdate.map((pool) => pool._id);
//         const newPools = poolsToUpdate.map((pool) => {
//           const obj = pool.toObject();
//           delete obj._id;
//           obj.players = [];
//           obj.joinedPlayers = 0;
//           obj.status = "active";
//           obj.gameTime = new Date(Date.now() + 12 * 60 * 60 * 1000);
//           obj.full = false;
//           return { insertOne: { document: obj } };
//         });

//         bulkOperations.push(...newPools);
//         bulkOperations.push({
//           updateMany: {
//             filter: { _id: { $in: newPoolIds } },
//             update: { $set: { status: "live" } },
//           },
//         });
//         bulkOperations.push({
//           updateMany: {
//             filter: { status: "active", gamePoolId: { $in: newPoolIds } },
//             update: { $set: { status: "live" } },
//           },
//         });
//       }

//       // Execute all operations in a single bulkWrite
//       if (bulkOperations.length > 0) {
//         const result = await GameModel.bulkWrite(bulkOperations);
//         console.log(`✅ Bulk write completed:`, result);
//       }
//     } catch (error) {
//       console.error("❌ Error updating pool status:", error);
//     }
//   });
// };

// export default startPoolStatusCron;
