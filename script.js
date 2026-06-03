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
    4: '#32cd32', // Green (Start/End)
    5: '#ff8800', // Orange (Toggle 0/1)
    6: '#00ffff', // Cyan (Forced Straight)
    7: '#9932cc'  // NEW: Purple (Overpass / Line Crossing Allowance)
};

// Organize levels into stages!
const stagesData = [
    {
        name: "Stage 1:",
        levels: [
            [[4,4]], // 1.1 Straight line
            [[4, 0, 4]], // 1.2 Corner
            [[4, 0, 0],[0, 0, 4]], // 1.3 The hole
            [[0, 0, 0, 4], [4, 0, 0, 0]], // 1.4 The U-Turn
            [[4, 0, 0, 0, 0], 
            [0, 0, 0, 0, 0], 
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
             [4,0,0,0,0],
             [1,1,1,1,0], 
             [4,0,0,0,0]
            ], // 2.4 Squeeze
            [[4, 1, 0, 0, 0],
             [0, 1, 0, 1, 0],
             [0, 0, 0, 1, 4]] // 2.5 Dead end trap
        ]
    },
    {
        name: "Stage 3:",
        levels: [
            [[4, 0, 0], [1, 1, 2], [4, 0, 0]], // 3.2 Forced visit
            [[4, 0, 4], [0, 0, 0], [0, 2, 0]], // 3.3 Out of the way
            [[4, 2, 2, 4], [0, 2, 2, 0]], // 3.4 Double tap
            [[4, 0, 4], [1, 0, 1], [0, 0, 0], [2, 1, 2]], // 3.5 Backtrack
            [
    [4, 1, 1, 1, 1],
    [0, 0, 0, 2, 2],
    [4, 1, 0, 0, 0]
],
        ]
    },
    {
        name: "Stage 4:",
        levels: [
            [[4, 0, 3],
             [1, 1, 0],
             [4, 0, 3]], // 4.1 The bounce
            [[4, 3, 0],
             [0, 1, 3],
             [0, 0, 4]], // 4.2 The stairs
            [[1, 4, 1],
             [0, 3, 0],
              [1, 4, 1]], // 4.5 The final exam
            [[4, 1, 3, 3, 2],
             [0, 0, 0, 3, 3],
             [4, 1, 1, 1, 2]], // 4.3 Diagonal trap
            [[4, 3, 3,3,2],
             [3, 3, 3,3,3],
              [2, 3, 3,3,4]], // 4.4 Double bounce
        ]
    },
        { name: "Stage 5:",
         levels: [
            [
                [0,5,0,1,1],
                [4,0,0,1,4],
                [0,0,5,1,1],
            ],
            [
                [4,5,0,2,4],
                [0,0,1,5,0],
                [0,1,1,1,5],
                [2,0,5,0,2],
                [5,1,1,1,0],
            ],
            [
                [4,0,0,3,2],
                [0,3,1,1,1],
                [3,0,1,0,5],
                [0,1,1,2,3],
                [5,1,0,0,4],
            ],
            [
                [2,3,1,3,4],
                [3,1,0,5,3],
                [1,0,1,0,1],
                [3,5,0,1,3],
                [4,3,1,3,2],
            ],
            [
                [4,0,5,1,2],
                [0,3,3,2,0],
                [5,3,2,3,5],
                [1,2,3,3,1],
                [2,0,5,1,4],
            ],
        ]
    },
    {
        name: "Stage 6:",
        levels: [
[
    [4, 6, 0],
    [1, 1, 6],
    [4, 6, 0]
],
            [
                [4,0,1,3,1],
                [0,6,6,5,6],
                [0,3,1,0,4],
            ],
            [
    [4, 0, 6, 0, 2],
    [0, 6, 0, 6, 1],
    [6, 0, 5, 1, 6],
    [0, 6, 1, 6, 1],
    [2, 1, 6, 1, 4]
],
[
    [4, 0, 1, 1, 0, 2],
    [0, 6, 6, 3, 6, 0],
    [0, 6, 0, 0, 6, 1],
    [1, 5, 0, 5, 6, 1],
    [0, 6, 6, 6, 6, 0],
    [2, 1, 0, 5, 1, 4]
],
            [
                [4,0,0,1,1,0,0,2],
                [0,0,0,2,1,0,0,5],
                [3,6,3,6,3,6,3,6],
                [6,3,6,3,6,3,6,3],
                [5,0,0,1,2,0,0,0],
                [2,0,0,1,1,0,0,4],
            ],
        ]
    },
    {
        name: "Stage 7:",
        levels: [
                        [
    [4, 0, 1, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 0, 6, 2, 0],
    [0, 1, 2, 1, 1],
    [7, 1, 5, 1, 4]
],
            [
    [4, 1, 2, 0, 0],
    [7, 1, 2, 1, 0],
    [0, 0, 0, 0, 4]
],

[
    [4, 1, 1, 1, 7],
    [0, 0, 2, 2, 0],
    [4, 1, 1, 1, 7]
],
[
    [4, 0, 0, 0, 0, 7],
    [1, 1, 1, 1, 0, 1],
    [7, 0, 2, 0, 2, 0],
    [0, 1, 0, 1, 0, 1],
    [0, 7, 1, 3, 6, 4],
    [1, 1, 1, 0, 0, 1]
],
[
    [4, 0, 1, 5, 1, 1, 7],
    [3, 6, 6, 6, 0, 2, 0],
    [0, 2, 1, 3, 6, 6, 6],
    [3, 6, 6, 6, 1, 2, 2],
    [0, 2, 0, 3, 6, 6, 3],
    [7, 1, 1, 5, 1, 0, 4]
],
        ]
    },
];

