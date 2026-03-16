// Log a message to the console to ensure the script is linked correctly
console.log('JavaScript file is linked correctly.');

// Linking images to the HTML file
const jerryCanEmpty = document.getElementById('jerry-can-empty');
const jerryCanQuarter = document.getElementById('jerry-can-quarter');
const jerryCanHalf = document.getElementById('jerry-can-half');
const jerryCanThreeQuarter = document.getElementById('jerry-can-three-quarter');
const jerryCanFull = document.getElementById('jerry-can-full');

// Transfering fill button to the js//
const fillButton = document.getElementById('fill-button');

const score = document.getElementById('score');
let currentScore = 0;

// Get the timing bar and ticker from the page
const timingBar = document.querySelector('.timing-bar');
const progressTicker = document.querySelector('.progress-ticker');

// This stores the current X position of the ticker (in pixels)
let tickerX = 0;

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

function startTicker() {
  if (tickerTimerId) {
    clearInterval(tickerTimerId);
  }

  // Move the ticker back and forth automatically
  tickerTimerId = setInterval(() => {
    const maxX = timingBar.clientWidth - progressTicker.offsetWidth;

    // Flip direction when the ticker hits the left or right edge
    if (tickerX >= maxX) {
      tickerDirection = -1;
    } else if (tickerX <= 0) {
      tickerDirection = 1;
    }

    // Move the ticker in the current direction using the current step size
    setTickerPosition(tickerX + tickerDirection * tickerStepPx);
  }, tickerIntervalMs);
}

startTicker();

function filledJerryCan() {
  if (jerryCanFull.style.display !== "none") {
      currentScore += 1;
      score.textContent = `Score: ${currentScore}`;
      jerryCanFull.style.display = "none";
      jerryCanEmpty.style.display = "block";

      // Make game faster, while staying inside caps
      tickerIntervalMs = Math.max(MIN_TICKER_INTERVAL_MS, tickerIntervalMs - 1);
      tickerStepPx = Math.min(MAX_TICKER_STEP_PX, tickerStepPx + 1);

      startTicker();
    }
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
    jerryCanEmpty.style.display = "block";
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
