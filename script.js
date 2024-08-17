document.addEventListener("DOMContentLoaded", () => {
    const cardsContainer = document.getElementById("cards-container");
    const movesCountElement = document.getElementById("moves-count");
    const restartButton = document.getElementById("restart");
    const startButton = document.getElementById("start-button");
    const gameContainer = document.getElementById("dynamic-cards");
    const startScreen = document.getElementById("start-screen");
    const userInfoForm = document.getElementById("user-info-form");
    const timerElement = document.getElementById("timer");
    let moves = 0;
    let firstCard = null;
    let secondCard = null;
    let lockBoard = true;
    let userGender = '';
    let userAge = '';
    let timeOfDay = '';

    const cardImages = [
        "images/0B.png", "images/1B.png", "images/2B.png", "images/3B.png", 
        "images/4B.png", "images/5B.png", "images/6B.png", "images/7B.png", 
        "images/8B.png", "images/9B.png", "images/skipB.png", "images/reverseB.png", 
        "images/0G.png", "images/1G.png", "images/2G.png", "images/3G.png", 
        "images/4G.png", "images/5G.png", "images/6G.png", "images/7G.png", 
        "images/8G.png", "images/9G.png", "images/skipG.png", "images/reverseG.png", 
        "images/0R.png", "images/1R.png", "images/2R.png", "images/3R.png", 
        "images/4R.png", "images/5R.png", "images/6R.png", "images/7R.png", 
        "images/8R.png", "images/9R.png", "images/skipR.png", "images/reverseR.png", 
        "images/0Y.png", "images/1Y.png", "images/2Y.png", "images/3Y.png", 
        "images/4Y.png", "images/5Y.png", "images/6Y.png", "images/7Y.png", 
        "images/8Y.png", "images/9Y.png", "images/skipY.png", "images/reverseY.png", 
        "images/+2B.png", "images/+2G.png", "images/+2R.png", "images/+2Y.png", 
        "images/+4.png", "images/changeColor.png"
    ];

    function generateCards() {
        const cards = [];
        const uniqueImages = new Set();

        // Selecciona un par único al azar
        const pairImage = cardImages[Math.floor(Math.random() * cardImages.length)];

        // Añade el par idéntico al tablero
        cards.push(pairImage, pairImage);

        // Rellena el resto del tablero con cartas únicas
        while (cards.length < 25) {
            const randomImage = cardImages[Math.floor(Math.random() * cardImages.length)];
            if (!uniqueImages.has(randomImage) && randomImage !== pairImage) {
                uniqueImages.add(randomImage);
                cards.push(randomImage);
            }
        }

        // Mezcla las cartas para asegurar la aleatoriedad
        return shuffle(cards);
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function createCardElement(imageSrc, index) {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.image = imageSrc;
        card.dataset.index = index;

        const outlineImage = document.createElement("img");
        outlineImage.classList.add("outline-image");
        outlineImage.src = "images/cover.png";

        const cardImage = document.createElement("img");
        cardImage.classList.add("card-image");
        cardImage.src = imageSrc;

        card.appendChild(outlineImage);
        card.appendChild(cardImage);

        card.addEventListener("click", flipCard);
        return card;
    }

    function flipCard() {
        if (lockBoard) return;  // Evitar cualquier interacción si el tablero está bloqueado
        if (this === firstCard) return;

        this.classList.add("toggled");

        if (!firstCard) {
            firstCard = this;
            return;
        }

        secondCard = this;
        moves++;
        movesCountElement.textContent = moves;
        checkForMatch();
    }

    function checkForMatch() {
        const isMatch = firstCard.dataset.image === secondCard.dataset.image;

        if (isMatch) {
            disableCards();
            showWinMessage();  // Mostrar el mensaje de victoria
        } else {
            unflipCards();
        }
    }

    function showWinMessage() {
        setTimeout(() => {
            alert(`¡Felicidades ${userGender}! A tus ${userAge} años, encontraste el único par correcto en ${moves} movimientos en la ${timeOfDay}.`);
            lockBoard = true;  // Bloquear el tablero después de ganar
        }, 500);
    }

    function disableCards() {
        firstCard.removeEventListener("click", flipCard);
        secondCard.removeEventListener("click", flipCard);
        resetBoard();
    }

    function unflipCards() {
        lockBoard = true;
        setTimeout(() => {
            firstCard.classList.remove("toggled");
            secondCard.classList.remove("toggled");
            resetBoard();
        }, 1500);
    }

    function resetBoard() {
        [firstCard, secondCard, lockBoard] = [null, null, false];
    }

    function startGame() {
        moves = 0;
        movesCountElement.textContent = moves;
        cardsContainer.innerHTML = "";
        const cards = generateCards();
        cards.forEach((cardImage, index) => {
            const cardElement = createCardElement(cardImage, index);
            cardsContainer.appendChild(cardElement);
        });

        showRowsSequentially(0);
    }

    function calculateTimeOfDay() {
        const hours = new Date().getHours();
        if (hours >= 6 && hours < 12) {
            timeOfDay = "mañana";
        } else if (hours >= 12 && hours < 18) {
            timeOfDay = "tarde";
        } else {
            timeOfDay = "noche";
        }
    }

    function showRowsSequentially(row) {
        if (row < 5) {
            showRow(row);
            startTimer(5, () => {
                hideRow(row);
                showRowsSequentially(row + 1);
            });
        } else {
            enableGameplay();
        }
    }

    function showRow(row) {
        for (let i = row * 5; i < (row + 1) * 5; i++) {
            const cardElement = cardsContainer.children[i];
            cardElement.classList.add("toggled");
        }
    }

    function hideRow(row) {
        for (let i = row * 5; i < (row + 1) * 5; i++) {
            const cardElement = cardsContainer.children[i];
            cardElement.classList.remove("toggled");
        }
    }

    function startTimer(duration, callback) {
        let time = duration;
        timerElement.textContent = time;
        const interval = setInterval(() => {
            time--;
            timerElement.textContent = time;
            if (time <= 0) {
                clearInterval(interval);
                callback();
            }
        }, 1000);
    }

    function enableGameplay() {
        lockBoard = false;
        timerElement.textContent = ''; // Limpiar el temporizador después de la visualización
    }

    // Maneja el envío del formulario y el inicio del juego
    userInfoForm.addEventListener("submit", (event) => {
        event.preventDefault();  // Evita el envío predeterminado del formulario
        userGender = document.getElementById("gender").value;
        userAge = document.getElementById("age").value;
        calculateTimeOfDay();
        startScreen.style.display = "none"; // Oculta la pantalla de inicio
        gameContainer.style.display = "block"; // Muestra el contenedor del juego
        startGame(); // Inicia el juego
    });

    restartButton.addEventListener("click", startGame);
});
