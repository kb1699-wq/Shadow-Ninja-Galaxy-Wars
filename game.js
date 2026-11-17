
const startButton = document.getElementById("start-button");
const startScreen = document.getElementById("start-screen");
const worldScreen = document.getElementById("world-screen");
const player = document.getElementById("player");
const gameArea = document.getElementById("game-area");
const effects = document.getElementById("effects");

let gameStarted = false;
let facing = 1;
let lastDash = 0;
let lastSword = 0;
let lastBlast = 0;

const ninja = {
  x: 70,
  y: 0,
  width: 42,
  height: 55,
  speed: 4,
  velocityY: 0,
  jumps: 0
};

const keys = {};
const projectiles = [];

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
  if (["Space", "ArrowLeft", "ArrowRight"].includes(event.code)) {
    event.preventDefault();
  }

  keys[event.code] = true;

  if (!gameStarted) return;

  if (event.code === "Space" && ninja.jumps < 2) {
    ninja.velocityY = jumpPower;
    ninja.jumps++;
  }

  if (event.code === "KeyJ") swordAttack();
  if (event.code === "KeyK") energyBlast();
  if (event.code === "ShiftLeft" || event.code === "ShiftRight") dash();
});

document.addEventListener("keyup", function (event) {
  keys[event.code] = false;
});

function swordAttack() {
  if (Date.now() - lastSword < 400) return;
  lastSword = Date.now();

  player.classList.add("attacking");

  const slash = document.createElement("div");
  slash.className = "sword-effect";
  slash.style.left = (ninja.x + (facing === 1 ? 35 : -48)) + "px";
  slash.style.bottom = (groundHeight + ninja.y + 25) + "px";
  effects.appendChild(slash);

  setTimeout(function () {
    slash.remove();
    player.classList.remove("attacking");
  }, 180);
}

function energyBlast() {
  if (Date.now() - lastBlast < 700) return;
  lastBlast = Date.now();

  player.classList.add("blasting");

  const blast = document.createElement("div");
  blast.className = "energy-blast";
  effects.appendChild(blast);

  projectiles.push({
    element: blast,
    x: ninja.x + 20,
    y: ninja.y + 25,
    direction: facing
  });

  setTimeout(function () {
    player.classList.remove("blasting");
  }, 200);
}

function dash() {
  if (Date.now() - lastDash < 900) return;
  lastDash = Date.now();

  ninja.x += facing * 110;
  ninja.x = Math.max(
    0,
    Math.min(gameArea.clientWidth - ninja.width, ninja.x)
  );

  player.classList.add("dashing");

  setTimeout(function () {
    player.classList.remove("dashing");
  }, 200);
}

function updatePlayer() {
  if (!gameStarted) return;

  const areaWidth = gameArea.clientWidth;

  if (keys["KeyA"] || keys["ArrowLeft"]) {
    ninja.x -= ninja.speed;
    facing = -1;
  }

  if (keys["KeyD"] || keys["ArrowRight"]) {
    ninja.x += ninja.speed;
    facing = 1;
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
  }

  player.style.left = ninja.x + "px";
  player.style.bottom = (groundHeight + ninja.y) + "px";

  projectiles.forEach(function (shot, index) {
    shot.x += shot.direction * 7;

    shot.element.style.left = shot.x + "px";
    shot.element.style.bottom =
      (groundHeight + shot.y) + "px";

    if (shot.x < -30 || shot.x > areaWidth + 30) {
      shot.element.remove();
      projectiles.splice(index, 1);
    }
  });

  requestAnimationFrame(updatePlayer);
}
