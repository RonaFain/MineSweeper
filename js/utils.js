function createMat(ROWS, COLS) {
  var mat = [];
  for (var i = 0; i < ROWS; i++) {
    var row = [];
    for (var j = 0; j < COLS; j++) {
      row.push('');
    }
    mat.push(row);
  }
  return mat;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function countNegs(cellI, cellJ, mat, element) {
  var negsCount = 0;
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i > mat.length - 1) continue;
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (j < 0 || j > mat[i].length - 1) continue;
      if (i === cellI && j === cellJ) continue;
      if (mat[i][j][element]) negsCount++;
    }
  }
  return negsCount;
}

function getElement(location) {
  var cellSelector = '.' + getClassName({ i: location.i, j: location.j });
  return document.querySelector(cellSelector);
}

function renderCell(location, value) {
  var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
  elCell.innerHTML = value;
}

function getClassName(location) {
  var cellClass = 'cell-' + location.i + '-' + location.j;
  return cellClass;
}

function startTimer() {
  var startTime = Date.now();
  gTimerInterval = setInterval(showTimer, 100, startTime);
}

function convertTime(miliseconds) {
  var totalSeconds = Math.floor(miliseconds / 1000);
  var minutes = Math.floor(totalSeconds / 60);
  var seconds = totalSeconds - minutes * 60;
  return seconds < 10
    ? '00' + seconds
    : seconds < 100
    ? '0' + seconds
    : seconds;
}

function generateColor() {
  gColors.push('blue');
  gColors.push('green');
  gColors.push('deeppink');
  gColors.push('darkslateblue');
  gColors.push('darkviolet');
  gColors.push('darkred');
  gColors.push('darkorange');
  gColors.push('darkseagreen');

  // get random colors - didnt like the colors
  //   for (var i = 0; i < 8; i++) {
  //     var color = getRandomColor();
  //     gColors.push(color);
  //   }
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
