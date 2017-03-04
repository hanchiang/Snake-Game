
$(document).ready(function() {
	// constants
	var ROW_NUM = 20;
	var COL_NUM = 20;
	/*
	var directionToOffset = {
		"left": -1,
		"up": -1,
		"right": 1,
		"down": 1 
	};
	*/

	// variables
	var gameMode = "";			// easy, normal, nochill
	var gameModeModifier = 0;	// Loop delay modifier according to game mode
	var gameBoard = document.getElementById("gameboard");
	var snake;
	
	var loopDelay, startingLoopDelay;
	var isGameStarted;
	var isGameOver;
	var gameOverMessage;
	var score, incrementPerFood;

	// Timer variables
	var delayBeforeStart;
	var gameLoopTimer;		// use to clear the game loop interval
	var userTimer;			// use to clear the interval
	var userCountdown;		// to display the timer countdown



	function init() {
		// clear previous game board
		if (gameBoard) {
			$(gameBoard).empty();
		}
		// snake object, starting position row 10 col 10
		snake = {
			position: [[10, 10]],
			direction: "right",
			prevDirection: "right"
		}

		isGameStarted = true;
		delayBeforeStart = 4000;
		if (gameMode == "easy") {
			startingLoopDelay = 140;
			gameModeModifier = 0;
		} else if (gameMode == "normal") {
			startingLoopDelay = 130;
			gameModeModifier = 1;
		} else if (gameMode == "nochill") {
			startingLoopDelay = 120;
			gameModeModifier = 1.2;
		}

		loopDelay = startingLoopDelay;
		
		userCountdown = 3;
		isGameOver =  false;
		score = incrementPerFood = 0;

		// display message to user
		setTimeout(showMessage, 0);
		$("#user-message").fadeTo(500, 1).slideDown(500);
		setTimeout(function() {
			$("#countdown").fadeTo(500, 1).slideDown(1500);
		}, 1000);
		$("#score").fadeTo(500, 1).html("Score: 0");
		$("#result").css("display", "none");

		setupGameBoard();
		createFood();
		displaySnake();
	}

	function setupGameBoard() {
		for (var i = 0; i < ROW_NUM; i++) {
			var row = document.createElement("div");
			row.className = "row row" + (i+1);

			for (var j = 0; j < COL_NUM; j++) {
				var cell = document.createElement("div");
				cell.className = "cell cell" + (j+1); 
				row.appendChild(cell);
			}
			gameBoard.appendChild(row);
		}
	}

	function displaySnake() {
		// remove all snakes instances on the game board
		var cells = document.getElementsByClassName("cell");
		for (var i = 0; i < cells.length; i++) {
			// remove snakes from the board
			var cellClassList = cells[i].classList;
			if (cellClassList.contains("snake")) {
				cellClassList.remove("snake");
			}
		}

		// Loop through the snake positions, add the snake class
		for (var j = 0; j < snake.position.length; j++) {
			var rowToAdd = snake.position[j][0];
			var colToAdd = snake.position[j][1];

			// add in the snake class
			var cell = getCellFromRowAndCol(rowToAdd, colToAdd);
			cell.className += " snake";
		}
	}

	function getCellFromRowAndCol(row, col) {
		var row = document.getElementsByClassName("row" + row)[0];
		var cell = row.children[col-1];
		return cell;
	}

	function updateSnake() {
		var snakeHead = snake.position[0];
		
		// get current direction, determine if direction is valid, check if snake hit the wall
		getCorrectedDirection(snake.prevDirection, snake.direction);
		
		if (!checkHitWall() && !checkHitSelf()) {
			// if next cell is food, add to snake length
			var nextCell;
			var newCoord;

			// Logic to update the snake position
			// add new coordinate to snake head
			newCoord = getNextRowAndCol(snake.direction);
			snake.position.unshift(newCoord);

			if (checkHitFood()) {
				updateScore();
				createFood();
				loopDelay = startingLoopDelay - (snake.position.length * gameModeModifier);
				console.log(loopDelay);
			} else {
				snake.position.pop();
			}

			snake.prevDirection = snake.direction;
		} else {
			isGameOver = true;
		}
	}

	// Get the next position of the snake head based on the current direction
	function getNextRowAndCol(direction) {
		var nextRow, nextCol;
		var snakeHead = snake.position[0];

		if (snake.direction == "left") {
			nextRow = snakeHead[0];
			nextCol = snakeHead[1]-1;
		} else if (snake.direction == "up") {
			nextRow = snakeHead[0] - 1;
			nextCol = snakeHead[1];
		} else if (snake.direction == "right") {
			nextRow = snakeHead[0];
			nextCol = snakeHead[1]+1;
		} else if (snake.direction == "down") {
			nextRow = snakeHead[0] + 1;
			nextCol = snakeHead[1];
		}
		return [nextRow, nextCol];
	}

	function checkHitFood() {
		var snakeHead = snake.position[0];
		var row = snakeHead[0];
		var col = snakeHead[1];
		var cell = getCellFromRowAndCol(row, col);
		if (cell.classList.contains("food")) {
			cell.classList.remove("food");
			return true;
		} else {
			return false;
		}
	}

	function updateScore() {
		if (gameMode == "easy") {
			incrementPerFood = 1;
		} else if (gameMode == "normal") {
			// +1 for every 10 length
			incrementPerFood = Math.max(1, Math.ceil((snake.position.length - 1) / 10));
		} else if (gameMode == "nochill") {
			// +1 for every 8 length
			incrementPerFood = Math.max(1, Math.ceil((snake.position.length - 1) / 8))
		}
		
		score += incrementPerFood;
		$("#score").html("Score: " + score);
	}

	function createFood() {
		// create a placed food position that is not within cells occupied by the snake
		var isLegalPosition = false;
		var randomRow;
		var randomCol;
		var cell;

		while(!isLegalPosition) {
			randomRow = Math.floor(Math.random() * 20 + 1);
			randomCol = Math.floor(Math.random() * 20 + 1);

			if (!isCellOccupiedBySnake(randomRow, randomCol)) {
				isLegalPosition = true;
			}
		}
		cell = getCellFromRowAndCol(randomRow, randomCol);
		cell.className += " food";
		
	}

	function isCellOccupiedBySnake(row, col) {
		for (var i = 0; i < snake.position.length; i++) {
			var snakePosition = snake.position[i];
			if (row == snakePosition[0] && col == snakePosition[1]) {
				return true;
			}
		}
		return false;
	}

	// returns the corrected snake direction
	function getCorrectedDirection(prevDirection, currDirection) {
		// does not allow travelling in an opposite direction as the previous direction
		if (prevDirection == "left" && currDirection == "right") {
			snake.direction = "left";
		} else if (prevDirection == "up" && currDirection == "down") {
			snake.direction = "up";
		} else if (prevDirection == "right" && currDirection == "left") {
			snake.direction = "right";
		} else if (prevDirection == "down" && currDirection == "up") {
			snake.direction = "down";
		}
		return snake.direction;
	}

	function checkHitWall() {
		var isHitWall = false;
		var snakeHead = snake.position[0];

		if ((snake.direction == "left" && snakeHead[1] == 1) ||
			(snake.direction == "up" && snakeHead[0] == 1) ||
			(snake.direction == "right" && snakeHead[1] == 20) ||
			(snake.direction == "down" && snakeHead[0] == 20)) {
				isHitWall = true;
				gameOverMessage = "<p>You hit the wall and died!</p>" +
				"<button id='play-again' class='gameOverSelection'>Play again</button>"+
				"<button id='select-difficulty' class='gameOverSelection'>Select difficulty</button>";
		}
		return isHitWall;
	}

	function checkHitSelf() {
		// Need to have at least length 4 in order to hit self, or is it 5..?

		// Check if next position of snake head collides with the snake body
		var nextCoord = getNextRowAndCol(snake.direction);

		if (snake.position.length < 4) {
			return false;
		} else {
			var snakeHead = snake.position[0];
			// snake head can only collide with the 4th cell onwards
			for (var i = 3; i < snake.position.length; i++) {
				var body = snake.position[i];
					
				if (nextCoord[0] == body[0] && nextCoord[1] == body[1]) {
					gameOverMessage = "You hit yourself and died!";
					return true;
				}
			}
			return false;
		}
		
	}

	function gameOver() {
		// clearTimeout(gameLoopTimer);
		$("#result").css("display", "block").html(gameOverMessage);
		// $("#result").html(gameOverMessage);

		// Handle game over selection
		document.getElementById("select-difficulty").addEventListener("click", selectDifficulty);

		function selectDifficulty(e) {
			$("#result").fadeTo(500, 0).hide();
			$("#game").fadeTo(500, 0).hide();
			$("#score").fadeTo(500, 0).hide();
			$("#difficulty-selection").fadeTo(500, 1).show();
			getMode();
		}

		document.getElementById("play-again").onclick = function(e) {
			play();
		}

	}

	function showMessage() {
		userTimer = setInterval(function() {
			var countdown = document.getElementById("countdown");
				if (userCountdown != 0) {
					countdown.innerHTML = "Game starting in " + userCountdown + "...";
				} else {
					clearInterval(userTimer);
					$("#user-message").fadeTo(200, 0);
					$("#countdown").fadeTo(200, 0);
				}
				userCountdown--;
		}, 1000);
	}

	function gameLoop() {
		gameLoopTimer = setTimeout(function() {
			if (!isGameOver) {
				updateSnake();
				displaySnake();
				gameLoop();		
			} else {
				gameOver();
			}
		}, loopDelay);
	}

	// register arrow key press and assigns it to the snake direction
	document.onkeydown = function(e) {
		switch(e.which) {
			case 37:
				snake.direction = "left";
				break;
			case 38:
				snake.direction = "up";
				break;
			case 39:
				snake.direction = "right";
				break;
			case 40:
				snake.direction = "down";
				break;
		}
		e.preventDefault();
	};

	// Get game mode first before showing start button
	function getMode() {
		var modes = document.getElementsByClassName("mode");
		for (var i = 0; i < modes.length; i++) {
			modes[i].addEventListener("click", processMode);
		}
	}
	getMode();


	function processMode(e) {
		e.stopPropagation();
		gameMode = e.target.id;
		$("#difficulty-selection").fadeTo(500, 0, function() {
			$(this).hide();
			$("#startgame").fadeTo(500, 1);
		});
	}

	// when start game button is clicked
	// call the game loop after delay
	document.getElementById("startgame").addEventListener("click", play);

	function play(e) {
		if (!isGameStarted || isGameOver) {
			// initialise board, and variables
			init();
			// call the main game loop
			setTimeout(gameLoop, delayBeforeStart);
			setTimeout(function() {
				e.target.style.display = "none";
			}, delayBeforeStart);
		}
	};	
});



