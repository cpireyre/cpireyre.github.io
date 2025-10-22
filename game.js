"use strict mode";

const PLAYING_FIELD_WIDTH  = 20;
const PLAYING_FIELD_HEIGHT = 15;

G = {
  height: PLAYING_FIELD_WIDTH, width: PLAYING_FIELD_WIDTH,
  ball: {
    diameter: 0.7,
    dir: {x: 1, z: 0},
    get radius() { return this.diameter / 2; },
    speed: 15,
    x: 0, z: 0,
  },
  p1: {
    height: 2.6, width: 0.2,
    score: 0,
    speed: 20,
    x: 8.5, z: 0,
  },
  p2: {
    height: 2.6, width: 0.2,
    score: 0,
    speed: 20,
    x: -8.5, z: 0,
  },
};

function move(v, u, speed, dt) {
  if (u.x === undefined) u.x = 0;
  if (u.z === undefined) u.z = 0;
  v.x += u.x * speed * dt;
  v.z += u.z * speed * dt;
  return (v);
}

b = BABYLON; v3 = BABYLON.Vector3;
const canvas = document.getElementById("canvas");

Engine = new b.Engine(canvas);
S = new b.Scene(Engine);
S.clearColor = new BABYLON.Color4(0, 0, 0, 0);

function intersect(ball, p) {
  const W = p.width;
  const H = p.height / 2;
  const x = Math.max(p.x - W, Math.min(ball.x, p.x + W));
  const z = Math.max(p.z - H, Math.min(ball.z, p.z + H));
  const distance = (x - ball.x)**2 + (z - ball.z)**2;
  return distance < G.ball.radius**2;
}

function collide(ball, p) {
  if (intersect(ball, p)) {
    ball.dir.x *= -1;
    ball.dir.z = (2 / p.height) * (ball.z - p.z);
  }
}

S.camera = new b.FreeCamera("camera", new v3(0, 15, 8), S);
S.ground = b.MeshBuilder.CreateGround("ground",
  {width: G.width, height: PLAYING_FIELD_HEIGHT}, S);
S.sphere = b.MeshBuilder.CreateSphere("sphere", {diameter: G.ball.diameter}, S);

S.camera.setTarget(v3.Zero());
S.ground.position = new v3(0,-1,0);

S.light3 = new b.PointLight("light3", new v3(0, 2, 0), S);
S.light3.intensity = 0.1;

Object.assign(S, {
  lpaddle: b.MeshBuilder.CreateCapsule("lpaddle", {
    height: G.p1.height, radius: G.p1.width, orientation: new v3(0, 0, 1)
  }, S),
  rpaddle: b.MeshBuilder.CreateCapsule("rpaddle", {
    height: G.p2.height, radius: G.p2.width, orientation: new v3(0, 0, 1)
  }, S)
});

const paddleColor = new b.Color3(1,1,1);
[S.lpaddle, S.rpaddle, S.sphere].forEach(mesh => {
  mesh.material = new b.StandardMaterial(`${mesh.name}_mat`, S);
  mesh.material.emissiveColor = paddleColor;
});

keys_down = new Set();
document.addEventListener('keydown', (e) => keys_down.add(e.code));
document.addEventListener('keyup', (e) => keys_down.delete(e.code));

last_time_ms = 0;

function update(current_time_ms) {
  const delta_ms = (current_time_ms - last_time_ms) / 1000;
  last_time_ms = current_time_ms;
  if (keys_down.has('KeyW') && G.p1.z > -5)
    move(G.p1, {z: -1}, G.p1.speed, delta_ms);
  if (keys_down.has('KeyS') && G.p1.z < 5)
    move(G.p1, {z: 1}, G.p1.speed, delta_ms);
  if (keys_down.has('KeyI') && G.p2.z > -5)
    move(G.p2, {z: -1}, G.p2.speed, delta_ms);
  if (keys_down.has('KeyK') && G.p2.z < 5)
    move(G.p2, {z: 1}, G.p2.speed, delta_ms);
  if (G.ball.dir.x > 0) collide(G.ball, G.p1);
  if (G.ball.dir.x < 0) collide(G.ball, G.p2);
  move(G.ball, G.ball.dir, G.ball.speed, delta_ms);
  if (Math.abs(G.ball.z) > 6.3) {
    if (G.ball.dir.z < 0 && G.ball.z < 0) G.ball.dir.z *= -1;
    if (G.ball.dir.z > 0 && G.ball.z > 0) G.ball.dir.z *= -1;
  }
  if (Math.abs(G.ball.x) > G.width / 2) {
    if (G.ball.x < 0) G.p1.score += 1;
    if (G.ball.x > 0) G.p2.score += 1;
    G.ball.z = 0; G.ball.x = 0;
  }
}

const container = Object.assign(document.createElement('div'), {
  style: 'position:relative; display:inline-block'
});
const overlay = Object.assign(document.createElement('div'), {
  style: 'position:absolute; top:0; left:0; width:100%;'
       + 'height:100%; pointer-events:none; color:white;'
       + 'font-family:monospace; font-size:24px; z-index:10'
});
const scoreDisplay = Object.assign(document.createElement('h1'), {
  style: 'position:absolute; top:20px; left:50%;'
       + 'transform:translateX(-50%); text-align:center'
});

canvas.parentNode.insertBefore(container, canvas);
container.append(canvas, overlay);
overlay.appendChild(scoreDisplay);

function loop(current_time_ms) {
  update(current_time_ms);
  scoreDisplay.textContent = `${G.p1.score} | ${G.p2.score}`;
  S.lpaddle.position.set(G.p1.x, 0, G.p1.z);
  S.rpaddle.position.set(G.p2.x, 0, G.p2.z);
  S.sphere.position.set(G.ball.x, 0, G.ball.z);
  S.light3.position.set(G.ball.x, 1, G.ball.z);
  S.render();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
