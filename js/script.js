$("document").ready(function () {
    let originalBoard;
    //TODO implement option for player to choose to be X or O
    const human = "X";
    const AI = "O";
    const winningCombos = [
        //winning across
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        //winning down
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        //winning diagonally
        [0, 4, 8],
        [6, 4, 2]
    ];
    const cells = $(".cell");

    const startGame = function () {
        $(".endResult").css("display", "none");
        //create an array of numbers from 0-8
        originalBoard = Array.from(Array(9).keys());
        //clear board
        cells.each(function () {
            $(this)
            .text("")
            .on("click", turnClick)
            .css({
                "background-color": "white",
                "cursor": "pointer"
            });
        });
    };

    const checkWin = function (board, player) {
        //find every index player has played in
        let plays = board.reduce((moves, user, cellID) => 
            (user === player) ? moves.concat(cellID) : moves, []);
            //console.log(plays);        
        let gameWon = null;
        for (let [index, win] of winningCombos.entries()) { //i.e. 0, [0,1,2]
            //if the win is an element of plays
            if (win.every(elem => plays.indexOf(elem) > -1)) {
                gameWon = {
                    index: index, 
                    player: player
                };
                break;
            }
        }
        return gameWon;
    };
    
    const turn = function (cellID, player) {
        originalBoard[cellID] = player;
        $(`#${cellID}`).text(player);
        $(`#${cellID}`).css("cursor", "not-allowed");

        let gameWon = checkWin(originalBoard, player);
        if (gameWon) gameOver(gameWon);
    };

    const gameOver = function (gameWon) {
        const winningColor = gameWon.player === human ? "#AFE1AF" : "#FF5733";
        for (let index of winningCombos[gameWon.index]) {
            $(`#${index}`).css("background-color", winningColor);
        }
        //make each cell unclickable
        cells.each(function () {
            $(this).off("click", turnClick).css("cursor", "not-allowed");
        });

        declareWinner(gameWon.player === human ? "You win!" : "You lose!");
    }

    const emptySquares = function () {
        return originalBoard.filter(square => typeof square === "number");
    };

    const minimax = function (newBoard, player) {
        const availableSpots = emptySquares();

        if (checkWin(newBoard, human)) {
            return {score: -10};
        } else if (checkWin(newBoard, AI)) {
            return {score: 10};
        } else if (availableSpots.length === 0) {
            return {score: 0};
        }
        const moves = [];
        for (var i = 0; i < availableSpots.length; i++) {
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

        let bestMove;
        if(player === AI) {
            var bestScore = -10000;
            for(var i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            var bestScore = 10000;
            for(var i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }

        return moves[bestMove];
    }

    const declareWinner = function (winner) {
        $(".endResult").text(winner).css("display", "block");
    };

    const checkTie = function () {
        //every square filled up and no win
        if (emptySquares().length === 0) {
            cells.each(function () {
                $(this).css("background-color", "grey");
            });
            declareWinner("It's a draw!");
            return true;
        } else {
            return false;
        }
    }

    const turnClick = function (cell) {
        if (typeof originalBoard[cell.target.id] == "number") {
            turn(cell.target.id, human);
            //check for draw before play
            if (!checkWin(originalBoard, human) && !checkTie()) turn((minimax(originalBoard, AI).index), AI);
        }

        $("button").prop("disabled", false);
        $("button").on("click", function () {
            startGame();
        });
    };

    startGame();
});

/* notes
    * the player picks a cell
    * the cell can no longer be clicked again
    * the cell gets added to their sequence of plays
    * the plays get compared to the array of winning combinations
    * 
    * MINIMAX W/ ALPHA-BETA PRUNING:
    *   return a value if a terminal state is found (+10, 0, -10)
    *   go through available spots on the board
    *   call the minimax function on each available spot through recursion
    *   evaluate returning values from function calls
    *   return the best value
*/