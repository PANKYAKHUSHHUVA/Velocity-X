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

    // 3. Dynamic Textured Grass Ground
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 1000, height: 2000 }, scene);
    ground.position.y = 0.01;
    
    const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
    
    // Procedural grass texture
    const grassTexture = new BABYLON.DynamicTexture("grassTex", 512, scene, false);
    const ctx = grassTexture.getContext();
    
    ctx.fillStyle = "#2d8a2d";
    ctx.fillRect(0, 0, 512, 512);
    
    for (let i = 0; i < 8000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? "#1e5c1e" : "#3eb03e";
        ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 4);
    }
    grassTexture.update();
    grassTexture.uScale = 80;
    grassTexture.vScale = 160;

    groundMat.diffuseTexture = grassTexture;
    groundMat.specularColor = new BABYLON.Color3(0, 0, 0);
    ground.material = groundMat;

    // 4. Main Asphalt Road
    const roadWidth = 18;
    const road = BABYLON.MeshBuilder.CreateGround("road", { width: roadWidth, height: 2000 }, scene);
    road.position.y = 0.02;
    const roadMat = new BABYLON.StandardMaterial("roadMat", scene);
    roadMat.diffuseColor = new BABYLON.Color3(0.15, 0.15, 0.15);
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

    // 6. 3D Trees
    const createTree = (x, z) => {
        const trunk = BABYLON.MeshBuilder.CreateCylinder("trunk", { height: 3, diameter: 0.6 }, scene);
        trunk.position = new BABYLON.Vector3(x, 1.5, z);
        const trunkMat = new BABYLON.StandardMaterial("trunkMat", scene);
        trunkMat.diffuseColor = new BABYLON.Color3(0.4, 0.2, 0.1);
        trunk.material = trunkMat;

        const leaves = BABYLON.MeshBuilder.CreateCone("leaves", { height: 5, diameter: 3.5 }, scene);
        leaves.position = new BABYLON.Vector3(x, 4.5, z);
        const leavesMat = new BABYLON.StandardMaterial("leavesMat", scene);
        leavesMat.diffuseColor = new BABYLON.Color3(0.1, 0.5, 0.1);
        leaves.material = leavesMat;
    };

    for (let z = -900; z < 900; z += 50) {
        createTree(-20 - Math.random() * 20, z);
        createTree(20 + Math.random() * 20, z);
    }

    // 7. Checkpoint Arches
    const createCheckpoint = (zPos) => {
        const arch = BABYLON.MeshBuilder.CreateBox("arch", { width: 20, height: 1, depth: 1 }, scene);
        arch.position = new BABYLON.Vector3(0, 6, zPos);

        const pillarLeft = BABYLON.MeshBuilder.CreateBox("pLeft", { width: 1, height: 6, depth: 1 }, scene);
        pillarLeft.position = new BABYLON.Vector3(-9.5, 3, zPos);

        const pillarRight = BABYLON.MeshBuilder.CreateBox("pRight", { width: 1, height: 6, depth: 1 }, scene);
        pillarRight.position = new BABYLON.Vector3(9.5, 3, zPos);

        const archMat = new BABYLON.StandardMaterial("archMat", scene);
        archMat.diffuseColor = new BABYLON.Color3(1, 0.8, 0);
        arch.material = archMat;
        pillarLeft.material = archMat;
        pillarRight.material = archMat;
    };

    createCheckpoint(-100);
    createCheckpoint(-300);
    createCheckpoint(-500);

    // 8. Player Sports Car Assembly
    const car = BABYLON.MeshBuilder.CreateBox("carBody", { width: 2.2, height: 0.8, depth: 4.5 }, scene);
    car.position.y = 0.6;
    car.rotation.y = Math.PI;

    const carMat = new BABYLON.StandardMaterial("carMat", scene);
    carMat.diffuseColor = new BABYLON.Color3(0.9, 0.1, 0.1);
    car.material = carMat;

    const roof = BABYLON.MeshBuilder.CreateBox("roof", { width: 1.8, height: 0.6, depth: 2 }, scene);
    roof.position.y = 1.2;
    roof.position.z = -0.2;
    roof.parent = car;

    const roofMat = new BABYLON.StandardMaterial("roofMat", scene);
    roofMat.diffuseColor = new BABYLON.Color3(0.05, 0.05, 0.05);
    roof.material = roofMat;

    // 9. Camera Setup
    const camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -20), scene);
    camera.radius = 12;
    camera.heightOffset = 4;
    camera.rotationOffset = 0;
    camera.cameraAcceleration = 0.05;
    camera.maxCameraSpeed = 20;
    camera.lockedTarget = car;

    // 10. Controls & Grass Drag Physics
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
    const roadFriction = 0.96;
    const grassFriction = 0.82;

    scene.onBeforeRenderObservable.add(() => {
        const isOffRoad = Math.abs(car.position.x) > 8;

        if (isOffRoad) {
            maxSpeed = 0.3;
            speed *= grassFriction;
        } else {
            maxSpeed = 1.2;
        }

        if (keys["w"] || keys["arrowup"]) {
            if (speed < maxSpeed) speed += acceleration;
        } else if (keys["s"] || keys["arrowdown"]) {
            if (speed > -maxSpeed / 2) speed -= acceleration;
        } else {
            speed *= roadFriction;
        }

        if (keys["a"] || keys["arrowleft"]) {
            car.rotation.y -= 0.03;
        }
        if (keys["d"] || keys["arrowright"]) {
            car.rotation.y += 0.03;
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