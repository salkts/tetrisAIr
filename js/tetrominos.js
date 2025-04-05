/**
 * NES-Style Tetris - Tetromino Definitions and Operations
 * This file contains the Tetromino class and related functionality
 */

// Tetromino shapes defined as 4x4 matrices
// 0 = empty space, 1 = filled block
const SHAPES = {
    I: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    J: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    L: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ],
    O: [
        [1, 1],
        [1, 1]
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    T: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ]
};

/**
 * Tetromino class - represents a tetromino piece in the game
 */
class Tetromino {
    /**
     * Create a new tetromino
     * @param {string} type - The type of tetromino (I, J, L, O, S, T, Z)
     */
    constructor(type) {
        this.type = type;
        this.shape = SHAPES[type];
        this.color = COLORS[type];
        this.x = Math.floor(COLS / 2) - Math.floor(this.shape[0].length / 2);
        this.y = 0;
        this.rotation = 0; // 0, 1, 2, 3 (0, 90, 180, 270 degrees)
    }

    /**
     * Get the current rotated shape of the tetromino
     * @returns {Array<Array<number>>} The current shape matrix
     */
    getCurrentShape() {
        return this.getRotatedShape(this.rotation);
    }

    /**
     * Get the shape matrix for a specific rotation
     * @param {number} rotation - The rotation state (0-3)
     * @returns {Array<Array<number>>} The rotated shape matrix
     */
    getRotatedShape(rotation) {
        if (rotation === 0) return this.shape;
        
        const originalShape = this.shape;
        let rotatedShape;
        
        // Handle different rotations
        switch (rotation % 4) {
            case 1: // 90 degrees clockwise
                rotatedShape = this.transposeMatrix(originalShape);
                return this.reverseRows(rotatedShape);
            case 2: // 180 degrees
                rotatedShape = this.cloneMatrix(originalShape);
                return this.reverseRows(this.reverseColumns(rotatedShape));
            case 3: // 270 degrees clockwise (or 90 counterclockwise)
                rotatedShape = this.transposeMatrix(originalShape);
                return this.reverseColumns(rotatedShape);
            default:
                return originalShape;
        }
    }

    /**
     * Transpose a matrix (swap rows and columns)
     * @param {Array<Array<number>>} matrix - The matrix to transpose
     * @returns {Array<Array<number>>} The transposed matrix
     */
    transposeMatrix(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const result = Array(cols).fill().map(() => Array(rows).fill(0));
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                result[j][i] = matrix[i][j];
            }
        }
        
        return result;
    }

    /**
     * Reverse the rows of a matrix
     * @param {Array<Array<number>>} matrix - The matrix to modify
     * @returns {Array<Array<number>>} The modified matrix
     */
    reverseRows(matrix) {
        return matrix.map(row => [...row].reverse());
    }

    /**
     * Reverse the columns of a matrix
     * @param {Array<Array<number>>} matrix - The matrix to modify
     * @returns {Array<Array<number>>} The modified matrix
     */
    reverseColumns(matrix) {
        return [...matrix].reverse();
    }

    /**
     * Create a deep copy of a matrix
     * @param {Array<Array<number>>} matrix - The matrix to clone
     * @returns {Array<Array<number>>} A new matrix with the same values
     */
    cloneMatrix(matrix) {
        return matrix.map(row => [...row]);
    }

    /**
     * Move the tetromino left
     */
    moveLeft() {
        this.x--;
    }

    /**
     * Move the tetromino right
     */
    moveRight() {
        this.x++;
    }

    /**
     * Move the tetromino down
     */
    moveDown() {
        this.y++;
    }

    /**
     * Rotate the tetromino clockwise
     */
    rotate() {
        this.rotation = (this.rotation + 1) % 4;
    }

    /**
     * Rotate the tetromino counter-clockwise
     */
    rotateCounterClockwise() {
        this.rotation = (this.rotation + 3) % 4;
    }
}

/**
 * TetrominoGenerator class - implements the 7-bag randomizer
 * Ensures a fair distribution of pieces
 */
class TetrominoGenerator {
    constructor() {
        this.bag = [];
        this.refillBag();
    }

    /**
     * Refill the bag with one of each tetromino type in random order
     */
    refillBag() {
        this.bag = [...TETROMINO_TYPES];
        // Shuffle the bag using Fisher-Yates algorithm
        for (let i = this.bag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
        }
    }

    /**
     * Get the next tetromino from the bag
     * @returns {Tetromino} A new tetromino instance
     */
    getNextTetromino() {
        if (this.bag.length === 0) {
            this.refillBag();
        }
        
        const type = this.bag.pop();
        return new Tetromino(type);
    }

    /**
     * Peek at the next tetromino type without removing it from the bag
     * @returns {string} The type of the next tetromino
     */
    peekNextType() {
        if (this.bag.length === 0) {
            this.refillBag();
        }
        
        return this.bag[this.bag.length - 1];
    }
}
