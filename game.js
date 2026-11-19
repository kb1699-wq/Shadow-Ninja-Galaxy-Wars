
const startButton = document.getElementById("start-button");
const startScreen = document.getElementById("start-screen");
const worldScreen = document.getElementById("world-screen");
const player = document.getElementById("player");
const gameArea = document.getElementById("game-area");

let gameStarted = false;

const ninja = {
  x: 70,
  y: 0,
  width: 42,
  height: 55,
  speed: 4,
  velocityY: 0,
  jumps: 0,
  onGround: true
};

const keys = {};

const gravity = 0.6;
const jumpPower = 12;
const groundHeight = 35;

startButton.addEventListener("click", function () {
  startScreen.hidden = true;
  worldScreen.hidden = false;
  gameStarted = true;
  updatePlayer();
});

document.addEventListener("keydown", function (event) {
  if (
    event.code === "Space" ||
    event.code === "ArrowLeft" ||
    event.code === "ArrowRight"
  ) {
    event.preventDefault();
  }

  keys[event.code] = true;

  if (
    gameStarted &&
    event.code === "Space" &&
    ninja.jumps < 2
  ) {
    ninja.velocityY = jumpPower;
    ninja.jumps++;
    ninja.onGround = false;
  }
});

document.addEventListener("keyup", function (event) {
  keys[event.code] = false;
});

function updatePlayer() {
  if (!gameStarted) return;

  const areaWidth = gameArea.clientWidth;

  if (keys["KeyA"] || keys["ArrowLeft"]) {
    ninja.x -= ninja.speed;
  }

  if (keys["KeyD"] || keys["ArrowRight"]) {
    ninja.x += ninja.speed;
  }

  ninja.x = Math.max(
    0,
    Math.min(areaWidth - ninja.width, ninja.x)
  );

  ninja.velocityY -= gravity;
  ninja.y += ninja.velocityY;

  if (ninja.y <= 0) {
    ninja.y = 0;
    ninja.velocityY = 0;
    ninja.jumps = 0;
    ninja.onGround = true;
  }

  player.style.left = ninja.x + "px";
  player.style.bottom =
    (groundHeight + ninja.y) + "px";

  requestAnimationFrame(updatePlayer);
}
