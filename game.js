"use strict mode";

const PLAYING_FIELD_WIDTH  = 20;
const PLAYING_FIELD_HEIGHT = 15;

G = {
  p1: {
    x: 8.5, z: 0,
    score: 0,
    height: 2.6, width: 0.2,
    speed: 15,
  },
  p2: {
    x: -8.5, z: 0,
    score: 0,
    speed: 15,
    height: 2.6, width: 0.2,
  },
  ball: {
    diameter: 0.7,
    speed: 0.25,
    dir: {x: 1, z: 0},
    x: 0,
    z: 0,
  },
  width: PLAYING_FIELD_WIDTH,
  height: PLAYING_FIELD_WIDTH,
};

b = BABYLON; v3 = BABYLON.Vector3;

Engine = new b.Engine(document.getElementById("canvas"));
S  = new b.Scene(Engine);
S.clearColor = new BABYLON.Color4(0, 0, 0, 0);

function intersect(ball, p) {
  const W = p.width; H = p.height / 2;
  const x = Math.max(p.x - W, Math.min(ball.x, p.x + W));
  const z = Math.max(p.z - H, Math.min(ball.z, p.z + H));
  const distance = (x - ball.x)**2 + (z - ball.z)**2;

  return distance < (G.ball.diameter / 2)**2;
}

function collide(ball, p) {
  if (intersect(ball, p)) {
    ball.dir.x *= -1;
    const hitPosition = (p.z - ball.z) / p.height;
    ball.dir.z = -hitPosition;
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

S.lpaddle = b.MeshBuilder.CreateCapsule("lpaddle", {
  height: G.p1.height,
  radius: G.p1.width,
  orientation: new v3(0, 0, 1)
},
  S);
S.rpaddle = b.MeshBuilder.CreateCapsule("rpaddle", {
  height: G.p2.height,
  radius: G.p2.width,
  orientation: new v3(0, 0, 1)
},
  S);
S.lpaddle.material = new b.StandardMaterial("lpaddle_mat", S);
S.rpaddle.material = new b.StandardMaterial("lpaddle_mat", S);
S.sphere.material = new b.StandardMaterial("sphere_mat", S);
paddleColor = new b.Color3(1,1,1);
S.lpaddle.material.emissiveColor = paddleColor;
S.rpaddle.material.emissiveColor = paddleColor;
S.sphere.material.emissiveColor = paddleColor;

keys_down = new Set();
document.addEventListener('keydown', (e) => keys_down.add   (e.code));
document.addEventListener('keyup',   (e) => keys_down.delete(e.code));

last_time_ms = 0;

function update(current_time_ms) {
  const delta_ms = (current_time_ms - last_time_ms) / 1000;
  if (keys_down.has('KeyW') && G.p1.z > -3.9)
    G.p1.z -= delta_ms * G.p1.speed;
  if (keys_down.has('KeyS') && G.p1.z < 3.9)
    G.p1.z += delta_ms * G.p1.speed;
  if (keys_down.has('KeyI') && G.p2.z > -3.9)
    G.p2.z -= delta_ms * G.p2.speed;
  if (keys_down.has('KeyK') && G.p2.z < 3.9)
    G.p2.z += delta_ms * G.p2.speed;
  last_time_ms = current_time_ms;
  if (G.ball.dir.x > 0) collide(G.ball, G.p1);
  if (G.ball.dir.x < 0) collide(G.ball, G.p2);
  G.ball.x += G.ball.speed * G.ball.dir.x;
  G.ball.z += G.ball.speed * G.ball.dir.z;
  if (Math.abs(G.ball.z) > 6.3)
  {
    console.log(G.ball.z);
    if (G.ball.dir.z < 0 && G.ball.z < 0) G.ball.dir.z *= -1;
    if (G.ball.dir.z > 0 && G.ball.z > 0) G.ball.dir.z *= -1;
  }
  if (Math.abs(G.ball.x) > G.width / 2)
  {
    if (G.ball.x < 0) G.p1.score += 1;
    if (G.ball.x > 0) G.p2.score += 1;
    G.ball.z = 0; G.ball.x = 0;
  }
}

function loop(current_time_ms) {
  update(current_time_ms);

  S.lpaddle.position.set(G.p1.x,   0, G.p1.z);
  S.rpaddle.position.set(G.p2.x,   0, G.p2.z);
  S.sphere .position.set(G.ball.x, 0, G.ball.z);
  S.light3 .position.set(G.ball.x, 1, G.ball.z);

  S.render();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
