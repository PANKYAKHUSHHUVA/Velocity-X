const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.5, 0.8, 1.0); // Sky blue background

    // Camera following the car
    const camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -20), scene);
    camera.radius = 15;
    camera.heightOffset = 4;
    camera.rotationOffset = 0;
    camera.cameraAcceleration = 0.05;
    camera.maxCameraSpeed = 20;

    // Light
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    // Road (Ground)
    const road = BABYLON.MeshBuilder.CreateGround("road", { width: 20, height: 1000 }, scene);
    const roadMaterial = new BABYLON.StandardMaterial("roadMat", scene);
    roadMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1); // Dark gray road
    road.material = roadMaterial;

    // Player Car (Temporary Box)
    const car = BABYLON.MeshBuilder.CreateBox("car", { width: 2, height: 1.2, depth: 4 }, scene);
    car.position.y = 0.6;
    const carMaterial = new BABYLON.StandardMaterial("carMat", scene);
    carMaterial.diffuseColor = new BABYLON.Color3(0.9, 0.1, 0.1); // Red sports car color
    car.material = carMaterial;

    // Attach camera to car
    camera.lockedTarget = car;

    // Keyboard Controls
    const inputMap = {};
    scene.actionManager = new BABYLON.ActionManager(scene);

    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
        inputMap[evt.sourceEvent.key.toLowerCase()] = true;
    }));

    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
        inputMap[evt.sourceEvent.key.toLowerCase()] = false;
    }));

    // Car Movement Loop
    let speed = 0;
    const maxSpeed = 0.8;
    const acceleration = 0.02;
    const friction = 0.96;

    scene.onBeforeRenderObservable.add(() => {
        // Accelerate / Reverse
        if (inputMap["w"] || inputMap["arrowup"]) {
            if (speed < maxSpeed) speed += acceleration;
        } else if (inputMap["s"] || inputMap["arrowdown"]) {
            if (speed > -maxSpeed / 2) speed -= acceleration;
        } else {
            speed *= friction;
        }

        // Steer Left / Right
        if (inputMap["a"] || inputMap["arrowleft"]) {
            car.rotation.y -= 0.03;
        }
        if (inputMap["d"] || inputMap["arrowright"]) {
            car.rotation.y += 0.03;
        }

        // Move Forward relative to rotation
        car.position.x += Math.sin(car.rotation.y) * speed;
        car.position.z += Math.cos(car.rotation.y) * speed;
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