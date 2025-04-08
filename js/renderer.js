/**
 * NES-Style Tetris - Rendering Logic
 * This file contains the Renderer class that handles all drawing operations
 */

class Renderer {
    /**
     * Create a new renderer
     * @param {HTMLCanvasElement} boardCanvas - The main game board canvas
     * @param {HTMLCanvasElement} nextCanvas - The next piece preview canvas
     * @param {HTMLCanvasElement} holdCanvas - The hold piece canvas
     */
    constructor(boardCanvas, nextCanvas, holdCanvas) {
        // Set up main board canvas
        this.boardCanvas = boardCanvas;
        this.boardCtx = boardCanvas.getContext('2d');
        
        // Set up next piece preview canvas
        this.nextCanvas = nextCanvas;
        this.nextCtx = nextCanvas.getContext('2d');
        
        // Set up hold piece canvas
        this.holdCanvas = holdCanvas;
        this.holdCtx = holdCanvas.getContext('2d');
        
        // Set up canvas properties
        this.setupCanvas();
    }

    /**
     * Set up canvas properties
     */
    setupCanvas() {
        // Set up main board canvas
        this.boardCanvas.width = COLS * BLOCK_SIZE;
        this.boardCanvas.height = ROWS * BLOCK_SIZE;
        
        // Enable crisp pixel art rendering
        this.boardCtx.imageSmoothingEnabled = false;
        this.nextCtx.imageSmoothingEnabled = false;
        this.holdCtx.imageSmoothingEnabled = false;
    }

    /**
     * Clear the main game board
     */
    clearBoard() {
        this.boardCtx.fillStyle = COLORS.BACKGROUND;
        this.boardCtx.fillRect(0, 0, this.boardCanvas.width, this.boardCanvas.height);
        this.drawGrid();
    }

    /**
     * Draw the grid lines on the board
     */
    drawGrid() {
        this.boardCtx.strokeStyle = COLORS.GRID;
        this.boardCtx.lineWidth = 1;
        
        // Draw vertical grid lines
        for (let x = 0; x <= COLS; x++) {
            this.boardCtx.beginPath();
            this.boardCtx.moveTo(x * BLOCK_SIZE, 0);
            this.boardCtx.lineTo(x * BLOCK_SIZE, this.boardCanvas.height);
            this.boardCtx.stroke();
        }
        
        // Draw horizontal grid lines
        for (let y = 0; y <= ROWS; y++) {
            this.boardCtx.beginPath();
            this.boardCtx.moveTo(0, y * BLOCK_SIZE);
            this.boardCtx.lineTo(this.boardCanvas.width, y * BLOCK_SIZE);
            this.boardCtx.stroke();
        }
    }

    /**
     * Draw a single block at the specified position
     * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on
     * @param {number} x - X coordinate in grid cells
     * @param {number} y - Y coordinate in grid cells
     * @param {string} color - The color of the block
     * @param {boolean} isGhost - Whether this is a ghost piece
     */
    drawBlock(ctx, x, y, color, isGhost = false) {
        const blockX = x * BLOCK_SIZE;
        const blockY = y * BLOCK_SIZE;
        
        // Draw the main block
        ctx.fillStyle = isGhost ? COLORS.GHOST : COLORS.BACKGROUND;
        ctx.fillRect(blockX, blockY, BLOCK_SIZE, BLOCK_SIZE);
        
        // Draw the colored border (NES style)
        // Use a neutral gray color for ghost pieces
        ctx.strokeStyle = isGhost ? 'rgba(128, 128, 128, 0.5)' : color;
        ctx.lineWidth = 2;
        ctx.strokeRect(blockX + 1, blockY + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
        
        // Draw inner highlight (only for solid pieces, not ghost)
        if (!isGhost) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(blockX + 3, blockY + BLOCK_SIZE - 3);
            ctx.lineTo(blockX + 3, blockY + 3);
            ctx.lineTo(blockX + BLOCK_SIZE - 3, blockY + 3);
            ctx.stroke();
        }
    }

