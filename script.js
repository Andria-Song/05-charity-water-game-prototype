// Log a message to the console to ensure the script is linked correctly
console.log('JavaScript file is linked correctly.');

// Linking images to the HTML file
const jerryCanEmpty = document.getElementById('jerry-can-empty');
const jerryCanQuarter = document.getElementById('jerry-can-quarter');
const jerryCanHalf = document.getElementById('jerry-can-half');
const jerryCanThreeQuarter = document.getElementById('jerry-can-three-quarter');
const jerryCanFull = document.getElementById('jerry-can-full');

const gameOverMessage = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const gameOverTitle = document.querySelector('#game-over h2');
const goalElement = document.getElementById('goal');
const difficultyButtons = document.querySelectorAll('.difficulty-button');
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const homeButton = document.getElementById('home-button');
const topHud = document.getElementById('top-hud');
const jerryCanContainer = document.querySelector('.jerry-can-container');
const pauseButton = document.getElementById('pause-button');

// Transfering fill button to the js//
const fillButton = document.getElementById('fill-button');
const resetButton = document.getElementById('restart-button') || document.getElementById('reset-button');

const score = document.getElementById('score');
let currentScore = 0;

// Difficulty settings are stored in one place to avoid giant if/else statements.
const DIFFICULTY_SETTINGS = {
  easy: {
    goalScore: 6,
    startTime: 20,
    startTickerIntervalMs: 9,
    startTickerStepPx: 2,
    speedUpIntervalDelta: 0.7,
    speedUpStepDelta: 1
  },
  medium: {
    goalScore: 7,
    startTime: 25,
    startTickerIntervalMs: 8,
    startTickerStepPx: 2.5,
    speedUpIntervalDelta: 0.5,
    speedUpStepDelta: 1
  },
  hard: {
    goalScore: 5,
    startTime: 20,
    startTickerIntervalMs: 7,
    startTickerStepPx: 3,
    speedUpIntervalDelta: 0.7,
    speedUpStepDelta: 1
  }
};

let currentDifficulty = 'medium';
let currentSettings = DIFFICULTY_SETTINGS[currentDifficulty];
let goalScore = currentSettings.goalScore;
let gameHasStarted = false;

// Get the timing bar and ticker from the page
const timingBar = document.querySelector('.timing-bar');
const progressTicker = document.querySelector('.progress-ticker');

// This stores the current X position of the ticker (in pixels)
let tickerX = 0;

//Timer Function
const timerElement = document.getElementById('timer');
let timerValue = 30;
let timerIntervalId = null;

function endGame(titleText) {
  fillButton.disabled = true;

  if (timerIntervalId) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }

  if (tickerTimerId) {
    clearInterval(tickerTimerId);
    tickerTimerId = null;
  }

  if (gameOverTitle) {
    gameOverTitle.textContent = titleText;
  }

  if (finalScoreElement) {
    finalScoreElement.textContent = `${currentScore}`;
  }

  gameOverMessage.style.display = "block";
}

function countdownTimer() {
  if (timerIntervalId) {
    clearInterval(timerIntervalId);
  }

  timerIntervalId = setInterval(function() {
    timerValue--;
    timerElement.textContent = `${timerValue}`;
    if (timerValue <= 0) {
      clearInterval(timerIntervalId);
      timerIntervalId = null;
      timerElement.textContent = "0";
      endGame('Game Over!');
    }
  }, 1000);
  }

function updateGoalText() {
  if (goalElement) {
    goalElement.textContent = `Goal: ${goalScore}`;
  }
}

function updateDifficultyButtonStyles() {
  difficultyButtons.forEach((button) => {
    const level = button.dataset.level;
    const isActive = level === currentDifficulty;
    button.classList.toggle('is-active', isActive);
  });
}

function applyDifficulty(level) {
  // If an unknown level is passed in, keep the current difficulty.
  if (!DIFFICULTY_SETTINGS[level]) {
    return;
  }

  currentDifficulty = level;
  currentSettings = DIFFICULTY_SETTINGS[currentDifficulty];
  goalScore = currentSettings.goalScore;

  updateGoalText();
  updateDifficultyButtonStyles();
}

// Move the ticker, but keep it inside the bar at all times
function setTickerPosition(newX) {
	if (!timingBar || !progressTicker) {
		return;
	}

	// Maximum allowed position so ticker does not move past the right edge
	const maxX = timingBar.clientWidth - progressTicker.offsetWidth;

	// Clamp the value between 0 and maxX
	tickerX = Math.max(0, Math.min(newX, maxX));

	// Apply the position
	progressTicker.style.left = `${tickerX}px`;
}

