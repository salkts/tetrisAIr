/**
 * NES-Style Tetris - Game Board Logic
 * This file contains the Board class that manages the game grid
 */

class Board {
    /**
     * Create a new game board
     */
    constructor() {
        this.reset();
    }

    /**
     * Reset the board to an empty state
     */
    reset() {
        // Create an empty grid (2D array filled with zeros)
        this.grid = Array(ROWS).fill().map(() => Array(COLS).fill(0));
        this.linesCleared = 0;
    }

    /**
     * Check if a position is valid for the current tetromino
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Array<Array<number>>} shape - The tetromino shape matrix
     * @returns {boolean} True if the position is valid, false otherwise
     */
    isValidPosition(x, y, shape) {
        // Check each cell of the tetromino shape
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                // Skip empty cells in the shape
                if (!shape[row][col]) continue;
                
                // Calculate the position on the board
                const boardX = x + col;
                const boardY = y + row;
                
                // Check if out of bounds
                if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
                    return false;
                }
                
                // Check if the position is already occupied (and not above the board)
                if (boardY >= 0 && this.grid[boardY][boardX]) {
                    return false;
                }
            }
        }
        
        return true;
    }

    /**
     * Place a tetromino on the board
     * @param {Tetromino} tetromino - The tetromino to place
     */
    placeTetromino(tetromino) {
        const shape = tetromino.getCurrentShape();
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                // Skip empty cells
                if (!shape[row][col]) continue;
                
                // Calculate the position on the board
                const boardX = tetromino.x + col;
                const boardY = tetromino.y + row;
                
                // Only place cells that are within the board
                if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
                    this.grid[boardY][boardX] = tetromino.type;
                }
            }
        }
    }

    /**
     * Calculate the ghost piece position (where the piece would land)
     * @param {Tetromino} tetromino - The active tetromino
     * @returns {number} The Y position where the tetromino would land
     */
    getGhostPosition(tetromino) {
        const shape = tetromino.getCurrentShape();
        let ghostY = tetromino.y;
        
        // Move the ghost piece down until it hits something
        while (this.isValidPosition(tetromino.x, ghostY + 1, shape)) {
            ghostY++;
        }
        
        return ghostY;
    }

    /**
     * Find completed lines without clearing them
     * @returns {Array<number>} Array of row indices that are completed
     */
    findCompletedLines() {
        const completedLines = [];
        
        // Check each row from top to bottom
        for (let row = 0; row < ROWS; row++) {
            // Check if the row is completely filled
            if (this.grid[row].every(cell => cell !== 0)) {
                completedLines.push(row);
            }
        }
        
        return completedLines;
    }
    
    /**
     * Clear completed lines and return the number of lines cleared
     * @returns {number} The number of lines that were cleared
     */
    clearLines() {
        let linesCleared = 0;
        
        // Check each row from bottom to top
        for (let row = ROWS - 1; row >= 0; row--) {
            // Check if the row is completely filled
            if (this.grid[row].every(cell => cell !== 0)) {
                // Remove the completed row
                this.grid.splice(row, 1);
                // Add a new empty row at the top
                this.grid.unshift(Array(COLS).fill(0));
                // Increment the counter
                linesCleared++;
                // Since we removed a row, we need to check the same index again
                row++;
            }
        }
        
        // Update total lines cleared
        this.linesCleared += linesCleared;
        
        return linesCleared;
    }

    /**
     * Check if the game is over (pieces stacked to the top)
     * @returns {boolean} True if the game is over, false otherwise
     */
    isGameOver() {
        // Check if any cells in the top row are filled
        return this.grid[0].some(cell => cell !== 0);
    }

    /**
     * Apply wall kick tests to find a valid position after rotation
     * @param {Tetromino} tetromino - The tetromino that was rotated
     * @param {number} prevRotation - The previous rotation state
     * @returns {boolean} True if a valid position was found, false otherwise
     */
    applyWallKicks(tetromino, prevRotation) {
        // Get the appropriate wall kick data based on tetromino type
        const kickDataSet = tetromino.type === 'I' ? WALL_KICK_DATA.I : 
                          tetromino.type === 'O' ? WALL_KICK_DATA.O : 
                          WALL_KICK_DATA.JLSTZ;
        
        // Determine which rotation transition we're testing
        const kickIndex = (prevRotation % 4);
        const tests = kickDataSet[kickIndex];
        
        // Get the current shape after rotation
        const shape = tetromino.getCurrentShape();
        
        // Try each test offset
        for (const [offsetX, offsetY] of tests) {
            const testX = tetromino.x + offsetX;
            const testY = tetromino.y - offsetY; // Y is inverted in wall kick data
            
            // If this position is valid, update the tetromino position
            if (this.isValidPosition(testX, testY, shape)) {
                tetromino.x = testX;
                tetromino.y = testY;
                return true;
            }
        }
        
        // If no valid position was found, return false
        return false;
    }
}
