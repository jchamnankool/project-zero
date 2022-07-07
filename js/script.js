$("document").ready(function () {
    //setup -------------------------------------------------------------------------------------------------------------
    const lastGameMode = sessionStorage.getItem("lastGameMode");
    let gameMode = lastGameMode ? lastGameMode : "";
    const totalAIAttempts = sessionStorage.getItem("totalAIAttempts");
    let numAIAttempts = totalAIAttempts ? totalAIAttempts : 0;

    const showMenuItems = function () {
        //"Choose a game mode:"
        $("h2").show();
        //two menu buttons
        $(".gameModeBtn").css("display", "block");
    };
    
    const showGame = function () {
        $(".choices").hide();
        $("#board").show();
        $(".smallBtn").show();
    };
    //initial menu options
    const chooseFriend = function() {
        gameMode = "Friend";
        sessionStorage.setItem("lastGameMode", gameMode);
        startGame();
    };
    const chooseAI = function () {
        if (Number(numAIAttempts) === 9) {
            egg();
        } else {
            $(".overlay").show();
            $("#dialogConfirm").css("display", "block");
        }
    };
    const playAI = function () {
        gameMode = "AI";
        sessionStorage.setItem("lastGameMode", gameMode);
        startGame();
    };

    let human = "X";
    let humanNumWins = 0;
    let human2 = "O";
    let human2NumWins = 0;
    let AI = "O";
    let AINumWins = 0;
    let currentPlayer = human;

    const isPlayerAMasochist = function () {
        return sessionStorage.getItem("masochistAcknowledgment");
    }

    //game mode buttons
    $("#chooseFriendBtn").on("click", chooseFriend);
    $("#chooseAIBtn").on("click", function () {
        if (isPlayerAMasochist() && Number(numAIAttempts) !== 9) {
            playAI();
        } else {
            chooseAI();
        }
    });
    //AI dialog prompt stuff => should only pop up once per session if acknowledged
    const closeDialog = function () {
        $("#dialogConfirm").css("display", "none");
        $(".overlay").hide();
    };
    $("#sufferBtn").on("click", function () {
        //the dialog box won't pop up again next time they pick to play against the AI in the session
        sessionStorage.setItem("masochistAcknowledgment", true);
        closeDialog();
        playAI();
    });
    $("#nvmBtn").on("click", function () {
        closeDialog();
    });

    //ahahaha...
    const returnHome = function () {
        sessionStorage.setItem("lastGameMode", "");
        location.reload();
    };
    $("#return").on("click", returnHome);
    
    let originalBoard;
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

    //actual code for the game -------------------------------------------------------------------------------------------
    const startGame = function () {
        showGame();
        $("#replay").prop("disabled", true);
        if (gameMode === "Friend") {
            currentPlayer = human;
            $("h1").text("Tic -Tac-Toe vs a Friend");
        } else {
            $("h1").text("Tic-Tac-Toe vs an Unbeatable AI");
        }
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
        }).hover(function () {
            $(this).css("background-color", "#3b3161"); //on hover
        }, function () {
            $(this).css("background-color", "#231B42"); //off hover
        });
    };

    const checkWin = function (board, player) {
        //find every index player has played in
        let plays = board.reduce((moves, user, cellID) => 
            (user === player) ? moves.concat(cellID) : moves, []);
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
        $(`#${cellID}`)
            .text(player)
            .unbind("mouseenter mouseleave")
            .css("cursor", "not-allowed")
            .css("background-color", "#231B42");
        let gameWon = checkWin(originalBoard, player);
        if (gameWon) gameOver(gameWon);
    };

    const gameOver = function (gameWon) {
        //to color in the cells
        let winningColor;
        if (gameWon.player === human || gameWon.player === human2 && gameMode !== "AI") {
            winningColor = "#C6D8C0"; //light green
        } else {
            winningColor = "#F63258"; //reddish
        }
        for (let index of winningCombos[gameWon.index]) {
            $(`#${index}`).css("background-color", winningColor);
        }
        //make each cell unclickable in case there are still empty squares
        cells.each(function () {
            $(this)
            .unbind("mouseenter mouseleave")
            .off("click", turnClick)
            .css("cursor", "not-allowed");
        });

        if (gameMode === "Friend") {
            declareWinner(gameWon.player === human ? "★ Player 1 wins! ★" : "★ Player 2 wins! ★");
        } else {
            declareWinner(gameWon.player === human ? "★ You win! ★" : "★ You lose! ★");
        }
    };

    const emptySquares = function () {
        return originalBoard.filter(square => typeof square === "number");
    };

    //the algorithm the AI uses to make its moves
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
    };

    const declareWinner = function (winningMessage) {
        $("h1").text(winningMessage).css("display", "block");
        let $scoreText = $("#scoreInfo").text();
        if (winningMessage === "★ Player 1 wins! ★") {
            humanNumWins++;
            $("#scoreInfo").text(`${$scoreText} P1`);
        } else if (winningMessage === "★ Player 2 wins! ★") {
            human2NumWins++;
            $("#scoreInfo").text(`${$scoreText} P2`);
        } else if (winningMessage === "★ You lose! ★") {
            AINumWins++;
            $("#scoreInfo").text(`${$scoreText} AI`);
        } else {
            $("#scoreInfo").text(`${$scoreText} Draw`);
        }
        $("#scoreInfo").show();
        $("#replay").text("Next Round");
    };

    const checkTie = function () {
        //if every square is filled up and still no win, it's a draw
        if (emptySquares().length === 0) {
            cells.each(function () {
                $(this)
                .unbind("mouseenter mouseleave")
                .css("background-color", "#3b3161");
            });
            declareWinner("★ It's a draw! ★");
            return true;
        } else {
            return false;
        }
    };

    const egg = function () {
        $(".overlay").show();
        $(".dialog").css("padding", "24px");
        $("#sufferBtn2").on("click", function () {
            numAIAttempts++;
            sessionStorage.setItem("totalAIAttempts", numAIAttempts);
            sessionStorage.setItem("lastGameMode", "AI");
            location.reload();
        });
        $("#nvmBtn2").on("click", returnHome);
        $("#dialogTenthPlay").css("display", "block");
    };

    const turnClick = function (cell) {
        if (typeof originalBoard[cell.target.id] == "number") {
            turn(cell.target.id, currentPlayer);

            if (gameMode === "Friend") {
                //check for draw before play
                if (!checkWin(originalBoard, currentPlayer) && !checkTie()) turn(cell.target.id, currentPlayer);
                //then swap players
                currentPlayer = currentPlayer == human ? human2 : human;
            } else {
                //check for draw before play
                if (!checkWin(originalBoard, human) && !checkTie()) turn((minimax(originalBoard, AI).index), AI);
            }
        }
        //checking for best of 3
        if (humanNumWins === 2 || human2NumWins === 2 || AINumWins === 2) {
            $("#replay").text("New Game").off().on("click", function () {
                if (Number(numAIAttempts) === 9) { //doesn't work without Number() for some reason despite being the same typeof
                    egg();
                } else {
                    numAIAttempts++;
                    sessionStorage.setItem("totalAIAttempts", numAIAttempts);
                    location.reload();
                }
            });
            let finalWinner;
            if (humanNumWins === 2) finalWinner = "Player 1";
            if (human2NumWins === 2) finalWinner = "Player 2"; 
            if (AINumWins === 2) finalWinner = "The AI"; 
            $("#scoreInfo").css("word-spacing", "0px").text(`Best of 3 reached. ${finalWinner} wins!`);
        } else {
            $("#replay").prop("disabled", false);
            $("#replay").on("click", function () {
                $("#replay").text("Reset Moves");
                startGame();
            });
        }
    };

    //for "new games" -- thank you session storage lmao
    if (gameMode !== "") {
        startGame();
    } else {
        //menu items are initially hidden to hide flicker when you start a new game
        showMenuItems();
    }
});
