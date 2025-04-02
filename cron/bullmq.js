import { Queue, Worker } from "bullmq";
import redisClient from "../lib/redis.js";
import { getquestion } from "../lib/QuestionSet.js";
import GameModel from "../model/game_model/gamePool.model.js";

const gameQueue = new Queue("gameQueue", {
  connection: redisClient,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: true,
  },
});

export const scheduleGame = async (gameId, startTime) => {
  const delay = new Date(startTime).getTime() - Date.now() - 1 * 30 * 1000;
  // - 2 * 60 * 1000;
  if (delay <= 0) {
    console.log("⏳ Game time already passed.");
    return;
  }

  await gameQueue.add("startGame", { gameId }, { delay });
  console.log(`🎮 Game ${gameId} scheduled ${delay / 1000}s before start.`);
};

const gameState = (poolId, player1, player2, questions, winningAmount, startTime) => ({
  poolId,
  players: {
    player1: { _id: player1, score: 0, answers: [] },
    player2: { _id: player2, score: 0, answers: [] },
  },
  questions,
  player1QuestionIndex: 0,
  player2QuestionIndex: 0,
  player1CheatingCount: 0,
  player2CheatingCount: 0,
  status: "live",
  winningAmount,
  startTime,
  endTime: null,
});

new Worker(
  "gameQueue",
  async (job) => {
    try {
      const { gameId } = job.data;
      const gameKey = `game-${gameId}`;
      console.log(`🎮 Preparing Game ${gameId}...`);

      const pool = await GameModel.findById(gameId);
      if (!pool) return;
      const playerId1 = pool.players[0];
      const playerId2 = pool.players[1];
      let questions = [];
      questions = await getquestion(pool.topic);
      if (questions.length === 0) {
        questions = await getquestion(pool.topic);
      }

      let winningAmount = pool.firstPrize;
      if (winningAmount === "Free") {
        winningAmount = 0;
      }
      const startTime = new Date(Date.now() + 2 * 60 * 1000).toISOString();
      const game = gameState(gameId, playerId1, playerId2, questions, winningAmount, startTime);
      await redisClient.set(gameKey, JSON.stringify(game), "EX", 2 * 3600);

      console.log(`✅ Game ${gameId} ready in Redis!`);
    } catch (error) {
      console.log(`Error in gameQueue: `, error);
    }
  },
  { connection: redisClient }
);
