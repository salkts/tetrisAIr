# NES-Style Tetris Game - Product Requirements Document

## Overview
This document outlines the requirements for a web-based Tetris game that faithfully recreates the classic NES Tetris style and gameplay mechanics. The game will be built using HTML5, CSS3, and JavaScript with a modular architecture for maintainability. It will adhere to the **official Tetris guidelines**, including the Super Rotation System (SRS), 7-bag piece randomizer, and classic scoring.

## Game Features

### Core Gameplay
1. **Standard Tetris Rules**
   - 7 different tetromino pieces (I, J, L, O, S, T, Z)
   - Pieces fall from the top of the playfield
   - Player can move pieces left, right, down, and rotate them
   - When a horizontal line is filled with blocks, it clears and awards points
   - Game ends when pieces stack to the top of the playfield

2. **Controls**
   - Left/Right Arrow: Move piece horizontally
   - Down Arrow: Soft drop (accelerate descent)
   - Up Arrow: Rotate piece clockwise
   - Z Key: Rotate piece counter-clockwise
   - Space: Hard drop (instant placement)
   - C Key: Hold piece
   - P Key: Pause game
   - R Key: Restart game (with confirmation)
   - Esc: Return to menu

3. **Scoring System**
   - Single line clear: 100 × level
   - Double line clear: 300 × level
   - Triple line clear: 500 × level
   - Tetris (four lines): 800 × level
   - Back-to-back Tetris: 1200 × level
   - Soft drop: 1 point per cell dropped
   - Hard drop: 2 points per cell dropped

4. **Level System**
   - Starting level selectable from 1, 5, 10, 15, 20, 25
   - Level increases after every 10 lines cleared
   - Piece fall speed increases with each level
   - Visual changes (colors) based on level

### Game Modes
1. **A-Type (Marathon)**
   - Standard endless mode
   - Goal: Achieve highest score possible
   - Level increases as lines are cleared

2. **Menu System**
   - Start Game (with level selection)
   - High Scores
   - Controls
   - Options (sound, music)

### Special Features
1. **Hold Piece**
   - Player can store one piece for later use
   - Can only use hold once per piece
   - Hold slot displayed in UI

2. **Next Piece Preview**
   - Shows the next piece that will appear
   - Displayed in the UI sidebar

3. **Ghost Piece**
   - Semi-transparent outline showing where the current piece will land
   - Helps with precision placement

4. **Statistics**
   - Track and display number of each piece type received
   - Display current score, level, and lines cleared

5. **Game States**
   - Menu
   - Playing
   - Paused
   - Game Over (with restart option)

## Visual Design
1. **NES Tetris Style**
   - Dark background for the play area
   - Visible grid lines
   - Gray tetromino blocks with colored outlines
   - Brick pattern border around the game area
   - Panel-based layout for game information

2. **UI Elements**
   - A-TYPE display
   - LEVEL display
   - LINES count
   - SCORE display
   - TOP score display
   - NEXT piece preview
   - HOLD piece display
   - STATISTICS panel

3. **Animations**
   - Line clear animation
   - Game over animation
   - Level up indication

## Technical Requirements
1. **Responsive Design**
   - Playable on desktop browsers
   - Scales appropriately for different screen sizes
   - Minimum supported resolution: 800x600

2. **Performance**
   - Consistent 60 FPS
   - No input lag
   - Smooth animations

3. **Code Architecture**
   - Modular design with separation of concerns
   - Clear file organization
   - Well-documented code
   - No files over 300 lines of code

4. **Browser Compatibility**
   - Chrome, Firefox, Safari, Edge (latest versions)
   - No external dependencies required

## Success Criteria
1. Game runs smoothly with no visual glitches
2. All features function as described
3. Code is well-organized and maintainable
4. Visual design matches NES Tetris aesthetic
5. Controls are responsive and intuitive
