/**
 * NES-Style Tetris - Game Logic
 * This file contains the Game class that manages the game state and mechanics
 */

class Game {
    /**
     * Create a new game instance
     */
    constructor() {
        // Set up game elements
        this.board = new Board();
        this.tetrominoGenerator = new TetrominoGenerator();
        this.renderer = new Renderer(
            document.getElementById('game-board'),
            document.getElementById('next-piece'),
            document.getElementById('hold-piece')
        );
        this.inputHandler = new InputHandler(this);
        
        // Game state
        this.state = GAME_STATES.MENU;
        this.activeTetromino = null;
        this.nextTetromino = null;
        this.heldTetromino = null;
        this.canHold = true;
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.dropInterval = null;
        this.lastTetris = false; // For tracking back-to-back Tetris
        
        // Lock delay mechanism
        this.lockDelayActive = false;
        this.lockDelayTimer = null;
        this.lockMoveCounter = 0; // Counter for moves during lock delay
        
        // Spawn protection
        this.spawnProtectionActive = false;
        this.spawnProtectionTimer = null;
        
        // Statistics
        this.statistics = {
            I: 0,
            J: 0,
            L: 0,
            O: 0,
            S: 0,
            T: 0,
            Z: 0
        };
        
        // Options
        this.options = {
            ghostPiece: true,
            sound: true,
            music: true
        };
        
        // Set up DOM elements
        this.setupDomElements();
        
        // Set up event listeners for UI buttons
        this.setupEventListeners();
        
        // Show the menu
        this.showMenu();
    }

    /**
     * Set up references to DOM elements
     */
    setupDomElements() {
        // Game info elements
        this.scoreElement = document.getElementById('score');
        this.topScoreElement = document.getElementById('top-score');
        this.levelElement = document.getElementById('level');
        this.linesElement = document.getElementById('lines');
        this.statisticsElement = document.getElementById('statistics');
        
        // Modal elements
        this.menuModal = document.getElementById('menu-modal');
        this.pauseModal = document.getElementById('pause-modal');
        this.gameOverModal = document.getElementById('game-over-modal');
        this.controlsModal = document.getElementById('controls-modal');
        this.optionsModal = document.getElementById('options-modal');
        this.restartConfirmModal = document.getElementById('restart-confirm-modal');
        
        // Game over elements
        this.finalScoreElement = document.getElementById('final-score');
        this.finalLevelElement = document.getElementById('final-level');
        this.finalLinesElement = document.getElementById('final-lines');
        
        // Level select
        this.selectedLevel = 1; // Default starting level
        this.levelButtons = document.querySelectorAll('.level-btn');
    }

