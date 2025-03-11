// import GameModel from "../model/game_model/GameModel.model.js";
import GameModel from "../model/game_model/gamePool.model.js";
import moment from "moment-timezone";
import mongoose from "mongoose";
import UserModel from "../model/user.model.js";
import GameStateQuiz from "../model/game_model/gameState.model.js";
import JoinedPoolModel from "../model/game_model/joinedPool.model.js";
const games = ["Cricket", "Football", "Bollywood", "Music", "Business", "Finance", "Personality", "Geography", "History", "Maths"];
const set = new Set(games);
const getPoolsByCategory = async (req, res, topic) => {
  try {
    if (!set.has(topic)) {
      return res.status(400).json({ success: false, message: "Invalid category" });
    }
    const types = ["Free", "H2H", "VIP"];

    const results = await Promise.all(
      types.map((type) => {
        if (type === "Free") {
          return GameModel.find({ topic, status: "active", full: false, type }).limit(4);
        } else {
          return GameModel.find({ topic, status: "active", full: false, type }).limit(12);
        }
      })
    );

    const pools = results.flat();
    if (!pools.length) {
      return res.status(404).json({ success: false, message: "No pools available right now", pools: [] });
    }
    return res.status(200).json({ success: true, pools });
  } catch (error) {
    console.error(`Error fetching ${topic} pools:`, error);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};

// Individual pool category handlers
export const getCricketPoolsData = (req, res) => getPoolsByCategory(req, res, "Cricket");
export const getFootballPoolsData = (req, res) => getPoolsByCategory(req, res, "Football");
export const getBollywoodPoolsData = (req, res) => getPoolsByCategory(req, res, "Bollywood");
export const getMusicPoolsData = (req, res) => getPoolsByCategory(req, res, "Music");
export const getBusinessPoolsData = (req, res) => getPoolsByCategory(req, res, "Business");
export const getFinancePoolsData = (req, res) => getPoolsByCategory(req, res, "Finance");
export const getPersonalityPoolsData = (req, res) => getPoolsByCategory(req, res, "Personality");
export const getGeographyPoolsData = (req, res) => getPoolsByCategory(req, res, "Geography");
export const getHistoryPoolsData = (req, res) => getPoolsByCategory(req, res, "History");
export const getMathsPoolsData = (req, res) => getPoolsByCategory(req, res, "Maths");
export const getMegaPoolsData = (req, res) => getMegaPools(req, res, "Mega");

const getMegaPools = async (req, res, type) => {
  try {
    const pools = await GameModel.find({ type, status: "active" }).sort({ totalPoolAmount: -1 }).limit(30);
    if (!pools.length) {
      return res.status(404).json({ success: false, message: "No pools found", pools: [] });
    }
    return res.status(200).json({ success: true, pools });
  } catch (error) {
    console.error(`Error fetching ${category} pools:`, error);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};

export const getSpecificPoolData = async (req, res) => {
  try {
    const { poolId } = req.params;
    if (!poolId) return res.status(400).json({ success: false, message: "Pool id is required" });
    const pool = await GameModel.findById(poolId);
    if (!pool) {
      return res.status(404).json({ success: false, message: "Pool not found" });
    }
    return res.status(200).json({ success: true, pool });
  } catch (error) {
    console.log(`Error in getting specific pool: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getSpecificLivePoolData = async (req, res) => {
  try {
    const { poolId } = req.params;
    if (!poolId) return res.status(400).json({ success: false, message: "Pool id is required" });
    let pool = await GameModel.findById(poolId);
    if (!pool) {
      return res.status(404).json({ success: false, message: "Pool not found" });
    }
    if (pool.status === "active") {
      pool = await GameModel.findByIdAndUpdate(poolId, { $set: { status: "live" } });
      await JoinedPoolModel.updateOne({ status: "active", gamePoolId: poolId }, { $set: { status: "live" } });
    }
    if (pool.status === "completed") {
      return res.status(400).json({ success: false, message: "Pool is completed" });
    }

    return res.status(200).json({ success: true, pool });
  } catch (error) {
    console.log(`Error in getting specific pool: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const enterPool = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = req.user;
    const { poolId } = req.params;
    if (!poolId) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Pool id is required", success: false });
    }
    const pool = await GameModel.findById(poolId).session(session).lean();
    if (!pool) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Pool not found", success: false });
    }
    if (pool.status !== "active") {
      await session.abortTransaction();
      return res.status(400).json({ message: `Pool is ${pool.status}, can not join this pool`, success: false });
    }
    // const existingPlayer = await GameModel.findOne({
    //   _id: poolId,
    //   players: user._id,
    // }).session(session);
    const players = pool.players.map((player) => player.toString());
    if (players.includes(user._id.toString())) {
      await session.abortTransaction();
      return res.status(409).json({ message: "You have already joined this pool", success: false });
    }
    if (pool.full) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Pool is full", success: false });
    }
    const poolTime = moment.utc(pool.gameTime).tz("Asia/Kolkata").toDate();
    const currentTime = new Date();
    if (poolTime.getTime() <= currentTime.getTime()) {
      if (pool.status === "active") {
        await GameModel.findByIdAndUpdate(poolId, { $set: { status: "live" } }, { session });
      }
      await session.commitTransaction();
      return res.status(400).json({ message: "Pool time out", success: false });
    }

    const thirtyMinutesAgo = new Date(pool.gameTime.getTime() - 30 * 60 * 1000);
    const thirtyMinutesLater = new Date(pool.gameTime.getTime() + 30 * 60 * 1000);
    const myActivePools = await JoinedPoolModel.findOne({ userId: user._id, status: "active", gameStartTime: { $gte: thirtyMinutesAgo, $lte: thirtyMinutesLater } }).session(
      session
    );
    if (myActivePools) {
      await session.abortTransaction();
      return res.status(400).json({ message: "You have joined another pool, that is within the 30 minutes window of this pool", success: false });
    }
    if (pool.entryFee > 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Real money gaming will be added in future updates, keep playing free games!", success: false });
    }
    const updated = await GameModel.findByIdAndUpdate(
      poolId,
      {
        $push: { players: user._id },
        $inc: { joinedPlayers: 1 },
      },
      { new: true, session }
    );
    await JoinedPoolModel.create({ userId: user._id, gamePoolId: poolId, status: "active", gameStartTime: pool.gameTime });

    if (parseInt(updated.joinedPlayers) === parseInt(updated.maxPlayers)) {
      await GameModel.findByIdAndUpdate(poolId, { $set: { full: true } }, { session });
    }
    await session.commitTransaction();
    return res.status(200).json({ message: "You have joined the pool", success: true, userId: user._id, pool: updated });
  } catch (error) {
    await session.abortTransaction();
    console.log(`Error in enterPool pool: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    session.endSession();
  }
};

// {$expr: {$eq: ["$maxPlayers", "$joinedPlayers"]}}

export const getPlayers = async (req, res) => {
  try {
    const { poolId } = req.params;
    if (!poolId) return res.status(400).json({ message: "Pool id is required" });
    const pool = await GameModel.findById(poolId).populate("players", "username name profilePic");
    if (!pool) return res.status(404).json({ message: "Pool not found" });
    return res.status(200).json({ players: pool.players, success: true });
  } catch (error) {
    console.log(`Error in getPlayers: `, error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const joinedPools = async (req, res) => {
  try {
    const user = req.user;
    const { status } = req.params;
    const getJoinedPools = await JoinedPoolModel.find({ userId: user._id, status }).select("gamePoolId").populate("gamePoolId").sort({ gameStartTime: -1 });
    if (!getJoinedPools.length) return res.status(404).json({ message: "No pools found" });
    if (status === "live") {
      if (!getJoinedPools[0].gamePoolId?.full) {
        await GameModel.findByIdAndDelete(getJoinedPools[0].gamePoolId._id);
        await JoinedPoolModel.deleteOne({ gamePoolId: getJoinedPools[0].gamePoolId._id });
        return res.status(400).json({ message: `${getJoinedPools[0].gamePoolId.title} pool didn't got full, that's why we had to remove the pool` });
      }
    }
    return res.status(200).json({ success: true, pools: getJoinedPools });
  } catch (error) {
    console.log(`Error in getting joinedPools: `, error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getJoinedPlayers = async (req, res) => {
  try {
    const { poolId } = req.params;
    const joinedPlayers = await GameModel.findById(poolId).select("joinedPlayers");
    if (!joinedPlayers) return res.status(500).json({ message: "Something went wrong, cound not find your profile" });
    return res.status(200).json({ success: true, count: joinedPlayers.joinedPlayers });
  } catch (error) {
    console.log(`Error in getting joinedPools: `, error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const quickPlay = async (req, res) => {
  try {
    const pool = await GameModel.aggregate([
      {
        $match: {
          status: "active",
          gameTime: { $lt: new Date(Date.now() + 40 * 60 * 1000) },
          entryFee: { $lt: 300 },
          type: "H2H",
          topic: "Cricket",
        },
      },
      {
        $addFields: {
          remainingPlayers: {
            $subtract: ["$maxPlayers", "$joinedPlayers"],
          },
        },
      },
      {
        $match: {
          $expr: { $eq: ["$remainingPlayers", 2] },
        },
      },
      {
        $sort: { entryFee: 1 },
      },
      {
        $limit: 8,
      },
    ]);
    if (!pool) return res.status(404).json({ message: "Pool not found" });
    return res.status(200).json({ pool, success: true });
  } catch (error) {
    console.log(`Error in quickPlay: `, error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getGameResults = async (req, res) => {
  try {
    const { poolId } = req.params;
    const pool = await GameStateQuiz.findOne({ poolId });
    if (!pool) return res.status(404).json({ message: "Pool not found" });
    console.log("pool: ", pool);
    return res.status(200).json({ pool, success: true });
  } catch (error) {
    console.log(`Error in getGameResults: `, error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
