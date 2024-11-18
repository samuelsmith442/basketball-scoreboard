const pointButtons = document.querySelectorAll(".point");

function updateScore(button) {
    try {
        const team = button.closest(".team");
        const score = team.querySelector(".score");
        const value = parseInt(button.dataset.value);
        const currentScore = parseInt(score.innerText);

        if (isNaN(value) || isNaN(currentScore)) {
            throw new Error("Invalid score value");
        }

        score.innerText = currentScore + value;
        score.style.color = "#F94F6D"; // Change to pink when scoring
    } catch (error) {
        console.error("Error updating score:", error);
    }
}

pointButtons.forEach((button) => {
    button.addEventListener("click", () => {
        updateScore(button);
    });
});
