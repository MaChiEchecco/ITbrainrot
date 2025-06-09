document.addEventListener("DOMContentLoaded", () => {
  const player = document.getElementById("player");
  const gameArea = document.getElementById("game");
  const map = document.getElementById("map");
  const inventoryDiv = document.getElementById("inventory");
  const weaponStatus = document.getElementById("weapon-status");
  const healthBarContainer = document.getElementById("health-bar-container");

  const speed = 5;
  const keys = {};

  const mapWidth = 1280;
  const mapHeight = 960;

  const viewWidth = gameArea.clientWidth;
  const viewHeight = gameArea.clientHeight;

  let pos = { top: 100, left: 100 };

  let inventory = [];
  let currentWeapon = null;
  let playerHealth = 10;
  let isGameOver = false;

  const weapons = Array.from(document.getElementsByClassName("weapon"));

  let mousePos = { x: 0, y: 0 };

  gameArea.addEventListener("mousemove", e => {
    const rect = gameArea.getBoundingClientRect();
    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;
  });

  document.addEventListener("keydown", e => {
    const key = e.key.toLowerCase();
    keys[key] = true;

    if (key === "g") {
      if (inventoryDiv.style.display === "block") {
        inventoryDiv.style.display = "none";
      } else {
        updateInventoryUI();
        inventoryDiv.style.display = "block";
      }
    }
  });

  document.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
  });

  document.addEventListener("mousedown", e => {
    if (e.button === 0 && currentWeapon) {
      attack();
    }
  });

  // Funzione di utilità per rettangoli con coordinate mappa
  function rectsOverlap(r1, r2) {
    return !(r2.left > r1.right ||
             r2.right < r1.left ||
             r2.top > r1.bottom ||
             r2.bottom < r1.top);
  }

  // MODIFICA QUI: controllo collisione con ripari usando offsetLeft/Top (coordinate mappa)
  function isCollidingWithCover(rect) {
    const covers = Array.from(document.getElementsByClassName("cover"));
    return covers.some(cover => {
      const coverLeft = cover.offsetLeft;
      const coverTop = cover.offsetTop;
      const coverRight = coverLeft + cover.offsetWidth;
      const coverBottom = coverTop + cover.offsetHeight;

      const coverRect = {
        left: coverLeft,
        top: coverTop,
        right: coverRight,
        bottom: coverBottom
      };
      return rectsOverlap(rect, coverRect);
    });
  }

  function canMove(rect) {
    return !isCollidingWithCover(rect);
  }

  function initializeEnemies() {
    const enemies = Array.from(document.getElementsByClassName("enemy"));
    enemies.forEach(enemy => {
      enemy.health = 6; // vita nemici
    });
  }

  function attack() {
    if (!currentWeapon) return;

    if (currentWeapon === "sword") {
      const attackRadius = 40;

      const playerCenter = {
        x: viewWidth / 2,
        y: viewHeight / 2
      };

      const attackCircle = document.createElement("div");
      attackCircle.style.position = "absolute";
      attackCircle.style.width = attackRadius * 2 + "px";
      attackCircle.style.height = attackRadius * 2 + "px";
      attackCircle.style.border = "2px solid red";
      attackCircle.style.borderRadius = "50%";
      attackCircle.style.left = (playerCenter.x - attackRadius) + "px";
      attackCircle.style.top = (playerCenter.y - attackRadius) + "px";
      attackCircle.style.zIndex = "20";
      attackCircle.style.pointerEvents = "none";
      gameArea.appendChild(attackCircle);

      setTimeout(() => attackCircle.remove(), 200);

      const enemies = Array.from(document.getElementsByClassName("enemy"));

      const playerCenterMap = {
        x: pos.left + 16,
        y: pos.top + 16
      };

      enemies.forEach(enemy => {
        const enemyCenter = {
          x: enemy.offsetLeft + enemy.offsetWidth / 2,
          y: enemy.offsetTop + enemy.offsetHeight / 2
        };

        const distX = enemyCenter.x - playerCenterMap.x;
        const distY = enemyCenter.y - playerCenterMap.y;
        const distance = Math.sqrt(distX * distX + distY * distY);

        if (distance <= attackRadius) {
          enemy.health -= 5; // 5 danni spada
          if (enemy.health <= 0) {
            enemy.remove();
          }
        }
      });

    } else if (currentWeapon === "bow") {
      shootProjectile();
    }
  }

  // MODIFICA qui: progetto usa coordinate mappa e controllo collisione ripari + nemici
  function shootProjectile() {
    const projectile = document.createElement("div");
    projectile.classList.add("projectile");

    const startX = pos.left + 16;
    const startY = pos.top + 16;

    projectile.style.left = startX + "px";
    projectile.style.top = startY + "px";
    map.appendChild(projectile);

    const mapMouseX = pos.left - (viewWidth / 2) + mousePos.x;
    const mapMouseY = pos.top - (viewHeight / 2) + mousePos.y;

    const dirX = mapMouseX - startX;
    const dirY = mapMouseY - startY;

    const length = Math.sqrt(dirX * dirX + dirY * dirY);
    const normX = dirX / length;
    const normY = dirY / length;

    const speedProj = 15;
    let projX = startX;
    let projY = startY;

    function move() {
      projX += normX * speedProj;
      projY += normY * speedProj;

      projectile.style.left = projX + "px";
      projectile.style.top = projY + "px";

      const projRect = {
        left: projX,
        top: projY,
        right: projX + projectile.offsetWidth,
        bottom: projY + projectile.offsetHeight,
      };

      const enemies = Array.from(document.getElementsByClassName("enemy"));
      for (const enemy of enemies) {
        const enemyRect = {
          left: enemy.offsetLeft,
          top: enemy.offsetTop,
          right: enemy.offsetLeft + enemy.offsetWidth,
          bottom: enemy.offsetTop + enemy.offsetHeight,
        };

        if (rectsOverlap(projRect, enemyRect)) {
          enemy.health -= 2; // 2 danni arco
          if (enemy.health <= 0) {
            enemy.remove();
          }
          projectile.remove();
          return;
        }
      }

      // Blocca proiettile sui ripari
      if (isCollidingWithCover(projRect)) {
        projectile.remove();
        return;
      }

      if (projX < 0 || projX > mapWidth || projY < 0 || projY > mapHeight) {
        projectile.remove();
        return;
      }
      requestAnimationFrame(move);
    }
    move();
  }

  function updateInventoryUI() {
    inventoryDiv.innerHTML = "<h3>Inventario</h3>";
    inventory.forEach((item) => {
      const itemDiv = document.createElement("div");
      itemDiv.textContent = item;
      itemDiv.style.cursor = "pointer";
      itemDiv.style.padding = "4px";
      itemDiv.style.border = currentWeapon === item ? "2px solid yellow" : "1px solid white";

      itemDiv.onclick = () => {
        currentWeapon = item;
        updateInventoryUI();
        weaponStatus.textContent = currentWeapon;
      };

      inventoryDiv.appendChild(itemDiv);
    });
  }

  function updateHealthDisplay() {
    let healthFill = document.getElementById("health-fill");
    if (!healthFill) {
      healthBarContainer.innerHTML = `
        <div id="health-bar" style="height: 20px; width: 100%; background: red; border: 1px solid white; border-radius: 4px;">
          <div id="health-fill" style="height: 100%; background: limegreen; width: 100%; border-radius: 4px;"></div>
        </div>`;
      healthFill = document.getElementById("health-fill");
    }

    const percent = Math.max(0, (playerHealth / 10) * 100);
    healthFill.style.width = percent + "%";
  }

  function checkWinCondition() {
    const enemies = document.getElementsByClassName("enemy");
    if (enemies.length === 0 && !isGameOver) {
      isGameOver = true;
      alert("Hai vinto!");
    }
  }

  // MODIFICA qui: nemici usano coordinate mappa e controllo collisione ripari
  function updateEnemies() {
    const enemies = Array.from(document.getElementsByClassName("enemy"));
    enemies.forEach(enemy => {
      const enemySpeed = 1;

      const dx = pos.left - enemy.offsetLeft;
      const dy = pos.top - enemy.offsetTop;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 1) {
        const newEnemyLeft = enemy.offsetLeft + (dx / dist) * enemySpeed;
        const newEnemyTop = enemy.offsetTop + (dy / dist) * enemySpeed;

        const enemyRect = {
          left: newEnemyLeft,
          top: newEnemyTop,
          right: newEnemyLeft + enemy.offsetWidth,
          bottom: newEnemyTop + enemy.offsetHeight,
        };

        if (canMove(enemyRect)) {
          enemy.style.left = newEnemyLeft + "px";
          enemy.style.top = newEnemyTop + "px";
        }
      }

      const enemyRectNow = {
        left: enemy.offsetLeft,
        top: enemy.offsetTop,
        right: enemy.offsetLeft + enemy.offsetWidth,
        bottom: enemy.offsetTop + enemy.offsetHeight,
      };

      const playerRectNow = {
        left: pos.left,
        top: pos.top,
        right: pos.left + 32,
        bottom: pos.top + 32,
      };

      if (rectsOverlap(enemyRectNow, playerRectNow)) {
        if (!enemy.dataset.lastHit || Date.now() - enemy.dataset.lastHit > 1000) {
          playerHealth--;
          updateHealthDisplay();
          enemy.dataset.lastHit = Date.now();

          if (playerHealth <= 0 && !isGameOver) {
            isGameOver = true;
            alert("Sei morto!");
          }
        }
      }
    });
  }

  function gameLoop() {
    let newLeft = pos.left;
    let newTop = pos.top;

    if (keys["w"]) newTop -= speed;
    if (keys["s"]) newTop += speed;
    if (keys["a"]) newLeft -= speed;
    if (keys["d"]) newLeft += speed;

    newTop = Math.max(0, Math.min(mapHeight - 32, newTop));
    newLeft = Math.max(0, Math.min(mapWidth - 32, newLeft));

    // Rettangolo player nuova posizione
    const newPlayerRect = {
      left: newLeft,
      top: newTop,
      right: newLeft + 32,
      bottom: newTop + 32,
    };

    if (canMove(newPlayerRect)) {
      pos.left = newLeft;
      pos.top = newTop;
    }

    player.style.top = pos.top + "px";
    player.style.left = pos.left + "px";

    let mapLeft = -pos.left + viewWidth / 2 - 16;
    let mapTop = -pos.top + viewHeight / 2 - 16;

    mapLeft = Math.min(0, Math.max(viewWidth - mapWidth, mapLeft));
    mapTop = Math.min(0, Math.max(viewHeight - mapHeight, mapTop));

    map.style.left = mapLeft + "px";
    map.style.top = mapTop + "px";

    // Controllo collisione con armi
    for (let i = weapons.length - 1; i >= 0; i--) {
      const w = weapons[i];
      if (!w) continue;

      // Cambiato da getBoundingClientRect a offsetLeft/Top per coerenza
      const wRect = {
        left: w.offsetLeft,
        top: w.offsetTop,
        right: w.offsetLeft + w.offsetWidth,
        bottom: w.offsetTop + w.offsetHeight
      };

      const playerRect = {
        left: pos.left,
        top: pos.top,
        right: pos.left + 32,
        bottom: pos.top + 32,
      };

      if (rectsOverlap(playerRect, wRect)) {
        let weaponType = "unknown";
        if (w.classList.contains("sword")) weaponType = "sword";
        else if (w.classList.contains("bow")) weaponType = "bow";

        inventory.push(weaponType);
        currentWeapon = weaponType;
        updateInventoryUI();
        weaponStatus.textContent = currentWeapon;

        w.remove();
        weapons.splice(i, 1);
      }
    }

    updateEnemies();
    checkWinCondition();

    if (!isGameOver) requestAnimationFrame(gameLoop);
  }

  initializeEnemies();
  updateHealthDisplay();
  gameLoop();
});
