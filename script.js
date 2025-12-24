// Game configuration based on difficulty
const DIFFICULTY_CONFIG = {
    easy: { min: 1, max: 100, attempts: 7, time: 60 },
    medium: { min: 1, max: 150, attempts: 5, time: 45 },
    hard: { min: 1, max: 200, attempts: 5, time: 30 }
};

// Game state
let currentDifficulty = null;
let targetNumber = 0;
let attemptsLeft = 0;
let timeLeft = 0;
let maxTime = 0;
let timerInterval = null;
let guessHistory = [];
let gameStarted = false;

// Initialize game on load
window.onload = function() {
    loadHighScores();
};

// Select difficulty and start game
function selectDifficulty(difficulty) {
    currentDifficulty = difficulty;
    const config = DIFFICULTY_CONFIG[difficulty];
    
    // Update UI
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelector(`.difficulty-btn.${difficulty}`).classList.add('selected');
    
    // Hide difficulty section and show game
    setTimeout(() => {
        document.getElementById('difficultySection').style.display = 'none';
        document.getElementById('gameSection').style.display = 'block';
        
        // Set difficulty badge
        const badge = document.getElementById('difficultyBadge');
        badge.className = `difficulty-badge ${difficulty}`;
        badge.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
        
        // Initialize game
        initializeGame(config);
    }, 300);
}

// Initialize game with difficulty config
function initializeGame(config) {
    targetNumber = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
    attemptsLeft = config.attempts;
    timeLeft = config.time;
    maxTime = config.time;
    guessHistory = [];
    gameStarted = false;
    
    // Update UI
    document.getElementById('attemptsLeft').textContent = attemptsLeft;
    document.getElementById('timeLeft').textContent = timeLeft;
    document.getElementById('rangeDisplay').textContent = `${config.min}-${config.max}`;
    document.getElementById('progressBar').style.width = '100%';
    document.getElementById('guessInput').setAttribute('min', config.min);
    document.getElementById('guessInput').setAttribute('max', config.max);
    document.getElementById('guessInput').setAttribute('placeholder', `${config.min} - ${config.max}`);
    document.getElementById('guessHistory').style.display = 'none';
    document.getElementById('hint').textContent = '';
    document.getElementById('hint').className = 'hint';
    
    // Display high score for current difficulty
    displayHighScore();
}

// Start timer on first guess
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timeLeft').textContent = timeLeft;
        
        const progressPercent = (timeLeft / maxTime) * 100;
        document.getElementById('progressBar').style.width = progressPercent + '%';
        
        if (timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
}

// Make a guess
function makeGuess() {
    const input = document.getElementById('guessInput');
    const config = DIFFICULTY_CONFIG[currentDifficulty];
    const guess = parseInt(input.value);
    const hint = document.getElementById('hint');

    if (!guess || guess < config.min || guess > config.max) {
        hint.textContent = `⚠️ Please enter a number between ${config.min} and ${config.max}`;
        hint.className = 'hint';
        return;
    }

    // Start timer on first guess
    if (!gameStarted) {
        startTimer();
        gameStarted = true;
    }

    guessHistory.push(guess);
    updateGuessHistory();

    attemptsLeft--;
    document.getElementById('attemptsLeft').textContent = attemptsLeft;

    if (guess === targetNumber) {
        endGame(true);
    } else if (attemptsLeft === 0) {
        endGame(false);
    } else {
        if (guess > targetNumber) {
            hint.textContent = '📉 Too high! Try a lower number';
            hint.className = 'hint too-high';
        } else {
            hint.textContent = '📈 Too low! Try a higher number';
            hint.className = 'hint too-low';
        }
    }

    input.value = '';
    input.focus();
}

// Update guess history display
function updateGuessHistory() {
    const historyDiv = document.getElementById('guessHistory');
    const itemsDiv = document.getElementById('historyItems');
    
    if (guessHistory.length > 0) {
        historyDiv.style.display = 'block';
        itemsDiv.innerHTML = guessHistory.map(g => 
            `<div class="history-item">${g}</div>`
        ).join('');
    }
}

// End game
function endGame(won) {
    clearInterval(timerInterval);
    gameStarted = false;
    
    if (won) {
        const score = calculateScore();
        checkAndUpdateHighScore(score);
        showCelebration(true, score);
    } else {
        showCelebration(false, 0);
    }
}

// Calculate score: (remaining attempts × 100) + remaining time
function calculateScore() {
    return (attemptsLeft * 100) + timeLeft;
}

