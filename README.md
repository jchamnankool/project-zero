# Tic-Tac-Toe
A classic Tic-Tac-Toe game for your browser, played to a best of three whether against your friend or an unbeatable AI.

## Usage
You can play the game [here](https://jchamnankool.github.io/project-zero/) at any time. No installations are required.

You will first be prompted to choose a game mode. If you have someone to play with (or just want to play against yourself), you can choose the "Play against a friend" option. If you'd like to try against the AI, you can choose "Suffer against the AI".

The prompt that will pop up if you choose to play against the AI is a fair warning. The AI is built using an algorithm that guarantees it will either win or draw every time. If that's your kind of thing, then this is the game mode for you.

If you don't know how to play Tic-Tac-Toe, the rules are as follows:
1. Players take turns putting their marks in empty squares. 
2. The first player to get 3 of their marks in a row (up, down, across, or diagonally) is the winner.
3. When all 9 squares are full, the game is over.

Either game mode has the exact same board layout and usage. You can simply click on the square you want to place your piece in, and then your friend or the AI will play next. Squares that have already been chosen cannot be chosen again, but you can click "Reset Moves" to reset the board if at least one move has already been made. This will continue until a draw has been made or a winner is declared.

After one round is completed, a score tracker will show underneath the board to see who has won which round, or if a round has ended in a draw. When a player has reached a best of three, the tracker will reflect the results of the game, and a "New Game" button will appear.

## How the AI works
The AI determines its moves using a minimax algorithm with alpha-beta pruning optimization. In other words, it evaluates the board for possible future moves, and then chooses the best one for its current position.

It achieves this through a recursive function that returns a value if a terminal state (the end of the game) is found at each empty spot on the board. After evaluating the returning values from each function call, it returns the best value.

The algorithm is broken down in the code shown below.

First, the algorithm must find what empty squares are available to play in.

```js
const availableSpots = emptySquares();
```
```js
const emptySquares = function () {
    return originalBoard.filter(square => typeof square === "number");
};
```

The algorithm then assigns values to each square. If placing a piece in the square would lead to a victory for the human player, the square is assigned a score of `-10`. If it leads to victory for the AI, the square is assigned a score of `10`. Alternatively, for a draw, the square will be assigned a score of `0`.

```js
if (checkWin(newBoard, human)) {
    return {score: -10};
} else if (checkWin(newBoard, AI)) {
    return {score: 10};
} else if (availableSpots.length === 0) {
    return {score: 0};
}
```

The scores from each empty spot are then collected into an array for later evaluation using a `for` loop. The moves are stored by index and corresponding score.

The `minimax` function will continue to recursively call itself until it reaches a terminal state and returns a score one level up. Once it returns a score, the function will reset the board and push the move to the `moves` array.

```js
const moves = [];
for (let i = 0; i < availableSpots.length; i++) {
    let move = {};
    move.index = newBoard[availableSpots[i]];
    newBoard[availableSpots[i]] = player;

    if (player == AI) {
        const result = minimax(newBoard, human);
        move.score = result.score;
    } else {
        const result = minimax(newBoard, AI);
        move.score = result.score;
    }

    newBoard[availableSpots[i]] = move.index;
    moves.push(move);
}
```

To evaluate the best move in the `moves` array, it will choose the highest score if `currentPlayer` is the AI, or the lowest score if `currentPlayer` is the human player. If the AI is playing, `bestScore` can be set to something very low, and when looping through the array of `moves`, if the move has a higher score than `bestScore`, the algorithm will store that move.

The same happens if `currentPlayer` is the human player, only `bestScore` is much higher and the algorithm looks for the lowest score to store instead of the highest.

In the end, the best move is returned.

```js
let bestMove;
if (player === AI) {
    let bestScore = -10000;
    for (let i = 0; i < moves.length; i++) {
    if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
        }
    }
} else {
    let bestScore = 10000;
    for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
            bestScore = moves[i].score;
            bestMove = i;
        }
    }
}
return moves[bestMove];
```

## Helpful resources
- [Algorithms Explained - minimax and alpha-beta pruning](https://www.youtube.com/watch?v=l-hh51ncgDI&ab_channel=SebastianLague) - Sebastian Lague
- [How to make your Tic Tac Toe game unbeatable by using the minimax algorithm](https://www.freecodecamp.org/news/how-to-make-your-tic-tac-toe-game-unbeatable-by-using-the-minimax-algorithm-9d690bad4b37/) - freeCodeCamp