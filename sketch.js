let pathPoints = [];
let level = 1;
let gameState = "WAITING"; // WAITING, PLAYING, GAMEOVER, WIN
let sparks = []; // 存放火花粒子的陣列
let fishies = []; // 存放小魚的陣列
let bubbles = []; // 存放氣泡的陣列
let jellies = []; // 存放水母的陣列

function setup() {
  // 產生全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  initFish();
  initJellies();
  initBubbles();
  initGame();
}

function initFish() {
  fishies = [];
  for (let i = 0; i < 15; i++) {
    fishies.push({
      x: random(width),
      y: random(height),
      speed: random(0.5, 2),
      size: random(5, 12),
      offset: random(TWO_PI)
    });
  }
}

function initJellies() {
  jellies = [];
  for (let i = 0; i < 5; i++) {
    jellies.push({
      x: random(width),
      y: random(height),
      size: random(30, 60),
      speed: random(0.2, 0.5),
      offset: random(TWO_PI)
    });
  }
}

function initBubbles() {
  bubbles = [];
  for (let i = 0; i < 20; i++) {
    bubbles.push({
      x: random(width),
      y: random(height, height * 2),
      speed: random(1, 3),
      size: random(2, 6)
    });
  }
}

function initGame() {
  pathPoints = [];
  sparks = []; // 重置火花
  gameState = "WAITING";
  let numPoints = 7 + level;
  let randomRange = height * (0.15 + level * 0.02); // 關卡越高，起伏越大
  
  // 在螢幕中間產生隨機路徑點
  for (let i = 0; i < numPoints; i++) {
    pathPoints.push({
      x: map(i, 0, numPoints - 1, 100, width - 100),
      y: height / 2 + random(-randomRange, randomRange)
    });
  }
}

function draw() {
  // 稍微亮一點的深海背景色
  background(15, 30, 60); 

  drawBubbles(); // 繪製上升氣泡
  drawJellies(); // 繪製半透明發光水母
  drawSeaLife(); // 繪製游動的小魚
  drawWire(); // 繪製軌道
  drawButtons(); // 繪製起點與終點按鈕

  if (gameState === "PLAYING") {
    checkCollision();
  }
  handleSparks(); // 更新並繪製火花

  drawSideButtons(); // 繪製側邊控制按鈕
  drawPlayer(); // 繪製白色線圈
  drawUI(); // 繪製介面文字
}

function drawJellies() {
  push();
  for (let j of jellies) {
    // 移動邏輯
    j.y -= j.speed;
    j.x += sin(frameCount * 0.01 + j.offset) * 0.5;
    if (j.y < -100) {
      j.y = height + 100;
      j.x = random(width);
    }
    
    let pulse = sin(frameCount * 0.03 + j.offset) * 0.1 + 1;
    
    // 繪製觸手 (透明藍線)
    stroke(120, 180, 255, 40);
    strokeWeight(1.5);
    noFill();
    for (let i = -2; i <= 2; i++) {
      beginShape();
      for (let k = 0; k < 5; k++) {
        let tx = j.x + i * (j.size * 0.15) + sin(frameCount * 0.05 + k + j.offset) * 8;
        let ty = j.y + k * (j.size * 0.4);
        curveVertex(tx, ty);
      }
      endShape();
    }
    
    // 繪製半透明傘狀體
    noStroke();
    fill(150, 200, 255, 20); // 外發光
    ellipse(j.x, j.y, j.size * 1.3 * pulse, j.size * 1.1 * pulse);
    fill(180, 230, 255, 70); // 核心
    arc(j.x, j.y, j.size * pulse, j.size * 0.8 * pulse, PI, TWO_PI, CHORD);
  }
  pop();
}

function drawBubbles() {
  noFill();
  stroke(255, 255, 255, 50); // 淡淡的白色氣泡
  strokeWeight(1);
  for (let b of bubbles) {
    b.y -= b.speed;
    b.x += sin(frameCount * 0.02 + b.y) * 0.5; // 左右微晃
    
    ellipse(b.x, b.y, b.size);
    
    if (b.y < -20) {
      b.y = height + 20;
      b.x = random(width);
    }
  }
}

function drawSeaLife() {
  noStroke();
  // 繪製並更新小魚
  for (let f of fishies) {
    // 偵測滑鼠距離
    let d = dist(mouseX, mouseY, f.x, f.y);
    let speedMult = 1;
    
    if (d < 150) {
      // 受驚嚇：計算遠離滑鼠的方向並加速
      let angle = atan2(f.y - mouseY, f.x - mouseX);
      f.x += cos(angle) * 4;
      f.y += sin(angle) * 2;
      speedMult = 2.5; 
    }

    f.x += f.speed * speedMult;
    // 越界重置
    if (f.x > width + 20) f.x = -20;
    
    // 微微的上下浮動
    let yOff = sin(frameCount * 0.05 + f.offset) * 5;
    
    // 魚的身影 (顏色微調，仍保持在背景感)
    fill(30, 60, 100); 
    ellipse(f.x, f.y + yOff, f.size * 1.5, f.size);
    
    // 魚尾巴
    triangle(f.x - f.size/2, f.y + yOff, f.x - f.size, f.y + yOff - 3, f.x - f.size, f.y + yOff + 3);
  }
}

function drawButtons() {
  let startP = pathPoints[0];
  let endP = pathPoints[pathPoints.length - 1];

  // 起點按鈕 (低飽和綠)
  fill(100, 180, 150);
  noStroke();
  ellipse(startP.x, startP.y, 50, 50);
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(12);
  text("START", startP.x, startP.y);

  // 終點按鈕 (低飽和紅)
  fill(180, 110, 110);
  noStroke();
  ellipse(endP.x, endP.y, 50, 50);
  fill(255);
  text("END", endP.x, endP.y);
}

