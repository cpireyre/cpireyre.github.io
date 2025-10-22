b = BABYLON; v3 = BABYLON.Vector3;

Engine = new b.Engine(document.getElementById("canvas"));
Scene  = new b.Scene(Engine);
Scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

G = {
  p1: {
    x: 5, y: 0, z: 0,
    score: 0,
    height: 2.6, width: 0.2,
    speed: 15,
  },
  p2: {
    x: -5, y: 0, z: 0,
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
  }
};

function intersect(ball, box) {
  x = Math.max(box.minX, Math.min(ball.x, box.maxX));
  z = Math.max(box.minZ, Math.min(ball.z, box.maxZ));

  distance = Math.sqrt((x - ball.x)**2 + (z - ball.z)**2);
  return distance < G.ball.diameter / 2;
}

S = {
  camera: new b.FreeCamera("camera", new v3(0, 10, 8), Scene),
  ground: b.MeshBuilder.CreateGround("ground", {width: 12, height: 12}, Scene),
  sphere: b.MeshBuilder.CreateSphere("sphere", {diameter: G.ball.diameter}, Scene),
};

S.camera.setTarget(v3.Zero());
S.ground.position = new v3(0,-1,0);


light3 = new b.PointLight("light3", new v3(0, 2, 0), S.scene);
light3.intensity = 0.1;

lpaddle = b.MeshBuilder.CreateCapsule("lpaddle", {
  height: G.p1.height,
  radius: G.p1.width,
  orientation: new v3(0, 0, 1)
},
  S.scene);
rpaddle = b.MeshBuilder.CreateCapsule("rpaddle", {
  height: G.p2.height,
  radius: G.p2.width,
  orientation: new v3(0, 0, 1)
},
  S.scene);
lpaddle.material = new b.StandardMaterial("lpaddle_mat", S.scene);
rpaddle.material = new b.StandardMaterial("lpaddle_mat", S.scene);
S.sphere.material = new b.StandardMaterial("sphere_mat", S.scene);
paddleColor = new b.Color3(1,1,1);
lpaddle.material.emissiveColor = paddleColor;
rpaddle.material.emissiveColor = paddleColor;
S.sphere.material.emissiveColor = paddleColor;


keys_down = new Set();
document.addEventListener('keydown', (e) => keys_down.add(e.code));
document.addEventListener('keyup', (e) => keys_down.delete(e.code));

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
  box1 = {
    minX: G.p1.x - G.p1.width,
    maxX: G.p1.x + G.p1.width,
    minZ: G.p1.z - G.p1.height/2,
    maxZ: G.p1.z + G.p1.height/2,
  };
  box2 = {
    minX: G.p2.x - G.p2.width,
    maxX: G.p2.x + G.p2.width,
    minZ: G.p2.z - G.p2.height/2,
    maxZ: G.p2.z + G.p2.height/2,
  };
  if (G.ball.dir.x > 0 && intersect(G.ball, box1)) {
    G.ball.dir.x *= -1;
    hitPosition = (G.p1.z - G.ball.z) / G.p1.height;
    console.log(hitPosition);
    G.ball.dir.z = -hitPosition;
  }
  if (G.ball.dir.x < 0 && intersect(G.ball, box2)) {
    G.ball.dir.x *= -1;
    hitPosition = (G.p2.z - G.ball.z) / G.p2.height;
    console.log(hitPosition);
    G.ball.dir.z = -hitPosition;
  }
  G.ball.x += G.ball.speed * G.ball.dir.x;
  G.ball.z += G.ball.speed * G.ball.dir.z;
  if (Math.abs(G.ball.z) > 5)
    G.ball.dir.z *= -1;
  if (Math.abs(G.ball.x) > 6)
  {
    if (G.ball.x < 0) G.p1.score   += 1;
    if (G.ball.x > 0) G.p2.score  += 1;
    G.ball.z = 0; G.ball.x = 0;
  }
}

debug = document.getElementById("debug");

function loop(current_time_ms) {
  debug.innerHTML = JSON.stringify(G, null, '\t');
  update(current_time_ms);


  lpaddle .position.set(G.p1.x,   G.p1.y, G.p1.z);
  rpaddle .position.set(G.p2.x,   G.p2.y, G.p2.z);
  S.sphere.position.set(G.ball.x, 0,      G.ball.z);
  light3  .position.set(G.ball.x, 1,      G.ball.z);
  Scene.render();
  requestAnimationFrame(loop);
}

console.log(b.SceneSerializer.Serialize(Scene));
requestAnimationFrame(loop);
