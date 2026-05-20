// --- UI Elements ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const menuScreen = document.getElementById('menuScreen');
const gameScreen = document.getElementById('gameScreen');
const completionScreen = document.getElementById('completionScreen');
const stagesContainer = document.getElementById('stagesContainer');

// --- GAME DATA ---
const colors = {
    0: '#444444', // Grey
    1: '#ff4444', // Red (Avoid)
    2: '#4444ff', // Blue (Must Cross)
    3: '#ffcc00', // Yellow (Forced Turn)
    4: '#32cd32'  // Green (Start/End)
};

// Organize levels into stages!
const stagesData = [
    {
        name: "Stage 1:",
        levels: [
            [[4,4]], // 1.1 Straight line
            [[4, 0, 4]], // 1.2 Corner
            [[4, 0, 0],[0, 0, 4]], // 1.3 The hole
            [[0, 0, 0, 0], [4, -1, -1, 4]], // 1.4 The U-Turn
            [[4, 0, 0, 0, 0], 
            [0, -1, 0, -1, 0], 
            [0, 0, 0, 0, 4]] // 1.5 Center path
        ]
    },
    {
        name: "Stage 2:",
        levels: [
            [[4, 1, 4], [0, 0, 0]], // 2.1 The wall
            [[4, 0, 0], [1, 1, 0], [4, 0, 0]], // 2.2 The hook
            [[4, 1, 0, 4], [0, 1, 0, 1], [0, 0, 0, 1]], // 2.3 Long way around
            [
             [0,4,0,0,0],
             [1,1,1,1,0], 
             [0,4,0,0,0]
            ], // 2.4 Squeeze
            [[4, 1, 0, 0, 0],
             [0, 1, 0, 1, 0],
             [0, 0, 0, 1, 4]] // 2.5 Dead end trap
        ]
    },
    {
        name: "Stage 3:",
        levels: [
            [[4, 2, 4]], // 3.1 Intro
            [[4, 0, 0], [1, 1, 2], [4, 0, 0]], // 3.2 Forced visit
            [[4, 0, 4], [0, 0, 0], [0, 2, 0]], // 3.3 Out of the way
            [[4, 2, 2, 4], [0, 2, 2, 0]], // 3.4 Double tap
            [[4, 0, 4], [1, 0, 1], [0, 0, 0], [2, 1, 2]] // 3.5 Backtrack
        ]
    },
    {
        name: "Stage 4:",
        levels: [
            [[1, 4, 1], [0, 3, 0], [1, 4, 1]], // 4.1 The bounce
            [[4, 3, 0], [0, -1, 3], [0, 0, 4]], // 4.2 The stairs
            [[4, 1, 3, 3, 2],
             [0, 0, 0, 3, 3],
             [4, 1, 1, 1, 2]], // 4.3 Diagonal trap
            [[4, 3, 3,3,2],
             [3, 3, 3,3,3],
              [2, 3, 3,3,4]], // 4.4 Double bounce
            [[4, 0, 1], [0, 3, 2], [1, 2, 4]] // 4.5 The final exam (Blue + Yellow + Red)
        ]
    }
];

// Flatten the stages down into one master array of levels for the logic to use easily
const levels = stagesData.flatMap(stage => stage.levels);

// State variables
let currentGrid = [];
let currentLevelIndex = 0;
let unlockedLevelIndex = localStorage.getItem('myGame_unlockedLevel') 
    ? parseInt(localStorage.getItem('myGame_unlockedLevel')) 
    : 0;

const tileSize = 100;
let offsetX = 0;
let offsetY = 0;

let totalBlueTiles = 0;
let crossedBlueTiles = new Set(); 
let visitedTiles = []; 

// --- DYNAMIC MENU GENERATION ---
function buildMenu() {
    let html = '';
    let globalIndex = 0; // Tracks 0 through 19 across all stages

    stagesData.forEach(stage => {
        html += `<div class="stage-block">`;
        html += `<h2 class="stage-title">${stage.name}</h2>`;
        html += `<div class="level-grid">`;
        
        stage.levels.forEach((level, indexInStage) => {
            // Check if locked
            const isLocked = globalIndex > unlockedLevelIndex;
            const disabledAttr = isLocked ? 'disabled' : '';
            
            html += `<button class="level-btn" data-level="${globalIndex}" ${disabledAttr}>${indexInStage + 1}</button>`;
            globalIndex++;
        });

        html += `</div></div>`;
    });

    stagesContainer.innerHTML = html;

    // Attach click listeners to our newly minted buttons
    document.querySelectorAll('.level-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const levelIndex = parseInt(e.target.getAttribute('data-level'));
            loadLevel(levelIndex);
        });
    });
}

function loadLevel(levelIndex) {
    currentLevelIndex = levelIndex;
    currentGrid = levels[levelIndex];

    const gridWidth = currentGrid[0].length * tileSize;
    const gridHeight = currentGrid.length * tileSize;
    offsetX = (canvas.width - gridWidth) / 2;
    offsetY = (canvas.height - gridHeight) / 2;

    totalBlueTiles = 0;
    for (let row = 0; row < currentGrid.length; row++) {
        for (let col = 0; col < currentGrid[row].length; col++) {
            if (currentGrid[row][col] === 2) {
                totalBlueTiles++;
            }
        }
    }

    menuScreen.style.display = 'none';
    completionScreen.style.display = 'none';
    gameScreen.style.display = 'flex';

    drawGrid();
}

