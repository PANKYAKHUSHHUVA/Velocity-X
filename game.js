const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    // 1. Sky Color & Environment Fog
    scene.clearColor = new BABYLON.Color3(0.4, 0.6, 0.9); // Bright sky blue
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    scene.fogDensity = 0.002;
    scene.fogColor = new BABYLON.Color3(0.6, 0.75, 0.9);

    // 2. Camera Setup
    const camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 3, 25, new BABYLON.Vector3(0, 1, 0), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 5;
    camera.upperRadiusLimit = 100;

    // 3. Lighting Setup
    const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.6;

    const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
    dirLight.position = new BABYLON.Vector3(20, 40, 20);
    dirLight.intensity = 0.8;

    // 4. Ground (Terrain Base)
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 1000, height: 1000 }, scene);
    const groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.2); // Green terrain
    ground.material = groundMaterial;

    // 5. Skybox
    const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
    const skyboxMaterial = new BABYLON.StandardMaterial("skyBoxMat", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.emissiveColor = new BABYLON.Color3(0.4, 0.6, 0.9);
    skybox.material = skyboxMaterial;

    return scene;
};

const scene = createScene();

engine.runRenderLoop(function () {
    scene.render();
});

window.addEventListener("resize", function () {
    engine.resize();
});