// Show celebration/game over modal
function showCelebration(won, score) {
    const modal = document.getElementById('celebrationModal');
    const content = document.getElementById('celebrationContent');
    const title = document.getElementById('modalTitle');
    const message = document.getElementById('modalMessage');
    const timeStatItem = document.getElementById('timeStatItem');
    const newHighScoreMsg = document.getElementById('newHighScoreMsg');
    
    modal.style.display = 'flex';
    
    document.getElementById('winNumber').textContent = targetNumber;
    document.getElementById('winAttempts').textContent = DIFFICULTY_CONFIG[currentDifficulty].attempts - attemptsLeft;
    
    if (won) {
        content.classList.remove('game-over');
        title.textContent = '🎉 YOU WON! 🎉';
        message.textContent = 'Congratulations!';
        document.getElementById('winTime').textContent = maxTime - timeLeft;
        document.getElementById('finalScore').textContent = score;
        timeStatItem.style.display = 'block';
        
        // Check if new high score
        const highScoreKey = `highScore_${currentDifficulty}`;
        const currentHighScore = parseInt(localStorage.getItem(highScoreKey)) || 0;
        if (score > currentHighScore) {
            newHighScoreMsg.style.display = 'block';
        } else {
            newHighScoreMsg.style.display = 'none';
        }
        
        createConfetti();
        createFireworks();
    } else {
        content.classList.add('game-over');
        title.textContent = '😢 GAME OVER';
        message.textContent = `Better luck next time!`;
        timeStatItem.style.display = 'none';
        newHighScoreMsg.style.display = 'none';
        document.getElementById('finalScore').textContent = '0';
    }
}

// Confetti animation
function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e'];
    
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = -10 + 'px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 3000);
        }, i * 30);
    }
}

// Fireworks animation
function createFireworks() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'];
    
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const centerX = Math.random() * window.innerWidth;
            const centerY = Math.random() * window.innerHeight * 0.5;
            
            for (let j = 0; j < 30; j++) {
                const firework = document.createElement('div');
                firework.className = 'firework';
                firework.style.left = centerX + 'px';
                firework.style.top = centerY + 'px';
                firework.style.background = colors[Math.floor(Math.random() * colors.length)];
                
                const angle = (Math.PI * 2 * j) / 30;
                const velocity = 100 + Math.random() * 100;
                firework.style.setProperty('--x', Math.cos(angle) * velocity + 'px');
                firework.style.setProperty('--y', Math.sin(angle) * velocity + 'px');
                
                document.body.appendChild(firework);
                setTimeout(() => firework.remove(), 1000);
            }
        }, i * 400);
    }
}

// Close modal and reset game
function closeModalAndReset() {
    document.getElementById('celebrationModal').style.display = 'none';
    resetGame();
}

// Reset game
function resetGame() {
    clearInterval(timerInterval);
    timerInterval = null;
    
    // Show difficulty selection again
    document.getElementById('gameSection').style.display = 'none';
    document.getElementById('difficultySection').style.display = 'block';
    
    // Reset difficulty selection
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    currentDifficulty = null;
    document.getElementById('guessInput').value = '';
}

// Load high scores from localStorage
function loadHighScores() {
    // Initialize high scores if they don't exist
    ['easy', 'medium', 'hard'].forEach(diff => {
        const key = `highScore_${diff}`;
        if (!localStorage.getItem(key)) {
            localStorage.setItem(key, '0');
        }
    });
}

// Display high score for current difficulty
function displayHighScore() {
    if (!currentDifficulty) return;
    
    const highScoreKey = `highScore_${currentDifficulty}`;
    const highScore = localStorage.getItem(highScoreKey) || '0';
    document.getElementById('highScoreDisplay').textContent = highScore;
}

// Check and update high score
function checkAndUpdateHighScore(score) {
    const highScoreKey = `highScore_${currentDifficulty}`;
    const currentHighScore = parseInt(localStorage.getItem(highScoreKey)) || 0;
    
    if (score > currentHighScore) {
        localStorage.setItem(highScoreKey, score.toString());
        displayHighScore();
    }
}

// Toggle dark mode
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const icon = document.getElementById('themeIcon');
    icon.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
}

// Toggle info modal
function toggleInfo() {
    const modal = document.getElementById('infoModal');
    if (modal.style.display === 'flex') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'flex';
    }
}

// Enter key support
document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('guessInput');
    if (input) {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                makeGuess();
            }
        });
    }
});
