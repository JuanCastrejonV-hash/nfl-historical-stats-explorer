const express = require("express");
const router = express.Router();

const nflController = require("../controllers/nflController");

router.get("/", nflController.home);

router.get("/stats", nflController.getStats);

router.get("/teams/top-wins", nflController.getTopTeamsByWins);
router.get("/teams/top-offenses", nflController.getTopOffenses);
router.get("/teams/top-defenses", nflController.getTopDefenses);
router.get("/teams/best-differential", nflController.getBestPointDifferential);
router.get("/teams/search", nflController.searchTeams);

router.get("/games/season/:season", nflController.getGamesBySeason);
router.get("/games/search", nflController.searchGamesByTeam);
router.get("/games/high-scoring", nflController.getHighestScoringGames);
router.get("/games/close-games", nflController.getCloseGames);

module.exports = router;