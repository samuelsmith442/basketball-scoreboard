// DOM Elements
const pointButtons = document.querySelectorAll(".point");
const foulButtons = document.querySelectorAll(".foul-btn");
const resetGameButton = document.getElementById("reset-game");
const toggleSoundButton = document.getElementById("toggle-sound");
const startTimerButton = document.getElementById("start-timer");
const pauseTimerButton = document.getElementById("pause-timer");
const resetTimerButton = document.getElementById("reset-timer");
const minutesDisplay = document.getElementById("minutes");
const secondsDisplay = document.getElementById("seconds");
const prevPeriodButton = document.getElementById("prev-period");
const nextPeriodButton = document.getElementById("next-period");
const periodDisplay = document.querySelector(".period-display");
const colorPickerButtons = document.querySelectorAll(".color-picker");
const historyList = document.querySelector(".history-list");
const teamNames = document.querySelectorAll(".team-name");

// Game state
let soundEnabled = true;
let timerInterval;
let timerRunning = false;
let minutes = 12;
let seconds = 0;
let currentPeriod = 1;
let gameHistory = [];
let homeTeamColor = getComputedStyle(document.documentElement).getPropertyValue('--home-team-color').trim();
let awayTeamColor = getComputedStyle(document.documentElement).getPropertyValue('--away-team-color').trim();

// Sound effects
const scoreSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-arcade-score-interface-217.mp3');
const buzzerSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-basketball-buzzer-1647.mp3');
const foulSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-referee-whistle-blow-2316.mp3');
const buttonClickSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3');

// Initialize the game
function initGame() {
    updateTimerDisplay();
    addEventListeners();
}

