const nflModel = require("../models/nflModel");

async function home(req, res) {
    res.json({
        project: "NFL Historical Stats Explorer",
        backend: "Node.js + Express",
        database: "MySQL",
        api_format: "JSON",
        routes: [
            "/api/stats",
            "/api/teams/top-wins",
            "/api/teams/top-offenses",
            "/api/teams/top-defenses",
            "/api/teams/best-differential",
            "/api/teams/search?q=Chiefs",
            "/api/games/season/2024",
            "/api/games/search?q=Chiefs",
            "/api/games/high-scoring",
            "/api/games/close-games"
        ]
    });
}

async function getStats(req, res) {
    try {
        const stats = await nflModel.getStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getTopTeamsByWins(req, res) {
    try {
        const data = await nflModel.getTopTeamsByWins();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getTopOffenses(req, res) {
    try {
        const data = await nflModel.getTopOffenses();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getTopDefenses(req, res) {
    try {
        const data = await nflModel.getTopDefenses();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getBestPointDifferential(req, res) {
    try {
        const data = await nflModel.getBestPointDifferential();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function searchTeams(req, res) {
    try {
        const q = req.query.q || "";
        const data = await nflModel.searchTeams(q);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getGamesBySeason(req, res) {
    try {
        const season = req.params.season;
        const data = await nflModel.getGamesBySeason(season);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function searchGamesByTeam(req, res) {
    try {
        const q = req.query.q || "";
        const data = await nflModel.searchGamesByTeam(q);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getHighestScoringGames(req, res) {
    try {
        const data = await nflModel.getHighestScoringGames();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getCloseGames(req, res) {
    try {
        const data = await nflModel.getCloseGames();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    home,
    getStats,
    getTopTeamsByWins,
    getTopOffenses,
    getTopDefenses,
    getBestPointDifferential,
    searchTeams,
    getGamesBySeason,
    searchGamesByTeam,
    getHighestScoringGames,
    getCloseGames
};