// Flatten the stages down into one master array of levels for the logic to use easily
const levels = stagesData.flatMap(stage => stage.levels);

// State variables
let baseGrid = []; // Stores the original level layout
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
let crossedOverpassTiles = new Set();        // Tracks unique purple tiles stepped on
let currentIntersectionCount = 0;           // Tracks total line crossings on the board
let isCurrentVisitARevisit = false;         // Tracks if current blue tile is an old one
let hasIntersectsInCurrentBlueVisit = false; // Verifies if a line crossing happened inside it
let visitedTiles = []; 
let drawnPoints = []; // Tracks exact pixel points of the drawn line

// --- DYNAMIC MENU GENERATION ---
function buildMenu() {
    let html = '';
    let globalIndex = 0; 

    stagesData.forEach(stage => {
        html += `<div class="stage-block">`;
        html += `<h2 class="stage-title">${stage.name}</h2>`;
        html += `<div class="level-grid">`;
        
        stage.levels.forEach((level, indexInStage) => {
            const isLocked = globalIndex > unlockedLevelIndex;
            const disabledAttr = isLocked ? 'disabled' : '';
            
            html += `<button class="level-btn" data-level="${globalIndex}" ${disabledAttr}>${indexInStage + 1}</button>`;
            globalIndex++;
        });

        html += `</div></div>`;
    });

    stagesContainer.innerHTML = html;

    document.querySelectorAll('.level-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const levelIndex = parseInt(e.target.getAttribute('data-level'));
            loadLevel(levelIndex);
        });
    });
}

