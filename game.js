let secretNumber, minNumber, maxNumber, attempts, maxAttempts, score, hintCount, gameStartTime;
const leaderboard = [];

function initGame(difficulty) {
    switch (difficulty) {
        case 'easy':
            minNumber = 1;
            maxNumber = 50;
            maxAttempts = 10;
            break;
        case 'medium':
            minNumber = 1;
            maxNumber = 100;
            maxAttempts = 7;
            break;
        case 'hard':
            minNumber = 1;
            maxNumber = 200;
            maxAttempts = 5;
            break;
        case 'custom':
            minNumber = parseInt(document.getElementById('minRange').value) || 1;
            maxNumber = parseInt(document.getElementById('maxRange').value) || 100;
            maxAttempts = parseInt(document.getElementById('maxAttempts').value) || 10;
            break;
    }
    secretNumber = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
    attempts = 0;
    score = 1000;
    hintCount = 0;
    gameStartTime = Date.now();
    updateUI();
    resetAnimations();
}

function checkGuess() {
    const guessInput = document.getElementById('guessInput');
    const guess = parseInt(guessInput.value);
    attempts++;

    if (isNaN(guess) || guess < minNumber || guess > maxNumber) {
        setMessage(`Please enter a valid number between ${minNumber} and ${maxNumber}.`);
        shakeElement(guessInput);
        return;
    }

    const difference = Math.abs(secretNumber - guess);
    const maxDifference = maxNumber - minNumber;
    const closeness = 1 - (difference / maxDifference);
    
    updateProgressBar(closeness);

    if (guess === secretNumber) {
        const timeTaken = Math.floor((Date.now() - gameStartTime) / 1000);
        score = calculateFinalScore(score, timeTaken);
        setMessage(`Congratulations! You guessed the number in ${attempts} attempts and ${timeTaken} seconds. Your score: ${score}`);
        document.getElementById('guessButton').disabled = true;
        addToLeaderboard(score);
        checkAchievements();
    } else if (attempts === maxAttempts) {
        setMessage(`Game over! The number was ${secretNumber}. Try again!`);
        document.getElementById('guessButton').disabled = true;
    } else {
        const hint = guess < secretNumber ? 'Too low!' : 'Too high!';
        setMessage(`${hint} Try again. Attempts left: ${maxAttempts - attempts}`);
        score -= Math.floor(100 / maxAttempts);
    }

    updateUI();
    guessInput.value = '';
    guessInput.focus();
}

function giveHint() {
    if (hintCount < 2) {
        const range = Math.floor((maxNumber - minNumber) / 4);
        const lowerHint = Math.max(minNumber, secretNumber - range);
        const upperHint = Math.min(maxNumber, secretNumber + range);
        setMessage(`Hint: The number is between ${lowerHint} and ${upperHint}`);
        hintCount++;
        score -= 50;
        updateUI();
    } else {
        setMessage("No more hints available!");
    }
}

function setMessage(message) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = message;
    messageElement.classList.add('message-animation');
    setTimeout(() => messageElement.classList.remove('message-animation'), 300);
}

function updateProgressBar(closeness) {
    const progressBar = document.getElementById('progressBar');
    const width = Math.round(closeness * 100);
    progressBar.style.width = width + '%';
    progressBar.style.backgroundColor = `hsl(${width}, 100%, 50%)`;
}

function updateUI() {
    document.getElementById('attempts').textContent = attempts;
    document.getElementById('score').textContent = score;
    document.getElementById('range').textContent = `${minNumber}-${maxNumber}`;
    document.getElementById('hintButton').disabled = hintCount >= 2;
}

function resetGame() {
    const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
    initGame(difficulty);
    document.getElementById('guessButton').disabled = false;
    document.getElementById('progressBar').style.width = '0%';
    setMessage('');
}

function calculateFinalScore(baseScore, timeTaken) {
    return Math.max(0, Math.floor(baseScore - (timeTaken * 2)));
}

function addToLeaderboard(score) {
    const playerName = prompt("You made it to the leaderboard! Enter your name:");
    if (playerName) {
        leaderboard.push({ name: playerName, score: score });
        leaderboard.sort((a, b) => b.score - a.score);
        leaderboard.splice(5); // Keep only top 5
        updateLeaderboardUI();
    }
}

function updateLeaderboardUI() {
    const leaderboardElement = document.getElementById('leaderboard');
    leaderboardElement.innerHTML = '<h3>Leaderboard</h3>';
    leaderboard.forEach((entry, index) => {
        leaderboardElement.innerHTML += `<p>${index + 1}. ${entry.name}: ${entry.score}</p>`;
    });
}

function checkAchievements() {
    const achievements = [];
    if (attempts === 1) achievements.push("Lucky Guess");
    if (score > 950) achievements.push("High Scorer");
    if (hintCount === 0) achievements.push("No Hints Used");
    
    if (achievements.length > 0) {
        setMessage(`Achievements unlocked: ${achievements.join(", ")}`);
    }
}

function shakeElement(element) {
    element.classList.add('shake');
    setTimeout(() => element.classList.remove('shake'), 500);
}

function resetAnimations() {
    document.querySelectorAll('.animated').forEach(el => {
        el.style.animation = 'none';
        el.offsetHeight; // Trigger reflow
        el.style.animation = null;
    });
}

function toggleCustomRange() {
    const customRangeInputs = document.getElementById('customRangeInputs');
    customRangeInputs.style.display = document.getElementById('custom').checked ? 'block' : 'none';
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initGame('medium');
    updateLeaderboardUI();
});