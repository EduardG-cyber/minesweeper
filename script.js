const BOMB_SQUARE = 'bomb';
const VALID_SQUARE = 'valid';
const EASY_MODE = {boardWidth: 10, boardHeigh: 10, bombsAmount: 20, difficulty: 'easy'};
const MEDIUM_MODE = {boardWidth: 15, boardHeigh: 15, bombsAmount: 40, difficulty: 'medium'};
const HARD_MODE = {boardWidth: 20, boardHeigh: 20, bombsAmount: 90, difficulty: 'hard'};

class Minesweeper {
  constructor(boardWidth, boardHeight, nrOfBombs, dificulty) {
    this.boardWidth = boardWidth;
    this.boardHeight = boardHeight;
    this.nrOfBombs = nrOfBombs;
    this.dificulty = dificulty;
    this.isGameOver = false;
    this.checkedSquares = 0;

    // Create the board
    this.board = this.createBoard();

    // Fill the board with bombs
    this.addBombs();

    this.check.bind(this);
    this.getNeigboringBombs.bind(this);
    this.handleClick.bind(this);
  }

  createBoard() {
    const board = new Array(this.boardHeight);
    for (let i = 0; i < this.boardWidth; i++) {
      board[i] = new Array(this.boardWidth);
      for (let j = 0; j < this.boardWidth; j++) {
        board[i][j] = {type: VALID_SQUARE, isChecked: false};
      }
    }
    return board;
  }

  // Adds bombs on the board (not the board that is seen by the user)
  addBombs() {
    let countBombs = 0;
    while (countBombs < this.nrOfBombs) {
      let i = Math.floor(Math.random() * this.boardHeight);
      let j = Math.floor(Math.random() * this.boardWidth);
      if (this.board[i][j].type === BOMB_SQUARE) {
        continue;
      }
      this.board[i][j].type = BOMB_SQUARE;
      countBombs++;
    }
  }

