const pointButtons = document.querySelectorAll(".point");

pointButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const team = button.closest(".team");
        const score = team.querySelector(".score");
        const value = parseInt(button.dataset.value);
        const currentScore = parseInt(score.innerText);
        score.innerText = currentScore + value;
        score.style.color = "#F94F6D"; // Change to pink when scoring
    });
});
