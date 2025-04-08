/**
 * NES-Style Tetris - Main Entry Point
 * This file initializes the game and handles the main application flow
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create a new game instance
    const game = new Game();
    
    // Initialize mobile controls if on a mobile device
    const mobileControls = new MobileControls(game);
    
    // Add event listener for window focus/blur to auto-pause
    window.addEventListener('blur', () => {
        if (game.state === GAME_STATES.PLAYING) {
            game.pauseGame();
        }
    });
    
    // Add event listener for window resize to adjust canvas if needed
    window.addEventListener('resize', () => {
        // If we need to adjust the canvas size based on window size
        // This would be implemented here
        
        // Update mobile controls detection on resize
        if (mobileControls) {
            const wasMobile = mobileControls.isMobile;
            mobileControls.isMobile = mobileControls.detectMobile();
            
            // If device type changed, update the controls
            if (wasMobile !== mobileControls.isMobile) {
                mobileControls.cleanup();
                mobileControls.setupMobileControls();
                mobileControls.updateControlsModal();
            }
        }
    });
    
    // Add a cleanup function for when the page is unloaded
    window.addEventListener('beforeunload', () => {
        game.cleanup();
        if (mobileControls) {
            mobileControls.cleanup();
        }
    });
    
    // Log that the game has initialized
    console.log('NES-Style Tetris initialized successfully!');
});