function drawPlayer() {
  noFill();
  stroke(255); // 白色線圈
  strokeWeight(3);
  ellipse(mouseX, mouseY, 30, 30);

  // 當滑鼠在右上角按鈕區域時顯示游標，否則隱藏
  if (mouseY < 75 && mouseX > width - 260) {
    cursor(ARROW);
  } else {
    noCursor();
  }
}

function drawSideButtons() {
  push();
  rectMode(CORNER);
  textAlign(CENTER, CENTER);
  textSize(18); // 字體加大
  stroke(255);
  strokeWeight(1);

  // 重新開始按鈕 (低飽和深紅)
  fill(110, 80, 80);
  rect(width - 250, 15, 115, 45, 8); // 尺寸加大
  fill(255);
  text("重新開始", width - 192, 38);

  // 下一關按鈕 (低飽和深綠)
  fill(80, 110, 80);
  rect(width - 125, 15, 115, 45, 8); // 尺寸加大
  fill(255);
  text("下一關", width - 67, 38);
  pop();
}

function drawUI() {
  fill(255);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(16);
  text("LEVEL: " + level, 20, 20);
  text("操作：點擊綠色 START 開始，沿路徑抵達紅色 END", 20, 45);

  if (gameState !== "PLAYING") {
    textAlign(CENTER, CENTER);
    textSize(48);
    if (gameState === "WAITING") {
      fill(255);
      text("請點擊綠色按鈕開始", width / 2, height / 2);
    } else if (gameState === "GAMEOVER") {
      fill(255, 50, 50);
      text("GAME OVER! 點擊畫面重試", width / 2, height / 2);
    } else if (gameState === "WIN") {
      fill(50, 255, 50);
      text("SUCCESS! 點擊進入第 " + (level + 1) + " 關", width / 2, height / 2);
    }
  }
}

function drawWire() {
  noFill();
  
  // 繪製軌道底色（緩衝區）
  // 難度提高：軌道寬度隨關卡變窄，最小維持在 20 像素
  let trackWidth = max(20, 60 - (level - 1) * 5);
  
  stroke(80, 80, 80); // 提高軌道亮度以區分背景
  strokeWeight(trackWidth); 
  drawSmoothCurve();

  // 繪製核心導線 (低飽和藍)
  stroke(140, 170, 200);
  strokeWeight(12);
  drawSmoothCurve();
}

function drawSmoothCurve() {
  beginShape();
  if (pathPoints.length > 0) {
    // curveVertex 需要重複起點與終點作為控制點以達到圓滑效果
    curveVertex(pathPoints[0].x, pathPoints[0].y);
    for (let p of pathPoints) {
      curveVertex(p.x, p.y);
    }
    curveVertex(pathPoints[pathPoints.length - 1].x, pathPoints[pathPoints.length - 1].y);
  }
  endShape();
}

function checkCollision() {
  // 取得滑鼠位置的顏色
  let c = get(mouseX, mouseY);
  let brightnessValue = brightness(c);

  // 1. 檢查是否碰到背景 (因為背景變亮，門檻調升至 25)
  if (brightnessValue < 25) {
    if (gameState === "PLAYING") {
      createSparks(mouseX, mouseY); // 在碰撞位置產生火花
      gameState = "GAMEOVER";
    }
  }
  
  // 2. 檢查是否碰到終點 (成功)
  let endP = pathPoints[pathPoints.length - 1];
  let d = dist(mouseX, mouseY, endP.x, endP.y);
  if (d < 25) {
    gameState = "WIN";
  }
}

function mousePressed() {
  // 檢查側邊控制按鈕的點擊
  if (mouseY > 15 && mouseY < 60) {
    // 點擊「重新開始」
    if (mouseX > width - 250 && mouseX < width - 135) {
      level = 1;
      initGame();
      return; // 結束函式，避免觸發後續遊戲邏輯
    }
    // 點擊「下一關」
    if (mouseX > width - 125 && mouseX < width - 10) {
      level++;
      initGame();
      return;
    }
  }

  if (gameState === "WAITING") {
    // 檢查是否點擊起點
    let startP = pathPoints[0];
    let d = dist(mouseX, mouseY, startP.x, startP.y);
    if (d < 30) {
      gameState = "PLAYING";
    }
  } else if (gameState === "GAMEOVER") {
    level = 1; // 失敗重來
    initGame();
  } else if (gameState === "WIN") {
    level++; // 進入下一關
    initGame();
  }
}

function windowResized() {
  // 視窗大小改變時，重新調整畫布
  resizeCanvas(windowWidth, windowHeight);
  initFish();
  initJellies();
  initBubbles();
  initGame();
}

// 產生火花粒子的函式
function createSparks(x, y) {
  for (let i = 0; i < 30; i++) {
    sparks.push({
      x: x,
      y: y,
      vx: random(-5, 5),
      vy: random(-5, 5),
      life: 255, // 透明度，隨時間減少
      color: color(255, random(100, 255), 0) // 橘黃色調
    });
  }
}

// 處理火花的移動與繪製
function handleSparks() {
  for (let i = sparks.length - 1; i >= 0; i--) {
    let s = sparks[i];
    s.x += s.vx;
    s.y += s.vy;
    s.vy += 0.1; // 微弱的重力感
    s.life -= 5; // 逐漸消失

    push();
    noStroke();
    fill(red(s.color), green(s.color), blue(s.color), s.life);
    ellipse(s.x, s.y, random(2, 5));
    pop();

    // 移除透明度為 0 的粒子
    if (s.life <= 0) {
      sparks.splice(i, 1);
    }
  }
}
