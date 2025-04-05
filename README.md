# NES-Style Tetris Game

A faithful recreation of the classic NES Tetris game using HTML5, CSS3, and JavaScript. This implementation follows the original NES Tetris aesthetics while incorporating modern gameplay features.

## Features

- Classic NES-style visual design with dark background and colored block outlines
- Standard Tetris rules with 7 different tetromino pieces
- Super Rotation System (SRS) with wall kicks
- 7-bag randomizer for fair piece distribution
- Ghost piece to help with precision placement
- Hold piece functionality
- Next piece preview
- Scoring system based on the original NES Tetris
- Level progression with increasing speed
- Statistics tracking
- Responsive design for different screen sizes

## Controls

- **Left/Right Arrow**: Move piece horizontally
- **Down Arrow**: Soft drop (accelerate descent)
- **Up Arrow**: Rotate piece clockwise
- **Z Key**: Rotate piece counter-clockwise
- **Space**: Hard drop (instant placement)
- **C Key**: Hold piece
- **P Key**: Pause game
- **R Key**: Restart game
- **Esc**: Return to menu

## How to Play

1. Open `index.html` in a web browser
2. Select your starting level (1-25)
3. Click "START GAME" or press Enter
4. Play the game using the controls listed above
5. Try to clear as many lines as possible and achieve a high score

## Game Modes

- **A-Type (Marathon)**: Standard endless mode where you try to achieve the highest score possible

## Technical Details

- No external dependencies required
- Modular code architecture with separation of concerns
- Responsive design that works on desktop browsers
- Compatible with Chrome, Firefox, Safari, and Edge (latest versions)

## Development

This project is organized into the following structure:

- `index.html`: Main HTML file
- `css/styles.css`: Main stylesheet
- `js/main.js`: Entry point for the application
- `js/constants.js`: Game constants and configurations
- `js/tetrominos.js`: Tetromino definitions and operations
- `js/board.js`: Game board logic
- `js/game.js`: Game state and mechanics
- `js/renderer.js`: Rendering logic
- `js/input.js`: Input handling

## License

This project is created for educational purposes and is not affiliated with The Tetris Company or Nintendo.
