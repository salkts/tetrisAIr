/**
 * NES-Style Tetris - Mobile Controls
 * This file contains the MobileControls class that manages touch and swipe inputs for mobile devices
 */

class MobileControls {
    /**
     * Create a new mobile controls handler
     * @param {Game} game - Reference to the game instance
     */
    constructor(game) {
        this.game = game;
        this.isMobile = this.detectMobile();
        
        // Touch tracking variables
        this.touchStartX = null;
        this.touchStartY = null;
        this.lastTouchX = null;
        this.lastTouchY = null;
        this.touchStartTime = null;
        
        // Configuration
        this.swipeThreshold = 20; // Minimum distance for a swipe
        this.tapThreshold = 10; // Maximum distance for a tap
        this.swipeTimeThreshold = 300; // Maximum time for a swipe (ms)
        this.minSwipeDistance = 5; // Minimum distance to consider a swipe
        
        // Debug mode
        this.debugMode = false;
        this.debugElement = null;
        
        // Set up mobile controls container and buttons
        if (this.isMobile) {
            this.setupMobileControls();
            this.setupEventListeners();
            
            if (this.debugMode) {
                this.setupDebugElement();
            }
        }
    }
    
    /**
     * Detect if the user is on a mobile device
     * @returns {boolean} True if mobile device detected
     */
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
            || (window.innerWidth <= 800);
    }
    
    /**
     * Set up mobile controls container and buttons
     */
    setupMobileControls() {
        // Create mobile controls container
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'mobile-controls';
        
        // Create pause button
        const pauseButton = document.createElement('button');
        pauseButton.className = 'mobile-btn pause-btn';
        pauseButton.innerHTML = 'II';
        pauseButton.setAttribute('aria-label', 'Pause Game');
        
        // Create hold button
        const holdButton = document.createElement('button');
        holdButton.className = 'mobile-btn hold-btn';
        holdButton.innerHTML = 'HOLD';
        holdButton.setAttribute('aria-label', 'Hold Piece');
        
        // Add buttons to container
        controlsContainer.appendChild(pauseButton);
        controlsContainer.appendChild(holdButton);
        
        // Add container to the game area
        const gameArea = document.querySelector('.game-area');
        if (gameArea) {
            gameArea.appendChild(controlsContainer);
        }
        
        // Set up button event listeners
        pauseButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.game.pauseGame();
        });
        
        holdButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.game.holdPiece();
        });
        
        // Update controls modal for mobile
        this.updateControlsModal();
    }
    
    /**
     * Set up debug element for touch tracking
     */
    setupDebugElement() {
        this.debugElement = document.createElement('div');
        this.debugElement.style.position = 'fixed';
        this.debugElement.style.top = '10px';
        this.debugElement.style.left = '10px';
        this.debugElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.debugElement.style.color = 'white';
        this.debugElement.style.padding = '10px';
        this.debugElement.style.borderRadius = '5px';
        this.debugElement.style.zIndex = '9999';
        this.debugElement.style.fontFamily = 'monospace';
        this.debugElement.style.fontSize = '12px';
        this.debugElement.style.maxWidth = '300px';
        this.debugElement.style.overflow = 'auto';
        this.debugElement.textContent = 'Touch Debug Info';
        document.body.appendChild(this.debugElement);
    }
    
    /**
     * Update debug element with touch information
     * @param {string} message - Debug message to display
     */
    updateDebug(message) {
        if (this.debugMode && this.debugElement) {
            this.debugElement.textContent = message;
        }
    }
    
    /**
     * Update the controls modal to show mobile controls
     */
    updateControlsModal() {
        const controlsList = document.querySelector('.controls-list');
        if (!controlsList) return;
        
        // Clear existing controls
        controlsList.innerHTML = '';
        
        if (this.isMobile) {
            // Add mobile control instructions
            const mobileControls = [
                { action: 'Swipe Left/Right', description: 'Move Left/Right' },
                { action: 'Swipe Down', description: 'Soft Drop' },
                { action: 'Tap', description: 'Rotate Clockwise' },
                { action: 'Swipe Up', description: 'Hard Drop' },
                { action: 'HOLD Button', description: 'Hold Piece' },
                { action: 'II Button', description: 'Pause Game' }
            ];
            
            mobileControls.forEach(control => {
                const controlItem = document.createElement('div');
                controlItem.className = 'control-item';
                
                const actionSpan = document.createElement('span');
                actionSpan.className = 'key';
                actionSpan.textContent = control.action;
                
                const descriptionSpan = document.createElement('span');
                descriptionSpan.className = 'action';
                descriptionSpan.textContent = control.description;
                
                controlItem.appendChild(actionSpan);
                controlItem.appendChild(descriptionSpan);
                controlsList.appendChild(controlItem);
            });
        } else {
            // Add keyboard control instructions
            const keyboardControls = [
                { key: '←/→', action: 'Move Left/Right' },
                { key: '↓', action: 'Soft Drop' },
                { key: '↑', action: 'Rotate Clockwise' },
                { key: 'Z', action: 'Rotate Counter-clockwise' },
                { key: 'Space', action: 'Hard Drop' },
                { key: 'C', action: 'Hold Piece' },
                { key: 'Esc / P', action: 'Pause/Unpause Game' },
                { key: 'R', action: 'Restart Game' }
            ];
            
            keyboardControls.forEach(control => {
                const controlItem = document.createElement('div');
                controlItem.className = 'control-item';
                
                const keySpan = document.createElement('span');
                keySpan.className = 'key';
                keySpan.textContent = control.key;
                
                const actionSpan = document.createElement('span');
                actionSpan.className = 'action';
                actionSpan.textContent = control.action;
                
                controlItem.appendChild(keySpan);
                controlItem.appendChild(actionSpan);
                controlsList.appendChild(controlItem);
            });
        }
    }
    
    /**
     * Set up touch event listeners
     */
    setupEventListeners() {
        const gameBoard = document.getElementById('game-board');
        if (!gameBoard) return;
        
        // Prevent default touch actions on the game board
        gameBoard.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        gameBoard.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        gameBoard.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        
        // Add direct click handler for rotation
        gameBoard.addEventListener('click', (e) => {
            if (this.game.state === GAME_STATES.PLAYING) {
                e.preventDefault();
                this.game.rotate();
            }
        });
        
        // Prevent context menu on long press
        gameBoard.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });
        
        // Add direct keyboard controls as a fallback
        document.addEventListener('keydown', (e) => {
            if (this.game.state !== GAME_STATES.PLAYING) return;
            
            switch (e.key) {
                case 'ArrowLeft':
                    this.game.moveLeft();
                    break;
                case 'ArrowRight':
                    this.game.moveRight();
                    break;
                case 'ArrowDown':
                    this.game.softDrop();
                    break;
                case 'ArrowUp':
                    this.game.rotate();
                    break;
                case ' ': // Space
                    this.game.hardDrop();
                    break;
            }
        });
    }
    
    /**
     * Handle touch start event
     * @param {TouchEvent} e - Touch event
     */
    handleTouchStart(e) {
        // Always prevent default to avoid scrolling
        e.preventDefault();
        
        if (this.game.state !== GAME_STATES.PLAYING) return;
        
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.lastTouchX = touch.clientX;
        this.lastTouchY = touch.clientY;
        this.touchStartTime = Date.now();
        
        if (this.debugMode) {
            this.updateDebug(`Touch Start: (${this.touchStartX}, ${this.touchStartY})`);
        }
    }
    
    /**
     * Handle touch move event
     * @param {TouchEvent} e - Touch event
     */
    handleTouchMove(e) {
        // Always prevent default to avoid scrolling
        e.preventDefault();
        
        if (this.game.state !== GAME_STATES.PLAYING || this.touchStartX === null) return;
        
        const touch = e.touches[0];
        const currentX = touch.clientX;
        const currentY = touch.clientY;
        
        // Calculate the distance moved since the last position
        const deltaX = currentX - this.lastTouchX;
        const deltaY = currentY - this.lastTouchY;
        
        // Update the last touch position
        this.lastTouchX = currentX;
        this.lastTouchY = currentY;
        
        // Calculate total distance from start
        const totalDeltaX = currentX - this.touchStartX;
        const totalDeltaY = currentY - this.touchStartY;
        
        if (this.debugMode) {
            this.updateDebug(`Touch Move: (${currentX}, ${currentY})<br>Delta: (${deltaX}, ${deltaY})<br>Total: (${totalDeltaX}, ${totalDeltaY})`);
        }
        
        // Handle horizontal movement (immediate response)
        if (Math.abs(deltaX) > this.minSwipeDistance && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) {
                this.game.moveRight();
            } else {
                this.game.moveLeft();
            }
        }
        
        // Handle vertical movement (immediate response for soft drop)
        if (deltaY > this.minSwipeDistance && Math.abs(deltaY) > Math.abs(deltaX)) {
            this.game.softDrop();
        }
    }
    
    /**
     * Handle touch end event
     * @param {TouchEvent} e - Touch event
     */
    handleTouchEnd(e) {
        // Always prevent default
        e.preventDefault();
        
        if (this.game.state !== GAME_STATES.PLAYING || this.touchStartX === null) {
            // Reset touch tracking
            this.touchStartX = null;
            this.touchStartY = null;
            this.lastTouchX = null;
            this.lastTouchY = null;
            this.touchStartTime = null;
            return;
        }
        
        const touch = e.changedTouches[0];
        const endX = touch.clientX;
        const endY = touch.clientY;
        const touchDuration = Date.now() - this.touchStartTime;
        
        // Calculate total distance and direction
        const distX = endX - this.touchStartX;
        const distY = endY - this.touchStartY;
        const totalDistance = Math.sqrt(distX * distX + distY * distY);
        
        if (this.debugMode) {
            this.updateDebug(`Touch End: (${endX}, ${endY})<br>Distance: (${distX}, ${distY})<br>Duration: ${touchDuration}ms<br>Total: ${totalDistance}px`);
        }
        
        // Check if it was a tap (short duration, minimal movement)
        if (touchDuration < this.swipeTimeThreshold && totalDistance < this.tapThreshold) {
            this.game.rotate();
        }
        // Check if it was a swipe
        else if (totalDistance >= this.swipeThreshold) {
            // Determine primary direction (horizontal or vertical)
            if (Math.abs(distX) > Math.abs(distY)) {
                // Horizontal swipe
                if (distX > 0) {
                    this.game.moveRight();
                } else {
                    this.game.moveLeft();
                }
            } else {
                // Vertical swipe
                if (distY > 0) {
                    this.game.softDrop();
                } else {
                    // Swipe up = hard drop
                    this.game.hardDrop();
                }
            }
        }
        
        // Reset touch tracking
        this.touchStartX = null;
        this.touchStartY = null;
        this.lastTouchX = null;
        this.lastTouchY = null;
        this.touchStartTime = null;
    }
    
    /**
     * Clean up event listeners and DOM elements
     */
    cleanup() {
        // Remove mobile controls if they exist
        const mobileControls = document.querySelector('.mobile-controls');
        if (mobileControls) {
            mobileControls.remove();
        }
        
        // Remove debug element if it exists
        if (this.debugElement) {
            this.debugElement.remove();
            this.debugElement = null;
        }
    }
}