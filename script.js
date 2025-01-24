/** @type {HTMLCanvasElement}*/
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 500;
canvas.height = 500;

const Brick_Stack = {
  stack: [],
  brickWidth: 100,
  brickHeight: 20,
  brickY: undefined,
  heightLimit: canvas.height / 2,
  speedBrick: 2,
  availableColors: ["yellow", "purple", "red", "blue", "green", "cyan"],
  renderBricks() {
    this.stack.forEach((obj) => obj.draw());
    this.stack[this.stack.length - 1].moving();
  },
  init() {
    this.speedBrick = 2;
    this.brickWidth = 100;
    this.brickHeight = 20;
    this.brickY = canvas.height - this.brickHeight;
    this.resetStack();
    this.addBrick();
  },
  addBrick() { this.stack.push(new Brick(this.brickWidth, this.brickHeight, this.stack.length ? this.stack[0].x : canvas.width / 2 - this.brickWidth / 2, this.brickY, this.speedBrick, this.availableColors)) },
  resetStack() { this.stack = [] },
  placeBrick() {
    var brickTop = this.stack[this.stack.length - 1];
    var brickBottom = this.stack[this.stack.length - 2];

    if (brickBottom) {
      if (isBetween(brickTop, brickBottom)) {
        if (this.brickY > this.heightLimit) {
          this.brickY -= this.brickHeight;
        } else {
          this.stack.forEach((brick) => brick.y += brick.height);
          this.stack.shift();
        }

        if (isMoreLeft(brickTop, brickBottom)) {
          var newWidth = (brickTop.x + brickTop.width) - brickBottom.x;
          var whatLeftWidth = brickBottom.x - brickTop.x;

          fallingBricks.push(new FallingBrick(brickBottom.x - whatLeftWidth, brickTop.y, brickBottom.x - brickTop.x, this.brickHeight, brickTop.color));

          brickTop.width = newWidth;
          brickTop.x = brickBottom.x;
          this.brickWidth = newWidth;

        } else {
          var newWidth = (brickBottom.x + brickBottom.width) - brickTop.x;
          var whatLeftWidth = brickTop.x - brickBottom.x;

          fallingBricks.push(new FallingBrick(brickBottom.x + brickBottom.width, brickTop.y, whatLeftWidth, this.brickHeight, brickTop.color));

          brickTop.width = newWidth;
          brickTop.x = (brickBottom.x + brickBottom.width) - newWidth;
          this.brickWidth = newWidth;
        }
        score++;
        this.addBrick();

        if (score % 2 == 0) {
          this.speedBrick = Math.min(this.speedBrick + 0.1, 10);
        }

      } else {
        gameOver = true;
      }
    } else {
      this.brickY -= this.brickHeight;
      this.addBrick();
    }
    console.log(this.stack);
  }
}

class Brick {
  constructor(width, height, xPos, yPos, speed, colors) {
    this.width = width;
    this.height = height;
    this.x = xPos;
    this.y = yPos;
    this.direction = speed;
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }
  moving() {
    this.x += this.direction;
    if (this.x + this.width >= canvas.width || this.x <= 0) {
      this.direction *= -1;
    }
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "gray";
    ctx.strokeRect(this.x, this.y, this.width, this.height)
  }
}

class FallingBrick {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.markedForDeletion = false;
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "gray";
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }
  update() {
    this.y += 2;

    if (this.y >= canvas.height) {
      this.markedForDeletion = true;
    }
  }
}

var gameOver = false;
var score = 0;
var bestScore = 0;

const gameMusic = new Audio("resources/EnV-Bonus-Level.mp3");
gameMusic.loop = true;

const loseSound = new Audio("resources/lose sound.mp3");

var fallingBricks = [];

window.addEventListener("load", function () {

  const h1 = document.getElementById("title");
  setRandomColors(h1);

  canvas.addEventListener("click", startNewGame);

  drawText("start a new game", 50, "arial", "center", "middle", canvas.width / 2, canvas.height / 2, "black");
});

function setRandomColors(ele) {
  var coloredText = [];
  var text = ele.textContent;

  for (let i = 0; i < text.length; i++) {
    if (text[i] != " ") {
      coloredText.push(`<span style='color:${random_color()}'>${text[i]}</span>`);
    } else {
      coloredText.push(" ");
    }
  }

  ele.innerHTML = coloredText.join("");
}

function handleFallingBricks() {
  fallingBricks.forEach(fBrick => {
    fBrick.draw();
    fBrick.update();
  });
  fallingBricks = fallingBricks.filter(b => !b.markedForDeletion);
}

function drawText(text, fontSize, fontname, alignment, baseline, x, y, color) {
  ctx.fillStyle = color;
  ctx.font = `${fontSize}px ${fontname}`;
  ctx.textAlign = alignment;
  ctx.textBaseline = baseline;
  ctx.fillText(text, x, y);
}

function drawScore() {
  var fontSize = 30;
  var text = `score: ${score}`;
  ctx.font = `${fontSize}px monospace`;
  ctx.textAlign = "start";
  ctx.textBaseline = "top";

  ctx.lineWidth = 1;
  ctx.strokeStyle = "black";
  ctx.strokeRect(10, 10, ctx.measureText(text).width, fontSize);

  ctx.fillStyle = "lime";
  ctx.fillRect(10, 10, ctx.measureText(text).width, fontSize);

  ctx.fillStyle = "green";
  ctx.fillText(text, 10, 10);
}

var lastTime = 0;
function Render(timestamp) {
  lastTime = timestamp;
  var deltaTime = timestamp - lastTime;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameOver) {
    ctx.globalAlpha = 0.5;
  }

  Brick_Stack.renderBricks();
  handleFallingBricks();
  drawScore();

  if (!gameOver) requestAnimationFrame(Render);
  else gameOverState();
}

const place_brick = () => Brick_Stack.placeBrick();

function gameOverState() {
  gameMusic.pause();
  loseSound.play();

  if (score > bestScore) bestScore = score;

  ctx.globalAlpha = 1.0;
  drawText("Game Over!", 50, "monospace", "center", "middle", canvas.width / 2, canvas.height / 2, "red");
  drawText("best score: " + bestScore, 20, "monospace", "center", "middle", canvas.width / 2, canvas.height / 2 + 50, "black");

  canvas.setAttribute("title", "click to start new game.");
  canvas.addEventListener("click", startNewGame);
}

function startNewGame() {
  gameMusic.currentTime = 0;
  gameMusic.play();

  if (!loseSound.paused) {
    loseSound.pause();
  }
  loseSound.currentTime = 0;

  Brick_Stack.init();
  fallingBricks = [];
  gameOver = false;
  score = 0;
  canvas.removeEventListener("click", startNewGame);
  canvas.removeAttribute("title");
  canvas.addEventListener("click", place_brick);
  requestAnimationFrame(Render);
}

function random_color() {
  return `rgb(${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)})`;
}

function rndNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isBetween(rect1, rect2) {
  return rect1.width + rect1.x > rect2.x && rect1.x < rect2.x + rect2.width;
}

function isMoreLeft(rect1, rect2) {
  return rect1.x + rect1.width < rect2.x + rect2.width;
}