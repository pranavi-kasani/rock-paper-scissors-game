// Buttons

const rockBtn = document.getElementById("rock");
const paperBtn = document.getElementById("paper");
const scissorsBtn = document.getElementById("scissors");
const resetBtn = document.getElementById("reset");

// Display

const userChoice = document.getElementById("user-choice");
const computerChoice = document.getElementById("computer-choice");
const result = document.getElementById("result");

const userScore = document.getElementById("user-score");
const computerScore = document.getElementById("computer-score");

// Scores

let userPoints = 0;
let computerPoints = 0;
let gameOver = false;

// Choices

const choices = ["Rock", "Paper", "Scissors"];

// Button Clicks

rockBtn.addEventListener("click", function () {

    playGame("Rock");

});

paperBtn.addEventListener("click", function () {

    playGame("Paper");

});

scissorsBtn.addEventListener("click", function () {

    playGame("Scissors");

});

// Main Function

function playGame(user) {
    if (gameOver) 
    {
    return;
    }

    const randomIndex = Math.floor(Math.random() * 3);

    const computer = choices[randomIndex];

    userChoice.textContent = user;

    computerChoice.textContent = computer;

    if (user === computer) {

        result.textContent = "🤝 It's a Draw!";
        result.style.color = "orange";

    }

    else if (

        (user === "Rock" && computer === "Scissors") ||

        (user === "Paper" && computer === "Rock") ||

        (user === "Scissors" && computer === "Paper")

    ) {

        result.textContent = "🎉 You Win!";
        result.style.color = "green";

        userPoints++;

        userScore.textContent = userPoints;
        if (userPoints === 5) 
        {
        result.textContent = "🏆 Congratulations! You Won the Match!";
        result.style.color = "green";
        gameOver = true;
        }

    }

    else {

        result.textContent = "😔 Computer Wins!";
        result.style.color = "red";

        computerPoints++;

        computerScore.textContent = computerPoints;
        if (computerPoints === 5)
    {
    result.textContent = "💻 Computer Won the Match!";
    result.style.color = "red";
    gameOver = true;
    }

    }

}

// Reset Button

resetBtn.addEventListener("click", function () {

    userPoints = 0;
    computerPoints = 0;
    gameOver = false;

    userScore.textContent = 0;
    computerScore.textContent = 0;

    userChoice.textContent = "-";
    computerChoice.textContent = "-";

    result.textContent = "Let's Play!";
    result.style.color = "green";

});