'use strict';
const MINE = '💥';
const FLAG = '🚩';
const DEAD = '🤯';
const WIN = '😎';
const PLAY = '😀';
const HINT = '💡';
const LIFE = ' ❤ ';

// Global variables
var gBoard;
var gGame = {
  isOn: true,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
  lifes: 3,
};
var gLevel = {
  size: 4,
  mines: 1,
};
var gTimerInterval = null;
var gMines = [];
var gElNugs = [];
var gColors = [];
var gIsHint = false;
var gIsFirstClick = true;

function initGame() {
  setScore();
  generateColor();
  gBoard = buildBoard();
  renderBoard(gBoard);
  renderElements();
}

function setScore() {
  var storeScore = localStorage.getItem('score');
  document.querySelector('.score').innerText = !storeScore ? 0 : storeScore;
}

function setLevelGame() {
  var elLevel = document.querySelector('.levels');
  var level = elLevel.value;

  gLevel.size = level === 'Beginner' ? 4 : level === 'Medium' ? 8 : 12;
  gLevel.mines = level === 'Beginner' ? 2 : level === 'Medium' ? 12 : 30;
  stopClock();
  updateLife();
  prepareNewGame();
}

function buildBoard() {
  var board = createMat(gLevel.size, gLevel.size);

  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      var cell = createCell();
      board[i][j] = cell;
    }
  }
  return board;
}

function createCell() {
  return {
    minesAroundCount: 0,
    isShown: false,
    isMine: false,
    isMarked: false,
  };
}

function createMines(numMines, i, j) {
  gMines = [];
  while (numMines > 0) {
    var emptyCell = getEmptyCell(false);

    // cant be mine in first location
    if (emptyCell.i === i && emptyCell.j === j) continue;

    gBoard[emptyCell.i][emptyCell.j].isMine = true;
    numMines--;
    gMines.push({ i: emptyCell.i, j: emptyCell.j });
  }
}

function setMinesNegsCount(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j];
      currCell.minesAroundCount = countNegs(i, j, board, 'isMine');
    }
  }
  return board;
}

function renderBoard(board) {
  var strHTML = '<table border="0"><tbody>';
  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>';
    for (var j = 0; j < board[0].length; j++) {
      var cell = board[i][j];
      var className = `cell cell-${i}-${j}`;
      strHTML +=
        '<td class="' +
        className +
        '"' +
        ' onclick="cellClicked(this,' +
        i +
        ',' +
        j +
        ')" onmousedown=(cellMarked(event,this))> ';

      strHTML += cell.isShown
        ? cell.isMine
          ? MINE
          : cell.minesAroundCount
        : '';
      strHTML += '</td>';
    }
    strHTML += '</tr>';
  }
  strHTML += '</tbody></table>';
  var elContainer = document.querySelector('.board-container');
  elContainer.innerHTML = strHTML;
}

function renderElements() {
  document.querySelector('.num-mines').innerText = gLevel.mines + ' ' + FLAG;
  renderElement(3, 'safe', '.safe-container');
  renderElement(gGame.lifes, 'life', '.lifes-container');
  renderElement(3, 'hint', '.hint-container');
}

function cellHint(elCell) {
  gIsHint = true;
  elCell.classList.add('disable-click');

  setTimeout(function () {
    for (var i = 0; i < gElNugs.length; i++) {
      var elCurrCell = gElNugs[i][0];
      var currPosition = getPosition(elCurrCell);
      var currCell = gBoard[currPosition.i][currPosition.j];

      // if the element wasnt shown before - remove class
      if (!gElNugs[i][1]) {
        elCurrCell.classList.remove('shown');
        var value = currCell.isMarked ? FLAG : '';
        renderCell({ i: currPosition.i, j: currPosition.j }, value);
      }
    }
    gElNugs = [];
    gIsHint = false;
  }, 1500);
}

function cellClicked(elCell, i, j) {
  if (gIsFirstClick) startGame(i, j);
  if (!gGame.isOn) return;
  if (gBoard[i][j].isShown) return;
  if (gIsHint) {
    revealHints(i, j);
    return;
  }
  revealCell(elCell, i, j); // reveal current cell
  if (!gBoard[i][j].minesAroundCount && !gBoard[i][j].isMine)
    expandShown(gBoard, elCell, i, j);
  checkGameOver();
}

function setBoard(i, j) {
  createMines(gLevel.mines, i, j);
  setMinesNegsCount(gBoard);
  renderBoard(gBoard);
}

