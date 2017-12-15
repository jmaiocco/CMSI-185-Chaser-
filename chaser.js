const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const progressBar = document.querySelector("progress");

let scoreTimer = setInterval(increaseScore, 5000);
let levelTimer = setInterval(increaseLevel, 50000);
let enemyCreationTimer = setInterval(createNewEnemy, 10000);
let barrierCreationTimer = setInterval(createNewBarrier, 10000);
function resetTimers (){
  scoreTimer = setInterval(increaseScore, 5000);
  levelTimer = setInterval(increaseLevel, 50000);
  enemyCreationTimer = setInterval(createNewEnemy, 10000);
  barrierCreationTimer = setInterval(createNewBarrier, 10000);
}

function restartGame() {
  if (progressBar.value === 0) {
    progressBar.value = 100;
    level = 1;
    score = 0;
    enemies = [
      new Enemy(0, canvas.height, enemyRadius, enemyColor, 0.065),
      new Enemy(canvas.width, 0, enemyRadius, enemyColor, 0.03),
      new Enemy(canvas.width, canvas.height, enemyRadius, enemyColor, 0.01)
    ];
    barriers = [];
    resetTimers();
    Object.assign(player, { x: canvas.width / 2, y: canvas.height / 2 });
    requestAnimationFrame(drawScene);
  }
}

let score = 0;
function drawScore() {
  ctx.font = "32px Brush Script MT";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`Score: ${score}`, canvas.width / 50, canvas.height / 40);
}
function increaseScore() {
  score += 5;
}

let level = 1;
function drawLevel() {
  ctx.font = "32px Brush Script MT";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`Level: ${level}`, 9 * canvas.width / 10, canvas.height / 40);
}
function increaseLevel() {
  level += 1;
}

class Sprite {
  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

class Player extends Sprite {
  constructor(x, y, radius, color, speed) {
    super();
    Object.assign(this, { x, y, radius, color, speed });
  }
}
let player = new Player(
  canvas.width / 2,
  canvas.height / 2,
  15,
  "darkgreen",
  0.07
);

class Enemy extends Sprite {
  constructor(x, y, radius, color, speed) {
    super();
    Object.assign(this, { x, y, radius, color, speed });
  }
}
let enemyRadius = 15;
let enemyColor = "brown";
let enemies = [
  new Enemy(0, canvas.height, enemyRadius, enemyColor, 0.065),
  new Enemy(canvas.width, 0, enemyRadius, enemyColor, 0.03),
  new Enemy(canvas.width, canvas.height, enemyRadius, enemyColor, 0.01)
];
function createNewEnemy() {
  enemies.push(
    new Enemy(
      canvas.width * Math.random(),
      canvas.height * Math.random(),
      enemyRadius,
      enemyColor,
      0.06 * Math.random()
    )
  );
}

class Barrier extends Sprite {
  constructor(x, y, radius, color) {
    super();
    Object.assign(this, { x, y, radius, color });
  }
}
let barrierRadius = 30;
let barrierColor = "black";
let barriers = [];
function createNewBarrier() {
  barriers.push(
    new Barrier(
      canvas.width * Math.random(),
      canvas.height * Math.random(),
      barrierRadius,
      barrierColor
    )
  );
}

let mouse = { x: 0, y: 0 };
document.body.addEventListener("mousemove", updateMouse);
function updateMouse(event) {
  const { left, top } = canvas.getBoundingClientRect();
  mouse.x = event.clientX - left;
  mouse.y = event.clientY - top;
}

function moveToward(leader, follower, speed) {
  follower.x += (leader.x - follower.x) * speed;
  follower.y += (leader.y - follower.y) * speed;
}

function distanceBetween(sprite1, sprite2) {
  return Math.hypot(sprite1.x - sprite2.x, sprite1.y - sprite2.y);
}

function haveCollided(sprite1, sprite2) {
  return distanceBetween(sprite1, sprite2) < sprite1.radius + sprite2.radius;
}

function pushOff(c1, c2) {
  let [dx, dy] = [c2.x - c1.x, c2.y - c1.y];
  const L = Math.hypot(dx, dy);
  let distToMove = c1.radius + c2.radius - L;
  if (distToMove > 0) {
    dx /= L;
    dy /= L;
    c1.x -= dx * distToMove / 2;
    c1.y -= dy * distToMove / 2;
    c2.x += dx * distToMove / 2;
    c2.y += dy * distToMove / 2;
  }
}

function updateScene() {
  moveToward(mouse, player, player.speed);
  enemies.forEach(enemy => moveToward(player, enemy, enemy.speed));
  for (let i = 0; i < enemies.length; i++) {
    for (let j = i + 1; j < enemies.length; j++) {
      pushOff(enemies[i], enemies[j]);
    }
  }
  enemies.forEach(enemy => {
    if (haveCollided(enemy, player)) {
      progressBar.value -= 1;
    }
  });
  barriers.forEach(barrier => {
    if (haveCollided(barrier, player)) {
      progressBar.value -= 2;
    }
  });
}

function clearBackground() {
  ctx.fillStyle = "lightgreen";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

let gameOverTextXPosition = canvas.width / 4;
let gameOverTextYPosition = canvas.height / 2;
function drawGameOver() {
  ctx.font = "54px Brush Script MT";
  ctx.fillStyle = "red";
  ctx.fillText(
    "YOU HAVE BEEN CAPTURED",
    gameOverTextXPosition,
    gameOverTextYPosition
  );
  ctx.font = "32px Brush Script MT";
  ctx.fillText(
    "(Click where you would like to respawn)",
    gameOverTextXPosition,
    gameOverTextYPosition + 62
  );
}

function drawScene() {
  clearBackground();
  drawScore();
  drawLevel();
  player.draw();
  enemies.forEach(enemy => enemy.draw());
  barriers.forEach(barrier => barrier.draw());
  updateScene();
  if (progressBar.value <= 0) {
    drawGameOver();
    clearInterval(scoreTimer);
    clearInterval(levelTimer);
    clearInterval(enemyCreationTimer);
    clearInterval(barrierCreationTimer);
  } else {
    requestAnimationFrame(drawScene);
  }
}

requestAnimationFrame(drawScene);
canvas.addEventListener("click", restartGame);