// Event listeners
function addEventListeners() {
    // Point buttons
    pointButtons.forEach((button) => {
        button.addEventListener("click", () => {
            if (soundEnabled) buttonClickSound.play();
            updateScore(button);
        });
    });

    // Foul buttons
    foulButtons.forEach((button) => {
        button.addEventListener("click", () => {
            if (soundEnabled) foulSound.play();
            updateFouls(button);
        });
    });

    // Reset game button
    resetGameButton.addEventListener("click", resetGame);

    // Toggle sound button
    toggleSoundButton.addEventListener("click", toggleSound);

    // Timer controls
    startTimerButton.addEventListener("click", startTimer);
    pauseTimerButton.addEventListener("click", pauseTimer);
    resetTimerButton.addEventListener("click", resetTimer);

    // Period controls
    prevPeriodButton.addEventListener("click", decreasePeriod);
    nextPeriodButton.addEventListener("click", increasePeriod);

    // Color picker buttons
    colorPickerButtons.forEach(button => {
        button.addEventListener("click", () => changeTeamColor(button));
    });

    // Team name editing
    teamNames.forEach(name => {
        name.addEventListener("blur", () => {
            addToHistory(`Team name changed to: ${name.textContent}`);
        });
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", handleKeyboardShortcuts);
}

// Update score
function updateScore(button) {
    try {
        const team = button.closest(".team");
        const score = team.querySelector(".score");
        const teamName = team.querySelector(".team-name").textContent;
        const value = parseInt(button.dataset.value);
        const currentScore = parseInt(score.innerText);
        const newScore = currentScore + value;

        if (isNaN(value) || isNaN(currentScore)) {
            throw new Error("Invalid score value");
        }

        // Update score
        score.innerText = newScore;

        // Add animation
        score.classList.add("highlight");
        setTimeout(() => {
            score.classList.remove("highlight");
        }, 500);

        // Create floating score animation
        createScoreAnimation(score, value);

        // Play sound
        if (soundEnabled) {
            scoreSound.currentTime = 0;
            scoreSound.play();
        }

        // Add to history
        addToHistory(`${teamName} scored ${value} point${value > 1 ? 's' : ''} (${newScore})`);

        // Check for milestone scores
        checkMilestones(newScore, team);

    } catch (error) {
        console.error("Error updating score:", error);
    }
}

// Create floating score animation
function createScoreAnimation(scoreElement, value) {
    const animation = document.createElement("div");
    animation.textContent = `+${value}`;
    animation.classList.add("score-animation");
    animation.style.color = value === 1 ? "#FFFFFF" :
                           value === 2 ? "#FFD700" : "#00FFFF";

    // Position the animation
    const rect = scoreElement.getBoundingClientRect();
    animation.style.left = `${rect.left + rect.width / 2}px`;
    animation.style.top = `${rect.top + rect.height / 2}px`;

    document.body.appendChild(animation);

    // Remove after animation completes
    setTimeout(() => {
        document.body.removeChild(animation);
    }, 1000);
}

// Update fouls
function updateFouls(button) {
    const team = button.closest(".team");
    const foulCount = team.querySelector(".foul-count");
    const teamName = team.querySelector(".team-name").textContent;
    const currentFouls = parseInt(foulCount.innerText);
    const newFouls = currentFouls + 1;

    foulCount.innerText = newFouls;

    // Add to history
    addToHistory(`${teamName} committed a foul (${newFouls} total)`);

    // Bonus warning
    if (newFouls === 5) {
        addToHistory(`${teamName} is in the bonus!`);
    }
}

// Check for milestone scores
function checkMilestones(score, team) {
    const teamName = team.querySelector(".team-name").textContent;

    if (score === 50) {
        addToHistory(`${teamName} reached 50 points!`);
        triggerConfetti();
    } else if (score === 100) {
        addToHistory(`${teamName} reached 100 points!`);
        triggerConfetti(true);
    } else if (score % 25 === 0) {
        addToHistory(`${teamName} reached ${score} points!`);
        triggerConfetti(false);
    }
}

// Trigger confetti animation
function triggerConfetti(intense = false) {
    const confettiSettings = {
        particleCount: intense ? 200 : 100,
        spread: intense ? 160 : 100,
        origin: { y: 0.6 },
        gravity: 1.2,
        scalar: 1.2,
        disableForReducedMotion: true
    };

    confetti(confettiSettings);

    if (intense) {
        // For big milestones, add more confetti from different angles
        setTimeout(() => {
            confetti({
                ...confettiSettings,
                origin: { y: 0.6, x: 0.2 }
            });
            confetti({
                ...confettiSettings,
                origin: { y: 0.6, x: 0.8 }
            });
        }, 500);
    }
}

// Timer functions
function startTimer() {
    if (!timerRunning) {
        timerRunning = true;
        timerInterval = setInterval(updateTimer, 1000);
        startTimerButton.disabled = true;
        pauseTimerButton.disabled = false;
    }
}

function pauseTimer() {
    if (timerRunning) {
        timerRunning = false;
        clearInterval(timerInterval);
        startTimerButton.disabled = false;
        pauseTimerButton.disabled = true;
    }
}

function resetTimer() {
    pauseTimer();
    minutes = 12;
    seconds = 0;
    updateTimerDisplay();
    startTimerButton.disabled = false;
    pauseTimerButton.disabled = false;
}

function updateTimer() {
    if (seconds === 0) {
        if (minutes === 0) {
            // End of period
            pauseTimer();
            if (soundEnabled) buzzerSound.play();
            addToHistory(`End of period ${currentPeriod}`);
            return;
        }
        minutes--;
        seconds = 59;
    } else {
        seconds--;
    }

    updateTimerDisplay();

    // Warning for last minute
    if (minutes === 0 && seconds === 59) {
        addToHistory("Last minute of the period!");
    }
}

function updateTimerDisplay() {
    minutesDisplay.textContent = minutes.toString().padStart(2, "0");
    secondsDisplay.textContent = seconds.toString().padStart(2, "0");
}

// Period functions
function increasePeriod() {
    if (currentPeriod < 4) {
        currentPeriod++;
        updatePeriodDisplay();
        addToHistory(`Starting period ${currentPeriod}`);
        resetTimer();
    }
}

function decreasePeriod() {
    if (currentPeriod > 1) {
        currentPeriod--;
        updatePeriodDisplay();
        addToHistory(`Returning to period ${currentPeriod}`);
    }
}

function updatePeriodDisplay() {
    periodDisplay.textContent = currentPeriod;
}

// Team color functions
function changeTeamColor(button) {
    const team = button.closest(".team");
    const teamType = button.dataset.team;
    const score = team.querySelector(".score");
    const teamName = team.querySelector(".team-name").textContent;

    // Generate a random color
    const randomColor = getRandomColor();

    // Update the score color
    score.style.color = randomColor;

    // Store the color
    if (teamType === "home") {
        homeTeamColor = randomColor;
    } else {
        awayTeamColor = randomColor;
    }

    addToHistory(`${teamName} changed team color`);
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Game history functions
function addToHistory(message) {
    const timestamp = new Date().toLocaleTimeString();
    const historyItem = document.createElement("div");
    historyItem.classList.add("history-item");
    historyItem.innerHTML = `<strong>${timestamp}</strong>: ${message}`;

    historyList.prepend(historyItem);

    // Keep history limited to last 20 events
    const historyItems = historyList.querySelectorAll(".history-item");
    if (historyItems.length > 20) {
        historyList.removeChild(historyItems[historyItems.length - 1]);
    }

    // Also store in our game state
    gameHistory.push({ timestamp, message });
}

// Reset game
function resetGame() {
    if (confirm("Are you sure you want to reset the game?")) {
        // Reset scores
        document.querySelectorAll(".score").forEach(score => {
            score.innerText = "0";
        });

        // Reset fouls
        document.querySelectorAll(".foul-count").forEach(count => {
            count.innerText = "0";
        });

        // Reset timer
        resetTimer();

        // Reset period
        currentPeriod = 1;
        updatePeriodDisplay();

        // Add to history
        addToHistory("Game reset");

        if (soundEnabled) buzzerSound.play();
    }
}

// Toggle sound
function toggleSound() {
    soundEnabled = !soundEnabled;
    toggleSoundButton.innerHTML = soundEnabled ?
        '<i class="fas fa-volume-up"></i> Sound: ON' :
        '<i class="fas fa-volume-mute"></i> Sound: OFF';

    addToHistory(`Sound ${soundEnabled ? 'enabled' : 'disabled'}`);
}

// Keyboard shortcuts
function handleKeyboardShortcuts(e) {
    // Home team shortcuts
    if (e.key === "1") updateScore(document.querySelector(".team:first-child .point[data-value='1']"));
    if (e.key === "2") updateScore(document.querySelector(".team:first-child .point[data-value='2']"));
    if (e.key === "3") updateScore(document.querySelector(".team:first-child .point[data-value='3']"));

    // Away team shortcuts
    if (e.key === "7") updateScore(document.querySelector(".team:last-child .point[data-value='1']"));
    if (e.key === "8") updateScore(document.querySelector(".team:last-child .point[data-value='2']"));
    if (e.key === "9") updateScore(document.querySelector(".team:last-child .point[data-value='3']"));

    // Timer shortcuts
    if (e.key === " ") {
        if (timerRunning) pauseTimer();
        else startTimer();
    }

    // Period shortcuts
    if (e.key === "ArrowRight") increasePeriod();
    if (e.key === "ArrowLeft") decreasePeriod();

    // Reset shortcut
    if (e.key === "r" && e.ctrlKey) resetGame();
}

// Initialize the game when the DOM is loaded
document.addEventListener("DOMContentLoaded", initGame);
