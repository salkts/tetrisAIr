/**
 * NES-Style Tetris - Game Constants
 * This file contains all the constant values used throughout the game
 */

// Board dimensions
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 32; // Size of each block in pixels

// Game states
const GAME_STATES = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
};

// Tetromino types
const TETROMINO_TYPES = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

// Colors for each tetromino type (matching NES style)
const COLORS = {
    I: '#00FFFF', // Cyan
    J: '#0000FF', // Blue
    L: '#FF7F00', // Orange
    O: '#FFFF00', // Yellow
    S: '#00FF00', // Green
    T: '#800080', // Purple
    Z: '#FF0000', // Red
    GHOST: 'rgba(128, 128, 128, 0.3)', // Semi-transparent gray for ghost piece
    GRID: '#1A1A1A', // Dark gray for grid lines
    BACKGROUND: '#000000' // Black background
};

// Scoring system
const SCORE_VALUES = {
    SINGLE: 100,    // Single line clear
    DOUBLE: 300,    // Double line clear
    TRIPLE: 500,    // Triple line clear
    TETRIS: 800,    // Four lines clear (Tetris)
    BACK_TO_BACK_TETRIS: 1200, // Back-to-back Tetris
    SOFT_DROP: 1,   // Points per cell for soft drop
    HARD_DROP: 2    // Points per cell for hard drop
};

// Level speed in milliseconds (how long to wait before piece drops one row)
const LEVEL_SPEEDS = {
    1: 800,
    2: 720,
    3: 630,
    4: 550,
    5: 470,
    6: 380,
    7: 300,
    8: 220,
    9: 130,
    10: 100,
    11: 95,   // Slowed down
    12: 90,   // Slowed down
    13: 85,   // Slowed down
    14: 80,   // Slowed down
    15: 75,   // Slowed down
    16: 70,   // Slowed down
    17: 65,   // Slowed down
    18: 63,   // Slowed down
    19: 62,   // Slowed down
    20: 60,   // Now has the speed that level 15 had before
    21: 58,
    22: 56,
    23: 54,
    24: 52,
    25: 50,   // Now has the speed that level 17/18 had before
    26: 45,
    27: 40,
    28: 35,
    29: 30,   // The "kill screen" is now more playable
    // Level 30+ all use the same speed
    30: 30
};

// Get the speed for a given level
function getLevelSpeed(level) {
    if (level <= 0) return LEVEL_SPEEDS[1];
    if (level >= 30) return LEVEL_SPEEDS[30];
    return LEVEL_SPEEDS[level] || LEVEL_SPEEDS[Math.floor(level / 5) * 5 + 1];
}

// Key codes for input handling
const KEYS = {
    LEFT: 'ArrowLeft',
    RIGHT: 'ArrowRight',
    DOWN: 'ArrowDown',
    UP: 'ArrowUp',
    SPACE: ' ',
    P: 'p',
    R: 'r',
    Z: 'z',
    C: 'c',
    ESC: 'Escape'
};

// Wall kick data for the Super Rotation System (SRS)
// Format: [test number][initial rotation state][final rotation state][test number][x offset, y offset]
const WALL_KICK_DATA = {
    // Wall kicks for J, L, S, T, Z tetrominoes
    JLSTZ: [
        // 0>>1
        [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
        // 1>>2
        [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
        // 2>>3
        [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
        // 3>>0
        [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]]
    ],
    // Wall kicks for I tetromino
    I: [
        // 0>>1
        [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
        // 1>>2
        [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
        // 2>>3
        [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
        // 3>>0
        [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]]
    ],
    // O tetromino doesn't need wall kicks as it doesn't rotate effectively
    O: [
        [[0, 0]],
        [[0, 0]],
        [[0, 0]],
        [[0, 0]]
    ]
};

// Animation durations in milliseconds
const ANIMATION = {
    LINE_CLEAR: 200,
    LEVEL_UP: 500,
    GAME_OVER: 800
};

// Game mechanics timings in milliseconds
const TIMINGS = {
    LOCK_DELAY: 500,     // Time before a piece locks after landing
    LOCK_RESET_MAX: 15   // Maximum number of moves/rotations before forcing lock
};