function loadLevel(levelIndex) {
    currentLevelIndex = levelIndex;
    
    // Save the original and clone it for playing
    baseGrid = levels[levelIndex];
    currentGrid = JSON.parse(JSON.stringify(baseGrid));

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
    
    buildMenu(); 

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
    // Reset grid to original state on new attempt
    currentGrid = JSON.parse(JSON.stringify(baseGrid));
    drawGrid();

    isDrawing = true;
    const pos = getMousePos(e);
    const clickedTile = getTileAtPos(pos.x, pos.y);
    
    crossedBlueTiles.clear();
    crossedOverpassTiles.clear(); 
    currentIntersectionCount = 0; 
    isCurrentVisitARevisit = false;
    hasIntersectsInCurrentBlueVisit = false;
    visitedTiles = []; 
    drawnPoints = [pos]; 
    
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

    const newPoint = pos;
    const currentPoint = drawnPoints[drawnPoints.length - 1];
    const currentTile = getTileAtPos(pos.x, pos.y);

    // SMOOTHING / MINIMUM DISTANCE CHECK
    const dx = newPoint.x - currentPoint.x;
    const dy = newPoint.y - currentPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    let intersectionsThisFrame = 0;

    if (distance > 8) {
        if (drawnPoints.length > 2) {
            for (let i = 0; i < drawnPoints.length - 2; i++) {
                const p1 = drawnPoints[i];
                const p2 = drawnPoints[i + 1];

                if (linesIntersect(p1, p2, currentPoint, newPoint)) {
                    intersectionsThisFrame++;
                    
                    // Mark if an intersection happens inside an already-visited blue tile
                    if (currentTile && currentTile.type === 2 && crossedBlueTiles.has(`${currentTile.row},${currentTile.col}`)) {
                        hasIntersectsInCurrentBlueVisit = true;
                    }
                }
            }
        }

        if (intersectionsThisFrame > 0) {
            currentIntersectionCount += intersectionsThisFrame;
            // Rule check: Have we crossed our line more times than unique purple tokens collected?
            if (currentIntersectionCount > crossedOverpassTiles.size) {
                isDrawing = false; 
                drawGrid();        
                return;            
            }
        }
        drawnPoints.push(newPoint); 
    }

    if (!currentTile || currentTile.type === -1 || currentTile.type === 1) {
        isDrawing = false; 
        drawGrid();        
        return;            
    }

    if (currentTile.type === 4) {
        const isStartTile = (startTile && currentTile.row === startTile.row && currentTile.col === startTile.col);
        
        if (!isStartTile) {
            const allBluesCrossed = (crossedBlueTiles.size === totalBlueTiles);
            if (!allBluesCrossed) {
                isDrawing = false; 
                drawGrid();
                return;
            }
        }
    }

    const lastTile = visitedTiles[visitedTiles.length - 1];
    
    if (currentTile.row !== lastTile.row || currentTile.col !== lastTile.col) {
        
        if (lastTile.type === 4 && (lastTile.row !== startTile.row || lastTile.col !== startTile.col)) {
            isDrawing = false; 
            drawGrid();
            return;
        }

        // PREVIOUS TILE CHECKING LOGIC
        if (visitedTiles.length >= 2) {
            const prevTile = lastTile; 
            const prePrevTile = visitedTiles[visitedTiles.length - 2]; 

            const dRowIn = prevTile.row - prePrevTile.row;
            const dColIn = prevTile.col - prePrevTile.col;
            const dRowOut = currentTile.row - prevTile.row;
            const dColOut = currentTile.col - prevTile.col;

            // YELLOW TILE: Must turn
            if (prevTile.type === 3) {
                if (dRowIn === dRowOut && dColIn === dColOut) {
                    isDrawing = false; 
                    drawGrid();
                    return;
                }
            }

            // CYAN TILE: Must go straight
            if (prevTile.type === 6) {
                if (dRowIn !== dRowOut || dColIn !== dColOut) {
                    isDrawing = false; 
                    drawGrid();
                    return;
                }
            }
        }

        // EXITING TILE GATEKEEPER: If leaving a revisited blue tile, verify an intersection actually happened
        if (lastTile.type === 2 && isCurrentVisitARevisit) {
            if (!hasIntersectsInCurrentBlueVisit) {
                isDrawing = false; 
                drawGrid();        
                return;   
            }
        }

        visitedTiles.push(currentTile);

        // ORANGE TILE LOGIC (THE SWAP)
        if (currentTile.type === 5) {
            for (let r = 0; r < currentGrid.length; r++) {
                for (let c = 0; c < currentGrid[r].length; c++) {
                    if (currentGrid[r][c] === 0) {
                        currentGrid[r][c] = 1;
                    } else if (currentGrid[r][c] === 1) {
                        currentGrid[r][c] = 0;
                    }
                }
            }
            drawGrid();     
            redrawPath();   
        }

        // BLUE TILE HANDLING
        if (currentTile.type === 2) {
            const tileKey = `${currentTile.row},${currentTile.col}`;
            
            if (crossedBlueTiles.has(tileKey)) {
                // This is a re-entry. Initialize tracking flags.
                isCurrentVisitARevisit = true;
                hasIntersectsInCurrentBlueVisit = (intersectionsThisFrame > 0);
            } else {
                // First time visit is always allowed naturally.
                isCurrentVisitARevisit = false;
                hasIntersectsInCurrentBlueVisit = false;
            }
            
            crossedBlueTiles.add(tileKey);
        }

        // PURPLE TILE COLLECTION LOGIC
        if (currentTile.type === 7) {
            const tileKey = `${currentTile.row},${currentTile.col}`;
            crossedOverpassTiles.add(tileKey);
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

// --- UTILITY FUNCTIONS ---

function redrawPath() {
    if (drawnPoints.length === 0) return;
    ctx.beginPath();
    ctx.moveTo(drawnPoints[0].x, drawnPoints[0].y);
    for (let i = 1; i < drawnPoints.length; i++) {
        ctx.lineTo(drawnPoints[i].x, drawnPoints[i].y);
    }
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
}

function linesIntersect(p1, p2, p3, p4) {
    function ccw(A, B, C) {
        return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
    }
    return (ccw(p1, p3, p4) !== ccw(p2, p3, p4)) && (ccw(p1, p2, p3) !== ccw(p1, p2, p4));
}