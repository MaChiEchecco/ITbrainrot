// JS: modifica solo la parte del gameLoop per NON dipingere più lo sfondo azzurro nel canvas

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const rotateWarning = document.getElementById('rotateWarning');
  const mobileControls = document.getElementById('mobileControls');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', () => {
    resizeCanvas();
    checkOrientation();
  });
  window.addEventListener('orientationchange', checkOrientation);
  resizeCanvas();

  function checkOrientation() {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const isPortrait = window.innerHeight > window.innerWidth;

    if (isMobile && isPortrait) {
      rotateWarning.style.display = 'block';
      mobileControls.style.display = 'none';
    } else if (isMobile && !isPortrait) {
      rotateWarning.style.display = 'none';
      mobileControls.style.display = 'flex';
    } else {
      rotateWarning.style.display = 'none';
      mobileControls.style.display = 'none';
    }
  }
  checkOrientation();

  const worldWidth = 3600;
  const playerImage = new Image();
  playerImage.src = "imagini2Drot/tralalero%20tralala.png";
  const lavaImage = new Image();
  lavaImage.src = "imagini2Drot/lava.png";

  const initialPosition = { x: 450, y: 200 };

  const player = {
    x: initialPosition.x,
    y: initialPosition.y,
    width: 60,
    height: 60,
    image: playerImage,
    dy: 0,
    dx: 0,
    gravity: 0.5,
    jumpPower: -10,
    grounded: false,
    speed: 5,
  };

  const keys = {};
  let cameraX = 0;
  let gameOver = false;
  let gameOverTimer = 0;

  const groundGreen = {
    x: 0,
    y: 250,
    width: worldWidth / 3,
    height: 50,
    color: "green",
  };

  const groundLava = {
    x: worldWidth / 3,
    y: 250,
    width: worldWidth / 3,
    height: 50,
    image: lavaImage,
  };

  const groundGreen2 = {
    x: (worldWidth / 3) * 2,
    y: 250,
    width: worldWidth / 3,
    height: 50,
    color: "green",
  };

  const obstacles = [
    { x: 400, y: 10, width: 10, height: 300, color: "black" },
    { x: 600, y: 180, width: 100, height: 70, color: "darkred" },
    { x: 1000, y: 220, width: 50, height: 30, color: "darkblue" },
    { x: 1150, y: 220, width: 100, height: 5, color: "red" },
    { x: 1350, y: 220, width: 50, height: 30, color: "yellow" },
    { x: 1500, y: 190, width: 120, height: 60, color: "pink" },
    { x: 1700, y: 190, width: 120, height: 10, color: "purple" },
    { x: 1900, y: 170, width: 140, height: 10, color: "orange" },
    { x: 2100, y: 170, width: 140, height: 20, color: "lime" },
    { x: 2300, y: 210, width: 70, height: 40, color: "black" },
    { x: 2600, y: 210, width: 70, height: 40, color: "violet" },
    { x: 2800, y: 140, width: 50, height: 80, color: "grey" },
    { x: 3200, y: 100, width: 50, height: 100, color: "gold", isGoal: true },
    { x: 3400, y: 10, width: 10, height: 300, color: "black" },
  ];

  function drawRect(obj) {
    if (obj.image && obj.image.complete) {
      ctx.drawImage(obj.image, obj.x - cameraX, obj.y, obj.width, obj.height);
    } else {
      ctx.fillStyle = obj.color || "black";
      ctx.fillRect(obj.x - cameraX, obj.y, obj.width, obj.height);
    }
  }

  function checkCollision(player, obstacle) {
    const collided =
      player.x < obstacle.x + obstacle.width &&
      player.x + player.width > obstacle.x &&
      player.y < obstacle.y + obstacle.height &&
      player.y + player.height > obstacle.y;

    if (collided && obstacle.isGoal && !gameOver) {
      alert("🎉 Hai vinto! 🎉");
      gameOver = true;
    }

    return collided;
  }

  function updatePlayer() {
    if (gameOver) return;

    if (keys["a"] || keys["A"]) player.dx = -player.speed;
    else if (keys["d"] || keys["D"]) player.dx = player.speed;
    else player.dx = 0;

    if (keys[" "] && player.grounded) {
      player.dy = player.jumpPower;
      player.grounded = false;
    }

    player.dy += player.gravity;
    player.x += player.dx;
    player.y += player.dy;
    player.grounded = false;

    if (player.y + player.height >= groundGreen.y && player.x < groundLava.x) {
      player.y = groundGreen.y - player.height;
      player.dy = 0;
      player.grounded = true;
    }

    if (
      player.y + player.height >= groundLava.y &&
      player.x + player.width >= groundLava.x &&
      player.x < groundGreen2.x
    ) {
      gameOver = true;
      gameOverTimer = Date.now();
    }

    if (player.y + player.height >= groundGreen2.y && player.x >= groundGreen2.x) {
      player.y = groundGreen2.y - player.height;
      player.dy = 0;
      player.grounded = true;
    }

    for (const obs of obstacles) {
      if (checkCollision(player, obs)) {
        if (obs.isGoal) continue;

        if (player.y + player.height - player.dy <= obs.y) {
          player.y = obs.y - player.height;
          player.dy = 0;
          player.grounded = true;
        } else {
          if (player.dx > 0) player.x = obs.x - player.width;
          else if (player.dx < 0) player.x = obs.x + obs.width;
        }
      }
    }

    cameraX = player.x - canvas.width / 2;
    if (cameraX < 0) cameraX = 0;
    if (cameraX > worldWidth - canvas.width) cameraX = worldWidth - canvas.width;
  }

  function resetPlayer() {
    player.x = initialPosition.x;
    player.y = initialPosition.y;
    player.dx = 0;
    player.dy = 0;
    player.grounded = false;
    gameOver = false;
  }

  function drawGameOver() {
    ctx.fillStyle = "black";
    ctx.globalAlpha = 0.6;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "white";
    ctx.font = "50px Arial";
    ctx.fillText("🔥 GAME OVER 🔥", canvas.width / 2 - 180, canvas.height / 2);
  }

  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Qui NON dipingiamo lo sfondo azzurro,
    // così si vede il background del body #e0e0e0

    drawRect(groundGreen);
    drawRect(groundLava);
    drawRect(groundGreen2);

    for (const obs of obstacles) {
      drawRect(obs);
    }

    if (player.image.complete) {
      ctx.drawImage(player.image, player.x - cameraX, player.y, player.width, player.height);
    } else {
      ctx.fillStyle = "red";
      ctx.fillRect(player.x - cameraX, player.y, player.width, player.height);
    }

    updatePlayer();

    if (gameOver) {
      drawGameOver();
      if (Date.now() - gameOverTimer > 1500) {
        resetPlayer();
      }
    }

    requestAnimationFrame(gameLoop);
  }

  gameLoop();

  window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
  });
  window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
  });

  document.getElementById("leftBtn").addEventListener("touchstart", (e) => {
    e.preventDefault();
    keys["a"] = true;
  });
  document.getElementById("leftBtn").addEventListener("touchend", (e) => {
    e.preventDefault();
    keys["a"] = false;
  });

  document.getElementById("rightBtn").addEventListener("touchstart", (e) => {
    e.preventDefault();
    keys["d"] = true;
  });
  document.getElementById("rightBtn").addEventListener("touchend", (e) => {
    e.preventDefault();
    keys["d"] = false;
  });

  document.getElementById("jumpBtn").addEventListener("touchstart", (e) => {
    e.preventDefault();
    keys[" "] = true;
  });
  document.getElementById("jumpBtn").addEventListener("touchend", (e) => {
    e.preventDefault();
    keys[" "] = false;
  });
});
