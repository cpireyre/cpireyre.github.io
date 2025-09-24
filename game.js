b = BABYLON;
v3 = BABYLON.Vector3;

canvas = document.getElementById("canvas");
engine = new b.Engine(canvas, true);
S = new b.Scene(engine);

camera = new b.FreeCamera("camera", new v3(0, 10, 8), S);
camera.setTarget(v3.Zero());


ground = b.MeshBuilder.CreateGround("ground", {width: 10, height: 10}, S);
ground.material = new b.StandardMaterial("ground_mat", S);
ground.material.diffuseColor = new b.Color3(0.3, 0.4, 0.6);
ground.position = new v3(0,-1,0);

sphere = b.MeshBuilder.CreateSphere("sphere", {diameter: 1}, S);
sphere.material = new b.StandardMaterial("sphere_mat", S);
sphere.material.diffuseColor = new b.Color3(1,1,1);

light1 = new b.PointLight("light1", new v3(0, 2, 0), S);
light1.intensity = 0.8;
light2 = new b.PointLight("light2", new v3(0, 2, 0), S);
light2.intensity = 0.8;
light3 = new b.PointLight("light3", new v3(0, 2, 0), S);
light3.intensity = 0.1;

lpaddle = b.MeshBuilder.CreateCapsule("lpaddle", {
  height: 2.5,
  orientation: new v3(0, 0, 1)
},
  S);
rpaddle = b.MeshBuilder.CreateCapsule("rpaddle", {
  height: 2.5,
  orientation: new v3(0, 0, 1)
},
  S);

p1 = new v3(5,0,0);
p2 = new v3(-5,0,0);

keys_down = new Set();
document.addEventListener('keydown', (e) => keys_down.add(e.code));
document.addEventListener('keyup', (e) => keys_down.delete(e.code));

last_time_ms = 0;
ball_pos = new v3(0, 0, 0);
ball_dir = 1;
perturbation = 0;
function update(current_time_ms) {
  const delta_ms = (current_time_ms - last_time_ms) / 1000;
  const speed = 8;
  if (keys_down.has('KeyW')) p1.z -= delta_ms * speed;
  if (keys_down.has('KeyS')) p1.z += delta_ms * speed;
  if (keys_down.has('KeyI')) p2.z -= delta_ms * speed;
  if (keys_down.has('KeyK')) p2.z += delta_ms * speed;
  last_time_ms = current_time_ms;
  if (ball_dir > 0 && v3.Distance(ball_pos, p1) < 1)
  {
    ball_dir *= -1;
    perturbation = 0.5 - Math.random();
  }
  if (ball_dir < 0 && v3.Distance(ball_pos, p2) < 1)
  {
    ball_dir *= -1;
    perturbation = 0.5 - Math.random();
  }
  ball_pos.x += 0.1 * ball_dir;
  ball_pos.z += 0.1 * perturbation;
  if (Math.abs(ball_pos.z) > 5)
    perturbation *= -1;
  if (Math.abs(ball_pos.x) > 6)
  {
    ball_pos.set(0,0,0);
    perturbation = 0;
  }
}

function loop(current_time_ms) {
  update(current_time_ms);
  lpaddle.setPositionWithLocalVector(p1);
  rpaddle.setPositionWithLocalVector(p2);
  sphere.setPositionWithLocalVector(ball_pos);
  light1.position.set(p1.x,p1.y+0.8,p1.z);
  light2.position.set(p2.x,p2.y+0.8,p2.z);
  light3.position.set(ball_pos.x,ball_pos.y+1,ball_pos.z);
  S.render();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
