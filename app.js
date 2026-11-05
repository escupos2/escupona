// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// Игровое состояние
let targetNumber = 0;
let attempts = 0;
let score = 0;
let gameHistory = [];

// Элементы DOM
const guessInput = document.getElementById('guessInput');
const guessButton = document.getElementById('guessButton');
const newGameButton = document.getElementById('newGameButton');
const messageDiv = document.getElementById('message');
const scoreSpan = document.getElementById('score');
const attemptsSpan = document.getElementById('attempts');
const historyDiv = document.getElementById('history');

// Инициализация новой игры
function startNewGame() {
    targetNumber = Math.floor(Math.random() * 100) + 1;
    attempts = 0;
    gameHistory = [];

    guessInput.value = '';
    guessInput.disabled = false;
    guessButton.disabled = false;

    updateUI();
    hideMessage();

    console.log('Новая игра. Загаданное число:', targetNumber);
}

// Проверка предположения
function makeGuess() {
    const guess = parseInt(guessInput.value);

    if (!guess || guess < 1 || guess > 100) {
        showMessage('Введи число от 1 до 100', 'error');
        tg.HapticFeedback.notificationOccurred('error');
        return;
    }

    attempts++;
    gameHistory.push(guess);

    if (guess === targetNumber) {
        handleWin();
    } else {
        handleHint(guess);
    }

    updateUI();
    guessInput.value = '';
    guessInput.focus();
}

// Обработка победы
function handleWin() {
    const points = Math.max(100 - (attempts - 1) * 10, 10);
    score += points;

    showMessage(`🎉 Победа! Ты угадал за ${attempts} попыток! +${points} очков`, 'success');

    guessInput.disabled = true;
    guessButton.disabled = true;

    tg.HapticFeedback.notificationOccurred('success');

    // Отправка данных в бот
    if (tg.initDataUnsafe.user) {
        tg.sendData(JSON.stringify({
            action: 'game_won',
            attempts: attempts,
            score: score,
            number: targetNumber
        }));
    }
}

// Подсказка
function handleHint(guess) {
    let hint = '';
    const diff = Math.abs(guess - targetNumber);

    if (guess < targetNumber) {
        hint = '⬆️ Моё число больше';
    } else {
        hint = '⬇️ Моё число меньше';
    }

    if (diff <= 5) {
        hint += ' (очень горячо! 🔥)';
    } else if (diff <= 15) {
        hint += ' (тепло 🌡️)';
    } else if (diff <= 30) {
        hint += ' (холодно ❄️)';
    } else {
        hint += ' (очень холодно 🧊)';
    }

    showMessage(hint, 'hint');
    tg.HapticFeedback.impactOccurred('light');
}

// Показать сообщение
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'flex';
}

// Скрыть сообщение
function hideMessage() {
    messageDiv.style.display = 'none';
}

// Обновление UI
function updateUI() {
    scoreSpan.textContent = score;
    attemptsSpan.textContent = attempts;

    historyDiv.innerHTML = '';
    gameHistory.forEach(num => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.textContent = num;
        historyDiv.appendChild(item);
    });
}

// Обработчики событий
guessButton.addEventListener('click', makeGuess);

guessInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        makeGuess();
    }
});

newGameButton.addEventListener('click', startNewGame);

// Настройка главной кнопки Telegram
tg.MainButton.setText('Поделиться результатом');
tg.MainButton.onClick(() => {
    const text = `Я играю в "Угадай число"! 🎯\nМой счёт: ${score}\nПопробуй обойти меня!`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(tg.initDataUnsafe.start_param || '')}&text=${encodeURIComponent(text)}`;
    tg.openTelegramLink(url);
});

if (score > 0) {
    tg.MainButton.show();
}

// Запуск игры
startNewGame();
