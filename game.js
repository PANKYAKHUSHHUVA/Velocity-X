const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    // 1. Sky & Environment Fog
    scene.clearColor = new BABYLON.Color3(0.4, 0.6, 0.9);
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    scene.fogDensity = 0.0015;
    scene.fogColor = new BABYLON.Color3(0.6, 0.75, 0.9);

    // 2. Lighting Setup
    const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.5;

    const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
    dirLight.position = new BABYLON.Vector3(20, 40, 20);
    dirLight.intensity = 0.8;

    // 3. Ground
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 1000, height: 2000 }, scene);
    ground.position.y = -0.01;
    const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.2, 0.55, 0.2);
    ground.material = groundMat;

    // 4. Main Road
    const road = BABYLON.MeshBuilder.CreateGround("road", { width: 18, height: 2000 }, scene);
    const roadMat = new BABYLON.StandardMaterial("roadMat", scene);
    roadMat.diffuseColor = new BABYLON.Color3(0.15, 0.15, 0.15);
    road.material = roadMat;

    // 5. Skybox
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
    const skyboxMat = new BABYLON.StandardMaterial("skyBoxMat", scene);
    skyboxMat.backFaceCulling = false;
    skyboxMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMat.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMat.emissiveColor = new BABYLON.Color3(0.4, 0.6, 0.9);
    skybox.material = skyboxMat;

    // 6. Player Sports Car Assembly
    const car = BABYLON.MeshBuilder.CreateBox("carBody", { width: 2.2, height: 0.8, depth: 4.5 }, scene);
    car.position.y = 0.6;
    car.rotation.y = Math.PI;

    const carMat = new BABYLON.StandardMaterial("carMat", scene);
    carMat.diffuseColor = new BABYLON.Color3(0.9, 0.1, 0.1);
    car.material = carMat;

    // Roof Top
    const roof = BABYLON.MeshBuilder.CreateBox("roof", { width: 1.8, height: 0.6, depth: 2 }, scene);
    roof.position.y = 1.2;
    roof.position.z = -0.2;
    roof.parent = car;

    const roofMat = new BABYLON.StandardMaterial("roofMat", scene);
    roofMat.diffuseColor = new BABYLON.Color3(0.05, 0.05, 0.05);
    roof.material = roofMat;

    // 7. Follow Camera
    const camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -20), scene);
    camera.radius = 12;
    camera.heightOffset = 4;
    camera.rotationOffset = 0;
    camera.cameraAcceleration = 0.05;
    camera.maxCameraSpeed = 20;
    camera.lockedTarget = car;

    // 8. Driving Controls
    const inputMap = {};
    scene.actionManager = new BABYLON.ActionManager(scene);

    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
        inputMap[evt.sourceEvent.key.toLowerCase()] = true;
    }));

    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
        inputMap[evt.sourceEvent.key.toLowerCase()] = false;
    }));

    let speed = 0;
    const maxSpeed = 1.2;
    const acceleration = 0.025;
    const friction = 0.96;

    scene.onBeforeRenderObservable.add(() => {
        if (inputMap["w"] || inputMap["arrowup"]) {
            if (speed < maxSpeed) speed += acceleration;
        } else if (inputMap["s"] || inputMap["arrowdown"]) {
            if (speed > -maxSpeed / 2) speed -= acceleration;
        } else {
            speed *= friction;
        }

        if (inputMap["d"] || inputMap["arrowleft"]) {
            car.rotation.y += 0.03;
        }
        if (inputMap["a"] || inputMap["arrowright"]) {
            car.rotation.y -= 0.03;
        }

        car.position.x -= Math.sin(car.rotation.y) * speed;
        car.position.z -= Math.cos(car.rotation.y) * speed;
    });

    return scene;
};

const scene = createScene();

engine.runRenderLoop(function () {
    scene.render();
});

window.addEventListener("resize", function () {
    engine.resize();
});