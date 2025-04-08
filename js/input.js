/**
 * NES-Style Tetris - Input Handling
 * This file contains the InputHandler class that manages keyboard input
 */

class InputHandler {
    /**
     * Create a new input handler
     * @param {Game} game - Reference to the game instance
     */
    constructor(game) {
        this.game = game;
        this.keysPressed = {};
        this.keyRepeatDelay = 150; // ms before key repeat starts
        this.keyRepeatRate = 50;   // ms between repeated actions
        this.keyTimers = {};       // Timers for key repeat
        
        // Set up event listeners
        this.setupEventListeners();
    }

    /**
     * Set up keyboard event listeners
     */
    setupEventListeners() {
        // Key down event
        document.addEventListener('keydown', (event) => {
            // Prevent default behavior for game control keys
            if (Object.values(KEYS).includes(event.key)) {
                event.preventDefault();
            }
            
            // If the key is already pressed, don't trigger again
            if (this.keysPressed[event.key]) return;
            
            // Mark the key as pressed
            this.keysPressed[event.key] = true;
            
            // Handle the key press
            this.handleKeyPress(event.key);
            
            // Set up key repeat for movement keys
            if ([KEYS.LEFT, KEYS.RIGHT, KEYS.DOWN].includes(event.key)) {
                this.keyTimers[event.key] = {
                    initialDelay: setTimeout(() => {
                        this.keyTimers[event.key].repeatInterval = setInterval(() => {
                            this.handleKeyPress(event.key);
                        }, this.keyRepeatRate);
                    }, this.keyRepeatDelay)
                };
            }
        });
        
        // Key up event
        document.addEventListener('keyup', (event) => {
            // Mark the key as released
            this.keysPressed[event.key] = false;
            
            // Clear any timers for this key
            if (this.keyTimers[event.key]) {
                if (this.keyTimers[event.key].initialDelay) {
                    clearTimeout(this.keyTimers[event.key].initialDelay);
                }
                if (this.keyTimers[event.key].repeatInterval) {
                    clearInterval(this.keyTimers[event.key].repeatInterval);
                }
                delete this.keyTimers[event.key];
            }
        });
    }

    /**
     * Handle a key press based on the current game state
     * @param {string} key - The key that was pressed
     */
    handleKeyPress(key) {
        // Handle keys based on game state
        switch (this.game.state) {
            case GAME_STATES.PLAYING:
                this.handlePlayingState(key);
                break;
            case GAME_STATES.PAUSED:
                this.handlePausedState(key);
                break;
            case GAME_STATES.GAME_OVER:
                this.handleGameOverState(key);
                break;
            case GAME_STATES.MENU:
                this.handleMenuState(key);
                break;
        }
    }

    /**
     * Handle key presses during gameplay
     * @param {string} key - The key that was pressed
     */
    handlePlayingState(key) {
        switch (key) {
            case KEYS.LEFT:
                this.game.moveLeft();
                break;
            case KEYS.RIGHT:
                this.game.moveRight();
                break;
            case KEYS.DOWN:
                this.game.softDrop();
                break;
            case KEYS.UP:
                this.game.rotate();
                break;
            case KEYS.Z:
                this.game.rotateCounterClockwise();
                break;
            case KEYS.SPACE:
                this.game.hardDrop();
                break;
            case KEYS.C:
                this.game.holdPiece();
                break;
            case KEYS.P:
                this.game.pauseGame();
                break;
            case KEYS.R:
                this.game.confirmRestart();
                break;
            case KEYS.ESC:
                this.game.pauseGame();
                break;
        }
    }

    /**
     * Handle key presses when the game is paused
     * @param {string} key - The key that was pressed
     */
    handlePausedState(key) {
        switch (key) {
            case KEYS.P:
                this.game.resumeGame();
                break;
        }
    }

    /**
     * Handle key presses when the game is over
     * @param {string} key - The key that was pressed
     */
    handleGameOverState(key) {
        switch (key) {
            case KEYS.R:
                this.game.restartGame();
                break;
            case KEYS.ESC:
                this.game.exitToMenu();
                break;
        }
    }

    /**
     * Handle key presses in the menu
     * @param {string} key - The key that was pressed
     */
    handleMenuState(key) {
        switch (key) {
            case KEYS.UP:
            case KEYS.DOWN:
                // Navigate menu options
                break;
            case KEYS.SPACE:
            case KEYS.ENTER:
                // Select menu option
                break;
            case KEYS.ESC:
                // Close submenu if open
                break;
        }
    }

    /**
     * Clean up event listeners and timers
     */
    cleanup() {
        // Clear all key repeat timers
        for (const key in this.keyTimers) {
            if (this.keyTimers[key].initialDelay) {
                clearTimeout(this.keyTimers[key].initialDelay);
            }
            if (this.keyTimers[key].repeatInterval) {
                clearInterval(this.keyTimers[key].repeatInterval);
            }
        }
        
        this.keyTimers = {};
        this.keysPressed = {};
    }
}
