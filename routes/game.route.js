import express from "express";
const router = express.Router();
import { auth } from "../middleware/auth.js";

router.use(auth);

import {
  getCricketPoolsData,
  getFootballPoolsData,
  getBollywoodPoolsData,
  getMusicPoolsData,
  getBusinessPoolsData,
  getFinancePoolsData,
  getPersonalityPoolsData,
  getGeographyPoolsData,
  getHistoryPoolsData,
  getMathsPoolsData,
  getMegaPoolsData,
  getSpecificPoolData,
  enterPool,
  getPlayers,
  joinedPools,
  quickPlay,
  getJoinedPlayers,
  getSpecificLivePoolData,
  getGameResults,
} from "../controller/game.controller.js";

router.get("/megaPoolsData", getMegaPoolsData);
router.get("/poolsData/cricket", getCricketPoolsData);
router.get("/poolsData/football", getFootballPoolsData);
router.get("/poolsData/bollywood", getBollywoodPoolsData);
router.get("/poolsData/music", getMusicPoolsData);
router.get("/poolsData/business", getBusinessPoolsData);
router.get("/poolsData/finance", getFinancePoolsData);
router.get("/poolsData/personality", getPersonalityPoolsData);
router.get("/poolsData/geography", getGeographyPoolsData);
router.get("/poolsData/history", getHistoryPoolsData);
router.get("/poolsData/maths", getMathsPoolsData);
router.get("/getPoolData/:poolId", getSpecificPoolData);
router.get("/getPoolData/live/:poolId", getSpecificLivePoolData);
router.put("/enterPool/:poolId", enterPool);
router.get("/pool/players/:poolId", getPlayers);
router.get("/joinedPools/:status", joinedPools);
router.get("/quickPlay", quickPlay);
router.get("/getJoinedPlayers/:poolId", getJoinedPlayers);
router.get("/game-results/:poolId", getGameResults);

export default router;