function levelComplete() {
    if (currentLevelIndex === unlockedLevelIndex && currentLevelIndex < levels.length - 1) {
        unlockedLevelIndex++;
        localStorage.setItem('myGame_unlockedLevel', unlockedLevelIndex);
    }
    
    buildMenu(); // Rebuild menu to update locks

    gameScreen.style.display = 'none';
    completionScreen.style.display = 'block';

    const nextBtn = document.getElementById('nextLevelBtn');
    if (currentLevelIndex >= levels.length - 1) {
        nextBtn.style.display = 'none';
    } else {
        nextBtn.style.display = 'inline-block';
    }
}

// Button Listeners
document.getElementById('backBtn').addEventListener('click', () => {
    gameScreen.style.display = 'none';
    menuScreen.style.display = 'block';
});

document.getElementById('completionMenuBtn').addEventListener('click', () => {
    completionScreen.style.display = 'none';
    menuScreen.style.display = 'block';
});

document.getElementById('nextLevelBtn').addEventListener('click', () => {
    loadLevel(currentLevelIndex + 1);
});

// Run once to set up the menu on page load
buildMenu();

// --- DRAWING THE GRID ---
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < currentGrid.length; row++) {
        for (let col = 0; col < currentGrid[row].length; col++) {
            let cellType = currentGrid[row][col];
            if (cellType === -1) continue; 

            let xPos = offsetX + (col * tileSize);
            let yPos = offsetY + (row * tileSize);

            ctx.fillStyle = colors[cellType];
            ctx.fillRect(xPos, yPos, tileSize, tileSize);
            
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 4;
            ctx.strokeRect(xPos, yPos, tileSize, tileSize);
        }
    }
}

// --- INTERACTION & COMPLETION LOGIC ---
let isDrawing = false;
let startTile = null;

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function getTileAtPos(x, y) {
    const col = Math.floor((x - offsetX) / tileSize);
    const row = Math.floor((y - offsetY) / tileSize);
    
    if (row >= 0 && row < currentGrid.length && col >= 0 && col < currentGrid[0].length) {
        return { row: row, col: col, type: currentGrid[row][col] };
    }
    return null; 
}

canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const pos = getMousePos(e);
    const clickedTile = getTileAtPos(pos.x, pos.y);
    
    crossedBlueTiles.clear();
    visitedTiles = []; 
    
    if (clickedTile && clickedTile.type === 4) {
        startTile = clickedTile;
        visitedTiles.push(clickedTile); 
    } else {
        startTile = null;
    }

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const pos = getMousePos(e);
    const currentTile = getTileAtPos(pos.x, pos.y);
    
    // 1. Off-grid, empty space, or red walls
    if (!currentTile || currentTile.type === -1 || currentTile.type === 1) {
        isDrawing = false; 
        drawGrid();        
        return;            
    }

    // --- NEW: GREEN TILE LOGIC (ENTRY) ---
    if (currentTile.type === 4) {
        // Check if this is the exact tile we started drawing on
        const isStartTile = (startTile && currentTile.row === startTile.row && currentTile.col === startTile.col);
        
        // If it is NOT the start tile, check if we've earned the right to touch it
        if (!isStartTile) {
            const allBluesCrossed = (crossedBlueTiles.size === totalBlueTiles);
            if (!allBluesCrossed) {
                isDrawing = false; // Haven't touched all blue tiles yet!
                drawGrid();
                return;
            }
        }
    }

    const lastTile = visitedTiles[visitedTiles.length - 1];
    
    // Only process logic if we've entered a physically NEW tile
    if (currentTile.row !== lastTile.row || currentTile.col !== lastTile.col) {
        
        // --- NEW: GREEN TILE LOGIC (EXIT) ---
        // Prevent drawing THROUGH an ending green tile
        if (lastTile.type === 4 && (lastTile.row !== startTile.row || lastTile.col !== startTile.col)) {
            isDrawing = false; 
            drawGrid();
            return;
        }

        // BOUNCER LOGIC
        if (visitedTiles.length >= 2) {
            const prevTile = lastTile; 
            const prePrevTile = visitedTiles[visitedTiles.length - 2]; 

            if (prevTile.type === 3) {
                const dRowIn = prevTile.row - prePrevTile.row;
                const dColIn = prevTile.col - prePrevTile.col;
                const dRowOut = currentTile.row - prevTile.row;
                const dColOut = currentTile.col - prevTile.col;

                if (dRowIn === dRowOut && dColIn === dColOut) {
                    isDrawing = false; 
                    drawGrid();
                    return;
                }
            }
        }

        visitedTiles.push(currentTile);

        if (currentTile.type === 2) {
            crossedBlueTiles.add(`${currentTile.row},${currentTile.col}`);
        }
    }
    
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
});

canvas.addEventListener('mouseup', (e) => {
    if (!isDrawing) return;
    isDrawing = false;
    
    const pos = getMousePos(e);
    const endTile = getTileAtPos(pos.x, pos.y);
    const allBluesCrossed = (crossedBlueTiles.size === totalBlueTiles);

    if (endTile && endTile.type === 4 && startTile && (endTile.row !== startTile.row || endTile.col !== startTile.col) && allBluesCrossed) {
        levelComplete();
    } else {
        drawGrid();
    }
});

canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
    drawGrid(); 
});