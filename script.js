let targetNumber = Math.floor(Math.random() * 100) + 1;
let attemptsLeft = 5;
let gameOver = false;
let guessCount = 0;
let guesses = [];
let hintShown = false;
let isDarkTheme = false;
let timeLeft = 45;
let timerInterval;

const guessInput = document.getElementById('guessInput');
const guessBtn = document.getElementById('guessBtn');
const hintDiv = document.getElementById('hint');
const attemptsDisplay = document.getElementById('attemptsLeft');
const container = document.getElementById('gameContainer');
const progressBar = document.getElementById('progressBar');
const guessHistory = document.getElementById('guessHistory');
const historyItems = document.getElementById('historyItems');
const themeIcon = document.getElementById('themeIcon');
const timeDisplay = document.getElementById('timeLeft');

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timeDisplay.textContent = timeLeft;

        if (timeLeft <= 10) {
            timeDisplay.className = 'info-value danger';
        } else if (timeLeft <= 15) {
            timeDisplay.className = 'info-value warning';
        }

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if (!gameOver) {
                gameOver = true;
                showTimeoutPopup();
                endGame(false);
            }
        }
    }, 1000);
}

startTimer();

function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle('dark-theme');
    themeIcon.textContent = isDarkTheme ? '☀️' : '🌙';
}

guessInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        makeGuess();
    }
});

function makeGuess() {
    if (gameOver) return;

    const guess = parseInt(guessInput.value);

    if (!guess || guess < 1 || guess > 100) {
        showHint('⚠️ Enter a valid number between 1 and 100!', 'error');
        container.classList.add('shake');
        setTimeout(() => container.classList.remove('shake'), 400);
        return;
    }

    guessCount++;
    guesses.push(guess);
    updateGuessHistory();

    attemptsLeft--;
    attemptsDisplay.textContent = attemptsLeft;
    updateProgressBar();

    const difference = Math.abs(guess - targetNumber);

    if (guess === targetNumber) {
        gameOver = true;
        clearInterval(timerInterval);
        const attemptsUsed = 5 - attemptsLeft;
        const timeTaken = 45 - timeLeft;
        showWinPopup(attemptsUsed, timeTaken);
        container.classList.add('glow');
        endGame(true);
    } else if (attemptsLeft === 0) {
        gameOver = true;
        clearInterval(timerInterval);
        showLosePopup();
        endGame(false);
    } else {
        const direction = guess < targetNumber ? 'higher' : 'lower';
        let message = '';

        if (difference <= 3) {
            message = `🔥 Very Close! Try a little ${direction}`;
        } else if (difference <= 10) {
            message = `👍 Getting closer… go ${direction}`;
        } else if (difference <= 25) {
            message = `🙂 Warmer… try ${direction}`;
        } else {
            message = `❄️ Cold… go much ${direction}`;
        }

        showHint(message, 'info');
        container.classList.add('shake');
        setTimeout(() => container.classList.remove('shake'), 400);

        if (guessCount === 3 && !hintShown) {
            showHintBulb();
        }
    }

    guessInput.value = '';
    guessInput.focus();
}

function updateGuessHistory() {
    guessHistory.style.display = 'block';
    const guessItem = document.createElement('span');
    guessItem.className = 'guess-item';
    guessItem.textContent = guesses[guesses.length - 1];
    historyItems.appendChild(guessItem);
}

function updateProgressBar() {
    const percentage = (attemptsLeft / 5) * 100;
    progressBar.style.width = `${percentage}%`;

    if (percentage <= 40) {
        progressBar.style.background = 'linear-gradient(90deg, #ff416c 0%, #ff4b2b 100%)';
    } else if (percentage <= 60) {
        progressBar.style.background = 'linear-gradient(90deg, #f8b500 0%, #fceabb 100%)';
    }
}

function showHintBulb() {
    const bulb = document.createElement('div');
    bulb.className = 'hint-bulb';
    bulb.innerHTML = '💡';
    bulb.title = 'Click for a strategy hint';
    bulb.onclick = showStrategyHint;
    container.style.position = 'relative';
    container.appendChild(bulb);
}

