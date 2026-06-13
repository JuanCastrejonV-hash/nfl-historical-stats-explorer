const db = require("../config/db");

async function getStats() {
    const [teamRows] = await db.query(`
        SELECT
            COUNT(*) AS total_team_seasons,
            COUNT(DISTINCT season) AS total_seasons,
            COUNT(DISTINCT team) AS total_teams,
            SUM(wins) AS total_wins,
            SUM(points_for) AS total_points_for,
            SUM(points_against) AS total_points_against
        FROM team_seasons
    `);

    const [gameRows] = await db.query(`
        SELECT
            COUNT(*) AS total_games,
            AVG(winner_points + loser_points) AS average_total_points,
            MAX(winner_points + loser_points) AS highest_total_points
        FROM games
        WHERE winner IS NOT NULL
          AND winner_points IS NOT NULL
          AND loser_points IS NOT NULL
    `);

    return {
        ...teamRows[0],
        ...gameRows[0]
    };
}

async function getTopTeamsByWins() {
    const [rows] = await db.query(`
        SELECT season, conference, team, wins, losses, ties, points_for, points_against, point_differential
        FROM team_seasons
        ORDER BY wins DESC, point_differential DESC
        LIMIT 50
    `);

    return rows;
}

async function getTopOffenses() {
    const [rows] = await db.query(`
        SELECT season, conference, team, wins, losses, points_for, points_against, point_differential
        FROM team_seasons
        ORDER BY points_for DESC
        LIMIT 50
    `);

    return rows;
}

async function getTopDefenses() {
    const [rows] = await db.query(`
        SELECT season, conference, team, wins, losses, points_for, points_against, point_differential
        FROM team_seasons
        ORDER BY points_against ASC
        LIMIT 50
    `);

    return rows;
}

async function getBestPointDifferential() {
    const [rows] = await db.query(`
        SELECT season, conference, team, wins, losses, points_for, points_against, point_differential
        FROM team_seasons
        ORDER BY point_differential DESC
        LIMIT 50
    `);

    return rows;
}

async function searchTeams(q) {
    const [rows] = await db.query(`
        SELECT season, conference, team, wins, losses, ties, points_for, points_against, point_differential
        FROM team_seasons
        WHERE team LIKE ?
        ORDER BY season DESC, wins DESC
        LIMIT 100
    `, [`%${q}%`]);

    return rows;
}

async function getGamesBySeason(season) {
    const [rows] = await db.query(`
        SELECT season, week, game_date, game_time, winner, winner_points, loser, loser_points, winner_yards, loser_yards
        FROM games
        WHERE season = ?
          AND winner IS NOT NULL
        ORDER BY week ASC, game_date ASC
        LIMIT 300
    `, [season]);

    return rows;
}

async function searchGamesByTeam(q) {
    const [rows] = await db.query(`
        SELECT season, week, game_date, winner, winner_points, loser, loser_points, winner_yards, loser_yards
        FROM games
        WHERE winner LIKE ? OR loser LIKE ?
        ORDER BY season DESC, week ASC
        LIMIT 200
    `, [`%${q}%`, `%${q}%`]);

    return rows;
}

async function getHighestScoringGames() {
    const [rows] = await db.query(`
        SELECT
            season,
            week,
            game_date,
            winner,
            winner_points,
            loser,
            loser_points,
            winner_yards,
            loser_yards,
            (winner_points + loser_points) AS total_points
        FROM games
        WHERE winner IS NOT NULL
          AND winner_points IS NOT NULL
          AND loser_points IS NOT NULL
        ORDER BY total_points DESC
        LIMIT 50
    `);

    return rows;
}

async function getCloseGames() {
    const [rows] = await db.query(`
        SELECT
            season,
            week,
            game_date,
            winner,
            winner_points,
            loser,
            loser_points,
            ABS(winner_points - loser_points) AS point_margin
        FROM games
        WHERE winner IS NOT NULL
          AND winner_points IS NOT NULL
          AND loser_points IS NOT NULL
        ORDER BY point_margin ASC
        LIMIT 50
    `);

    return rows;
}

module.exports = {
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