    /**
     * Set up event listeners for UI buttons
     */
    setupEventListeners() {
        // Menu buttons
        document.getElementById('show-controls').addEventListener('click', () => this.showControls());
        document.getElementById('show-options').addEventListener('click', () => this.showOptions());
        
        // Level selection buttons
        this.levelButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove selected class from all buttons
                this.levelButtons.forEach(btn => btn.classList.remove('selected'));
                
                // Add selected class to clicked button
                button.classList.add('selected');
                
                // Update selected level
                this.selectedLevel = parseInt(button.getAttribute('data-level'));
                
                // Start the game immediately
                this.startGame();
            });
        });
        
        // Pause menu buttons
        document.getElementById('resume-game').addEventListener('click', () => this.resumeGame());
        document.getElementById('restart-game').addEventListener('click', () => this.confirmRestart());
        document.getElementById('exit-to-menu').addEventListener('click', () => this.exitToMenu());
        
        // Game over buttons
        document.getElementById('play-again').addEventListener('click', () => this.restartGame());
        document.getElementById('game-over-exit').addEventListener('click', () => this.exitToMenu());
        
        // Restart confirmation buttons
        document.getElementById('confirm-restart').addEventListener('click', () => this.restartGame());
        document.getElementById('cancel-restart').addEventListener('click', () => this.cancelRestart());
        
        // Controls and options buttons
        document.getElementById('close-controls').addEventListener('click', () => this.closeControls());
        document.getElementById('close-options').addEventListener('click', () => this.closeOptions());
        
        // Options toggles
        document.getElementById('sound-toggle').addEventListener('change', (e) => {
            this.options.sound = e.target.checked;
        });
        
        document.getElementById('music-toggle').addEventListener('change', (e) => {
            this.options.music = e.target.checked;
        });
        
        document.getElementById('ghost-toggle').addEventListener('change', (e) => {
            this.options.ghostPiece = e.target.checked;
        });
    }

    /**
     * Show the main menu
     */
    showMenu() {
        this.state = GAME_STATES.MENU;
        this.menuModal.classList.remove('hidden');
        this.pauseModal.classList.add('hidden');
        this.gameOverModal.classList.add('hidden');
        this.controlsModal.classList.add('hidden');
        this.optionsModal.classList.add('hidden');
        
        // Clear the board for the background
        this.renderer.clearBoard();
    }

    /**
     * Show the controls modal
     */
    showControls() {
        this.controlsModal.classList.remove('hidden');
        this.menuModal.classList.add('hidden');
    }

    /**
     * Close the controls modal
     */
    closeControls() {
        this.controlsModal.classList.add('hidden');
        this.menuModal.classList.remove('hidden');
    }

    /**
     * Show the options modal
     */
    showOptions() {
        this.optionsModal.classList.remove('hidden');
        this.menuModal.classList.add('hidden');
    }

    /**
     * Close the options modal
     */
    closeOptions() {
        this.optionsModal.classList.add('hidden');
        this.menuModal.classList.remove('hidden');
    }

    /**
     * Start a new game
     */
    startGame() {
        // Hide all modals
        this.menuModal.classList.add('hidden');
        this.pauseModal.classList.add('hidden');
        this.gameOverModal.classList.add('hidden');
        
        // Reset game state
        this.board.reset();
        this.score = 0;
        this.level = this.selectedLevel || 1;
        this.linesCleared = 0;
        this.lastTetris = false;
        this.statistics = {
            I: 0,
            J: 0,
            L: 0,
            O: 0,
            S: 0,
            T: 0,
            Z: 0
        };
        
        // Reset hold
        this.heldTetromino = null;
        this.canHold = true;
        
        // Reset spawn protection
        this.spawnProtectionActive = false;
        if (this.spawnProtectionTimer) {
            clearTimeout(this.spawnProtectionTimer);
            this.spawnProtectionTimer = null;
        }
        
        // Generate the first pieces
        this.activeTetromino = this.tetrominoGenerator.getNextTetromino();
        this.nextTetromino = this.tetrominoGenerator.peekNextType();
        
        // Update statistics
        this.statistics[this.activeTetromino.type]++;
        
        // Activate spawn protection for the first piece
        this.activateSpawnProtection();
        
        // Update UI
        this.updateUI();
        
        // Set game state to playing
        this.state = GAME_STATES.PLAYING;
        
        // Start the game loop
        this.startGameLoop();
    }

    /**
     * Start the game loop
     */
    startGameLoop() {
        // Clear any existing interval
        if (this.dropInterval) {
            clearInterval(this.dropInterval);
        }
        
        // Set up the drop interval based on the current level
        const speed = getLevelSpeed(this.level);
        this.dropInterval = setInterval(() => {
            this.update();
        }, speed);
    }

    /**
     * Update the game state (called on each tick)
     */
    update() {
        if (this.state !== GAME_STATES.PLAYING) return;
        
        // Move the active tetromino down
        if (!this.moveDown()) {
            // If the piece can't move down, start lock delay if not already active
            if (!this.lockDelayActive) {
                this.startLockDelay();
            }
            // We don't lock the piece immediately - the lock delay timer will handle that
        }
        
        // Render the game
        this.render();
    }
    
    /**
     * Start the lock delay timer
     */
    startLockDelay() {
        // Set the lock delay flag
        this.lockDelayActive = true;
        this.lockMoveCounter = 0;
        
        // Clear any existing timer
        if (this.lockDelayTimer) {
            clearTimeout(this.lockDelayTimer);
        }
        
        // Set a new timer
        this.lockDelayTimer = setTimeout(() => {
            this.finalizeLock();
        }, TIMINGS.LOCK_DELAY);
    }
    
    /**
     * Reset the lock delay timer if a valid move is made during lock delay
     */
    resetLockDelay() {
        // Only reset if lock delay is active and we haven't exceeded the move counter
        if (this.lockDelayActive && this.lockMoveCounter < TIMINGS.LOCK_RESET_MAX) {
            // Increment the move counter
            this.lockMoveCounter++;
            
            // Clear the existing timer
            if (this.lockDelayTimer) {
                clearTimeout(this.lockDelayTimer);
            }
            
            // Set a new timer
            this.lockDelayTimer = setTimeout(() => {
                this.finalizeLock();
            }, TIMINGS.LOCK_DELAY);
        }
    }
    
    /**
     * Finalize the locking of a piece after lock delay
     */
    finalizeLock() {
        // Only proceed if we're still in lock delay and still playing
        if (!this.lockDelayActive || this.state !== GAME_STATES.PLAYING) return;
        
        // Check if the piece can still move down (e.g., if it was moved during lock delay)
        this.activeTetromino.moveDown();
        if (this.board.isValidPosition(
            this.activeTetromino.x,
            this.activeTetromino.y,
            this.activeTetromino.getCurrentShape()
        )) {
            // The piece can move down, so cancel lock delay
            this.lockDelayActive = false;
            this.activeTetromino.y--; // Move back up to maintain position
            return;
        }
        this.activeTetromino.y--; // Move back up to maintain position
        
        // Lock the piece
        this.lockTetromino();
        
        // Check for completed lines
        const linesCleared = this.board.clearLines();
        
        // Update score and level
        this.updateScore(linesCleared);
        
        // Check if the game is over
        if (this.board.isGameOver()) {
            this.endGame();
            return;
        }
        
        // Spawn a new tetromino
        this.spawnTetromino();
        
        // Reset lock delay state
        this.lockDelayActive = false;
        if (this.lockDelayTimer) {
            clearTimeout(this.lockDelayTimer);
            this.lockDelayTimer = null;
        }
    }

    /**
     * Render the game
     */
    render() {
        // Clear the board
        this.renderer.clearBoard();
        
        // Draw the board with placed blocks
        this.renderer.drawBoard(this.board.grid);
        
        // Draw the ghost piece if enabled
        if (this.options.ghostPiece && this.activeTetromino) {
            const ghostY = this.board.getGhostPosition(this.activeTetromino);
            this.renderer.drawGhostPiece(this.activeTetromino, ghostY);
        }
        
        // Draw the active tetromino
        if (this.activeTetromino) {
            this.renderer.drawTetromino(this.activeTetromino);
        }
        
        // Draw the next piece preview
        if (this.nextTetromino) {
            this.renderer.drawNextPiece(this.nextTetromino);
        }
        
        // Draw the hold piece
        this.renderer.drawHoldPiece(this.heldTetromino, this.canHold);
    }

    /**
     * Update the UI elements
     */
    updateUI() {
        // Update score, level, and lines
        this.renderer.updateScore(this.score, this.scoreElement);
        this.renderer.updateLevel(this.level, this.levelElement);
        this.renderer.updateLines(this.linesCleared, this.linesElement);
        
        // Update top score if needed
        const topScore = localStorage.getItem('tetrisTopScore') || 0;
        if (this.score > topScore) {
            localStorage.setItem('tetrisTopScore', this.score);
            this.renderer.updateScore(this.score, this.topScoreElement);
        } else {
            this.renderer.updateScore(topScore, this.topScoreElement);
        }
        
        // Update statistics
        this.renderer.updateStatistics(this.statistics, this.statisticsElement);
    }

    /**
     * Move the active tetromino left
     * @returns {boolean} True if the move was successful
     */
    moveLeft() {
        if (this.state !== GAME_STATES.PLAYING || !this.activeTetromino) return false;
        
        // Try to move left
        this.activeTetromino.moveLeft();
        
        // Check if the new position is valid
        if (!this.board.isValidPosition(
            this.activeTetromino.x,
            this.activeTetromino.y,
            this.activeTetromino.getCurrentShape()
        )) {
            // If not valid, move back
            this.activeTetromino.moveRight();
            return false;
        }
        
        // If we're in lock delay and made a successful move, reset the lock delay
        if (this.lockDelayActive) {
            // Check if the piece is still on the ground
            const isOnGround = !this.board.isValidPosition(
                this.activeTetromino.x,
                this.activeTetromino.y + 1,
                this.activeTetromino.getCurrentShape()
            );
            
            if (isOnGround) {
                this.resetLockDelay();
            } else {
                // If the piece is no longer on the ground, cancel lock delay
                this.lockDelayActive = false;
                if (this.lockDelayTimer) {
                    clearTimeout(this.lockDelayTimer);
                    this.lockDelayTimer = null;
                }
            }
        }
        
        // Render the updated position
        this.render();
        return true;
    }

    /**
     * Move the active tetromino right
     * @returns {boolean} True if the move was successful
     */
    moveRight() {
        if (this.state !== GAME_STATES.PLAYING || !this.activeTetromino) return false;
        
        // Try to move right
        this.activeTetromino.moveRight();
        
        // Check if the new position is valid
        if (!this.board.isValidPosition(
            this.activeTetromino.x,
            this.activeTetromino.y,
            this.activeTetromino.getCurrentShape()
        )) {
            // If not valid, move back
            this.activeTetromino.moveLeft();
            return false;
        }
        
        // If we're in lock delay and made a successful move, reset the lock delay
        if (this.lockDelayActive) {
            // Check if the piece is still on the ground
            const isOnGround = !this.board.isValidPosition(
                this.activeTetromino.x,
                this.activeTetromino.y + 1,
                this.activeTetromino.getCurrentShape()
            );
            
            if (isOnGround) {
                this.resetLockDelay();
            } else {
                // If the piece is no longer on the ground, cancel lock delay
                this.lockDelayActive = false;
                if (this.lockDelayTimer) {
                    clearTimeout(this.lockDelayTimer);
                    this.lockDelayTimer = null;
                }
            }
        }
        
        // Render the updated position
        this.render();
        return true;
    }

    /**
     * Move the active tetromino down
     * @returns {boolean} True if the move was successful
     */
    moveDown() {
        if (this.state !== GAME_STATES.PLAYING || !this.activeTetromino) return false;
        
        // Try to move down
        this.activeTetromino.moveDown();
        
        // Check if the new position is valid
        if (!this.board.isValidPosition(
            this.activeTetromino.x,
            this.activeTetromino.y,
            this.activeTetromino.getCurrentShape()
        )) {
            // If not valid, move back
            this.activeTetromino.y--;
            return false;
        }
        
        // Render the updated position
        this.render();
        return true;
    }

    /**
     * Perform a soft drop (accelerated downward movement)
     * @returns {boolean} True if the move was successful
     */
    softDrop() {
        if (this.state !== GAME_STATES.PLAYING || !this.activeTetromino) return false;
        
        // Move down and add points if successful
        if (this.moveDown()) {
            this.score += SCORE_VALUES.SOFT_DROP;
            this.updateUI();
            return true;
        }
        
        return false;
    }

    /**
     * Perform a hard drop (instant placement)
     */
    hardDrop() {
        if (this.state !== GAME_STATES.PLAYING || !this.activeTetromino) return;
        
        // Prevent hard drop if spawn protection is active
        if (this.spawnProtectionActive) return;
        
        // Cancel any active lock delay
        if (this.lockDelayActive) {
            this.lockDelayActive = false;
            if (this.lockDelayTimer) {
                clearTimeout(this.lockDelayTimer);
                this.lockDelayTimer = null;
            }
        }
        
        // Calculate the ghost position
        const ghostY = this.board.getGhostPosition(this.activeTetromino);
        
        // Calculate the distance for scoring
        const distance = ghostY - this.activeTetromino.y;
        
        // Move the piece to the ghost position
        this.activeTetromino.y = ghostY;
        
        // Add points for the hard drop
        this.score += distance * SCORE_VALUES.HARD_DROP;
        
        // Lock the piece immediately
        this.lockTetromino();
        
        // Find completed lines before clearing them
        const completedLines = this.board.findCompletedLines();
        
        if (completedLines.length > 0) {
            // Render the board with the locked piece before animation
            this.render();
            
            // Animate the line clear
            this.renderer.animateLineClear(completedLines, () => {
                // Clear the lines after the animation
                const linesCleared = this.board.clearLines();
                
                // Update score and level
                this.updateScore(linesCleared);
                
                // Check if the game is over
                if (this.board.isGameOver()) {
                    this.endGame();
                    return;
                }
                
                // Spawn a new tetromino
                this.spawnTetromino();
                
                // Update UI
                this.updateUI();
                
                // Render the updated game
                this.render();
            });
        } else {
            // No lines completed, continue with the game flow
            // Check if the game is over
            if (this.board.isGameOver()) {
                this.endGame();
                return;
            }
            
            // Spawn a new tetromino
            this.spawnTetromino();
            
            // Update UI
            this.updateUI();
            
            // Render the updated game
            this.render();
        }
    }

    /**
     * Rotate the active tetromino clockwise
     */
    rotate() {
        if (this.state !== GAME_STATES.PLAYING || !this.activeTetromino) return;
        
        // Store the current rotation for wall kick tests
        const prevRotation = this.activeTetromino.rotation;
        
        // Rotate the piece
        this.activeTetromino.rotate();
        
        // Check if the new position is valid
        if (!this.board.isValidPosition(
            this.activeTetromino.x,
            this.activeTetromino.y,
            this.activeTetromino.getCurrentShape()
        )) {
            // Try wall kicks
            if (!this.board.applyWallKicks(this.activeTetromino, prevRotation)) {
                // If wall kicks fail, revert to the previous rotation
                this.activeTetromino.rotation = prevRotation;
                return;
            }
        }
        
        // If we're in lock delay and made a successful rotation, reset the lock delay
        if (this.lockDelayActive) {
            // Check if the piece is still on the ground
            const isOnGround = !this.board.isValidPosition(
                this.activeTetromino.x,
                this.activeTetromino.y + 1,
                this.activeTetromino.getCurrentShape()
            );
            
            if (isOnGround) {
                this.resetLockDelay();
            } else {
                // If the piece is no longer on the ground, cancel lock delay
                this.lockDelayActive = false;
                if (this.lockDelayTimer) {
                    clearTimeout(this.lockDelayTimer);
                    this.lockDelayTimer = null;
                }
            }
        }
        
        // Render the updated position
        this.render();
    }

    /**
     * Rotate the active tetromino counter-clockwise
     */
    rotateCounterClockwise() {
        if (this.state !== GAME_STATES.PLAYING || !this.activeTetromino) return;
        
        // Store the current rotation for wall kick tests
        const prevRotation = this.activeTetromino.rotation;
        
        // Rotate the piece counter-clockwise
        this.activeTetromino.rotateCounterClockwise();
        
        // Check if the new position is valid
        if (!this.board.isValidPosition(
            this.activeTetromino.x,
            this.activeTetromino.y,
            this.activeTetromino.getCurrentShape()
        )) {
            // Try wall kicks (using the opposite direction)
            if (!this.board.applyWallKicks(this.activeTetromino, (prevRotation + 3) % 4)) {
                // If wall kicks fail, revert to the previous rotation
                this.activeTetromino.rotation = prevRotation;
                return;
            }
        }
        
        // If we're in lock delay and made a successful rotation, reset the lock delay
        if (this.lockDelayActive) {
            // Check if the piece is still on the ground
            const isOnGround = !this.board.isValidPosition(
                this.activeTetromino.x,
                this.activeTetromino.y + 1,
                this.activeTetromino.getCurrentShape()
            );
            
            if (isOnGround) {
                this.resetLockDelay();
            } else {
                // If the piece is no longer on the ground, cancel lock delay
                this.lockDelayActive = false;
                if (this.lockDelayTimer) {
                    clearTimeout(this.lockDelayTimer);
                    this.lockDelayTimer = null;
                }
            }
        }
        
        // Render the updated position
        this.render();
    }

    /**
     * Hold the current tetromino
     */
    holdPiece() {
        if (this.state !== GAME_STATES.PLAYING || !this.activeTetromino || !this.canHold) return;
        
        // Store the current piece type
        const currentType = this.activeTetromino.type;
        
        // If there's already a held piece, swap them
        if (this.heldTetromino) {
            // Create a new tetromino of the held type
            this.activeTetromino = new Tetromino(this.heldTetromino);
            // Update the held type
            this.heldTetromino = currentType;
        } else {
            // Store the current piece
            this.heldTetromino = currentType;
            // Get a new piece
            this.spawnTetromino();
        }
        
        // Prevent holding again until a piece is placed
        this.canHold = false;
        
        // Render the updated game
        this.render();
    }

    /**
     * Lock the active tetromino in place
     */
    lockTetromino() {
        if (!this.activeTetromino) return;
        
        // Place the tetromino on the board
        this.board.placeTetromino(this.activeTetromino);
        
        // Allow hold again
        this.canHold = true;
        
        // Reset lock delay state
        this.lockDelayActive = false;
        if (this.lockDelayTimer) {
            clearTimeout(this.lockDelayTimer);
            this.lockDelayTimer = null;
        }
    }

    /**
     * Spawn a new tetromino
     */
    spawnTetromino() {
        // Get the next tetromino
        this.activeTetromino = this.tetrominoGenerator.getNextTetromino();
        
        // Update statistics
        this.statistics[this.activeTetromino.type]++;
        
        // Get the next piece preview
        this.nextTetromino = this.tetrominoGenerator.peekNextType();
        
        // Activate spawn protection to prevent accidental hard drops
        this.activateSpawnProtection();
        
        // Update UI
        this.updateUI();
    }
    
    /**
     * Activate spawn protection to prevent accidental hard drops
     */
    activateSpawnProtection() {
        // Set spawn protection flag
        this.spawnProtectionActive = true;
        
        // Clear any existing timer
        if (this.spawnProtectionTimer) {
            clearTimeout(this.spawnProtectionTimer);
        }
        
        // Set a timer to disable spawn protection after the delay
        this.spawnProtectionTimer = setTimeout(() => {
            this.spawnProtectionActive = false;
            this.spawnProtectionTimer = null;
        }, TIMINGS.SPAWN_PROTECTION);
    }

    /**
     * Update the score based on lines cleared
     * @param {number} linesCleared - Number of lines cleared
     */
    updateScore(linesCleared) {
        if (linesCleared === 0) return;
        
        // Update lines cleared count
        this.linesCleared += linesCleared;
        
        // Calculate score based on the number of lines cleared
        let points = 0;
        let backToBackTetris = false;
        
        switch (linesCleared) {
            case 1:
                points = SCORE_VALUES.SINGLE;
                this.lastTetris = false;
                break;
            case 2:
                points = SCORE_VALUES.DOUBLE;
                this.lastTetris = false;
                break;
            case 3:
                points = SCORE_VALUES.TRIPLE;
                this.lastTetris = false;
                break;
            case 4:
                if (this.lastTetris) {
                    points = SCORE_VALUES.BACK_TO_BACK_TETRIS;
                    backToBackTetris = true;
                } else {
                    points = SCORE_VALUES.TETRIS;
                }
                this.lastTetris = true;
                break;
        }
        
        // Multiply by level
        this.score += points * this.level;
        
        // Check if level should increase
        const newLevel = Math.floor(this.linesCleared / 10) + this.selectedLevel;
        if (newLevel > this.level) {
            this.level = newLevel;
            
            // Update the drop speed
            this.updateDropSpeed();
            
            // Update level display without animation
            this.updateUI();
        }
        
        // Update UI after animation
        this.updateUI();
    }

    /**
     * Update the drop speed based on the current level
     */
    updateDropSpeed() {
        // Clear the current interval
        if (this.dropInterval) {
            clearInterval(this.dropInterval);
        }
        
        // Set up a new interval with the updated speed
        const speed = getLevelSpeed(this.level);
        this.dropInterval = setInterval(() => {
            this.update();
        }, speed);
    }

    /**
     * Pause the game
     * @param {boolean} showModal - Whether to show the pause modal (default: true)
     */
    pauseGame(showModal = true) {
        if (this.state !== GAME_STATES.PLAYING) return;
        
        // Set the game state to paused
        this.state = GAME_STATES.PAUSED;
        
        // Show the pause modal if requested
        if (showModal) {
            this.pauseModal.classList.remove('hidden');
        }
        
        // Pause the drop interval
        if (this.dropInterval) {
            clearInterval(this.dropInterval);
        }
    }

    /**
     * Resume the game
     */
    resumeGame() {
        if (this.state !== GAME_STATES.PAUSED) return;
        
        // Set the game state to playing
        this.state = GAME_STATES.PLAYING;
        
        // Hide the pause modal
        this.pauseModal.classList.add('hidden');
        
        // Restart the drop interval
        this.startGameLoop();
    }

    /**
     * Show restart confirmation
     */
    confirmRestart() {
        // Only show confirmation if we're in a game
        if (this.state === GAME_STATES.PLAYING || this.state === GAME_STATES.PAUSED) {
            // Pause the game if it's not already paused
            if (this.state === GAME_STATES.PLAYING) {
                this.pauseGame(false); // Pause without showing the pause modal
            } else {
                // Hide the pause modal if it's showing
                this.pauseModal.classList.add('hidden');
            }
            
            // Show the restart confirmation modal
            this.restartConfirmModal.classList.remove('hidden');
        } else {
            // If we're not in a game, just restart immediately
            this.restartGame();
        }
    }
    
    /**
     * Cancel the restart and return to the previous state
     */
    cancelRestart() {
        // Hide the restart confirmation modal
        this.restartConfirmModal.classList.add('hidden');
        
        // If we were paused, show the pause modal again
        if (this.state === GAME_STATES.PAUSED) {
            this.pauseModal.classList.remove('hidden');
        } else {
            // Otherwise resume the game
            this.resumeGame();
        }
    }

    /**
     * Restart the game
     */
    restartGame() {
        // Hide all modals
        this.pauseModal.classList.add('hidden');
        this.gameOverModal.classList.add('hidden');
        this.restartConfirmModal.classList.add('hidden');
        
        // Start a new game
        this.startGame();
    }

    /**
     * Show exit confirmation
     */
    confirmExit() {
        // For simplicity, just exit immediately
        // In a full implementation, you might want to show a confirmation dialog
        this.exitToMenu();
    }

    /**
     * Exit to the main menu
     */
    exitToMenu() {
        // Clear the drop interval
        if (this.dropInterval) {
            clearInterval(this.dropInterval);
        }
        
        // Show the menu
        this.showMenu();
    }

    /**
     * End the game
     */
    endGame() {
        // Set the game state to game over
        this.state = GAME_STATES.GAME_OVER;
        
        // Clear the drop interval
        if (this.dropInterval) {
            clearInterval(this.dropInterval);
        }
        
        // Update high score if needed
        const topScore = localStorage.getItem('tetrisTopScore') || 0;
        if (this.score > topScore) {
            localStorage.setItem('tetrisTopScore', this.score);
        }
        
        // Update final score display
        this.finalScoreElement.textContent = this.score;
        this.finalLevelElement.textContent = this.level;
        this.finalLinesElement.textContent = this.linesCleared;
        
        // Show the game over animation
        this.renderer.animateGameOver(() => {
            // Show the game over modal after animation
            this.gameOverModal.classList.remove('hidden');
        });
    }

    /**
     * Clean up resources when the game is destroyed
     */
    cleanup() {
        // Clear the drop interval
        if (this.dropInterval) {
            clearInterval(this.dropInterval);
        }
        
        // Clear the lock delay timer
        if (this.lockDelayTimer) {
            clearTimeout(this.lockDelayTimer);
        }
        
        // Clean up input handler
        this.inputHandler.cleanup();
    }
}