function showStrategyHint() {
    if (hintShown) return;
    hintShown = true;

    const strategyDiv = document.createElement('div');
    strategyDiv.className = 'strategy-hint';
    strategyDiv.innerHTML = `
        <strong>💡 Smart Move:</strong>
        Think like a detective! Instead of random guesses, try the middle number first. 
        Each hint cuts your search area in half. It's like finding a page in a book—you don't 
        start from page 1, you open in the middle and decide which half to check next! 📖✨
    `;

    hintDiv.parentNode.insertBefore(strategyDiv, hintDiv);

    const bulb = document.querySelector('.hint-bulb');
    if (bulb) {
        bulb.style.animation = 'none';
        bulb.style.opacity = '0.5';
        bulb.style.cursor = 'default';
        bulb.onclick = null;
    }
}

function showWinPopup(attempts, timeTaken) {
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.innerHTML = `
        <div class="popup">
            <div class="popup-icon">🎉</div>
            <div class="popup-title">Legendary!</div>
            <div class="popup-message">You beat the extreme challenge!</div>
            <div class="popup-number">${targetNumber}</div>
            <div class="popup-stats">✅ ${attempts} attempt${attempts === 1 ? '' : 's'}</div>
            <div class="popup-stats">⏱️ ${timeTaken} seconds</div>
            <button class="popup-close" onclick="closePopup()">Play Again</button>
        </div>
    `;
    document.body.appendChild(overlay);
}

function showLosePopup() {
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.innerHTML = `
        <div class="popup">
            <div class="popup-icon">😢</div>
            <div class="popup-title">Game Over!</div>
            <div class="popup-message">You've run out of attempts!</div>
            <div class="popup-message">The number was:</div>
            <div class="popup-number">${targetNumber}</div>
            <button class="popup-close" onclick="closePopup()">Try Again</button>
        </div>
    `;
    document.body.appendChild(overlay);
}

function showTimeoutPopup() {
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.innerHTML = `
        <div class="popup">
            <div class="popup-icon">⏰</div>
            <div class="popup-title">Time's Up!</div>
            <div class="popup-message">You ran out of time!</div>
            <div class="popup-message">The number was:</div>
            <div class="popup-number">${targetNumber}</div>
            <button class="popup-close" onclick="closePopup()">Try Again</button>
        </div>
    `;
    document.body.appendChild(overlay);
}

function closePopup() {
    const overlay = document.querySelector('.popup-overlay');
    if (overlay) overlay.remove();
    restartGame();
}

function showHint(message, type) {
    hintDiv.textContent = message;
    hintDiv.className = `hint ${type}`;
}

function endGame() {
    guessInput.disabled = true;
    guessBtn.disabled = true;
    clearInterval(timerInterval);

    const bulb = document.querySelector('.hint-bulb');
    if (bulb) bulb.remove();

    const restartBtn = document.createElement('button');
    restartBtn.textContent = '🔄 Play Again';
    restartBtn.className = 'restart-btn';
    restartBtn.onclick = restartGame;
    guessBtn.parentNode.insertBefore(restartBtn, hintDiv);
}

function restartGame() {
    targetNumber = Math.floor(Math.random() * 100) + 1;
    attemptsLeft = 5;
    gameOver = false;
    guessCount = 0;
    guesses = [];
    hintShown = false;
    timeLeft = 45;
    clearInterval(timerInterval);

    attemptsDisplay.textContent = attemptsLeft;
    timeDisplay.textContent = timeLeft;
    timeDisplay.className = 'info-value';
    guessInput.disabled = false;
    guessBtn.disabled = false;
    guessInput.value = '';
    hintDiv.textContent = '';
    hintDiv.className = 'hint';
    container.classList.remove('glow');
    progressBar.style.width = '100%';
    progressBar.style.background = 'linear-gradient(90deg, #11998e 0%, #38ef7d 100%)';
    guessHistory.style.display = 'none';
    historyItems.innerHTML = '';

    const restartBtn = document.querySelector('.restart-btn');
    if (restartBtn) restartBtn.remove();

    const strategyHint = document.querySelector('.strategy-hint');
    if (strategyHint) strategyHint.remove();

    const bulb = document.querySelector('.hint-bulb');
    if (bulb) bulb.remove();

    guessInput.focus();
    startTimer();
}
