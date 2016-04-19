
$(document).ready(function() {
	const ROWS = 20;
	const COLUMNS = 20;

	// game variables
	var snake;
	var isGameOver;
	var game = document.getElementById("game");
	var foodCell;

	// timeout function variables
	var loop;
	var delayBeforeStart;
	var warningTimer, timerCount;
	var warningMessage;

	function init() {
		timerCount = 3;
		isGameOver = false;
		foodCell = null;
		clearTimeout(delayBeforeStart);
		clearTimeout(warningMessage);
		clearTimeout(loop);
		$(".game-over").css("display", "none");
		$("#user-message").html("Adjust your browser so that you can view the whole game board.");
		$("#user-message").css("visibility", "visible");

		$(game).empty();

		// create the 20 x 20 grids
		for (var i = 1; i <= ROWS; i++) {
			var row = document.createElement("div");
			row.className = "row " + "row" + i;

			for (var j = 1;  j<= COLUMNS; j++) {
				var cell = document.createElement("div");
				cell.className = "cell " + "cell" + j;
				row.appendChild(cell);
			}
			game.appendChild(row);
		}

		// snake object
		snake = {position: [[10, 10]],
			direction: "right",
			prevDirection: "right"};

		setSnakeStartingPosition();
		createFood();
	}

	function setSnakeStartingPosition() {
		// [10, 10]
		var row = document.getElementsByClassName("row10");
		var cell = row[0].children[9];
		$(cell).addClass("snake");
	}

	function createFood() {
		$(foodCell).removeClass("food");
		var randomRow;
		var randomCell;
		var validFoodPosition;
		var snakeRow;
		var snakeCell;
		// randomly selects food position that is not currently occupied by snake
		do {
			validFoodPosition = true;
			randomRow = Math.floor(Math.random()*20 + 1);
			randomCell = Math.floor(Math.random()*20 + 1);
			for (var i = 0; i < snake.position.length; i++) {
				snakeRow = snake.position[i][0];
				snakeCell = snake.position[i][1];
				if (randomRow == snakeRow && randomCell == snakeCell) {
					validFoodPosition = false;
					break;
				}
			}
		} while(!validFoodPosition);
		
		var row = document.getElementsByClassName("row" + randomRow);
		var cell = row[0].children[randomCell-1];
		foodCell = cell;
		$(cell).addClass("food");
	}


	function displaySnake() {
		$(".cell").removeClass("snake");
		var rowNumber;
		var colNumber;
		var row;
		var cell;
		for (var i = 0; i < snake.position.length; i++) {
			rowNumber = snake.position[i][0];
			colNumber = snake.position[i][1];
			row = document.getElementsByClassName("row"+rowNumber);
			cell = row[0].children[colNumber-1];
			$(cell).addClass("snake");
		}
	}

	// move the snake one square in the direction it is facing
	// snake.position[0][1] = snake head
	function updateSnake() {
		switch(snake.direction) {
			case "left":
				// prevent snake from going backwards
				if (snake.prevDirection == "right") {
					updateCurrDirection("right", snake.prevDirection);
				} else {
					updateCurrDirection("left", snake.prevDirection);
				}
				break;
			case "up":
				// prevent snake from going backwards
				if (snake.prevDirection == "down") {
					updateCurrDirection("down", snake.prevDirection);
				} else {
					updateCurrDirection("up", snake.prevDirection);
				}
				break;
			case "right":
				// prevent snake from going backwards
				if (snake.prevDirection == "left") {
					updateCurrDirection("left", snake.prevDirection);
				} else {
					updateCurrDirection("right", snake.prevDirection);
				}
				break;
			case "down":	
				// prevent snake from going backwards
				if (snake.prevDirection == "up") {
					updateCurrDirection("up", snake.prevDirection);
				} else {
					updateCurrDirection("down", snake.prevDirection);
				}
		}
	}

	function updateCurrDirection(currDirection, prevDirection) {
		switch(currDirection) {
			case "left":
				if (!checkGameover("left")) {
					// get position of new snake head, add it to the front of the position array
					var newCoord = [snake.position[0][0], snake.position[0][1]-1];
					snake.position.unshift(newCoord);
					if (checkHitFood()) {
						createFood();
					} else {
						snake.position.splice(snake.position.length-1, 1);
					}
					snake.prevDirection = "left";
				}
				break;
			case "up":
				if (!checkGameover("up")) {
					var newCoord = [snake.position[0][0]-1, snake.position[0][1]];
					snake.position.unshift(newCoord);
					if (checkHitFood()) {
						createFood();
					} else {
						snake.position.splice(snake.position.length-1, 1);
					}
					snake.prevDirection = "up";
				}
				break;
			case "right":
				if (!checkGameover("right")) {
					var newCoord = [snake.position[0][0], snake.position[0][1]+1];
					snake.position.unshift(newCoord);
					if (checkHitFood()) {
						createFood();
					} else {
						snake.position.splice(snake.position.length-1, 1);
					}
					snake.prevDirection = "right";
				}
				break;
			case "down":
				if (!checkGameover("down")) {
					var newCoord = [snake.position[0][0]+1, snake.position[0][1]];
					snake.position.unshift(newCoord);
					if (checkHitFood()) {
						createFood();
					} else {
						snake.position.splice(snake.position.length-1, 1);
					}
					snake.prevDirection = "down";
				}
		}
	}

	function checkGameover(direction) {
		if (checkHitWall(direction)) {
			$(".game-over").html("You hit the wall and died! Click the button to play again!");
			isGameOver = true;
			return true;
		}
		if (checkHitSelf(direction)) {
			$(".game-over").html("You hit yourself and died! Click the button to play again!");
			isGameOver = true;
			return true;
		}
		isGameOver = false;
		return false;
	}

	function checkHitWall(direction) {
		switch(direction) {
			case "left":
				if (snake.position[0][1] == 1) {
					return true;
				}
				break;
			case "up":
				if (snake.position[0][0] == 1) {
					return true;
				}
				break;
			case "right":
				if (snake.position[0][1] == 20) {
					return true;
				}
				break;
			case "down":
				if (snake.position[0][0] == 20) {
					return true;
				}
		}
	}

	function checkHitSelf(direction) {
		var snakeRow;
		var snakeCell;
		var snakeHeadRow = snake.position[0][0];
		var snakeHeadCell = snake.position[0][1];

		// need at least length 4 to for snake head to hit its body
		for (var i = 3; i < snake.position.length; i++) {
			snakeRow = snake.position[i][0];
			snakeCell = snake.position[i][1];
			if (direction == "left") {
				snakeHeadCell--;
			} else if (direction == "up") {
				snakeHeadRow--;
			} else if (direction =="right") {
				snakeHeadCell++;
			} else if (direction == "down") {
				snakeHeadRow++;
			}
			if (snakeRow == snakeHeadRow && snakeCell == snakeHeadCell) {
				return true;
			}
		}
		return false;
	}

	function checkHitFood() {
		rowNumber = snake.position[0][0];
		colNumber = snake.position[0][1];
		row = document.getElementsByClassName("row"+rowNumber);
		cell = row[0].children[colNumber-1];
		if ($(cell).hasClass("food")) {
			return true;
		} else {
			return false;
		}
	}

	// game loop
	function move() {
		loop = setTimeout(function() {
			if (!isGameOver) {
				updateSnake();
				displaySnake();
				move();
			} else {
				gameOver();
			}
		}, 100);
	}

	function gameOver() {
		$(".game-over").css("display", "block");
	}

	$(document).keydown(function(event) {
		switch(event.which) {
			case 37: 	// left key
				snake.direction = "left";
				break;
			case 38: 	// up key
				snake.direction = "up";
				break;
			case 39: 	// right key
				snake.direction = "right";
				break;
			case 40: 	// down key
				snake.direction = "down";
				break;
			default:
				return;
		}
		event.preventDefault();	// prevent scrolling of page by key arrows
	});

	document.getElementById("start-game").onclick = function() {
		init();
		warningMessage = setTimeout(function() {
			$("#user-message").css("visibility", "hidden");
		}, 4000);
		delayBeforeStart = setTimeout(move, 4000);
		warningTimer = setInterval(timer, 1000);
	};


	function timer() {
		$("#user-timer").css("visibility", "visible");
		if (timerCount == 0) {
			clearInterval(warningTimer);
			$("#user-timer").css("visibility", "hidden");
			return;
		} else {
			$("#user-timer").html("Game starting in " + timerCount + "...");
		}
		timerCount--;
	}
});