  // Displays the board to the user using the
  // informations from the this.board
  displayBoard() {
    const gameBoard = document.querySelector('.game-board');
    for (let i = 0; i < this.boardHeight; i++) {
      for (let j = 0; j < this.boardWidth; j++) {
        const square = document.createElement('div');
        square.setAttribute('i', i);
        square.setAttribute('j', j);
        square.classList.add('square');
        // Set this class in order to compute the
        // square dimensions right
        square.classList.add(`square--${this.dificulty}`);
        gameBoard.appendChild(square);
        // Left click from the user
        square.addEventListener('click', this.handleClick.bind(this));
        // Right click from the user (sets the flag)
        square.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          e.target.classList.toggle('flag');
        });
      }
    }
  }
  
  // Handles a left click from the user
  handleClick(event) {
    if (this.isGameOver) {
      return;
    }
    // Get the position of the square that the user clicked
    const square = event.target;
    const i = parseInt(square.getAttribute('i'));
    const j = parseInt(square.getAttribute('j'));

    // Remove the flag if the square is checked
    // despite the fact that it was flaged
    if (square.classList.contains('flag')) {
      square.classList.remove('flag');
    }

    if (!this.board[i][j].isChecked) {
      // If the user selected a bomb the game is over
      if (this.board[i][j].type === BOMB_SQUARE) {
        this.gameOver();
      }
      this.check(i, j);
    }
  }

  check(i, j) {
    // Check if it is a valid square
    if (this.board[i][j].type === BOMB_SQUARE
        || this.board[i][j].isChecked
        || this.isGameOver) {
      return;
    }
    // Keep track of the checked squares
    this.board[i][j].isChecked = true;
    this.checkedSquares++;
    // Get the neighboring bombs
    const neighboringBombs = this.getNeigboringBombs(i, j);
    if (neighboringBombs === 0) {
      if (i > 0) {
        // Check up
        this.check(i - 1, j);
        // Check up and left
        if (j > 0) {
          this.check(i - 1, j - 1);
        }
        // Check up and right
        if (j + 1 < this.boardWidth) {
          this.check(i - 1, j + 1);
        }
      }
      if (i + 1 < this.boardHeight) {
        // Check down
        this.check(i + 1, j);
        // Check down and left
        if (j > 0) {
          this.check(i + 1, j - 1);
        }
        // Check down and right
        if (j + 1 < this.boardWidth) {
          this.check(i + 1, j + 1);
        }
      }
      // Check left
      if (j > 0) {
        this.check(i, j - 1);
      }
      // Check right
      if (j + 1 < this.boardWidth) {
        this.check(i, j + 1);
      }
    }
    this.updateSquare(i, j, neighboringBombs);
    if (this.hasWon()) {
      this.gameWon();
    }
  }

  getNeigboringBombs(i, j) {
    let bombs = 0;
    // Check up
    if (i > 0) {
      // Check just up
      if (this.board[i - 1][j].type === BOMB_SQUARE) {
        bombs++;
      }
      // Check up and left
      if (j > 0 && this.board[i - 1][j - 1].type === BOMB_SQUARE) {
        bombs++;
      }
      // Check up and right
      if (j + 1 < this.boardWidth && this.board[i - 1][j + 1].type === BOMB_SQUARE) {
        bombs++;
      }
    }
    // Check down
    if (i + 1 < this.boardHeight) {
      // Check just down
      if (this.board[i + 1][j].type === BOMB_SQUARE) {
        bombs++;
      }
      // Check down and left
      if (j > 0 && this.board[i + 1][j - 1].type === BOMB_SQUARE) {
        bombs++;
      }
      // Check down and right
      if (j + 1 < this.boardWidth && this.board[i + 1][j + 1].type === BOMB_SQUARE) {
        bombs++;
      }
    }
    // Check left
    if (j > 0 && this.board[i][j - 1].type === BOMB_SQUARE) {
      bombs++;
    }
    // Check right
    if (j + 1 < this.boardWidth && this.board[i][j + 1].type === BOMB_SQUARE) {
      bombs++;
    }

    return bombs;
  }

  updateSquare(i, j, neighboringBombs) {
    const boardGame = document.querySelector('.game-board');
    const square = this.getSquare(i, j);
    const classes = ['checked'];
    square.classList.add(...classes);
    if (neighboringBombs !== 0) {
      square.innerHTML = neighboringBombs;
      square.setAttribute('neighbors', neighboringBombs);
    }
  }

  hasWon() {
    return this.checkedSquares === this.boardHeight * this.boardWidth - this.nrOfBombs;
  }

  gameWon() {
    this.isGameOver = true;
    const message = document.querySelector('h1');
    message.innerHTML = 'Game won!';
    message.classList.add('victory');
    console.log('Game won');
  }

  gameOver() {
    this.isGameOver = true;
    // Get the position of the bombs
    const bombsPos = [];
    for (let i = 0; i < this.boardHeight; i++) {
      for (let j = 0; j < this.boardWidth; j++) {
        if (this.board[i][j].type === BOMB_SQUARE) {
          bombsPos.push({i, j});
        }
      }
    }
    // Get the bombs on the board
    const bombs = bombsPos.map(({i, j}) => this.getSquare(i, j));
    bombs.forEach(bomb => {
      bomb.classList.add(BOMB_SQUARE);
      bomb.innerHTML = '<i class="fas fa-bomb"></i>';
    });

    // Print the message to the player
    const message = document.querySelector('h1');
    message.innerHTML = 'Game lost!';
    message.classList.add('defeat');
    console.log('Game over');
  }

  getSquare(i, j) {
    const boardGame = document.querySelector('.game-board');
    return boardGame.querySelector(`[i="${i}"][j="${j}"]`);
  }

  restart() {
    this.isGameOver = false;
    this.checkedSquares = 0;
    // Restart the board to the initial condition
    for (let i = 0; i < this.boardHeight; i++) {
      for (let j = 0; j < this.boardWidth; j++) {
        this.board[i][j].type = VALID_SQUARE;
        this.board[i][j].isChecked = false;
      }
    }
    // Add bombs
    this.addBombs();

    // Clean the UI board
    document.querySelector('.game-board').innerHTML = '';
    // Actualize the UI board
    this.displayBoard();
  }
}

const game = new Minesweeper(EASY_MODE.boardWidth, EASY_MODE.boardHeigh,
                              EASY_MODE.bombsAmount, EASY_MODE.difficulty);
game.displayBoard();
displayBombsAmount(EASY_MODE.bombsAmount);

function displayBombsAmount(bombsAmount) {
  const bombsContainer = document.querySelector('.bombs-amount');
  bombsContainer.innerHTML = `Find ${bombsAmount} bombs`;
}


const restartBtn = document.querySelector('.restart');
restartBtn.addEventListener('click', () => {
  document.querySelector('h1').innerHTML = '';
  game.restart();
});

function handleModeChange(mode) {
  document.querySelector('h1').innerHTML = '';
  const gameBoard = document.querySelector('.game-board');
  gameBoard.innerHTML = '';
  game.boardWidth = mode.boardWidth;
  game.boardHeight = mode.boardHeigh;
  game.nrOfBombs = mode.bombsAmount;
  game.dificulty = mode.difficulty;
  game.checkedSquares = 0;
  game.isGameOver = false;
  game.board = game.createBoard();
  game.addBombs();
  game.displayBoard();
  displayBombsAmount(mode.bombsAmount);
}

const easyBtn = document.querySelector('.easy');
easyBtn.addEventListener('click', () => handleModeChange(EASY_MODE));

const mediumBtn = document.querySelector('.medium');
mediumBtn.addEventListener('click', () => handleModeChange(MEDIUM_MODE));

const hardBtn = document.querySelector('.hard');
hardBtn.addEventListener('click', () => handleModeChange(HARD_MODE));
