
const startButton = document.getElementById("start-button");
const gameScreen = document.getElementById("game-screen");

startButton.addEventListener("click", function () {
  gameScreen.innerHTML = `
    <h2>WORLD 1: NEON CITY</h2>
    <p>Welcome to your first mission, Shadow Ninja!</p>
    <p>Your journey to save the galaxy starts now.</p>
    <p>More gameplay features are coming soon!</p>
  `;
});
