/*jslint browser */
/*global BABYLON */

const B = BABYLON;
const V3 = BABYLON.Vector3;
const createGround = B.MeshBuilder.CreateGround;
const createSphere = B.MeshBuilder.CreateSphere;
const createCapsule = B.MeshBuilder.CreateCapsule;
const zeroVector = BABYLON.Vector3.Zero;

function createScene(canvas, G) {
    const Engine = new B.Engine(canvas);
    const S = new B.Scene(Engine);
    S.clearColor = new B.Color4(0, 0, 0, 0);

    S.camera = new B.FreeCamera("camera", new V3(0, 15, 8), S);
    S.ground = createGround("ground", {
        height: G.height,
        width: G.width
    }, S);
    S.sphere = createSphere("sphere", {
        diameter: G.ball.diameter
    }, S);

    S.camera.setTarget(zeroVector());
    S.ground.position = new V3(0, -1, 0);

    S.ballLight = new B.PointLight("ballLight", new V3(0, 2, 0), S);
    S.ballLight.intensity = 0.1;

    Object.assign(S, {
        lpaddle: createCapsule("lpaddle", {
            height: G.p1.height,
            orientation: new V3(0, 0, 1),
            radius: G.p1.width
        }, S),
        rpaddle: createCapsule("rpaddle", {
            height: G.p2.height,
            orientation: new V3(0, 0, 1),
            radius: G.p2.width
        }, S)
    });

    const paddleColor = new B.Color3(1, 1, 1);
    [S.lpaddle, S.rpaddle, S.sphere].forEach(function (mesh) {
        mesh.material = new B.StandardMaterial(`${mesh.name}_mat`, S);
        mesh.material.emissiveColor = paddleColor;
    });
    S.scoreSphereShader = new B.ShaderMaterial(
        Symbol(),
        S,
        "./shader/scoreSphereShader",
        {
            attributes: ["position", "normal", "uv"],
            uniforms: [
                "world",
                "worldView",
                "worldViewProjection",
                "view",
                "projection",
                "scoreRatio"
            ]
        }
    );

    S.scoreSpheres = Array.from({length: 4}, function (ignore, i) {
        return createSphere(`scoreSphere${i + 1}`, {
            diameter: G.ball.diameter
        }, S);
    });
    S.scoreSpheres.forEach(function (mesh) {
        mesh.material = S.scoreSphereShader;
    });
    S.scoreSphereShader.onBindObservable.add(function (mesh) {
        S.scoreSphereShader.getEffect().setFloat("scoreRatio", mesh.ratio);
    });
    return (S);
}

const createRenderer = Object.freeze(
    function (canvas, G) {
        const S = createScene(canvas, G);
        S.scoreSpheres.forEach(function (sphere) {
            sphere.ratio = 0;
        });

        return function render(G) {
            S.lpaddle.position.set(G.p1.x, 0, G.p1.z);
            S.rpaddle.position.set(G.p2.x, 0, G.p2.z);
            S.sphere.position.set(G.ball.x, 0, G.ball.z);
            S.ballLight.position.set(G.ball.x, 1, G.ball.z);
            if (G.p1.roundsWon < 1) {
                S.scoreSpheres[0].ratio = G.p1.score / G.winningScore;
            } else if (G.p1.roundsWon < 2) {
                S.scoreSpheres[1].ratio = G.p1.score / G.winningScore;
            } else {
                S.scoreSpheres[1].ratio = 1;
            }
            if (G.p2.roundsWon < 1) {
                S.scoreSpheres[2].ratio = G.p2.score / G.winningScore;
            } else if (G.p2.roundsWon < 2) {
                S.scoreSpheres[3].ratio = G.p2.score / G.winningScore;
            } else {
                S.scoreSpheres[3].ratio = 1;
            }
            [
                [10, 0, 0],
                [10, 0, 1],
                [-10, 0, 0],
                [-10, 0, 1]
            ].forEach(function (pos, i) {
                S.scoreSpheres[i].position.set(pos[0], pos[1], pos[2]);
            });
            S.render();
        };
    }
);

export {createRenderer};
