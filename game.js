b = BABYLON; v3 = BABYLON.Vector3;

Engine = new b.Engine(document.getElementById("canvas"));
Scene  = new b.Scene(Engine);
Scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

G = {
  p1: {
    x: 5, y: 0, z: 0,
    score: 0,
    size: {height: 2.5, width: 0.2},
  },
  p2: {
    x: -5, y: 0, z: 0,
    score: 0,
    size: {height: 2.5, width: 0.2},
  },
  ball: {
    diameter: 1.0,
  }
};

function intersect(ball, box) {
  const x = Math.max(box.minX, Math.min(ball.x, box.maxX));
  const z = Math.max(box.minZ, Math.min(ball.z, box.maxZ));

  const distance = Math.sqrt((x - ball.x)**2 + (z - ball.z)**2);
  return distance < G.ball.diameter / 2;
}

S = {
  // How important is it to call new here?
  camera: new b.FreeCamera("camera", new v3(0, 10, 8), Scene),
  ground: b.MeshBuilder.CreateGround("ground", {width: 12, height: 12}, Scene),
  sphere: b.MeshBuilder.CreateSphere("sphere", {diameter: G.ball.diameter}, Scene),
};

// Can we pass these in the constructor so I don't have
// to init them statefully?
S.camera.setTarget(v3.Zero());
S.ground.position = new v3(0,-1,0);


light3 = new b.PointLight("light3", new v3(0, 2, 0), S.scene);
light3.intensity = 0.1;

lpaddle = b.MeshBuilder.CreateCapsule("lpaddle", {
  height: G.p1.size.height,
  radius: G.p1.size.width,
  orientation: new v3(0, 0, 1)
},
  S.scene);
rpaddle = b.MeshBuilder.CreateCapsule("rpaddle", {
  height: G.p2.size.height,
  radius: G.p2.size.width,
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
ball_pos = new v3(0, 0, 0);
ball_dir = 1;
perturbation = 0;

function clamp(x, min, max) {
  if (x < min) return min;
  if (x > max) return max;
  return x;
}

function update(current_time_ms) {
  const delta_ms = (current_time_ms - last_time_ms) / 1000;
  const speed = 12;
  if (keys_down.has('KeyW') && G.p1.z > -3.9)
    G.p1.z -= delta_ms * speed;
  if (keys_down.has('KeyS') && G.p1.z < 3.9)
    G.p1.z += delta_ms * speed;
  if (keys_down.has('KeyI') && G.p2.z > -3.9)
    G.p2.z -= delta_ms * speed;
  if (keys_down.has('KeyK') && G.p2.z < 3.9)
    G.p2.z += delta_ms * speed;
  last_time_ms = current_time_ms;
  box1 = {
    minX: G.p1.x - G.p1.size.width,
    maxX: G.p1.x + G.p1.size.width,
    minZ: G.p1.z - G.p1.size.height/2,
    maxZ: G.p1.z + G.p1.size.height/2,
  };
  box2 = {
    minX: G.p2.x - G.p2.size.width,
    maxX: G.p2.x + G.p2.size.width,
    minZ: G.p2.z - G.p2.size.height/2,
    maxZ: G.p2.z + G.p2.size.height/2,
  };
  if (ball_dir > 0 && intersect(ball_pos, box1)) {
    ball_dir *= -1;
    perturbation = 0.5 - Math.random();
  }
  if (ball_dir < 0 && intersect(ball_pos, box2)) {
    ball_dir *= -1;
    perturbation = 0.5 - Math.random();
  }
  ballSpeed = 0.1;
  ball_pos.x += ballSpeed * ball_dir;
  ball_pos.z += ballSpeed * perturbation;
  if (Math.abs(ball_pos.z) > 5)
    perturbation *= -1;
  if (Math.abs(ball_pos.x) > 6)
  {
    if (ball_pos.x < 0) G.p1.score   += 1;
    if (ball_pos.x > 0) G.p2.score  += 1;
    ball_pos.set(0,0,0);
    perturbation = 0;
  }
}

debug = document.getElementById("debug");

function loop(current_time_ms) {
  debug.innerHTML = JSON.stringify(G, null, '\t');
  update(current_time_ms);


  lpaddle.position.copyFromFloats(G.p1.x, G.p1.y, G.p1.z);
  rpaddle.position.copyFromFloats(G.p2.x, G.p2.y, G.p2.z);
  S.sphere.setPositionWithLocalVector(ball_pos);
  light3.position.set(ball_pos.x,ball_pos.y+1,ball_pos.z);
  Scene.render();
  requestAnimationFrame(loop);
}

console.log(b.SceneSerializer.Serialize(Scene));
requestAnimationFrame(loop);
