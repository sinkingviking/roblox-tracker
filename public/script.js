async function fetchData() {
  const response = await fetch('/.netlify/functions/fetchGames');
  const data = await response.json();
  renderRegions(data);
}

function renderRegions(data) {
  const container = document.getElementById('regions');
  for (const [region, games] of Object.entries(data)) {
    const regionDiv = document.createElement('div');
    regionDiv.className = 'region';
    regionDiv.innerHTML = `
      <h2 onclick="toggleRegion(this)">${region} ▼</h2>
      <div class="games">
        ${games.map(game => `
          <div class="game">
            <span>${game.name}</span>
            <span class="players">${game.players}</span>
          </div>
        `).join('')}
      </div>
    `;
    container.appendChild(regionDiv);
  }
}

function toggleRegion(header) {
  const gamesDiv = header.nextElementSibling;
  gamesDiv.style.display = gamesDiv.style.display === 'none' ? 'block' : 'none';
  header.textContent = header.textContent.includes('▼') 
    ? header.textContent.replace('▼', '▶') 
    : header.textContent.replace('▶', '▼');
}

// Refresh every 60 seconds
fetchData();
setInterval(fetchData, 60000);