function checkCellValue(cell) {
  var value = cell.isMine
    ? MINE
    : cell.minesAroundCount > 0
    ? getNumHTML(cell.minesAroundCount)
    : '';
  return value;
}

function getNumHTML(num) {
  var color = gColors[num - 1];
  return `<span style="color: ${color}; font-weight: bolder;">${num}</span>`;
}

function cellMarked(event, elCell) {
  window.addEventListener('contextmenu', (e) => e.preventDefault());
  if (!gGame.isOn) return;
  if (event.which === 3) {
    if (gIsFirstClick) startGame();
    var currPosition = getPosition(elCell); // return {i , j}
    var currCell = gBoard[currPosition.i][currPosition.j];
    currCell.isMarked = !currCell.isMarked;
    currCell.isShown = false;

    // DOM
    renderCell(currPosition, currCell.isMarked ? FLAG : '');

    // marked counter
    currCell.isMarked ? gGame.markedCount++ : gGame.markedCount--;
    checkGameOver();
  }
}

function startGame(i, j) {
  gIsFirstClick = !gIsFirstClick;
  startTimer();
  setElements();
  setBoard(i, j);
}

function checkGameOver() {
  if (
    gGame.markedCount === gLevel.mines &&
    gGame.shownCount === gLevel.size ** 2 - gLevel.mines
  ) {
    gGame.isOn = false;
    gameOver(true);
  }
}

function gameOver(isVictory) {
  stopClock();
  updateScore();
  updateElements();
  var msgText = isVictory
    ? 'Victoryyyyy !! 😉'
    : 'You lost the game. Try again 🤠';
  openModal(msgText);
  var smiley = document.querySelector('.restart');
  smiley.innerText = isVictory ? WIN : DEAD;
}

function openModal(text) {
  var elModal = document.querySelector('.modal');
  var modelText = elModal.querySelector('p');
  modelText.innerText = text;
  elModal.style.display = 'block';

  closeModal(elModal);
}

function closeModal(elModal) {
  var elCloseModal = document.querySelector('.closeModal');
  elCloseModal.onclick = function () {
    elModal.style.display = 'none';
  };

  window.onclick = function (event) {
    if (event.target == elModal) {
      elModal.style.display = 'none';
    }
  };
}

function restart() {
  updateLife();

  if (gGame.lifes > 0) {
    stopClock();
  } else {
    gGame.isOn = false;
    gGame.lifes = 3;
  }
  prepareNewGame();
}

function updateLife() {
  gGame.lifes = 3;
  var wasVictory = document.querySelector('.restart').innerText;
  wasVictory === DEAD ? gGame.lifes : null;
}

function prepareNewGame() {
  gIsFirstClick = true;
  gGame.markedCount = 0;
  gGame.shownCount = 0;
  gGame.secsPassed = 0;
  gGame.isOn = true;
  document.querySelector('.restart').innerText = PLAY;
  document.querySelector('.timer').innerText = gGame.secsPassed;
  document.querySelector('.num-mines').innerText = gLevel.mines + FLAG;
  initGame();
}

function expandShown(board, elCell, cellI, cellJ) {
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i > board.length - 1) continue;
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (j < 0 || j > board[i].length - 1) continue;
      if (i === cellI && j === cellJ) continue;
      var numMinesNeg = board[i][j].minesAroundCount;
      var elNegCell = getElement({ i, j });
      if (
        numMinesNeg === 0 &&
        !board[i][j].isMine &&
        !board[i][j].isShown &&
        !board[i][j].isMarked
      ) {
        revealCell(elNegCell, i, j);
        expandShown(board, elCell, i, j);
      } else if (
        numMinesNeg >= 0 &&
        !board[i][j].isMine &&
        !board[i][j].isMarked
      ) {
        revealCell(elNegCell, i, j);
      }
    }
  }
}

function getEmptyCell(isSafeClick) {
  var emptyCells = [];

  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      var currCell = gBoard[i][j];
      if (!currCell.isMine) {
        var emptyCellPos = { i, j };
        emptyCells.push(emptyCellPos);
        if (isSafeClick) {
          var elCurrCell = getElement({ i, j });
          elCurrCell.classList.contains('shown') ? emptyCells.pop() : null;
        }
      }
    }
  }
  var randomIdx = getRandomInt(0, emptyCells.length);
  var emptyCell = emptyCells[randomIdx];
  return emptyCell;
}

function getPosition(elCell) {
  var splitPos = elCell.classList[1].split('-');
  var i = splitPos[1];
  var j = splitPos[2];

  return { i, j };
}

