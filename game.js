const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 120;

const scoreText = document.getElementById("score");
const gameOverText = document.getElementById("gameOver");

let running = false;
let score = 0;
let speed = 6;
let touchX = canvas.width / 2;

// ===== СМУГИ =====
const lanes = [
    canvas.width * 0.25,
    canvas.width * 0.5,
    canvas.width * 0.75
];

// ===== ГРАВЕЦЬ =====
const player = {
    lane: 1,
    x: lanes[1],
    y: canvas.height - 140,
    w: 50,
    h: 90,
    color: "#00aaff"
};

// ===== ДОРОГА =====
let road = [];
for (let i = 0; i < 10; i++) road.push({ y: i * 100 });

// ===== ВОРОГИ =====
let enemies = [];

// ===== TOUCH =====
canvas.addEventListener("touchstart", e => {
    touchX = e.touches[0].clientX;
});

canvas.addEventListener("touchmove", e => {
    touchX = e.touches[0].clientX;
});

// ===== СТАРТ =====
function startGame() {
    running = true;
    score = 0;
    enemies = [];
    gameOverText.classList.add("hidden");
    loop();
}

// ===== ЦИКЛ =====
function loop() {
    if (!running) return;
    update();
    draw();
    requestAnimationFrame(loop);
}

// ===== UPDATE =====
function update() {
    score++;
    speed = 6 + Math.floor(score / 400);
    scoreText.textContent = "Score: " + score;

    // рух гравця за пальцем
    if (touchX < canvas.width / 2 && player.lane > 0) {
        player.lane--;
        touchX = canvas.width / 2;
    }
    if (touchX > canvas.width / 2 && player.lane < lanes.length - 1) {
        player.lane++;
        touchX = canvas.width / 2;
    }
    player.x = lanes[player.lane];

    // дорога
    road.forEach(r => {
        r.y += speed;
        if (r.y > canvas.height) r.y = -120;
    });

    // спавн AI
    if (Math.random() < 0.03) {
        enemies.push({
            lane: Math.floor(Math.random() * lanes.length),
            x: 0,
            y: -120,
            w: 50,
            h: 90,
            s: speed,
            ai: ["calm", "aggressive"][Math.floor(Math.random() * 2)],
            cd: 0
        });
    }

    // AI рух
    enemies.forEach(e => {
        updateEnemyAI(e);
        e.y += e.s;
    });

    enemies = enemies.filter(e => e.y < canvas.height + 200);

    // зіткнення
    enemies.forEach(e => {
        if (
            player.x - player.w / 2 < e.x + e.w / 2 &&
            player.x + player.w / 2 > e.x - e.w / 2 &&
            player.y < e.y + e.h &&
            player.y + player.h > e.y
        ) {
            running = false;
            gameOverText.classList.remove("hidden");
        }
    });
}

// ===== AI =====
function updateEnemyAI(e) {
    e.x = lanes[e.lane];

    if (e.cd > 0) {
        e.cd--;
        return;
    }

    if (e.ai === "aggressive" && Math.random() < 0.03) {
        if (player.lane < e.lane) e.lane--;
        else if (player.lane > e.lane) e.lane++;
    }

    e.lane = Math.max(0, Math.min(lanes.length - 1, e.lane));
    e.cd = 20;
}

// ===== ФІГУРКИ (ВЛАСНІ МАШИНИ) =====
function drawCar(x, y, w, h, color, lights = false) {
    ctx.save();
    ctx.translate(x, y);

    // корпус
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-w / 2, 0, w, h, 12);
    ctx.fill();

    // вікна
    ctx.fillStyle = "#111";
    ctx.fillRect(-w / 2 + 8, 15, w - 16, 20);

    // фари
    if (lights) {
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(-w / 4, 0, 6, 0, Math.PI * 2);
        ctx.arc(w / 4, 0, 6, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

// ===== DRAW =====
function draw() {
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // дорога
    ctx.fillStyle = "white";
    road.forEach(r => {
        ctx.fillRect(canvas.width / 2 - 4, r.y, 8, 60);
    });

    // гравець
    drawCar(player.x, player.y, player.w, player.h, player.color, true);

    // вороги
    enemies.forEach(e => {
        drawCar(lanes[e.lane], e.y, e.w, e.h,
            e.ai === "aggressive" ? "#ff4444" : "#44ff44");
    });
}

// ===== RESTART =====
canvas.addEventListener("click", () => {
    if (!running) startGame();
});
