import * as THREE from "three";
import * as CANNON from "cannon-es";
import { FontLoader } from "../../node_modules/three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "../../node_modules/three/examples/jsm/geometries/TextGeometry.js";
import { PointerLockControlsCannon } from "../PointerLockControlsCannon.js";
import { UserCamera } from "../UserCamera.js";
import { WorldScene } from "../WorldScene.js";
import { WorldPhysics } from "../WorldPhysics.js";

class Core extends THREE.WebGLRenderer {
  constructor(listBox = [], listSphere = [], nextLevel) {
    super({ antialias: true });
    this.nextLevel = nextLevel;

    this.camera = new UserCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.scene = new WorldScene();
    this.world = new WorldPhysics(40);

    this.setSize(window.innerWidth, window.innerHeight);
    this.setClearColor(this.scene.fog.color);
    this.shadowMap.enabled = true;
    this.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.domElement);

    this.timeStep = 1 / 60;
    this.lastCallTime = performance.now();
    this.boxes = [];
    this.boxMeshes = [];
    this.instructions = document.getElementById("instructions");

    this.setControls();
    this.setListener();
    this.setObjectBlender(listBox, 0);
    this.setTextAnimation(); // Adiciona o texto "LAVA"
    this.animate();
  }

  setControls() {
    this.controls = new PointerLockControlsCannon(
      this.camera,
      this.world.sphereBody
    );
    this.scene.add(this.controls.getObject());
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.setSize(window.innerWidth, window.innerHeight);
  }

  setListener() {
    window.addEventListener("resize", this.onWindowResize.bind(this));
  }

  setObjectBlender(listBox) {
    for (let i = 0; i < listBox.length; i++) {
      this.createBox(listBox[i]);
    }
  }

  setTextAnimation() {
    const loader = new FontLoader();
    loader.load(
      "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
      (font) => {
        const textGeometry = new TextGeometry("LAVAGAME", {
          font: font,
          size: 5,
          height: 1,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.5,
          bevelSize: 0.3,
          bevelOffset: 0,
          bevelSegments: 5,
        });

        const textMaterial = new THREE.MeshStandardMaterial({
          color: 0xff4500,
          emissive: 0xff0000,
          emissiveIntensity: 0.6,
        });

        this.textMesh = new THREE.Mesh(textGeometry, textMaterial);
        this.textMesh.position.set(-20, 20, -30);
        this.textMesh.castShadow = true;

        this.scene.add(this.textMesh);
      }
    );
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const time = performance.now() / 1000;
    const dt = time - this.lastCallTime;
    this.lastCallTime = time;

    this.world.step(this.timeStep, dt);

    for (let i = 0; i < this.boxes.length; i++) {
      this.boxMeshes[i].position.copy(this.boxes[i].position);
      this.boxMeshes[i].quaternion.copy(this.boxes[i].quaternion);
    }

    if (this.textMesh) {
      this.textMesh.position.y = 45 + Math.sin(time * 2) * 1;
    }

    this.controls.update(dt);
    this.render(this.scene, this.camera);
  }
}

const listBox = [];
const nextLevel = "Level_0.html";

const play = new Core(listBox, [], nextLevel);
