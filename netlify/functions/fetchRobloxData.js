const fetch = require('node-fetch');

exports.handler = async (event) => {
    const { gameId } = event.queryStringParameters;
    
    try {
        const response = await fetch(`https://games.roblox.com/v1/games/${gameId}/servers/Public/0?sortOrder=Asc&limit=100`);
        const data = await response.json();
        
        if (!data.data) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    totalPlayers: 0,
                    servers: [],
                    error: "No server data available"
                })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                totalPlayers: data.data.reduce((sum, server) => sum + server.playing, 0),
                servers: data.data.map(server => ({
                    name: server.name || `Server ${server.id.slice(0, 4)}`,
                    playing: server.playing,
                    maxPlayers: server.maxPlayers,
                    ping: server.ping || 0,
                    id: server.id
                }))
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: "Failed to fetch data",
                details: error.message 
            })
        };
    }
};
