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
        
        // Additional tracking for improved movement control
        this.lastMovedAtX = null; // X position where last movement occurred
        this.lastMovedAtY = null; // Y position where last movement occurred
        this.lastMoveTime = null; // Timestamp of last movement
        this.lastMoveDirection = null; // Direction of last movement
        this.keyboardHandlerAdded = false;
        
        // Thresholds for swipe detection
        this.swipeThreshold = 50; // Minimum distance for a swipe
        this.swipeTimeThreshold = 300; // Maximum time in ms for a swipe
        this.tapThreshold = 20; // Maximum movement for a tap
        
        // Debug mode
        this.debugMode = false; // Debug mode disabled
        this.debugElement = null;
        
        // Initialize controls
        this.initialize();
        
        // Add window resize listener to handle orientation changes
        window.addEventListener('resize', this.handleResize.bind(this));
    }
    
    /**
     * Initialize mobile controls based on current device detection
     */
    initialize() {
        // Update mobile detection
        this.isMobile = this.detectMobile();
        
        // Clean up any existing controls
        this.cleanup();
        
        // Set up mobile controls if on mobile
        if (this.isMobile) {
            this.setupMobileControls();
            this.setupMobilePieceContainers(); // Add mobile-specific next and hold containers
            this.setupEventListeners();
            
            if (this.debugMode) {
                this.setupDebugElement();
            }
            
            console.log('Mobile controls initialized');
        } else {
            console.log('Desktop mode detected - mobile controls disabled');
        }
    }
    
    /**
     * Handle window resize events
     */
    handleResize() {
        const wasMobile = this.isMobile;
        const isMobileNow = this.detectMobile();
        
        // Only reinitialize if the device type changed
        if (wasMobile !== isMobileNow) {
            console.log(`Device type changed: ${wasMobile ? 'Mobile → Desktop' : 'Desktop → Mobile'}`);
            this.initialize();
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
        // Create a separate container for the pause button at the top left
        const pauseContainer = document.createElement('div');
        pauseContainer.className = 'mobile-pause-container';
        
        // Create a separate container for the hold button at the bottom right
        const holdContainer = document.createElement('div');
        holdContainer.className = 'mobile-hold-container';
        
        // Create pause button with NES-style square design
        const pauseButton = document.createElement('button');
        pauseButton.className = 'mobile-btn pause-btn nes-style';
        pauseButton.innerHTML = '❚❚';
        pauseButton.setAttribute('aria-label', 'Pause Game');
        
        // Create hold button with NES-style square design
        const holdButton = document.createElement('button');
        holdButton.className = 'mobile-btn hold-btn nes-style';
        holdButton.innerHTML = 'HOLD';
        holdButton.setAttribute('aria-label', 'Hold Piece');
        
        // Add buttons to their containers
        pauseContainer.appendChild(pauseButton);
        holdContainer.appendChild(holdButton);
        
        // Add containers to the game area
        const gameArea = document.querySelector('.game-area');
        if (gameArea) {
            gameArea.appendChild(pauseContainer);
            gameArea.appendChild(holdContainer);
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
            this.debugElement.innerHTML = message;
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
                { action: '❚❚ Button', description: 'Pause Game' }
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
        // Get a fresh reference to the game board element
        const gameBoard = document.getElementById('game-board');
        if (!gameBoard) {
            console.error('Game board element not found');
            return;
        }
        
        // Store these bound handlers so we can reference them later if needed
        this.boundTouchStart = this.handleTouchStart.bind(this);
        this.boundTouchMove = this.handleTouchMove.bind(this);
        this.boundTouchEnd = this.handleTouchEnd.bind(this);
        
        // Prevent default touch actions on the game board
        gameBoard.addEventListener('touchstart', this.boundTouchStart, { passive: false });
        gameBoard.addEventListener('touchmove', this.boundTouchMove, { passive: false });
        gameBoard.addEventListener('touchend', this.boundTouchEnd, { passive: false });
        
        // Add direct click handler for rotation
        this.boundClickHandler = (e) => {
            if (this.game.state === GAME_STATES.PLAYING) {
                e.preventDefault();
                this.game.rotate();
            }
        };
        gameBoard.addEventListener('click', this.boundClickHandler);
        
        // Prevent context menu on long press
        this.boundContextMenuHandler = (e) => {
            e.preventDefault();
            return false;
        };
        gameBoard.addEventListener('contextmenu', this.boundContextMenuHandler);
        
        // Add direct keyboard controls as a fallback
        // We don't need to remove this as it's on the document level and won't be duplicated
        if (!this.keyboardHandlerAdded) {
            this.boundKeydownHandler = (e) => {
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
            };
            document.addEventListener('keydown', this.boundKeydownHandler);
            this.keyboardHandlerAdded = true;
        }
        
        if (this.debugMode) {
            console.log('Event listeners set up on game board');
        }
    }
    
    /**
     * Handle touch start event
     * @param {TouchEvent} e - Touch event
     */
    handleTouchStart(e) {
        // Always prevent default
        e.preventDefault();
        
        if (this.game.state !== GAME_STATES.PLAYING) return;
        
        const touch = e.touches[0];
        
        // Reset all tracking variables first
        this.resetTouchTracking();
        
        // Record the starting position and time
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.lastTouchX = touch.clientX;
        this.lastTouchY = touch.clientY;
        this.touchStartTime = Date.now();
        
        if (this.debugMode) {
            this.updateDebug(`Touch Start: (${this.touchStartX.toFixed(2)}, ${this.touchStartY.toFixed(2)})`);
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
        
        // Calculate total distance from start
        const totalDeltaX = currentX - this.touchStartX;
        const totalDeltaY = currentY - this.touchStartY;
        
        // Track the current direction of movement
        // This allows us to detect direction changes during a swipe
        const currentDirection = Math.abs(totalDeltaX) > Math.abs(totalDeltaY) ? 
            (totalDeltaX > 0 ? 'right' : 'left') : 
            (totalDeltaY > 0 ? 'down' : 'up');
        
        // Store the last movement timestamp and direction
        const now = Date.now();
        if (!this.lastMoveTime) this.lastMoveTime = now;
        if (!this.lastMoveDirection) this.lastMoveDirection = currentDirection;
        
        // Calculate time since last movement
        const timeSinceLastMove = now - this.lastMoveTime;
        
        if (this.debugMode) {
            this.updateDebug(
                `Touch Move: (${currentX.toFixed(2)}, ${currentY.toFixed(2)})<br>
                Delta: (${deltaX.toFixed(2)}, ${deltaY.toFixed(2)})<br>
                Total: (${totalDeltaX.toFixed(2)}, ${totalDeltaY.toFixed(2)})<br>
                Direction: ${currentDirection}<br>
                Last Direction: ${this.lastMoveDirection}<br>
                Time since last move: ${timeSinceLastMove}ms`
            );
        }
        
        // Define movement thresholds based on block size (assuming 32px blocks)
        const blockSize = 32;
        // Horizontal movement thresholds - increased for more precision
        const moveThresholdHorizontal = blockSize * 0.5; // 50% of block for initial horizontal movement
        const additionalMoveThresholdHorizontal = blockSize * 0.7; // 70% of block for subsequent horizontal movements
        
        // Vertical movement thresholds - different values for up vs down
        const moveThresholdDown = blockSize * 0.2; // 20% of block for initial downward movement (more sensitive)
        const additionalMoveThresholdDown = blockSize * 0.3; // 30% of block for subsequent downward movements
        
        // Use standard thresholds as fallback
        const moveThreshold = blockSize * 0.4; // 40% of block for initial movement
        const additionalMoveThreshold = blockSize * 0.6; // 60% of block for subsequent movements
        
        // Handle horizontal movement
        if (Math.abs(totalDeltaX) > Math.abs(totalDeltaY)) {
            // Check if direction changed
            const directionChanged = 
                (this.lastMoveDirection === 'left' && currentDirection === 'right') ||
                (this.lastMoveDirection === 'right' && currentDirection === 'left');
            
            // Reset movement tracking if direction changed - immediately respond to direction changes
            if (directionChanged) {
                this.lastMovedAtX = currentX;
                this.lastMoveDirection = currentDirection;
                this.lastMoveTime = 0; // Reset time to allow immediate movement in new direction
                
                // Immediately move in the new direction
                if (currentDirection === 'right') {
                    this.game.moveRight();
                } else {
                    this.game.moveLeft();
                }
            }
            
            // Calculate distance since last movement action
            const distanceSinceLastMove = !this.lastMovedAtX ? 
                Math.abs(totalDeltaX) : 
                Math.abs(currentX - this.lastMovedAtX);
            
            // Determine if we should move based on distance and time
            const shouldMove = 
                // First movement needs less distance
                (!this.lastMovedAtX && distanceSinceLastMove > moveThresholdHorizontal) ||
                // Subsequent movements need more distance and some time delay
                (this.lastMovedAtX && 
                 distanceSinceLastMove > additionalMoveThresholdHorizontal && 
                 timeSinceLastMove > 70); // Increased delay to 70ms between moves for more precision
            
            if (shouldMove) {
                if (currentDirection === 'right') {
                    this.game.moveRight();
                } else {
                    this.game.moveLeft();
                }
                
                // Update tracking after movement
                this.lastMovedAtX = currentX;
                this.lastMoveTime = now;
                this.lastMoveDirection = currentDirection;
            }
        }
        // Handle vertical movement
        else {
            // Check if direction changed
            const directionChanged = 
                (this.lastMoveDirection === 'up' && currentDirection === 'down') ||
                (this.lastMoveDirection === 'down' && currentDirection === 'up');
            
            // Reset movement tracking if direction changed - immediately respond to direction changes
            if (directionChanged) {
                this.lastMovedAtY = currentY;
                this.lastMoveDirection = currentDirection;
                this.lastMoveTime = 0; // Reset time to allow immediate movement in new direction
                
                // Immediately move in the new direction
                if (currentDirection === 'down') {
                    this.game.softDrop();
                } else if (Math.abs(totalDeltaY) > blockSize * 1.8) { // Increased threshold for hard drop on direction change
                    this.game.hardDrop();
                    this.resetTouchTracking();
                    return;
                }
            }
            
            // Calculate distance since last movement action
            const distanceSinceLastMove = !this.lastMovedAtY ? 
                Math.abs(totalDeltaY) : 
                Math.abs(currentY - this.lastMovedAtY);
            
            // Determine if we should move based on distance and time - different logic for up vs down
            const isDownwardSwipe = currentDirection === 'down';
            const moveThresholdToUse = isDownwardSwipe ? moveThresholdDown : moveThreshold * 1.5; // More sensitive for down, less for up
            const additionalMoveThresholdToUse = isDownwardSwipe ? additionalMoveThresholdDown : additionalMoveThreshold * 1.5;
            const timeDelayToUse = isDownwardSwipe ? 40 : 80; // Faster for downward movement, slower for upward
            
            const shouldMove = 
                // First movement needs less distance
                (!this.lastMovedAtY && distanceSinceLastMove > moveThresholdToUse) ||
                // Subsequent movements need more distance and some time delay
                (this.lastMovedAtY && 
                 distanceSinceLastMove > additionalMoveThresholdToUse && 
                 timeSinceLastMove > timeDelayToUse);
            
            if (shouldMove) {
                if (currentDirection === 'down') {
                    this.game.softDrop();
                    this.lastMovedAtY = currentY;
                    this.lastMoveTime = now;
                    this.lastMoveDirection = 'down';
                } else if (Math.abs(totalDeltaY) > blockSize * 3) { // Hard drop requires a much longer swipe (increased from 2x to 3x)
                    this.game.hardDrop();
                    
                    // Reset touch tracking after hard drop
                    this.resetTouchTracking();
                    return;
                }
            }
        }
        
        // Always update the last touch position
        this.lastTouchX = currentX;
        this.lastTouchY = currentY;
    }
    
    /**
     * Handle touch end event
     * @param {TouchEvent} e - Touch event
     */
    handleTouchEnd(e) {
        // Always prevent default
        e.preventDefault();
        
        if (this.game.state !== GAME_STATES.PLAYING || this.touchStartX === null) {
            // Reset all touch tracking variables
            this.resetTouchTracking();
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
            this.updateDebug(`Touch End: (${endX.toFixed(2)}, ${endY.toFixed(2)})<br>Distance: (${distX.toFixed(2)}, ${distY.toFixed(2)})<br>Duration: ${touchDuration}ms<br>Total: ${totalDistance.toFixed(2)}px`);
        }
        
        // Define block size for thresholds
        const blockSize = 32;
        
        // Check if it was a tap (short duration, minimal movement)
        if (touchDuration < this.swipeTimeThreshold && totalDistance < this.tapThreshold) {
            this.game.rotate();
        }
        // Check if it was a final swipe action that wasn't handled during move events
        else if (totalDistance >= blockSize * 0.5) {
            // Only handle if we haven't moved recently (within 100ms) AND this is a vertical swipe
            // We'll disable horizontal movements on touch end to prevent the double-movement issue
            const timeSinceLastMove = Date.now() - (this.lastMoveTime || 0);
            const isVerticalSwipe = Math.abs(distY) > Math.abs(distX);
            
            if (timeSinceLastMove > 100 && isVerticalSwipe) {
                // Only handle vertical swipes on touch end
                if (distY > 0) {
                    this.game.softDrop();
                } else if (Math.abs(distY) > blockSize * 2.5) { // Much higher threshold for hard drop (increased from 1.5x to 2.5x)
                    // Swipe up = hard drop
                    this.game.hardDrop();
                }
            }
        }
        
        // Reset all touch tracking variables
        this.resetTouchTracking();
    }
    
    /**
     * Reset all touch tracking variables
     */
    resetTouchTracking() {
        this.touchStartX = null;
        this.touchStartY = null;
        this.lastTouchX = null;
        this.lastTouchY = null;
        this.touchStartTime = null;
        this.lastMovedAtX = null;
        this.lastMovedAtY = null;
        this.lastMoveTime = null;
        this.lastMoveDirection = null;
    }
    
    /**
     * Clean up event listeners and DOM elements
     */
    cleanup() {
        // Remove mobile controls elements if they exist
        const mobileElements = document.querySelectorAll('.mobile-pause-container, .mobile-hold-container, .mobile-pieces-container');
        mobileElements.forEach(element => {
            if (element) element.remove();
        });
        
        // Remove debug element if it exists
        if (this.debugElement) {
            this.debugElement.remove();
            this.debugElement = null;
        }
        
        // Clear any intervals
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        
        // Remove event listeners from game board without replacing the element
        const gameBoard = document.getElementById('game-board');
        if (gameBoard && this.boundTouchStart) {
            gameBoard.removeEventListener('touchstart', this.boundTouchStart);
            gameBoard.removeEventListener('touchmove', this.boundTouchMove);
            gameBoard.removeEventListener('touchend', this.boundTouchEnd);
            gameBoard.removeEventListener('click', this.boundClickHandler);
            gameBoard.removeEventListener('contextmenu', this.boundContextMenuHandler);
            
            // Log cleanup for debugging
            if (this.debugMode) {
                console.log('Removed event listeners from game board');
            }
        }
    }
    
    /**
     * Set up mobile-specific next and hold piece containers
     * These will appear in the top right of the board
     */
    setupMobilePieceContainers() {
        // Create container for both next and hold pieces
        const piecesContainer = document.createElement('div');
        piecesContainer.className = 'mobile-pieces-container';
        
        // Create mobile next piece container
        const nextContainer = document.createElement('div');
        nextContainer.className = 'mobile-next-container';
        
        // Create mobile hold piece container
        const holdContainer = document.createElement('div');
        holdContainer.className = 'mobile-hold-container-box';
        
        // Add labels
        const nextLabel = document.createElement('div');
        nextLabel.className = 'mobile-piece-label';
        nextLabel.textContent = 'NEXT';
        
        const holdLabel = document.createElement('div');
        holdLabel.className = 'mobile-piece-label';
        holdLabel.textContent = 'HOLD';
        
        // Create canvases for pieces
        const nextCanvas = document.createElement('canvas');
        nextCanvas.id = 'mobile-next-piece';
        nextCanvas.width = 80;
        nextCanvas.height = 80;
        
        const holdCanvas = document.createElement('canvas');
        holdCanvas.id = 'mobile-hold-piece';
        holdCanvas.width = 80;
        holdCanvas.height = 80;
        
        // Add elements to containers
        nextContainer.appendChild(nextLabel);
        nextContainer.appendChild(nextCanvas);
        
        holdContainer.appendChild(holdLabel);
        holdContainer.appendChild(holdCanvas);
        
        // Add containers to main container
        piecesContainer.appendChild(nextContainer);
        piecesContainer.appendChild(holdContainer);
        
        // Add container to the game area
        const gameArea = document.querySelector('.game-area');
        if (gameArea) {
            gameArea.appendChild(piecesContainer);
        }
        
        // Set up synchronization with the main next and hold pieces
        this.syncMobilePieces();
    }
    
    /**
     * Synchronize mobile piece displays with the main next and hold pieces
     */
    syncMobilePieces() {
        // Get references to the original canvases
        const originalNextCanvas = document.getElementById('next-piece');
        const originalHoldCanvas = document.getElementById('hold-piece');
        
        // Get references to the mobile canvases
        const mobileNextCanvas = document.getElementById('mobile-next-piece');
        const mobileHoldCanvas = document.getElementById('mobile-hold-piece');
        
        if (!originalNextCanvas || !originalHoldCanvas || !mobileNextCanvas || !mobileHoldCanvas) {
            console.error('Could not find all required canvas elements');
            return;
        }
        
        // Function to copy canvas content
        const copyCanvas = (source, destination) => {
            const destCtx = destination.getContext('2d');
            destCtx.clearRect(0, 0, destination.width, destination.height);
            destCtx.drawImage(source, 0, 0, source.width, source.height, 
                             0, 0, destination.width, destination.height);
        };
        
        // Initial copy
        copyCanvas(originalNextCanvas, mobileNextCanvas);
        copyCanvas(originalHoldCanvas, mobileHoldCanvas);
        
        // Set up an interval to ensure synchronization
        this.syncInterval = setInterval(() => {
            copyCanvas(originalNextCanvas, mobileNextCanvas);
            copyCanvas(originalHoldCanvas, mobileHoldCanvas);
        }, 500); // Update every 500ms
    }
}