// Tracks which direction the ticker is moving: 1 = right, -1 = left
let tickerDirection = 1;

// Speed limits (caps)
const MIN_TICKER_INTERVAL_MS = 2; // lower than this can be unreliable in browsers
const MAX_TICKER_STEP_PX = 6; // capped a bit lower so late-game speed stays manageable

// Current timer speed (smaller number = faster updates)
let tickerIntervalMs = 10;
let tickerStepPx = 2; // how many pixels the ticker moves each update
let tickerTimerId = null;
// This becomes true after one click and resets when a new pass starts.
let hasClickedThisPass = false;

function startTicker() {
  if (tickerTimerId) {
    clearInterval(tickerTimerId);
  }

  // Move the ticker back and forth automatically
  tickerTimerId = setInterval(() => {
    const maxX = timingBar.clientWidth - progressTicker.offsetWidth;
    let startedNewPass = false;

    // Flip direction when the ticker hits the left or right edge
    if (tickerX >= maxX) {
      tickerDirection = -1;
      startedNewPass = true;
    } else if (tickerX <= 0) {
      tickerDirection = 1;
      startedNewPass = true;
    }

    // At each bounce, a new pass begins, so allow one new click.
    if (startedNewPass) {
      hasClickedThisPass = false;
    }

    // Move the ticker in the current direction using the current step size
    setTickerPosition(tickerX + tickerDirection * tickerStepPx);
  }, tickerIntervalMs);
}

function resetJerryCanImages() {
  jerryCanEmpty.style.display = "block";
  jerryCanQuarter.style.display = "none";
  jerryCanHalf.style.display = "none";
  jerryCanThreeQuarter.style.display = "none";
  jerryCanFull.style.display = "none";
}

function resetGameState() {
  // Reset score and labels
  currentScore = 0;
  score.textContent = `Score: ${currentScore}`;
  if (finalScoreElement) {
    finalScoreElement.textContent = `${currentScore}`;
  }

  // Reset timer based on selected difficulty
  timerValue = currentSettings.startTime;
  timerElement.textContent = `${timerValue}`;

  // Reset game-over panel and controls
  fillButton.disabled = false;
  gameOverMessage.style.display = "none";
  if (gameOverTitle) {
    gameOverTitle.textContent = 'Game Over!';
  }

  resetJerryCanImages();

  // Reset ticker settings based on selected difficulty
  tickerDirection = 1;
  tickerIntervalMs = currentSettings.startTickerIntervalMs;
  tickerStepPx = currentSettings.startTickerStepPx;
  hasClickedThisPass = false;
  setTickerPosition(0);

  startTicker();
  countdownTimer();
}

function setGameUiVisibility(isVisible) {
  // Show or hide the in-game parts as one group.
  const displayValue = isVisible ? 'block' : 'none';

  if (topHud) {
    topHud.style.display = displayValue;
  }

  if (fillButton) {
    fillButton.style.display = displayValue;
  }

  if (jerryCanContainer) {
    jerryCanContainer.style.display = displayValue;
  }
}

function showStartScreen() {
  if (startScreen) {
    startScreen.style.display = 'block';
  }

  setGameUiVisibility(false);
  gameOverMessage.style.display = 'none';
}

function startGameFromStartScreen() {
  if (startScreen) {
    startScreen.style.display = 'none';
  }

  setGameUiVisibility(true);
  gameHasStarted = true;
  resetGameState();
}



function filledJerryCan() {
  if (jerryCanFull.style.display !== "none") {
      currentScore += 1;
      score.textContent = `Score: ${currentScore}`;
      jerryCanFull.style.display = "none";
      jerryCanEmpty.style.display = "block";

      if (currentScore >= goalScore) {
        endGame('You Win!');
        return;
      }

      // Make game faster, while staying inside caps
      tickerIntervalMs = Math.max(
        MIN_TICKER_INTERVAL_MS,
        tickerIntervalMs - currentSettings.speedUpIntervalDelta
      );
      tickerStepPx = Math.min(
        MAX_TICKER_STEP_PX,
        tickerStepPx + currentSettings.speedUpStepDelta
      );

      startTicker();
    }
  }

// Set initial difficulty and start the first round.
applyDifficulty(currentDifficulty);
showStartScreen();

difficultyButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const selectedLevel = button.dataset.level;
    applyDifficulty(selectedLevel);

    // If a round is already running, restart with the new difficulty.
    if (gameHasStarted) {
      resetGameState();
    }
  });
});

