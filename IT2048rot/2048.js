const game = document.getElementById('game');
let board = [];

function initBoard() {
  board = Array(4).fill(null).map(() => Array(4).fill(0));
  addTile();
  addTile();
  render();
}

function addTile() {
  let empty = [];
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++)
      if (board[i][j] === 0) empty.push([i, j]);

  if (empty.length === 0) return false;
  let [i, j] = empty[Math.floor(Math.random() * empty.length)];
  board[i][j] = Math.random() < 0.9 ? 2 : 4;
  return true;
}

function render() {
  game.innerHTML = '';
  board.forEach(row => {
    row.forEach(cell => {
      const tile = document.createElement('div');
      tile.className = `tile tile-${cell}`;
      tile.textContent = cell !== 0 ? cell : '';
      game.appendChild(tile);
    });
  });
}

function slide(row) {
  // sposta tutti i numeri a sinistra e rimuove zeri
  let arr = row.filter(v => v !== 0);
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      arr[i + 1] = 0;
    }
  }
  arr = arr.filter(v => v !== 0);
  while (arr.length < 4) arr.push(0);
  return arr;
}

function moveLeft() {
  let moved = false;
  for (let i = 0; i < 4; i++) {
    let oldRow = board[i].slice();
    let newRow = slide(oldRow);
    if (oldRow.toString() !== newRow.toString()) moved = true;
    board[i] = newRow;
  }
  return moved;
}

function rotateRight(matrix) {
  // ruota 90 gradi a destra
  let N = matrix.length;
  let ret = Array(N).fill(null).map(() => Array(N).fill(0));
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++)
      ret[j][N - 1 - i] = matrix[i][j];
  return ret;
}

function rotateLeft(matrix) {
  // ruota 90 gradi a sinistra
  let N = matrix.length;
  let ret = Array(N).fill(null).map(() => Array(N).fill(0));
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++)
      ret[N - 1 - j][i] = matrix[i][j];
  return ret;
}

function moveRight() {
  board = board.map(row => row.reverse());
  let moved = moveLeft();
  board = board.map(row => row.reverse());
  return moved;
}

function moveUp() {
  board = rotateLeft(board);
  let moved = moveLeft();
  board = rotateRight(board);
  return moved;
}

function moveDown() {
  board = rotateRight(board);
  let moved = moveLeft();
  board = rotateLeft(board);
  return moved;
}

function move(direction) {
  let moved = false;
  switch(direction) {
    case 'left': moved = moveLeft(); break;
    case 'right': moved = moveRight(); break;
    case 'up': moved = moveUp(); break;
    case 'down': moved = moveDown(); break;
  }
  if (moved) {
    addTile();
    render();
    if (checkGameOver()) alert("Game Over!");
  }
}

function checkGameOver() {
  // Controlla se non ci sono mosse possibili
  for(let i=0; i<4; i++){
    for(let j=0; j<4; j++){
      if(board[i][j] === 0) return false;
      if(j<3 && board[i][j] === board[i][j+1]) return false;
      if(i<3 && board[i][j] === board[i+1][j]) return false;
    }
  }
  return true;
}

document.addEventListener('keydown', e => {
  switch(e.key) {
    case 'ArrowLeft': e.preventDefault(); move('left'); break;
    case 'ArrowRight': e.preventDefault(); move('right'); break;
    case 'ArrowUp': e.preventDefault(); move('up'); break;
    case 'ArrowDown': e.preventDefault(); move('down'); break;
  }
});

initBoard();