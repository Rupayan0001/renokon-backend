import cron from "node-cron";
import mongoose from "mongoose";
import GameModel from "../model/game_model/gamePool.model.js";
import JoinedPoolModel from "../model/game_model/joinedPool.model.js";
import { sendEmail } from "../lib/emailService.js";
import { gameStartsNotification, gamePoolNotFilledNotification } from "../emails/emailTemplate.js";

const startPoolStatusCron = () => {
  console.log("✅ Pool status update cron job initialized...");

  cron.schedule("* * * * *", async () => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const currentTime = new Date();
      const updateTime = new Date(Date.now() + 6 * 60 * 60 * 1000);
      const poolsToUpdate = await GameModel.find({ gameTime: { $lte: currentTime }, status: "active", full: true, joinedPlayers: 2 }).session(session);
      // const notFilled = await GameModel.updateMany(
      //   { gameTime: { $lte: currentTime }, status: "active", full: false, joinedPlayers: 1, players: { $ne: [] } },
      //   { $set: { joinedPlayers: 0, players: [], gameTime: updateTime } },
      //   { session }
      // );
      const oneMinuteLater = new Date(currentTime.getTime() + 1 * 60 * 1000);
      // console.log("notFilled: ", notFilled);

      // if (notFilled.length > 0) {
      //   for (const pool of notFilled) {
      //     const emailPromises = pool.players.map((player) => {
      //       const html = gamePoolNotFilledNotification(player.name.split(" ")[0], pool.title);
      //       return sendEmail(player.email, "Game pool is not filled", html);
      //     });
      //     const deleteJoinedPools = pool.players.map((player) => {
      //       return JoinedPoolModel.deleteOne({ gamePoolId: pool._id });
      //     });

      //     await Promise.all(emailPromises);
      //     await Promise.all(deleteJoinedPools);
      //   }
      // }
      const notFilledFilter = {
        gameTime: { $lte: currentTime },
        status: "active",
        full: false,
        joinedPlayers: 1,
        players: { $ne: [] },
      };

      // Find the affected games
      const notFilledPools = await GameModel.find(notFilledFilter).populate("players").session(session);

      if (notFilledPools.length > 0) {
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

        await GameModel.updateMany(notFilledFilter, {
          $set: { joinedPlayers: 0, players: [], gameTime: updateTime },
        }).session(session);
      }

      const emptyPools = await GameModel.updateMany(
        { gameTime: { $lte: currentTime }, status: "active", full: false, joinedPlayers: 0 },
        { $set: { joinedPlayers: 0, players: [], gameTime: updateTime } }
      );
      const before1Minute = await GameModel.find({ gameTime: { $gte: currentTime, $lte: oneMinuteLater }, status: "active", full: true })
        .populate("players")
        .session(session);

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
        await session.abortTransaction();
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
      const newPoolsCreated = await GameModel.insertMany(newPools, { session });
      const updatedPools = await GameModel.updateMany({ _id: { $in: newPoolIds } }, { $set: { status: "live" } }, { session });
      await JoinedPoolModel.updateMany({ status: "active", gamePoolId: { $in: newPoolIds } }, { $set: { status: "live" } }, { session });

      if (updatedPools.modifiedCount > 0 || newPoolsCreated.length > 0) {
        console.log(`✅ Updated ${updatedPools.modifiedCount} pools to "live" status. and created ${newPoolsCreated.length} new pools`);
      }
      await session.commitTransaction();
    } catch (error) {
      console.error("❌ Error updating pool status:", error);
      await session.abortTransaction();
    } finally {
      await session.endSession();
    }
  });
};

export default startPoolStatusCron;