if (startButton) {
  startButton.addEventListener('click', () => {
    startGameFromStartScreen();
  });
}

function toggleJerryCanImageGreen() {
  // If the empty can is showing (visible by default, so display is "" or "block")
  if (jerryCanEmpty.style.display !== "none") {
    jerryCanEmpty.style.display = "none";
    jerryCanHalf.style.display = "block";
  }
  // If the quarter can is showing, switch to three-quarter
  else if (jerryCanQuarter.style.display !== "none") {
    jerryCanQuarter.style.display = "none";
    jerryCanThreeQuarter.style.display = "block";
  }
  else if (jerryCanHalf.style.display !== "none") {
    jerryCanHalf.style.display = "none";
    jerryCanFull.style.display = "block";
  }
  else if (jerryCanThreeQuarter.style.display !== "none") {
    jerryCanThreeQuarter.style.display = "none";
    jerryCanFull.style.display = "block";
    jerryCanQuarter.style.display = "block";
  }
}

function toggleJerryCanImageYellow() {
  // If the empty can is showing (visible by default, so display is "" or "block")
  if (jerryCanEmpty.style.display !== "none") {
    jerryCanEmpty.style.display = "none";
    jerryCanQuarter.style.display = "block";
  }
  else if (jerryCanQuarter.style.display !== "none") {
    jerryCanQuarter.style.display = "none";
    jerryCanHalf.style.display = "block";
  }
  else if (jerryCanHalf.style.display !== "none") {
    jerryCanHalf.style.display = "none";
    jerryCanThreeQuarter.style.display = "block";
  }
  else if (jerryCanThreeQuarter.style.display !== "none") {
    jerryCanThreeQuarter.style.display = "none";
    jerryCanFull.style.display = "block";
  }
}

function toggleJerryCanImageRed() {
  // If the empty can is showing (visible by default, so display is "" or "block")
  if (jerryCanQuarter.style.display !== "none") {
    jerryCanQuarter.style.display = "none";
    jerryCanEmpty.style.display = "block";
  }
  else if (jerryCanHalf.style.display !== "none") {
    jerryCanHalf.style.display = "none";
    jerryCanQuarter.style.display = "block";
  }
  else if (jerryCanThreeQuarter.style.display !== "none") {
    jerryCanThreeQuarter.style.display = "none";
    jerryCanHalf.style.display = "block";
  }
}

// Event listener for Fill Jerry Can button
fillButton.addEventListener('click', () => {
  // Only allow one click for each pass of the ticker.
  if (hasClickedThisPass) {
    console.log('You already clicked this pass. Wait for the ticker to bounce.');
    return;
  }

  // Lock clicking until the ticker reaches an edge and starts a new pass.
  hasClickedThisPass = true;

  // Calculate where the ticker is as a percentage of the bar's width
  const barWidth = timingBar.clientWidth;
  const tickerPercent = (tickerX / barWidth) * 100;

  const inGreen = tickerPercent >= 40 && tickerPercent <= 59;
  const inYellow = tickerPercent >= 20 && tickerPercent <= 39 || tickerPercent >= 60 && tickerPercent <= 79;
  const inRed = tickerPercent < 20 || tickerPercent > 79;

  if (inGreen) {
    console.log('Great timing! Ticker is in the green zone.');
    toggleJerryCanImageGreen();
    filledJerryCan();
  } else if (inYellow) {
    console.log('Missed! Ticker was not in the green zone.');
    toggleJerryCanImageYellow();
    filledJerryCan();
  } else if (inRed) {
    console.log('Failed! Ticker is in the red zone.');
    toggleJerryCanImageRed();
  }

  


});

if (resetButton) {
  resetButton.addEventListener('click', () => {
    // Restart using whatever difficulty is currently selected.
    setGameUiVisibility(true);
    gameHasStarted = true;
    resetGameState();
  });
}

if (homeButton) {
  homeButton.addEventListener('click', () => {
    gameHasStarted = false;

    // Stop running timers when going back to home.
    if (timerIntervalId) {
      clearInterval(timerIntervalId);
      timerIntervalId = null;
    }

    if (tickerTimerId) {
      clearInterval(tickerTimerId);
      tickerTimerId = null;
    }

    showStartScreen();
  });
}

pauseButton.addEventListener('click', () => {
  if (timerIntervalId) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }

  if (tickerTimerId) {
    clearInterval(tickerTimerId);
    tickerTimerId = null;
  }
});