    /**
     * Draw the game board with all placed blocks
     * @param {Array<Array<string>>} grid - The game board grid
     */
    drawBoard(grid) {
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if (grid[row][col]) {
                    this.drawBlock(this.boardCtx, col, row, COLORS[grid[row][col]]);
                }
            }
        }
    }

    /**
     * Draw the active tetromino
     * @param {Tetromino} tetromino - The active tetromino
     */
    drawTetromino(tetromino) {
        const shape = tetromino.getCurrentShape();
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    // Only draw if the block is within the visible board area
                    if (tetromino.y + row >= 0) {
                        this.drawBlock(
                            this.boardCtx, 
                            tetromino.x + col, 
                            tetromino.y + row, 
                            tetromino.color
                        );
                    }
                }
            }
        }
    }

    /**
     * Draw the ghost piece (shadow showing where the piece will land)
     * @param {Tetromino} tetromino - The active tetromino
     * @param {number} ghostY - The Y position where the tetromino would land
     */
    drawGhostPiece(tetromino, ghostY) {
        const shape = tetromino.getCurrentShape();
        
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    // Only draw if the block is within the visible board area
                    if (ghostY + row >= 0) {
                        this.drawBlock(
                            this.boardCtx, 
                            tetromino.x + col, 
                            ghostY + row, 
                            tetromino.color,
                            true
                        );
                    }
                }
            }
        }
    }

    /**
     * Draw the next piece preview
     * @param {string} nextType - The type of the next tetromino
     */
    drawNextPiece(nextType) {
        // Clear the next piece canvas
        this.nextCtx.fillStyle = COLORS.BACKGROUND;
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        // Create a temporary tetromino to get the shape
        const tempTetromino = new Tetromino(nextType);
        const shape = tempTetromino.getCurrentShape();
        
        // Calculate the block size for the preview
        const blockSize = 24; // Smaller blocks for the preview
        
        // Find actual dimensions of the shape (excluding empty rows/columns)
        let minRow = shape.length, maxRow = -1, minCol = shape[0].length, maxCol = -1;
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    minRow = Math.min(minRow, r);
                    maxRow = Math.max(maxRow, r);
                    minCol = Math.min(minCol, c);
                    maxCol = Math.max(maxCol, c);
                }
            }
        }
        
        // Calculate actual shape dimensions
        const shapeHeight = (maxRow >= minRow) ? maxRow - minRow + 1 : 0;
        const shapeWidth = (maxCol >= minCol) ? maxCol - minCol + 1 : 0;
        
        // Calculate pixel dimensions
        const shapePixelWidth = shapeWidth * blockSize;
        const shapePixelHeight = shapeHeight * blockSize;
        
        // Calculate offset to center the tetromino
        const offsetX = Math.floor((this.nextCanvas.width - shapePixelWidth) / 2);
        const offsetY = Math.floor((this.nextCanvas.height - shapePixelHeight) / 2);
        
        // Draw the next piece
        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                if (shape[r][c]) {
                    const blockX = offsetX + (c - minCol) * blockSize;
                    const blockY = offsetY + (r - minRow) * blockSize;
                    
                    // Draw the block background
                    this.nextCtx.fillStyle = COLORS.BACKGROUND;
                    this.nextCtx.fillRect(blockX, blockY, blockSize, blockSize);
                    
                    // Draw the colored border
                    this.nextCtx.strokeStyle = COLORS[nextType];
                    this.nextCtx.lineWidth = 2;
                    this.nextCtx.strokeRect(blockX + 1, blockY + 1, blockSize - 2, blockSize - 2);
                    
                    // Draw inner highlight
                    this.nextCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                    this.nextCtx.lineWidth = 1;
                    this.nextCtx.beginPath();
                    this.nextCtx.moveTo(blockX + 3, blockY + blockSize - 3);
                    this.nextCtx.lineTo(blockX + 3, blockY + 3);
                    this.nextCtx.lineTo(blockX + blockSize - 3, blockY + 3);
                    this.nextCtx.stroke();
                }
            }
        }
    }

    /**
     * Draw the hold piece
     * @param {string} holdType - The type of the held tetromino (or null if empty)
     * @param {boolean} canHold - Whether the player can use hold again
     */
    drawHoldPiece(holdType, canHold) {
        // Clear the hold piece canvas
        this.holdCtx.fillStyle = COLORS.BACKGROUND;
        this.holdCtx.fillRect(0, 0, this.holdCanvas.width, this.holdCanvas.height);
        
        // If there's no hold piece, just return
        if (!holdType) return;
        
        // Create a temporary tetromino to get the shape
        const tempTetromino = new Tetromino(holdType);
        const shape = tempTetromino.getCurrentShape();
        
        // Calculate the block size for the preview
        const blockSize = 24; // Smaller blocks for the preview
        
        // Find actual dimensions of the shape (excluding empty rows/columns)
        let minRow = shape.length, maxRow = -1, minCol = shape[0].length, maxCol = -1;
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    minRow = Math.min(minRow, r);
                    maxRow = Math.max(maxRow, r);
                    minCol = Math.min(minCol, c);
                    maxCol = Math.max(maxCol, c);
                }
            }
        }
        
        // Calculate actual shape dimensions
        const shapeHeight = (maxRow >= minRow) ? maxRow - minRow + 1 : 0;
        const shapeWidth = (maxCol >= minCol) ? maxCol - minCol + 1 : 0;
        
        // Calculate pixel dimensions
        const shapePixelWidth = shapeWidth * blockSize;
        const shapePixelHeight = shapeHeight * blockSize;
        
        // Calculate offset to center the tetromino
        const offsetX = Math.floor((this.holdCanvas.width - shapePixelWidth) / 2);
        const offsetY = Math.floor((this.holdCanvas.height - shapePixelHeight) / 2);
        
        // Determine the color based on whether hold is available
        const color = canHold ? COLORS[holdType] : 'rgba(128, 128, 128, 0.5)';
        
        // Draw the hold piece
        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                if (shape[r][c]) {
                    const blockX = offsetX + (c - minCol) * blockSize;
                    const blockY = offsetY + (r - minRow) * blockSize;
                    
                    // Draw the block background
                    this.holdCtx.fillStyle = COLORS.BACKGROUND;
                    this.holdCtx.fillRect(blockX, blockY, blockSize, blockSize);
                    
                    // Draw the colored border
                    this.holdCtx.strokeStyle = color;
                    this.holdCtx.lineWidth = 2;
                    this.holdCtx.strokeRect(blockX + 1, blockY + 1, blockSize - 2, blockSize - 2);
                    
                    // Draw inner highlight (only if can hold)
                    if (canHold) {
                        this.holdCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                        this.holdCtx.lineWidth = 1;
                        this.holdCtx.beginPath();
                        this.holdCtx.moveTo(blockX + 3, blockY + blockSize - 3);
                        this.holdCtx.lineTo(blockX + 3, blockY + 3);
                        this.holdCtx.lineTo(blockX + blockSize - 3, blockY + 3);
                        this.holdCtx.stroke();
                    }
                }
            }
        }
    }

    /**
     * Draw the line clear animation
     * @param {Array<number>} completedLines - Array of row indices that were completed
     * @param {Function} callback - Function to call when animation is complete
     */
    animateLineClear(completedLines, callback) {
        // If no completed lines, just call the callback and return
        if (!completedLines || completedLines.length === 0) {
            callback();
            return;
        }
        
        // Flash the completed lines white
        const flashCount = 3;
        let currentFlash = 0;
        
        // Make a copy of the current board state
        const boardCopy = this.boardCtx.getImageData(0, 0, this.boardCanvas.width, this.boardCanvas.height);
        
        const flashInterval = setInterval(() => {
            // Restore the original board state for each frame
            this.boardCtx.putImageData(boardCopy, 0, 0);
            
            // Draw the flash effect only on the completed lines
            if (currentFlash % 2 === 0) {
                // On even flashes, draw white lines
                for (const row of completedLines) {
                    const y = row * BLOCK_SIZE;
                    
                    // White flash
                    this.boardCtx.fillStyle = '#FFFFFF';
                    this.boardCtx.fillRect(0, y, this.boardCanvas.width, BLOCK_SIZE);
                    
                    // Redraw grid lines over the flash
                    this.boardCtx.strokeStyle = COLORS.GRID;
                    this.boardCtx.lineWidth = 1;
                    
                    // Horizontal grid lines for this row
                    this.boardCtx.beginPath();
                    this.boardCtx.moveTo(0, y);
                    this.boardCtx.lineTo(this.boardCanvas.width, y);
                    this.boardCtx.stroke();
                    
                    this.boardCtx.beginPath();
                    this.boardCtx.moveTo(0, y + BLOCK_SIZE);
                    this.boardCtx.lineTo(this.boardCanvas.width, y + BLOCK_SIZE);
                    this.boardCtx.stroke();
                    
                    // Vertical grid lines for this row
                    for (let x = 0; x <= COLS; x++) {
                        this.boardCtx.beginPath();
                        this.boardCtx.moveTo(x * BLOCK_SIZE, y);
                        this.boardCtx.lineTo(x * BLOCK_SIZE, y + BLOCK_SIZE);
                        this.boardCtx.stroke();
                    }
                }
            }
            
            currentFlash++;
            
            // End the animation after the specified number of flashes
            if (currentFlash >= flashCount * 2) {
                clearInterval(flashInterval);
                callback();
            }
        }, ANIMATION.LINE_CLEAR / (flashCount * 2));
    }

    /**
     * Draw the game over animation
     * @param {Function} callback - Function to call when animation is complete
     */
    animateGameOver(callback) {
        // Fill the board from bottom to top with white
        let currentRow = ROWS - 1;
        
        const fillInterval = setInterval(() => {
            // Fill the current row
            this.boardCtx.fillStyle = '#FFFFFF';
            this.boardCtx.fillRect(0, currentRow * BLOCK_SIZE, this.boardCanvas.width, BLOCK_SIZE);
            
            currentRow--;
            
            // End the animation when we reach the top
            if (currentRow < 0) {
                clearInterval(fillInterval);
                
                // Wait a moment, then fade to black
                setTimeout(() => {
                    this.boardCtx.fillStyle = COLORS.BACKGROUND;
                    this.boardCtx.fillRect(0, 0, this.boardCanvas.width, this.boardCanvas.height);
                    callback();
                }, 300);
            }
        }, ANIMATION.GAME_OVER / ROWS);
    }

    /**
     * Update the statistics display
     * @param {Object} stats - Object containing piece counts
     * @param {HTMLElement} statsElement - The element to update
     */
    updateStatistics(stats, statsElement) {
        // Clear the statistics element
        statsElement.innerHTML = '';
        
        // Define block size for statistics display
        const statsBlockSize = 14; // Increased block size
        
        // Create a row for each tetromino type
        for (const type of TETROMINO_TYPES) {
            const row = document.createElement('div');
            row.className = 'stat-row';
            
            // Create a mini tetromino preview
            const preview = document.createElement('div');
            preview.className = 'piece-preview';
            
            // Create a small canvas for the tetromino preview
            const canvas = document.createElement('canvas');
            canvas.width = 120; // Match CSS width
            canvas.height = 60; // Match CSS height
            preview.appendChild(canvas);
            
            // Draw the tetromino on the canvas
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = COLORS.BACKGROUND;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Get tetromino shape
            const shape = SHAPES[type];
            const color = COLORS[type];
            
            // Find actual dimensions of the shape (excluding empty rows/columns)
            let minRow = shape.length, maxRow = -1, minCol = shape[0].length, maxCol = -1;
            for (let r = 0; r < shape.length; r++) {
                for (let c = 0; c < shape[r].length; c++) {
                    if (shape[r][c]) {
                        minRow = Math.min(minRow, r);
                        maxRow = Math.max(maxRow, r);
                        minCol = Math.min(minCol, c);
                        maxCol = Math.max(maxCol, c);
                    }
                }
            }
            
            // Calculate actual shape dimensions
            const shapeHeight = (maxRow >= minRow) ? maxRow - minRow + 1 : 0;
            const shapeWidth = (maxCol >= minCol) ? maxCol - minCol + 1 : 0;
            
            // Calculate pixel dimensions
            const shapePixelWidth = shapeWidth * statsBlockSize;
            const shapePixelHeight = shapeHeight * statsBlockSize;
            
            // Calculate offset to center the tetromino
            const offsetX = Math.floor((canvas.width - shapePixelWidth) / 2);
            const offsetY = Math.floor((canvas.height - shapePixelHeight) / 2);
            
            // Draw the tetromino
            for (let r = minRow; r <= maxRow; r++) {
                for (let c = minCol; c <= maxCol; c++) {
                    if (shape[r][c]) {
                        const drawX = offsetX + (c - minCol) * statsBlockSize;
                        const drawY = offsetY + (r - minRow) * statsBlockSize;
                        
                        // Draw block background
                        ctx.fillStyle = COLORS.BACKGROUND;
                        ctx.fillRect(drawX, drawY, statsBlockSize, statsBlockSize);
                        
                        // Draw colored border
                        ctx.strokeStyle = color;
                        ctx.lineWidth = 2;
                        ctx.strokeRect(
                            drawX + 1,
                            drawY + 1,
                            statsBlockSize - 2,
                            statsBlockSize - 2
                        );
                        
                        // No inner highlight (removed as requested)
                    }
                }
            }
            
            // Create the count display
            const count = document.createElement('div');
            count.className = 'stat-count';
            // Format count with three digits (padded with zeros)
            count.textContent = (stats[type] || 0).toString().padStart(3, '0');
            
            // Add elements to the row
            row.appendChild(preview);
            row.appendChild(count);
            
            // Add the row to the statistics element
            statsElement.appendChild(row);
        }
    }

    /**
     * Update the score display
     * @param {number} score - The current score
     * @param {HTMLElement} scoreElement - The element to update
     */
    updateScore(score, scoreElement) {
        scoreElement.textContent = score.toString().padStart(6, '0');
    }

    /**
     * Update the level display
     * @param {number} level - The current level
     * @param {HTMLElement} levelElement - The element to update
     */
    updateLevel(level, levelElement) {
        levelElement.textContent = level.toString().padStart(2, '0');
    }

    /**
     * Update the lines display
     * @param {number} lines - The number of lines cleared
     * @param {HTMLElement} linesElement - The element to update
     */
    updateLines(lines, linesElement) {
        linesElement.textContent = lines.toString().padStart(3, '0');
    }

    /**
     * Animate a level up notification
     * @param {number} level - The new level
     */
    animateLevelUp(level) {
        // Level up notification removed to prevent board shifting
        // Just update the level display in the UI
        this.updateLevel(level, document.getElementById('level'));
    }
}
