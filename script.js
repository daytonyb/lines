// --- UI Elements ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const menuScreen = document.getElementById('menuScreen');
const gameScreen = document.getElementById('gameScreen');
const completionScreen = document.getElementById('completionScreen');
const stagesContainer = document.getElementById('stagesContainer');

// Mode Selection Elements
const modeScreen = document.getElementById('modeScreen');
const colorModeBtn = document.getElementById('colorModeBtn');
const shapeModeBtn = document.getElementById('shapeModeBtn');
const backToModesBtn = document.getElementById('backToModesBtn');

// --- GAME DATA ---
const colors = {
    '-1': '#1e1e1e', // Void / Empty space
    0: '#444444',    // Grey path (Color Mode)
    1: '#ff4444',    // Red (Avoid)
    2: '#4444ff',    // Blue (Must Cross)
    3: '#ffcc00',    // Yellow (Forced Turn)
    4: '#32cd32',    // Green (Start/End Terminals)
    5: '#ff8800',    // Orange (Toggle 0/1)
    6: '#00ffff',    // Cyan (Forced Straight)
    7: '#9932cc'     // Purple (Overpass)
};

// Pool 1: Color Mode Stages (Standard Cell-Based Movement)
const colorStagesData = [
    {
        name: "Color Stage 1:",
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
        name: "Color Stage 2:",
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
        name: "Color Stage 3:",
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
        name: "Color Stage 4:",
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
    { 
        name: "Color Stage 5:",
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
        name: "Color Stage 6:",
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
        name: "Color Stage 7:",
        levels: [
            [
                [4, 0, 1, 0, 0],
                [0, 1, 0, 0, 0],
                [0, 0, 6, 2, 0],
                [0, 1, 2, 1, 1],
                [7, 1, 5, 1, 4]
            ],
            [
                [4, 1, 2, 1],
                [7, 1, 2, 1],
                [0, 0, 0, 4]
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

// Pool 2: Shape Mode Stages
const shapeStagesData = [
    {
        name: "Shape Stage 1:",
        levels: [
            {
                grid: [
                    [0, 0, 0],
                    [4, 0, 4],
                    [0, 0, 0]
                ],
                cells: [
                    [0, 0], // Empty panels ready for rules
                    [0, 0]
                ]
            },
            {
                grid: [
                    [4, 0, 0],
                    [0, 0, 0],
                    [0, 0, 4]
                ],
                cells: [
                    [0, 0, 0], // Black and White Squares are supported!
                    [0, 0, 0]
                ]
            },
                        {
                grid: [
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                    [4, 0, 0, 4]
                ],
                cells: [
                    [0, 0, 0], // Black and White Squares are supported!
                    [0, 0, 0]
                ]
            },
                        {
                grid: [
                    [4, 0, 0, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 4]
                ],
                cells: [
                    [0, 0, 0], // Black and White Squares are supported!
                    [0, 0, 0]
                ]
            },
                        {
                grid: [
                    [4, 0, 0,0, 0],
                    [0, 0, 0,0, 0],
                    [0, 0, 0,0, 4]
                ],
                cells: [
                    [0, 0, 0], // Black and White Squares are supported!
                    [0, 0, 0]
                ]
            },
        ]
    },
    {
        name: "Shape Stage 2:",
        levels: [
{
    grid: [
        [4, 0],
        [0, 4]
    ],
    cells: [
        [1]
    ]
},
            {
    grid: [
        [4, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 4]
    ],
    cells: [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0]
    ]
},
{
    grid: [
        [4, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 4]
    ],
    cells: [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
    ]
},
{
    grid: [
        [4, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [4, 0, 0, 0, 0]
    ],
    cells: [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
    ]
},
{
    grid: [
        [4, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 4]
    ],
    cells: [
        [0, 0, 1, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 1, 0, 1]
    ]
},
        ]
    },
    {
        name: "Shape Stage 3:",
        levels: [
            {
    grid: [
        [0, 0],
        [0, 0],
        [0, 0],
        [4, 4]
    ],
    cells: [
        [0],
        [2],
        [0]
    ]
},
{
    grid: [
        [4, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 4]
    ],
    cells: [
        [0, 0, 0],
        [0, 2, 0],
        [0, 0, 0]
    ]
},
{
    grid: [
        [4, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 4]
    ],
    cells: [
        [0, 0, 0, 0, 0],
        [0, 2, 1, 2, 0],
        [0, 0, 0, 0, 0]
    ]
},
{
    grid: [
        [4, 0, 0, 0, 0, 4],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0]
    ],
    cells: [
        [0, 0, 0, 0, 0],
        [0, 2, 0, 2, 0],
        [0, 1, 2, 1, 0],
        [0, 0, 0, 0, 0]
    ]
},
{
    grid: [
        [4, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 4]
    ],
    cells: [
        [0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 2, 0, 0, 2],
        [0, 1, 2, 0, 0],
        [1, 0, 0, 0, 0]
    ]
},
        ]
    },
    {
        name: "Shape Stage 4:",
        levels: [
{
    grid: [
        [4, 0],
        [0, 0],
        [0, 4]
    ],
    cells: [
        [3],
        [3]
    ]
},
{
    grid: [
        [4, 0, 0],
        [0, 0, 0],
        [0, 0, 4]
    ],
    cells: [
        [0, 3],
        [3, 0]
    ]
},
{
    grid: [
        [4, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 4]
    ],
    cells: [
        [0, 0, 0, 0],
        [0, 0, 3, 0],
        [3, 3, 0, 0],
        [0, 3, 0, 0]
    ]
},
{
    grid: [
        [4, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 4]
    ],
    cells: [
        [0, 0, 0, 3, 0],
        [0, 3, 3, 1, 3],
        [0, 2, 2, 3, 0],
        [0, 1, 0, 3, 0],
        [0, 0, 0, 0, 0]
    ]
},
{
    grid: [
        [4, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 4]
    ],
    cells: [
        [0, 0, 0, 0, 0],
        [0, 0, 1, 0, 3],
        [3, 0, 2, 1, 3],
        [0, 1, 0, 0, 0],
        [0, 3, 0, 0, 0]
    ]
},
        ],
    },
];



// State variables
let baseGrid = [];
let currentGrid = [];
let currentCells = []; 
let currentLevelIndex = 0;
let currentGameMode = 'color'; 

const tileSize = 100;
let offsetX = 0;
let offsetY = 0;

let totalBlueTiles = 0;
let crossedBlueTiles = new Set(); 
let crossedOverpassTiles = new Set();        
let currentIntersectionCount = 0;           
let isCurrentVisitARevisit = false;         
let hasIntersectsInCurrentBlueVisit = false; 
let visitedTiles = []; 
let drawnPoints = [];
let currentMousePos = null;

// --- PROGRESSION HELPERS ---
// This is where the game tracks locks completely independently!
function getUnlockedIndex() {
    const key = `myGame_unlockedLevel_${currentGameMode}`;
    return localStorage.getItem(key) ? parseInt(localStorage.getItem(key)) : 0;
}

function setUnlockedIndex(val) {
    const key = `myGame_unlockedLevel_${currentGameMode}`;
    localStorage.setItem(key, val);
}

function getActiveStagesData() {
    return currentGameMode === 'color' ? colorStagesData : shapeStagesData;
}

function getActiveLevelsFlattened() {
    return getActiveStagesData().flatMap(stage => stage.levels);
}

// --- MENU BUILDER ---
function buildMenu() {
    let html = '';
    let globalIndex = 0; 
    
    const targetStages = getActiveStagesData();
    const unlockedLevelIndex = getUnlockedIndex(); // Grabs the correct mode lock value

    targetStages.forEach(stage => {
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
    const activePool = getActiveLevelsFlattened();
    const rawLevel = activePool[levelIndex];

    if (currentGameMode === 'color') {
        baseGrid = rawLevel;
        currentGrid = JSON.parse(JSON.stringify(baseGrid));
        currentCells = [];
    } else {
        baseGrid = rawLevel.grid;
        currentGrid = JSON.parse(JSON.stringify(baseGrid));
        currentCells = rawLevel.cells ? JSON.parse(JSON.stringify(rawLevel.cells)) : [];
    }

    const gridWidth = (currentGrid[0].length - (currentGameMode === 'shape' ? 1 : 0)) * tileSize;
    const gridHeight = (currentGrid.length - (currentGameMode === 'shape' ? 1 : 0)) * tileSize;
    offsetX = (canvas.width - gridWidth) / 2;
    offsetY = (canvas.height - gridHeight) / 2;

    totalBlueTiles = 0;
    if (currentGameMode === 'color') {
        for (let row = 0; row < currentGrid.length; row++) {
            for (let col = 0; col < currentGrid[row].length; col++) {
                if (currentGrid[row][col] === 2) totalBlueTiles++;
            }
        }
    }

    menuScreen.style.display = 'none';
    completionScreen.style.display = 'none';
    gameScreen.style.display = 'flex';

    drawGrid();
}

function levelComplete() {
    const unlockedLevelIndex = getUnlockedIndex();
    const activePool = getActiveLevelsFlattened();

    // Unlock the next level securely
    if (currentLevelIndex === unlockedLevelIndex && currentLevelIndex < activePool.length - 1) {
        setUnlockedIndex(unlockedLevelIndex + 1);
    }
    
    buildMenu(); 
    gameScreen.style.display = 'none';
    completionScreen.style.display = 'block';

    const nextBtn = document.getElementById('nextLevelBtn');
    if (currentLevelIndex >= activePool.length - 1) {
        nextBtn.style.display = 'none';
    } else {
        nextBtn.style.display = 'inline-block';
    }
}

// --- NAVIGATION LISTENERS ---
colorModeBtn.addEventListener('click', () => {
    currentGameMode = 'color';
    buildMenu();
    modeScreen.style.display = 'none';
    menuScreen.style.display = 'block';
});

shapeModeBtn.addEventListener('click', () => {
    currentGameMode = 'shape';
    buildMenu();
    modeScreen.style.display = 'none';
    menuScreen.style.display = 'block';
});

backToModesBtn.addEventListener('click', () => {
    menuScreen.style.display = 'none';
    modeScreen.style.display = 'block';
});

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

buildMenu();

// --- ENGINE RENDERING LAYER ---
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentGameMode === 'color') {
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
    else if (currentGameMode === 'shape') {
        for (let row = 0; row < currentGrid.length - 1; row++) {
            for (let col = 0; col < currentGrid[row].length - 1; col++) {
                let padding = 14;
                let x = offsetX + (col * tileSize) + padding;
                let y = offsetY + (row * tileSize) + padding;
                let size = tileSize - (padding * 2);

                ctx.fillStyle = '#282828';
                ctx.fillRect(x, y, size, size);
                
                let shapeType = currentCells[row] ? currentCells[row][col] : 0;
                if (shapeType > 0) {
                    ctx.save();
                    let cx = x + size / 2;
                    let cy = y + size / 2;

                    if (shapeType === 1) { // Black Square
                        ctx.fillStyle = '#000000';
                        ctx.strokeStyle = '#444';
                        ctx.lineWidth = 2;
                        ctx.fillRect(cx - 14, cy - 14, 28, 28);
                        ctx.strokeRect(cx - 14, cy - 14, 28, 28);
                    } 
                    else if (shapeType === 2) { // White Square
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(cx - 14, cy - 14, 28, 28);
                    } 
                    else if (shapeType === 3) { // Star Symbol
                        ctx.fillStyle = '#ffcc00';
                        ctx.beginPath();
                        ctx.moveTo(cx, cy - 18);
                        ctx.lineTo(cx + 14, cy);
                        ctx.lineTo(cx, cy + 18);
                        ctx.lineTo(cx - 14, cy);
                        ctx.closePath();
                        ctx.fill();
                    }
                    ctx.restore();
                }
            }
        }

        ctx.strokeStyle = '#444446';
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let row = 0; row < currentGrid.length; row++) {
            for (let col = 0; col < currentGrid[row].length; col++) {
                let x1 = offsetX + col * tileSize;
                let y1 = offsetY + row * tileSize;

                if (col + 1 < currentGrid[row].length) {
                    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + tileSize, y1); ctx.stroke();
                }
                if (row + 1 < currentGrid.length) {
                    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1, y1 + tileSize); ctx.stroke();
                }
            }
        }

        for (let row = 0; row < currentGrid.length; row++) {
            for (let col = 0; col < currentGrid[row].length; col++) {
                if (currentGrid[row][col] === 4) {
                    let x = offsetX + col * tileSize;
                    let y = offsetY + row * tileSize;
                    ctx.beginPath();
                    ctx.arc(x, y, 18, 0, Math.PI * 2);
                    ctx.fillStyle = colors[4]; 
                    ctx.fill();
                    ctx.strokeStyle = '#111';
                    ctx.lineWidth = 3;
                    ctx.stroke();
                }
            }
        }
    }
}

// --- CORE INTERACTION MECHANICS ---
let isDrawing = false;
let startTile = null;

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function getTileAtPos(x, y) {
    const col = currentGameMode === 'color' ? Math.floor((x - offsetX) / tileSize) : Math.round((x - offsetX) / tileSize);
    const row = currentGameMode === 'color' ? Math.floor((y - offsetY) / tileSize) : Math.round((y - offsetY) / tileSize);
    
    if (row >= 0 && row < currentGrid.length && col >= 0 && col < currentGrid[0].length) {
        return { row: row, col: col, type: currentGrid[row][col] };
    }
    return null; 
}

canvas.addEventListener('mousedown', (e) => {
    if (currentGameMode === 'color') {
        currentGrid = JSON.parse(JSON.stringify(baseGrid));
    }
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
    currentMousePos = pos;

    if (clickedTile && clickedTile.type === 4) {
        if (currentGameMode === 'shape') {
            let nodeX = offsetX + clickedTile.col * tileSize;
            let nodeY = offsetY + clickedTile.row * tileSize;
            if (Math.sqrt((pos.x - nodeX)**2 + (pos.y - nodeY)**2) > 28) { isDrawing = false; return; }
        }
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
    currentMousePos = pos;

    const currentTile = getTileAtPos(pos.x, pos.y);

    if (currentGameMode === 'color') {
        const newPoint = pos;
        const currentPoint = drawnPoints[drawnPoints.length - 1];
        const dx = newPoint.x - currentPoint.x;
        const dy = newPoint.y - currentPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let intersectionsThisFrame = 0;

        if (distance > 8) {
            if (drawnPoints.length > 2) {
                for (let i = 0; i < drawnPoints.length - 2; i++) {
                    if (linesIntersect(drawnPoints[i], drawnPoints[i+1], currentPoint, newPoint)) {
                        intersectionsThisFrame++;
                        if (currentTile && currentTile.type === 2 && crossedBlueTiles.has(`${currentTile.row},${currentTile.col}`)) {
                            hasIntersectsInCurrentBlueVisit = true;
                        }
                    }
                }
            }

            if (intersectionsThisFrame > 0) {
                currentIntersectionCount += intersectionsThisFrame;
                if (currentIntersectionCount > crossedOverpassTiles.size) { isDrawing = false; drawGrid(); return; }
            }
            drawnPoints.push(newPoint); 
        }

        if (!currentTile || currentTile.type === -1 || currentTile.type === 1) { isDrawing = false; drawGrid(); return; }

        if (currentTile.type === 4) {
            const isStartTile = (startTile && currentTile.row === startTile.row && currentTile.col === startTile.col);
            if (!isStartTile && crossedBlueTiles.size !== totalBlueTiles) { isDrawing = false; drawGrid(); return; }
        }

        const lastTile = visitedTiles[visitedTiles.length - 1];
        if (currentTile.row !== lastTile.row || currentTile.col !== lastTile.col) {
            if (lastTile.type === 4 && (lastTile.row !== startTile.row || lastTile.col !== startTile.col)) { isDrawing = false; drawGrid(); return; }

            if (visitedTiles.length >= 2) {
                const prevTile = lastTile; 
                const prePrevTile = visitedTiles[visitedTiles.length - 2]; 
                const dRowIn = prevTile.row - prePrevTile.row; const dColIn = prevTile.col - prePrevTile.col;
                const dRowOut = currentTile.row - prevTile.row; const dColOut = currentTile.col - prevTile.col;

                if (prevTile.type === 3 && dRowIn === dRowOut && dColIn === dColOut) { isDrawing = false; drawGrid(); return; }
                if (prevTile.type === 6 && (dRowIn !== dRowOut || dColIn !== dColOut)) { isDrawing = false; drawGrid(); return; }
            }

            if (lastTile.type === 2 && isCurrentVisitARevisit && !hasIntersectsInCurrentBlueVisit) { isDrawing = false; drawGrid(); return; }

            visitedTiles.push(currentTile);

            if (currentTile.type === 5) {
                for (let r = 0; r < currentGrid.length; r++) {
                    for (let c = 0; c < currentGrid[r].length; c++) {
                        if (currentGrid[r][c] === 0) currentGrid[r][c] = 1;
                        else if (currentGrid[r][c] === 1) currentGrid[r][c] = 0;
                    }
                }
                drawGrid(); redrawPath();   
            }

            if (currentTile.type === 2) {
                const tileKey = `${currentTile.row},${currentTile.col}`;
                isCurrentVisitARevisit = crossedBlueTiles.has(tileKey);
                hasIntersectsInCurrentBlueVisit = false;
                crossedBlueTiles.add(tileKey);
            }

            if (currentTile.type === 7) crossedOverpassTiles.add(`${currentTile.row},${currentTile.col}`);
        }
        drawGrid();
        redrawPath();
    } 
    else if (currentGameMode === 'shape') {
        if (!currentTile || currentTile.type === -1) return;

        let targetX = offsetX + currentTile.col * tileSize;
        let targetY = offsetY + currentTile.row * tileSize;
        let gapToIntersection = Math.sqrt((pos.x - targetX)**2 + (pos.y - targetY)**2);

        if (gapToIntersection < 32) {
            const lastTile = visitedTiles[visitedTiles.length - 1];

            if (currentTile.row !== lastTile.row || currentTile.col !== lastTile.col) {
                const dRow = Math.abs(currentTile.row - lastTile.row);
                const dCol = Math.abs(currentTile.col - lastTile.col);

                if (dRow + dCol === 1) {
                    if (visitedTiles.length >= 2) {
                        const previousNode = visitedTiles[visitedTiles.length - 2];
                        if (currentTile.row === previousNode.row && currentTile.col === previousNode.col) {
                            visitedTiles.pop();
                            drawGrid();
                            redrawPath();
                            return;
                        }
                    }

                    if (visitedTiles.some(t => t.row === currentTile.row && t.col === currentTile.col)) {
                        return;
                    }

                    visitedTiles.push(currentTile);
                }
            }
        }
        drawGrid();
        redrawPath();
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (!isDrawing) return;
    isDrawing = false;
    
    const pos = getMousePos(e);
    const endTile = getTileAtPos(pos.x, pos.y);

    if (endTile && endTile.type === 4 && startTile && (endTile.row !== startTile.row || endTile.col !== startTile.col)) {
        
        // --- WIN CONDITION CHECKS ---
        if (currentGameMode === 'shape') {
            if (validateShapeRules()) {
                levelComplete();
            } else {
                // Flash the screen or just reset if they failed the rules
                drawGrid();
            }
        } else if (crossedBlueTiles.size === totalBlueTiles) {
            levelComplete(); 
        }
        
    } else {
        drawGrid(); // Resets path if dropped early
    }
});

canvas.addEventListener('mouseleave', () => {
    isDrawing = false;
    drawGrid(); 
});

// --- UTILITY VECTOR DRAW LAYER ---
function redrawPath() {
    if (visitedTiles.length === 0) return;
    
    ctx.beginPath();
    let startX = currentGameMode === 'color' ? visitedTiles[0].col * tileSize + tileSize/2 : visitedTiles[0].col * tileSize;
    let startY = currentGameMode === 'color' ? visitedTiles[0].row * tileSize + tileSize/2 : visitedTiles[0].row * tileSize;
    ctx.moveTo(offsetX + startX, offsetY + startY);

    if (currentGameMode === 'color') {
        for (let i = 1; i < drawnPoints.length; i++) {
            ctx.lineTo(drawnPoints[i].x, drawnPoints[i].y);
        }
    } else {
        for (let i = 1; i < visitedTiles.length; i++) {
            ctx.lineTo(offsetX + visitedTiles[i].col * tileSize, offsetY + visitedTiles[i].row * tileSize);
        }
        if (isDrawing && currentMousePos) {
            ctx.lineTo(currentMousePos.x, currentMousePos.y);
        }
    }

    ctx.strokeStyle = currentGameMode === 'color' ? 'white' : '#0098ff'; 
    ctx.lineWidth = currentGameMode === 'color' ? 5 : 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
}

function linesIntersect(p1, p2, p3, p4) {
    function ccw(A, B, C) { return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x); }
    return (ccw(p1, p3, p4) !== ccw(p2, p3, p4)) && (ccw(p1, p2, p3) !== ccw(p1, p2, p4));
}

// --- SHAPE MODE RULE VALIDATION ---
function validateShapeRules() {
    // 1. Build a record of every grid line the player drew over
    let drawnEdges = new Set();
    
    function getEdgeString(r1, c1, r2, c2) {
        // Sort the coordinates so direction doesn't matter (A to B is the same as B to A)
        if (r1 < r2 || (r1 === r2 && c1 < c2)) return `${r1},${c1}-${r2},${c2}`;
        return `${r2},${c2}-${r1},${c1}`;
    }

    for (let i = 0; i < visitedTiles.length - 1; i++) {
        let t1 = visitedTiles[i];
        let t2 = visitedTiles[i+1];
        drawnEdges.has(getEdgeString(t1.row, t1.col, t2.row, t2.col));
        drawnEdges.add(getEdgeString(t1.row, t1.col, t2.row, t2.col));
    }

    let totalTriangles = 0;

    // 2. Check Black and White Square edge rules
    for (let r = 0; r < currentCells.length; r++) {
        for (let c = 0; c < currentCells[r].length; c++) {
            let cellType = currentCells[r][c];
            if (cellType === 0) continue;

            // Check the 4 borders of the current cell
            let topDrawn = drawnEdges.has(getEdgeString(r, c, r, c+1));
            let bottomDrawn = drawnEdges.has(getEdgeString(r+1, c, r+1, c+1));
            let leftDrawn = drawnEdges.has(getEdgeString(r, c, r+1, c));
            let rightDrawn = drawnEdges.has(getEdgeString(r, c+1, r+1, c+1));
            
            let edgeCount = (topDrawn ? 1 : 0) + (bottomDrawn ? 1 : 0) + (leftDrawn ? 1 : 0) + (rightDrawn ? 1 : 0);

            if (cellType === 1) { // Black Square (Exactly 2 CONNECTED edges)
                if (edgeCount !== 2) return false; 
                if ((topDrawn && bottomDrawn) || (leftDrawn && rightDrawn)) return false; // Opposite edges = fail
            }
            else if (cellType === 2) { // White Square (Exactly 2 OPPOSITE edges)
                if (edgeCount !== 2) return false;
                if (!((topDrawn && bottomDrawn) || (leftDrawn && rightDrawn))) return false; // Connected edges = fail
            }
            else if (cellType === 3) {
                totalTriangles++;
            }
        }
    }

    // 3. Check Triangle Separation Rule (Flood Fill)
    if (totalTriangles > 1) {
        // Create a blank map to track which cells we've checked
        let visitedCells = Array(currentCells.length).fill(null).map(() => Array(currentCells[0].length).fill(false));
        let regionTriangleCounts = [];

        for (let r = 0; r < currentCells.length; r++) {
            for (let c = 0; c < currentCells[r].length; c++) {
                if (!visitedCells[r][c]) {
                    
                    // Start a new flood fill region
                    let currentRegionTriangles = 0;
                    let queue = [{r, c}];
                    visitedCells[r][c] = true;

                    while (queue.length > 0) {
                        let curr = queue.shift();
                        if (currentCells[curr.r][curr.c] === 3) currentRegionTriangles++;

                        // Check Up
                        if (curr.r > 0 && !visitedCells[curr.r-1][curr.c]) {
                            if (!drawnEdges.has(getEdgeString(curr.r, curr.c, curr.r, curr.c+1))) {
                                visitedCells[curr.r-1][curr.c] = true; queue.push({r: curr.r-1, c: curr.c});
                            }
                        }
                        // Check Down
                        if (curr.r < currentCells.length - 1 && !visitedCells[curr.r+1][curr.c]) {
                            if (!drawnEdges.has(getEdgeString(curr.r+1, curr.c, curr.r+1, curr.c+1))) {
                                visitedCells[curr.r+1][curr.c] = true; queue.push({r: curr.r+1, c: curr.c});
                            }
                        }
                        // Check Left
                        if (curr.c > 0 && !visitedCells[curr.r][curr.c-1]) {
                            if (!drawnEdges.has(getEdgeString(curr.r, curr.c, curr.r+1, curr.c))) {
                                visitedCells[curr.r][curr.c-1] = true; queue.push({r: curr.r, c: curr.c-1});
                            }
                        }
                        // Check Right
                        if (curr.c < currentCells[0].length - 1 && !visitedCells[curr.r][curr.c+1]) {
                            if (!drawnEdges.has(getEdgeString(curr.r, curr.c+1, curr.r+1, curr.c+1))) {
                                visitedCells[curr.r][curr.c+1] = true; queue.push({r: curr.r, c: curr.c+1});
                            }
                        }
                    }
                    
                    // Only record regions that actually contain triangles
                    if (currentRegionTriangles > 0) {
                        regionTriangleCounts.push(currentRegionTriangles);
                    }
                }
            }
        }

        // Rule Validation: Triangles must be split into EXACTLY two groups
        if (regionTriangleCounts.length !== 2) return false;
        
        let target1 = Math.floor(totalTriangles / 2);
        let target2 = Math.ceil(totalTriangles / 2);
        
        regionTriangleCounts.sort((a,b) => a - b);
        
        if (regionTriangleCounts[0] !== target1 || regionTriangleCounts[1] !== target2) {
            return false;
        }
    }

    return true; // All rules passed!
}