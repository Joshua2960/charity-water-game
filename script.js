const grid = document.getElementById("grid");
const livesDisplay = document.getElementById("lives");
const flagsDisplay = document.getElementById("flags");
const streakDisplay = document.getElementById("streak");
const difficultyDisplay = document.getElementById("difficulty");
const message = document.getElementById("message");

let currentDifficulty = "easy";

const difficulties = {
  easy: {
    size: 10,
    polluted: 12
  },
  medium: {
    size: 14,
    polluted: 32
  },
  hard: {
    size: 18,
    polluted: 70
  }
};

let board = [];
let size = 10;
let pollutedCount = 12;
let lives = 3;
let flagsUsed = 0;
let winStreak = 0;
let revealedCount = 0;
let gameOver = false;

function startGame(difficulty) {
  currentDifficulty = difficulty;

  size = difficulties[currentDifficulty].size;
  pollutedCount = difficulties[currentDifficulty].polluted;

  lives = 3;
  flagsUsed = 0;
  revealedCount = 0;
  gameOver = false;
  board = [];

  livesDisplay.textContent = lives;
  flagsDisplay.textContent = flagsUsed + " / " + pollutedCount;
  streakDisplay.textContent = winStreak;
  difficultyDisplay.textContent =
    currentDifficulty.charAt(0).toUpperCase() +
    currentDifficulty.slice(1);

  message.textContent =
    "Find the clean path and avoid polluted water.";

  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${size}, 36px)`;

  createBoard();
  placePollutedWater();
  calculateNumbers();
  drawBoard();
}
function restartGame() {
  startGame(currentDifficulty);
}

function createBoard() {
  for (let row = 0; row < size; row++) {
    board[row] = [];

    for (let col = 0; col < size; col++) {
      board[row][col] = {
        polluted: false,
        revealed: false,
        flagged: false,
        number: 0
      };
    }
  }
}

function placePollutedWater() {
  let placed = 0;

  while (placed < pollutedCount) {
    const row = Math.floor(Math.random() * size);
    const col = Math.floor(Math.random() * size);

    if (!board[row][col].polluted) {
      board[row][col].polluted = true;
      placed++;
    }
  }
}

function calculateNumbers() {
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!board[row][col].polluted) {
        board[row][col].number = countNearbyPollution(row, col);
      }
    }
  }
}

function countNearbyPollution(row, col) {
  let count = 0;

  for (let r = row - 1; r <= row + 1; r++) {
    for (let c = col - 1; c <= col + 1; c++) {
      if (isInsideBoard(r, c) && board[r][c].polluted) {
        count++;
      }
    }
  }

  return count;
}

function drawBoard() {
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      tile.dataset.row = row;
      tile.dataset.col = col;

      tile.addEventListener("click", () => revealTile(row, col, tile));

      tile.addEventListener("contextmenu", function(event) {
        event.preventDefault();
        flagTile(row, col, tile);
      });

      grid.appendChild(tile);
    }
  }
}

function revealTile(row, col, tile) {
  const cell = board[row][col];

  if (gameOver || cell.revealed || cell.flagged) {
    return;
  }

  cell.revealed = true;
  tile.classList.add("revealed");

  if (cell.polluted) {
    tile.classList.add("polluted");
    tile.textContent = "☣";
    lives--;
    livesDisplay.textContent = lives;

    message.textContent = "Polluted water! You lost a life.";

    if (lives === 0) {
      loseGame();
    }

    return;
  }

  revealedCount++;

  if (cell.number > 0) {
    tile.textContent = cell.number;
    tile.classList.add("num-" + cell.number);
  } else {
    tile.textContent = "💧";
    tile.classList.add("clean-empty");
    revealEmptyNeighbors(row, col);
  }

  checkWin();
}

function revealEmptyNeighbors(row, col) {
  for (let r = row - 1; r <= row + 1; r++) {
    for (let c = col - 1; c <= col + 1; c++) {
      if (isInsideBoard(r, c)) {
        const neighbor = board[r][c];
        const neighborTile = getTile(r, c);

        if (!neighbor.revealed && !neighbor.flagged && !neighbor.polluted) {
          revealTile(r, c, neighborTile);
        }
      }
    }
  }
}

function flagTile(row, col, tile) {
  const cell = board[row][col];

  if (gameOver || cell.revealed) {
    return;
  }

  cell.flagged = !cell.flagged;

  if (cell.flagged) {
    tile.textContent = "🚩";
    tile.classList.add("flagged");
    flagsUsed++;
  } else {
    tile.textContent = "";
    tile.classList.remove("flagged");
    flagsUsed--;
  }

  flagsDisplay.textContent = flagsUsed + " / " + pollutedCount;
}

function checkWin() {
  const safeTiles = size * size - pollutedCount;

  if (revealedCount === safeTiles) {
    gameOver = true;
    winStreak++;
    streakDisplay.textContent = winStreak;
    message.textContent = "You found the Clean Path! Win streak increased.";
    revealAllPollutedWater();
  }
}

function loseGame() {
  gameOver = true;
  winStreak = 0;
  streakDisplay.textContent = winStreak;
  message.textContent = "Game over! The water source was too polluted.";
  revealAllPollutedWater();
}

function revealAllPollutedWater() {
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col].polluted) {
        const tile = getTile(row, col);
        tile.classList.add("revealed", "polluted");
        tile.textContent = "☣";
      }
    }
  }
}

function getTile(row, col) {
  return document.querySelector(
    `.tile[data-row="${row}"][data-col="${col}"]`
  );
}

function isInsideBoard(row, col) {
  return row >= 0 && row < size && col >= 0 && col < size;
}

startGame("easy");

