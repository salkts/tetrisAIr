/**
 * NES-Style Tetris - Background Animation
 * This file creates a starry night background with falling Tetris pieces
 */

class BackgroundManager {
    constructor() {
        this.stars = [];
        this.fallingPieces = [];
        this.maxStars = 100;
        this.maxFallingPieces = 15;
        this.pieceColors = ['#00FFFF', '#0000FF', '#FF7F00', '#FFFF00', '#00FF00', '#800080', '#FF0000'];
        this.pieceTypes = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
        this.pieceShapes = {
            'I': [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ],
            'J': [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            'L': [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0]
            ],
            'O': [
                [1, 1],
                [1, 1]
            ],
            'S': [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0]
            ],
            'T': [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            'Z': [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0]
            ]
        };
        
        // Create a container for all background elements
        this.container = document.createElement('div');
        this.container.id = 'background-container';
        this.container.style.position = 'fixed';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.overflow = 'hidden';
        this.container.style.pointerEvents = 'none';
        this.container.style.zIndex = '-5'; // Below everything else
        document.body.appendChild(this.container);
        
        this.init();
    }
    
    /**
     * Initialize the background
     */
    init() {
        // Create stars
        this.createStars();
        
        // Create initial falling pieces
        this.createFallingPieces();
        
        // Start animation loop
        this.animate();
    }
    
    /**
     * Create stars in the background
     */
    createStars() {
        for (let i = 0; i < this.maxStars; i++) {
            const star = document.createElement('div');
            star.classList.add('star');
            
            // Random position
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            
            // Random size (1-3px)
            const size = Math.random() * 2 + 1;
            
            // Random opacity
            const opacity = Math.random() * 0.5 + 0.3;
            
            // Apply styles
            star.style.left = `${x}px`;
            star.style.top = `${y}px`;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.opacity = opacity;
            
            // Add to container
            this.container.appendChild(star);
            
            // Store reference
            this.stars.push({
                element: star,
                x,
                y,
                size,
                opacity,
                twinkleSpeed: Math.random() * 0.01 + 0.003,
                twinkleDirection: Math.random() > 0.5 ? 1 : -1
            });
        }
    }
    
    /**
     * Create falling Tetris pieces
     */
    createFallingPieces() {
        // Create initial pieces
        for (let i = 0; i < this.maxFallingPieces; i++) {
            this.createFallingPiece();
        }
    }
    
    /**
     * Create a single falling Tetris piece
     */
    createFallingPiece() {
        // Create container element
        const pieceElement = document.createElement('div');
        pieceElement.classList.add('falling-piece');
        
        // Random position (only from top of screen)
        const x = Math.random() * window.innerWidth;
        const y = -100 - Math.random() * 300; // Start above the viewport
        
        // Random rotation
        const rotation = Math.random() * 360;
        
        // Random piece type
        const typeIndex = Math.floor(Math.random() * this.pieceTypes.length);
        const type = this.pieceTypes[typeIndex];
        const color = this.pieceColors[typeIndex];
        
        // Random size (15-30px per block)
        const blockSize = Math.random() * 15 + 15;
        
        // Random falling speed
        const speed = Math.random() * 0.5 + 0.2;
        
        // Random rotation speed
        const rotationSpeed = (Math.random() * 0.5 + 0.1) * (Math.random() > 0.5 ? 1 : -1);
        
        // Get the piece shape
        const shape = this.pieceShapes[type];
        
        // Calculate piece dimensions
        const width = shape[0].length * blockSize;
        const height = shape.length * blockSize;
        
        // Create the piece HTML
        pieceElement.style.width = `${width}px`;
        pieceElement.style.height = `${height}px`;
        pieceElement.style.left = `${x}px`;
        pieceElement.style.top = `${y}px`;
        pieceElement.style.transform = `rotate(${rotation}deg)`;
        
        // Create the blocks
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const block = document.createElement('div');
                    block.style.position = 'absolute';
                    block.style.width = `${blockSize}px`;
                    block.style.height = `${blockSize}px`;
                    block.style.left = `${col * blockSize}px`;
                    block.style.top = `${row * blockSize}px`;
                    block.style.backgroundColor = 'transparent';
                    block.style.border = `2px solid ${color}`;
                    
                    pieceElement.appendChild(block);
                }
            }
        }
        
        // Add to container
        this.container.appendChild(pieceElement);
        
        // Store reference
        this.fallingPieces.push({
            element: pieceElement,
            x,
            y,
            rotation,
            speed,
            rotationSpeed,
            width,
            height
        });
    }
    
    /**
     * Animate the background elements
     */
    animate() {
        // Animate stars (twinkle effect)
        this.stars.forEach(star => {
            // Update opacity for twinkle effect
            star.opacity += star.twinkleSpeed * star.twinkleDirection;
            
            // Reverse direction if opacity limits reached
            if (star.opacity > 0.8 || star.opacity < 0.3) {
                star.twinkleDirection *= -1;
            }
            
            // Apply new opacity
            star.element.style.opacity = star.opacity;
        });
        
        // Animate falling pieces
        this.fallingPieces.forEach((piece, index) => {
            // Update position
            piece.y += piece.speed;
            piece.rotation += piece.rotationSpeed;
            
            // Apply new position and rotation
            piece.element.style.top = `${piece.y}px`;
            piece.element.style.transform = `rotate(${piece.rotation}deg)`;
            
            // Remove if off screen
            if (piece.y > window.innerHeight + 100) {
                piece.element.remove();
                this.fallingPieces.splice(index, 1);
                
                // Create a new piece to replace it
                this.createFallingPiece();
            }
        });
        
        // Continue animation loop
        requestAnimationFrame(() => this.animate());
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        // Update star positions
        this.stars.forEach(star => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            
            star.x = x;
            star.y = y;
            
            star.element.style.left = `${x}px`;
            star.element.style.top = `${y}px`;
        });
    }
}

// Initialize the background when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const backgroundManager = new BackgroundManager();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        backgroundManager.handleResize();
    });
});
