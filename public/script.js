// Complete game data with all regions and IDs
const gamesData = {
    "NORTH": [
        { "name": "Winterkeep", "id": "18307684806" },
        { "name": "N1", "id": "101648853566741" },
        { "name": "N2", "id": "135987315568372" }
    ],
    "VALE": [
        { "name": "The Peak", "id": "18339529428" },
        { "name": "V1", "id": "137433975887507" }
    ],
    "IRON ISLANDS": [
        { "name": "Iron Cliff", "id": "18320819979" }
    ],
    "RIVERLANDS": [
        { "name": "Riverport", "id": "18320826573" },
        { "name": "RL1", "id": "125046138905962" },
        { "name": "RL2", "id": "96933580660606" },
        { "name": "RL3", "id": "126767089635681" }
    ],
    "WESTERLANDS": [
        { "name": "The Rock", "id": "18332924662" },
        { "name": "W1", "id": "94821075480261" },
        { "name": "W2", "id": "81454192342001" },
        { "name": "W3", "id": "77168796420279" }
    ],
    "CROWNLANDS": [
        { "name": "Dragonhold", "id": "101102574077224" },
        { "name": "Crown City", "id": "18523133709" },
        { "name": "C1", "id": "131621148729526" },
        { "name": "C2", "id": "87858627218476" }
    ],
    "REACH": [
        { "name": "Oldcity", "id": "100737540604428" },
        { "name": "Highfield", "id": "18996341199" },
        { "name": "Lemongate Hall", "id": "72385863635321" },
        { "name": "R1", "id": "102428606479413" },
        { "name": "R2", "id": "79474756073427" },
        { "name": "R3", "id": "138949404017779" }
    ],
    "STORMLANDS": [
        { "name": "Storms Rock", "id": "18319450561" },
        { "name": "Griffins Rest", "id": "102959368784417" },
        { "name": "S1", "id": "134783075113784" },
        { "name": "S2", "id": "113528463886906" },
        { "name": "S3", "id": "95414965201342" },
        { "name": "S4", "id": "122414115905956" }
    ],
    "DORNE": [
        { "name": "Solspire", "id": "17889564070" },
        { "name": "D1", "id": "82891784272370" },
        { "name": "D2", "id": "124037456260782" }
    ],
    "STEPSTONES": [
        { "name": "SS1", "id": "132597658295890" }
    ]
};

// DOM Elements
const regionsContainer = document.getElementById('regions');
const totalPlayersEl = document.querySelector('.total-players');
const percentageEl = document.querySelector('.percentage');
const updateTimeEl = document.getElementById('update-time');
const refreshBtn = document.querySelector('.refresh-btn');

// Animation delays
let animationDelay = 0;
let totalGames = 0;
let successfulFetches = 0;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    totalGames = Object.values(gamesData).flat().length;
    fetchAllData();
    setInterval(fetchAllData, 60000); // Refresh every 60 seconds
});

// Event Listeners
refreshBtn.addEventListener('click', () => {
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
    fetchAllData();
});

async function fetchAllData() {
    try {
        const startTime = Date.now();
        updateTimeEl.textContent = "Updating...";
        
        // Reset UI
        regionsContainer.innerHTML = '';
        animationDelay = 0;
        successfulFetches = 0;
        
        let totalPlayers = 0;
        
        // Fetch data for each region in parallel
        const regionPromises = Object.entries(gamesData).map(
            async ([region, games]) => {
                const regionPlayers = await fetchRegionData(region, games);
                totalPlayers += regionPlayers;
            }
        );
        
        await Promise.all(regionPromises);
        
        // Update totals
        totalPlayersEl.textContent = totalPlayers.toLocaleString();
        const percentage = Math.round((successfulFetches / totalGames) * 100);
        percentageEl.textContent = `${percentage}%`;
        
        // Update circle animation
        const circle = document.querySelector('.circle');
        const circumference = 314; // 2 * π * r (where r=50)
        const offset = circumference - (percentage / 100) * circumference;
        circle.style.strokeDashoffset = offset;
        
        // Update timestamp
        const endTime = Date.now();
        const updateTime = new Date(endTime).toLocaleTimeString();
        updateTimeEl.textContent = updateTime;
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Data';
        
    } catch (error) {
        console.error("Error fetching data:", error);
        updateTimeEl.textContent = "Error updating";
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Data';
    }
}

async function fetchRegionData(regionName, games) {
    let regionPlayers = 0;
    const regionCard = document.createElement('div');
    regionCard.className = 'region-card';
    
    // Create region header
    const regionHeader = document.createElement('div');
    regionHeader.className = 'region-header';
    
    const regionTitle = document.createElement('div');
    regionTitle.className = 'region-name';
    regionTitle.textContent = regionName;
    
    const regionCount = document.createElement('div');
    regionCount.className = 'region-count';
    regionCount.textContent = '0 players';
    
    regionHeader.appendChild(regionTitle);
    regionHeader.appendChild(regionCount);
    regionCard.appendChild(regionHeader);
    
    // Add to DOM early for smoother rendering
    regionsContainer.appendChild(regionCard);
    
    // Fetch each game in the region
    const gamePromises = games.map(async (game, index) => {
        try {
            const players = await fetchGamePlayers(game.id);
            successfulFetches++;
            regionPlayers += players;
            
            const gameItem = document.createElement('div');
            gameItem.className = 'game-item';
            gameItem.style.animationDelay = `${animationDelay + (index * 0.05)}s`;
            
            const gameName = document.createElement('div');
            gameName.className = 'game-name';
            gameName.textContent = game.name;
            
            const gamePlayers = document.createElement('div');
            gamePlayers.className = 'game-players';
            gamePlayers.textContent = players.toLocaleString();
            
            gameItem.appendChild(gameName);
            gameItem.appendChild(gamePlayers);
            regionCard.appendChild(gameItem);
            
            return players;
        } catch (error) {
            console.error(`Error fetching ${game.name}:`, error);
            return 0;
        }
    });
    
    await Promise.all(gamePromises);
    animationDelay += games.length * 0.05;
    
    // Update region count after all games are processed
    regionCount.textContent = `${regionPlayers.toLocaleString()} players`;
    return regionPlayers;
}

async function fetchGamePlayers(gameId) {
    try {
        // Roblox API endpoint for game servers
        const url = `https://games.roblox.com/v1/games/${gameId}/servers/Public/0?sortOrder=Asc&limit=100`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Calculate total players across all servers
        const totalPlayers = data.data.reduce((sum, server) => sum + server.playing, 0);
        return totalPlayers;
        
    } catch (error) {
        console.error(`Failed to fetch players for game ${gameId}:`, error);
        throw error; // Re-throw to be caught in the calling function
    }
}

// Error handling for the Roblox API
function handleRobloxAPIError(error) {
    console.error("Roblox API Error:", error);
    
    // Check for rate limiting
    if (error.message.includes("429")) {
        console.warn("Rate limited by Roblox API - consider adding delays between requests");
        return 0; // Return 0 players if rate limited
    }
    
    throw error; // Re-throw other errors
}
