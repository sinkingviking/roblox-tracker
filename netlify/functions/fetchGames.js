const axios = require('axios');
const games = require('../../games.json');

exports.handler = async () => {
  const results = {};

  for (const [region, regionGames] of Object.entries(games)) {
    results[region] = [];
    for (const game of regionGames) {
      try {
        const res = await axios.get(
          `https://games.roblox.com/v1/games/${game.id}/servers/0?sortOrder=Asc&limit=100`
        );
        const players = res.data.data.reduce((sum, server) => sum + server.playing, 0);
        results[region].push({ name: game.name, players });
      } catch (error) {
        results[region].push({ name: game.name, players: "Error" });
      }
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(results),
  };
};
