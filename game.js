
const startButton = document.getElementById("start-button");
const startScreen = document.getElementById("start-screen");
const worldScreen = document.getElementById("world-screen");
const player = document.getElementById("player");
const gameArea = document.getElementById("game-area");
const effects = document.getElementById("effects");
const enemyArea = document.getElementById("enemy-area");

const healthDisplay = document.getElementById("health");
const livesDisplay = document.getElementById("lives");
const coinsDisplay = document.getElementById("coins");
const xpDisplay = document.getElementById("xp");

let gameStarted = false;
let facing = 1;
let lastDash = 0;
let lastSword = 0;
let lastBlast = 0;
let lastDamage = 0;
let coins = 0;
let xp = 0;
let health = 100;
let lives = 3;

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
const enemies = [];

const gravity = 0.6;
const jumpPower = 12;
const groundHeight = 35;

function updateStats() {
  healthDisplay.textContent = "Health: " + health;
  livesDisplay.textContent = "Lives: " + lives;
  coinsDisplay.textContent = "Coins: " + coins;
  xpDisplay.textContent = "XP: " + xp;
}

function createEnemy(x) {
  const element = document.createElement("div");
  element.className = "robot-enemy";
  element.textContent = "🤖";
  element.style.left = x + "px";

  const healthBar = document.createElement("div");
  healthBar.className = "robot-health";

  const healthFill = document.createElement("div");
  healthFill.className = "robot-health-fill";

  healthBar.appendChild(healthFill);
  element.appendChild(healthBar);
  enemyArea.appendChild(element);

  enemies.push({
    x: x,
    health: 100,
    direction: 1,
    element: element,
    healthFill: healthFill
  });
}

function startGame() {
  startScreen.hidden = true;
  worldScreen.hidden = false;
  gameStarted = true;

  createEnemy(350);
  createEnemy(650);

  updatePlayer();
}

startButton.addEventListener("click", startGame);

document.addEventListener("keydown", function(event) {
  if (["Space", "ArrowLeft", "ArrowRight"].includes(event.code)) {
    event.preventDefault();
  }

  if (keys[event.code]) return;
  keys[event.code] = true;

  if (!gameStarted) return;

  if (event.code === "Space" && ninja.jumps < 2) {
    ninja.velocityY = jumpPower;
    ninja.jumps++;
  }

  if (event.code === "KeyJ") swordAttack();
  if (event.code === "KeyK") energyBlast();

  if (
    event.code === "ShiftLeft" ||
    event.code === "ShiftRight"
  ) {
    dash();
  }
});

document.addEventListener("keyup", function(event) {
  keys[event.code] = false;
});

function damageEnemy(enemy, amount) {
  enemy.health -= amount;

  enemy.healthFill.style.width =
    Math.max(0, enemy.health) + "%";

  if (enemy.health <= 0) {
    enemy.element.remove();
    enemies.splice(enemies.indexOf(enemy), 1);

    coins += 10;
    xp += 20;
    updateStats();

    setTimeout(function() {
      if (gameStarted) {
        createEnemy(300 + Math.random() * 400);
      }
    }, 3000);
  }
}

function swordAttack() {
  if (Date.now() - lastSword < 400) return;
  lastSword = Date.now();

  player.classList.add("attacking");

  const slash = document.createElement("div");
  slash.className = "sword-effect";
  slash.style.left =
    (ninja.x + (facing === 1 ? 35 : -48)) + "px";
  slash.style.bottom =
    (groundHeight + ninja.y + 25) + "px";

  effects.appendChild(slash);

  enemies.slice().forEach(function(enemy) {
    const distance = enemy.x - ninja.x;

    if (
      Math.abs(distance) < 90 &&
      (distance * facing) >= -25
    ) {
      damageEnemy(enemy, 50);
    }
  });

  setTimeout(function() {
    slash.remove();
    player.classList.remove("attacking");
  }, 180);
}

function energyBlast() {
  if (Date.now() - lastBlast < 700) return;
  lastBlast = Date.now();

  const blast = document.createElement("div");
  blast.className = "energy-blast";
  effects.appendChild(blast);

  projectiles.push({
    element: blast,
    x: ninja.x + 20,
    y: ninja.y + 25,
    direction: facing
  });
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

  setTimeout(function() {
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

  enemies.forEach(function(enemy) {
    enemy.x += enemy.direction * 0.6;

    if (enemy.x < 150 || enemy.x > areaWidth - 60) {
      enemy.direction *= -1;
    }

    enemy.element.style.left = enemy.x + "px";

    if (
      Math.abs(enemy.x - ninja.x) < 40 &&
      ninja.y < 45 &&
      Date.now() - lastDamage > 1000
    ) {
      health -= 10;
      lastDamage = Date.now();

      if (health <= 0) {
        lives--;

        if (lives > 0) {
          health = 100;
          ninja.x = 70;
          ninja.y = 0;
        } else {
          health = 0;
          gameStarted = false;
          alert("GAME OVER! Refresh to try again.");
        }
      }

      updateStats();
    }
  });

  projectiles.slice().forEach(function(shot) {
    shot.x += shot.direction * 7;

    shot.element.style.left = shot.x + "px";
    shot.element.style.bottom =
      (groundHeight + shot.y) + "px";

    enemies.slice().forEach(function(enemy) {
      if (
        Math.abs(shot.x - enemy.x) < 35 &&
        Math.abs(shot.y - ninja.y) < 55
      ) {
        damageEnemy(enemy, 100);
        shot.element.remove();
        projectiles.splice(projectiles.indexOf(shot), 1);
      }
    });

    if (shot.x < -30 || shot.x > areaWidth + 30) {
      shot.element.remove();
      projectiles.splice(projectiles.indexOf(shot), 1);
    }
  });

  requestAnimationFrame(updatePlayer);
}

updateStats();
