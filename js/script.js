$("document").ready(function () {
    let gameMode = "";

    const showGame = function () {
        $(".choices").hide();
        $("#board").show();
        $(".smallBtn").show();
    }

    const hideGame = function () {
        $("h1").text("Tic - Tac - Toe");
        $(".choices").show();
        $("#board").hide();
        $(".smallBtn").hide();
    }

    const chooseFriend = function() {
        gameMode = "Friend";
        showGame();
        startGame();
    }

    const chooseAI = function () {
        $(".overlay").show();
        $("#dialogConfirm").css("display", "block");
    }

    const playAI = function () {
        gameMode = "AI";
        showGame();
        startGame();
    }

    $("#chooseFriendBtn").on("click", chooseFriend);
    $("#chooseAIBtn").on("click", chooseAI);
    $("#sufferBtn").on("click", function () {
        $("#dialogConfirm").css("display", "none");
        $(".overlay").hide();
        playAI();
    });
    $("#nvmBtn").on("click", function () {
        $("#dialogConfirm").css("display", "none");
        $(".overlay").hide();
    });

    const returnHome = function () {
        gameMode = "";
        hideGame();
    }

    $("#return").on("click", returnHome);
    
    let originalBoard;
    //TODO give player choice to be X or O when playing against AI
    //TODO keep score
    const human = "X";
    const human2 = "O";
    const AI = "O";
    let currentPlayer = human;

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
    //cells in the game board
    const cells = $(".cell");

    const startGame = function () {
        currentPlayer = human;
        if (gameMode === "Friend") {
            $("h1").text("Tic - Tac - Toe vs a Friend");
        } else {
            $("h1").text("Tic - Tac - Toe vs an Unbeatable AI");
        }
        $(".endResult").css("display", "none");
        //create an array of numbers from 0-8
        originalBoard = Array.from(Array(9).keys());
        //clear board
        cells.each(function () {
            $(this)
            .text("")
            .on("click", turnClick)
            .css({
                "background-color": "#231B42",
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
        $(`#${cellID}`).text(player).css("cursor", "not-allowed");

        let gameWon = checkWin(originalBoard, player);
        if (gameWon) gameOver(gameWon);
    };

    const gameOver = function (gameWon) {
        console.log(currentPlayer);
        const winningColor = gameWon.player === human||human2&&gameMode!=="AI" ? "#C6D8C0" : "#F63258";
        for (let index of winningCombos[gameWon.index]) {
            $(`#${index}`).css("background-color", winningColor);
        }
        //make each cell unclickable
        cells.each(function () {
            $(this).off("click", turnClick).css("cursor", "not-allowed");
        });

        if (gameMode === "Friend") {
            declareWinner(gameWon.player === human ? "★ Player 1 wins! ★" : "★ Player 2 wins! ★");

        } else {
            declareWinner(gameWon.player === human ? "★ You win! ★" : "★ You lose! ★");
        }
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
        $("h1").text(winner).css("display", "block");
    };

    const checkTie = function () {
        //every square filled up and no win
        if (emptySquares().length === 0) {
            cells.each(function () {
                $(this).css("background-color", "#3b3161");
            });
            declareWinner("It's a draw!");
            return true;
        } else {
            return false;
        }
    }

    const turnClick = function (cell) {
        if (typeof originalBoard[cell.target.id] == "number") {
            if (gameMode === "Friend") {
                console.log(emptySquares().length);
                turn(cell.target.id, currentPlayer);
                //check for draw before play
                if (!checkWin(originalBoard, currentPlayer) && !checkTie()) turn(cell.target.id, currentPlayer);
                //swap players
                currentPlayer = currentPlayer == human ? human2 : human;
            } else {
                turn(cell.target.id, human);
                //check for draw before play
                if (!checkWin(originalBoard, human) && !checkTie()) turn((minimax(originalBoard, AI).index), AI);
            }
        }

        $("#replay").prop("disabled", false);
        $("#replay").on("click", function () {
            startGame();
        });
    };
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