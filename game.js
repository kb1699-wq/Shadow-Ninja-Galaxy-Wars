
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

const worldTitle = document.getElementById("world-title");
const worldNumber = document.getElementById("world-number");
const worldStatus = document.getElementById("world-status");
const nextWorldButton = document.getElementById("next-world-button");

const worlds = [
  "Neon City",
  "Alien Jungle",
  "Space Station",
  "Volcanic Planet",
  "Frozen Moon",
  "Desert Planet",
  "Cyber Factory",
  "Shadow Dimension",
  "Crystal World",
  "Final Galaxy"
];

let currentWorld = 0;
let unlockedWorlds = 1;
let gameStarted = false;
let worldComplete = false;

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
saveGame(); }

function updateWorldInfo() {
  worldTitle.textContent =
    "WORLD " + (currentWorld + 1) + ": " + worlds[currentWorld];

  worldNumber.textContent =
    "World " + (currentWorld + 1) + " of 10";

  worldStatus.textContent = worldComplete
    ? "Mission completed!"
    : "Mission in progress";

  nextWorldButton.hidden =
    !worldComplete || currentWorld === 9;

  if (currentWorld === 9 && worldComplete) {
    worldStatus.textContent = "GALAXY SAVED!";
  }
}

function clearEnemies() {
  enemies.forEach(function(enemy) {
    enemy.element.remove();
  });

  enemies.length = 0;

  projectiles.forEach(function(shot) {
    shot.element.remove();
  });

  projectiles.length = 0;
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

function loadWorld() {
  clearEnemies();

  currentWorld = Math.min(currentWorld, 9);
  gameArea.className = "world-" + currentWorld;
  worldComplete = false;

  ninja.x = 70;
  ninja.y = 0;
  ninja.velocityY = 0;
  ninja.jumps = 0;

  player.style.left = ninja.x + "px";
  player.style.bottom = groundHeight + "px";

  const areaWidth = gameArea.clientWidth;

  createEnemy(Math.max(250, areaWidth * 0.45));
  createEnemy(Math.max(400, areaWidth * 0.75));

  updateWorldInfo();
  updateStats();
}

function completeWorld() {
  if (worldComplete) return;

  worldComplete = true;
  unlockedWorlds = Math.max(unlockedWorlds, currentWorld + 2);

  coins += 25;
  xp += 50;

  updateStats();// Save player progress
function saveGame() {
  const saveData = {
    currentWorld: currentWorld,
    unlockedWorlds: unlockedWorlds,
    coins: coins,
    xp: xp,
    health: health,
    lives: lives
  };

  localStorage.setItem("shadowNinjaSave", JSON.stringify(saveData));
}

// Load saved player progress
function loadGame() {
  const savedData = localStorage.getItem("shadowNinjaSave");

  if (!savedData) return;

  try {
    const data = JSON.parse(savedData);

    currentWorld = Math.max(0, Math.min(9, data.currentWorld || 0));
    unlockedWorlds = Math.max(1, Math.min(10, data.unlockedWorlds || 1));
    coins = Math.max(0, data.coins || 0);
    xp = Math.max(0, data.xp || 0);
    health = Math.max(0, Math.min(100, data.health ?? 100));
    lives = Math.max(0, Math.min(3, data.lives ?? 3));

    updateStats();
  } catch (error) {
    console.log("Could not load saved game.");
  }
}

loadGame();
  updateWorldInfo();

  if (currentWorld === 9) {
    worldStatus.textContent = "GALAXY SAVED! YOU WIN!";
    alert("Congratulations! You saved the galaxy!");
  } else {
    alert("World completed! You earned 25 coins and 50 XP.");
  }
}

function startGame() {
  startScreen.hidden = true;
  worldScreen.hidden = false;
  gameStarted = true;

  loadWorld();
  requestAnimationFrame(updatePlayer);
}

startButton.addEventListener("click", startGame);

nextWorldButton.addEventListener("click", function() {
  if (!worldComplete || currentWorld >= 9) return;

  currentWorld++;
  loadWorld();
});

document.addEventListener("keydown", function(event) {
  if (["Space", "ArrowLeft", "ArrowRight"].includes(event.code)) {
    event.preventDefault();
  }

  if (keys[event.code]) return;
  keys[event.code] = true;

  if (!gameStarted || worldComplete) return;

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
  if (!enemies.includes(enemy)) return;

  enemy.health -= amount;

  enemy.healthFill.style.width =
    Math.max(0, enemy.health) + "%";

  if (enemy.health <= 0) {
    enemy.element.remove();
    enemies.splice(enemies.indexOf(enemy), 1);

    coins += 10;
    xp += 20;
    updateStats();

    if (enemies.length === 0) {
      completeWorld();
    }
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
      distance * facing >= -25
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

  if (!worldComplete) {
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
    player.style.bottom =
      (groundHeight + ninja.y) + "px";

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
            ninja.velocityY = 0;
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
  }

  requestAnimationFrame(updatePlayer);
}

updateStats();
