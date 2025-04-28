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
const refreshBtn = document.getElementById('refresh-btn');
const updateStatusEl = document.getElementById('update-status');
const showEmptyCheckbox = document.getElementById('show-empty');

// State
let animationDelay = 0;
let totalGames = Object.values(gamesData).flat().length;
let successfulFetches = 0;
let isRefreshing = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchAllData();
    setInterval(fetchAllData, 60000); // Refresh every 60 seconds
});

// Event Listeners
refreshBtn.addEventListener('click', () => {
    if (!isRefreshing) {
        fetchAllData();
    }
});

showEmptyCheckbox.addEventListener('change', () => {
    document.querySelectorAll('.server-item').forEach(item => {
        const players = parseInt(item.querySelector('.server-count').textContent);
        if (players === 0) {
            item.style.display = showEmptyCheckbox.checked ? 'flex' : 'none';
        }
    });
});

async function fetchAllData() {
    if (isRefreshing) return;
    isRefreshing = true;
    refreshBtn.classList.add('refreshing');
    
    try {
        const startTime = Date.now();
        updateStatusEl.textContent = "Updating data...";
        updateTimeEl.textContent = "Refreshing...";
        
        // Reset UI
        regionsContainer.innerHTML = '';
        animationDelay = 0;
        successfulFetches = 0;
        
        let totalPlayers = 0;
        
        // Show loading skeletons
        Object.keys(gamesData).forEach(region => {
            const regionCard = createRegionSkeleton(region);
            regionsContainer.appendChild(regionCard);
        });
        
        // Fetch data for each region in parallel
        const regionPromises = Object.entries(gamesData).map(
            async ([region, games]) => {
                const regionPlayers = await fetchRegionData(region, games);
                totalPlayers += regionPlayers;
                return regionPlayers;
            }
        );
        
        const regionResults = await Promise.all(regionPromises);
        totalPlayers = regionResults.reduce((sum, count) => sum + count, 0);
        
        // Update totals
        totalPlayersEl.textContent = totalPlayers.toLocaleString();
        const percentage = Math.round((successfulFetches / totalGames) * 100);
        percentageEl.textContent = `${percentage}%`;
        
        // Update circle animation
        updateProgressCircle(percentage);
        
        // Update timestamp
        const endTime = Date.now();
        const updateTime = new Date(endTime).toLocaleTimeString();
        updateTimeEl.textContent = updateTime;
        updateStatusEl.textContent = `Last updated at ${updateTime}`;
        
    } catch (error) {
        console.error("Error fetching data:", error);
        updateStatusEl.textContent = "Error updating data";
        updateTimeEl.textContent = "Error";
    } finally {
        isRefreshing = false;
        refreshBtn.classList.remove('refreshing');
    }
}

function createRegionSkeleton(regionName) {
    const regionCard = document.createElement('div');
    regionCard.className = 'region-card loading-skeleton';
    regionCard.innerHTML = `
        <div class="region-header">
            <div class="region-name">${regionName}</div>
            <div class="region-count">Loading...</div>
        </div>
        <div class="game-item loading-skeleton" style="height: 20px; width: 100%;"></div>
        <div class="game-item loading-skeleton" style="height: 20px; width: 100%; margin-top: 8px;"></div>
    `;
    return regionCard;
}

async function fetchRegionData(regionName, games) {
    let regionPlayers = 0;
    const regionCard = document.createElement('div');
    regionCard.className = 'region-card';
    
    // Create region header
    const regionHeader = document.createElement('div');
    regionHeader.className = 'region-header';
    regionHeader.innerHTML = `
        <div class="region-name">${regionName}</div>
        <div class="region-count">0 players</div>
    `;
    regionCard.appendChild(regionHeader);
    
    // Create games container
    const gamesContainer = document.createElement('div');
    gamesContainer.className = 'games-container';
    regionCard.appendChild(gamesContainer);
    
    // Add to DOM
    regionsContainer.appendChild(regionCard);
    
    // Fetch each game in the region
    const gamePromises = games.map(async (game, index) => {
        try {
            const { totalPlayers, servers } = await fetchGameServers(game.id);
            successfulFetches++;
            regionPlayers += totalPlayers;
            
            // Create game item
            const gameItem = document.createElement('div');
            gameItem.className = 'game-item';
            gameItem.style.animationDelay = `${animationDelay + (index * 0.05)}s`;
            gameItem.innerHTML = `
                <div class="game-name">${game.name}</div>
                <div class="game-players">${totalPlayers.toLocaleString()}</div>
            `;
            gamesContainer.appendChild(gameItem);
            
            // Create server details if there are servers
            if (servers.length > 0) {
                const serverDetails = createServerDetails(game.name, servers);
                gamesContainer.appendChild(serverDetails);
            }
            
            return totalPlayers;
        } catch (error) {
            console.error(`Error fetching ${game.name}:`, error);
            return 0;
        }
    });
    
    await Promise.all(gamePromises);
    animationDelay += games.length * 0.05;
    
    // Update region count
    regionHeader.querySelector('.region-count').textContent = 
        `${regionPlayers.toLocaleString()} players`;
    return regionPlayers;
}

function createServerDetails(gameName, servers) {
    const container = document.createElement('div');
    container.className = 'servers-container';
    
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-servers-btn';
    toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Show Servers';
    toggleBtn.addEventListener('click', () => {
        container.classList.toggle('active');
        toggleBtn.innerHTML = container.classList.contains('active') 
            ? '<i class="fas fa-chevron-up"></i> Hide Servers' 
            : '<i class="fas fa-chevron-down"></i> Show Servers';
    });
    container.appendChild(toggleBtn);
    
    const serverDetails = document.createElement('div');
    serverDetails.className = 'server-details';
    
    const header = document.createElement('h4');
    header.innerHTML = `
        ${gameName} Servers
        <span>${servers.length} server${servers.length !== 1 ? 's' : ''}</span>
    `;
    serverDetails.appendChild(header);
    
    const serverList = document.createElement('div');
    serverList.className = 'server-list';
    
    servers.forEach(server => {
        const serverItem = document.createElement('div');
        serverItem.className = `server-item ${server.playing > 0 ? 'active' : ''}`;
        serverItem.style.display = server.playing > 0 || showEmptyCheckbox.checked ? 'flex' : 'none';
        serverItem.innerHTML = `
            <span class="server-name" title="${server.name}">${server.name}</span>
            <div>
                <span class="server-count">${server.playing}</span>
                <span class="server-ping">${server.ping}ms</span>
            </div>
        `;
        serverList.appendChild(serverItem);
    });
    
    serverDetails.appendChild(serverList);
    container.appendChild(serverDetails);
    
    return container;
}

async function fetchGameServers(gameId) {
    try {
        const response = await fetch(`/.netlify/functions/fetchRobloxData?gameId=${gameId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Handle error response from proxy
        if (data.error) {
            throw new Error(data.error);
        }
        
        return {
            totalPlayers: data.totalPlayers || 0,
            servers: data.servers || []
        };
    } catch (error) {
        console.error(`Failed to fetch servers for game ${gameId}:`, error);
        return { totalPlayers: 0, servers: [] };
    }
}

function updateProgressCircle(percentage) {
    const circle = document.querySelector('.circle');
    const circumference = 314; // 2 * π * r (where r=50)
    const offset = circumference - (percentage / 100) * circumference;
    circle.style.strokeDashoffset = offset;
}