function revealCell(elCell, i, j) {
  var clickedCell = gBoard[i][j];

  // show counter
  if (!clickedCell.isShown) gGame.shownCount++;

  if (!clickedCell.isMine) {
    clickedCell.isShown = true;
    clickedCell.isMarked = false;
  } else {
    pressedMine(elCell);
    gGame.lifes--;
    renderElement(gGame.lifes, 'life', '.lifes-container');
    gGame.markedCount++;
    gGame.shownCount--;
    checkGameOver();
    if (gGame.lifes === 0) {
      revealOtherMines(i, j);
      gGame.isOn = false;
      gameOver(false);
    }
  }

  elCell.classList.add('shown');
  var cellValue = checkCellValue(clickedCell);
  renderCell({ i, j }, cellValue);
}

function showTimer(startTime) {
  gGame.secsPassed = Date.now() - startTime;
  var formatted = convertTime(gGame.secsPassed);
  document.querySelector('.timer').innerHTML = formatted;
}

function stopClock() {
  clearInterval(gTimerInterval);
}

function revealOtherMines(idxI, idxJ) {
  for (var i = 0; i < gMines.length; i++) {
    if (gMines[i].i === idxI && gMines[i].j === idxJ) continue;
    var cellI = gMines[i].i;
    var cellJ = gMines[i].j;

    // DOM
    var elCell = getElement({ i: cellI, j: cellJ });
    elCell.classList.add('shown');
    renderCell({ i: cellI, j: cellJ }, MINE);
  }
}

function revealHints(idxI, idxJ) {
  // insert the element itself to array
  revealHint(idxI, idxJ);

  // insert his neighbors to array
  for (var i = idxI - 1; i <= idxI + 1; i++) {
    if (i < 0 || i > gBoard.length - 1) continue;
    for (var j = idxJ - 1; j <= idxJ + 1; j++) {
      if (j < 0 || j > gBoard[0].length - 1) continue;
      if (i === idxI && j === idxJ) continue;
      revealHint(i, j);
    }
  }
}

function pressedMine(elCell) {
  elCell.classList.add('pressed');
}

function revealHint(i, j) {
  var currCell = gBoard[i][j];
  var elCurrCell = getElement({ i, j });
  var isShownClass = elCurrCell.classList.contains('shown');
  gElNugs.push([elCurrCell, isShownClass]);
  elCurrCell.classList.add('shown');
  var cellValue = checkCellValue(currCell);
  renderCell({ i, j }, cellValue);
}

function updateScore() {
  var prevScore = localStorage.getItem('score');
  var newScore = parseInt(gGame.secsPassed / 1000);
  if (prevScore < newScore || !prevScore) {
    localStorage.setItem('score', newScore);
    document.querySelector('.score').innerText = newScore;
  }
}

// reveal random cell on click button
function safeClicked(elBtn) {
  var count = +elBtn.getAttribute('data-countSafe');
  if (count === 0) {
    elBtn.classList.add('disable-click');
    return;
  }

  var safeCell = getEmptyCell(true);
  if (!safeCell) return;

  var elCell = getElement({ i: safeCell.i, j: safeCell.j });
  elCell.classList.add('shown', 'safe');
  var cellValue = checkCellValue(gBoard[safeCell.i][safeCell.j]);
  renderCell({ i: safeCell.i, j: safeCell.j }, cellValue);

  setTimeout(function () {
    elCell.classList.remove('shown', 'safe');
    renderCell({ i: safeCell.i, j: safeCell.j }, '');
  }, 3000);

  count--;
  renderElement(count, 'safe', '.safe-container');
}

function updateElements() {
  document.querySelector('.safe-container').style.pointerEvents = 'none';
  document.querySelectorAll('.hint').forEach((element) => {
    element.classList.add('disable-click');
  });
}

function renderElement(count, element, selector) {
  var strHTML = '';
  if (element === 'hint') {
    strHTML +=
      `<span class="hint disable-click" onclick="cellHint(this)">${HINT}</span>`.repeat(
        3
      );
  } else if (element === 'safe') {
    strHTML += `<button data-countSafe="${count}" onclick="safeClicked(this)">Safe Click</button>`;
  } else if (element === 'life') {
    strHTML += `<span class="life">${LIFE}</span>`.repeat(count);
  }
  var elContainer = document.querySelector(selector);
  elContainer.innerHTML = strHTML;
}

function setElements() {
  document.querySelector('.safe-container').style.pointerEvents = 'auto';
  document.querySelectorAll('.hint').forEach((element) => {
    element.classList.remove('disable-click');
  });
}
