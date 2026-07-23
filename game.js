const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    // 1. Sky & Environment Fog
    scene.clearColor = new BABYLON.Color3(0.4, 0.6, 0.9);

    // 2. Lighting Setup
    const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.7;

    const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
    dirLight.position = new BABYLON.Vector3(20, 40, 20);
    dirLight.intensity = 0.8;

    // 3. Main Grass Ground (Raised slightly to render above the skybox bottom)
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 1000, height: 2000 }, scene);
    ground.position.y = 0.01;
    const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.25, 0.65, 0.25); // Vibrant Grass Green
    groundMat.specularColor = new BABYLON.Color3(0, 0, 0);
    ground.material = groundMat;

    // 4. Main Asphalt Road
    const roadWidth = 18;
    const road = BABYLON.MeshBuilder.CreateGround("road", { width: roadWidth, height: 2000 }, scene);
    road.position.y = 0.02; // Placed right on top of grass
    const roadMat = new BABYLON.StandardMaterial("roadMat", scene);
    roadMat.diffuseColor = new BABYLON.Color3(0.15, 0.15, 0.15); // Dark Gray Road
    roadMat.specularColor = new BABYLON.Color3(0, 0, 0);
    road.material = roadMat;

    // 5. Skybox
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
    const skyboxMat = new BABYLON.StandardMaterial("skyBoxMat", scene);
    skyboxMat.backFaceCulling = false;
    skyboxMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMat.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMat.emissiveColor = new BABYLON.Color3(0.4, 0.6, 0.9);
    skybox.material = skyboxMat;

    // 6. Checkpoint Arches
    const createCheckpoint = (zPos) => {
        const arch = BABYLON.MeshBuilder.CreateBox("arch", { width: 20, height: 1, depth: 1 }, scene);
        arch.position = new BABYLON.Vector3(0, 6, zPos);

        const pillarLeft = BABYLON.MeshBuilder.CreateBox("pLeft", { width: 1, height: 6, depth: 1 }, scene);
        pillarLeft.position = new BABYLON.Vector3(-9.5, 3, zPos);

        const pillarRight = BABYLON.MeshBuilder.CreateBox("pRight", { width: 1, height: 6, depth: 1 }, scene);
        pillarRight.position = new BABYLON.Vector3(9.5, 3, zPos);

        const archMat = new BABYLON.StandardMaterial("archMat", scene);
        archMat.diffuseColor = new BABYLON.Color3(1, 0.8, 0); // Bright Yellow
        arch.material = archMat;
        pillarLeft.material = archMat;
        pillarRight.material = archMat;
    };

    // Spawn 3 Checkpoints
    createCheckpoint(-100);
    createCheckpoint(-300);
    createCheckpoint(-500);

    // 7. Player Sports Car Assembly
    const car = BABYLON.MeshBuilder.CreateBox("carBody", { width: 2.2, height: 0.8, depth: 4.5 }, scene);
    car.position.y = 0.6;
    car.rotation.y = Math.PI;

    const carMat = new BABYLON.StandardMaterial("carMat", scene);
    carMat.diffuseColor = new BABYLON.Color3(0.9, 0.1, 0.1);
    car.material = carMat;

    // Roof
    const roof = BABYLON.MeshBuilder.CreateBox("roof", { width: 1.8, height: 0.6, depth: 2 }, scene);
    roof.position.y = 1.2;
    roof.position.z = -0.2;
    roof.parent = car;

    const roofMat = new BABYLON.StandardMaterial("roofMat", scene);
    roofMat.diffuseColor = new BABYLON.Color3(0.05, 0.05, 0.05);
    roof.material = roofMat;

    // 8. Follow Camera
    const camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -20), scene);
    camera.radius = 12;
    camera.heightOffset = 4;
    camera.rotationOffset = 0;
    camera.cameraAcceleration = 0.05;
    camera.maxCameraSpeed = 20;
    camera.lockedTarget = car;

    // 9. Input & Physics Loop
    const keys = {};

    window.addEventListener("keydown", (e) => {
        keys[e.key.toLowerCase()] = true;
    });

    window.addEventListener("keyup", (e) => {
        keys[e.key.toLowerCase()] = false;
    });

    let speed = 0;
    let maxSpeed = 1.2;
    const acceleration = 0.025;
    const friction = 0.96;

    scene.onBeforeRenderObservable.add(() => {
        // Off-road Grass Penalty
        const isOffRoad = Math.abs(car.position.x) > (roadWidth / 2 - 1);
        maxSpeed = isOffRoad ? 0.35 : 1.2; 

        // Accelerate / Reverse
        if (keys["w"] || keys["arrowup"]) {
            if (speed < maxSpeed) speed += acceleration;
        } else if (keys["s"] || keys["arrowdown"]) {
            if (speed > -maxSpeed / 2) speed -= acceleration;
        } else {
            speed *= friction;
        }

        // Steer Left / Right
        if (keys["a"] || keys["arrowleft"]) {
            car.rotation.y -= 0.03;
        }
        if (keys["d"] || keys["arrowright"]) {
            car.rotation.y += 0.03;
        }

        // Position Updates
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