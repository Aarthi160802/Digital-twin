import * as THREE from "./three.js-master/build/three.module.js";
import { GLTFLoader } from "./three.js-master/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "./three.js-master/examples/jsm/controls/OrbitControls.js";

const MODEL_PATH = "assets/furnace.glb";
const ALERT_SOUND_PATH = "assets/alert.mp3";
const ALERT_BACKGROUND_TEXTURE_PATH = "assets/red_bg.png";
const NORMAL_BACKGROUND_TEXTURE_PATH = "assets/white_bg.png";

const SCREEN_DIMENSIONS = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const MAX_VALUE = 2000;

const BLINK_RATE = 3;
const CURRENT_VALUE_INCREMENT_RATE = 0.5;

const scene = new THREE.Scene();
const canvas = document.querySelector(".webgl");

const alert_sound = new Audio(ALERT_SOUND_PATH);

let normal_background_texture, alert_background_texture;

const load_3d_model = (model_path) => {
  const model_loader = new GLTFLoader();

  model_loader.load(
    model_path,
    function (glb) {
      const root = glb.scene;
      root.scale.set(0.007, 0.007, 0.007);
      scene.add(root);
    },
    function (xhr) {
      console.log(
        `Model: ${((xhr.loaded / xhr.total) * 100).toFixed(2)}% loaded`
      );
    },
    function (error) {
      console.error("An error occurred while loading the model.");
      console.error(error);
    }
  );
};

const load_background_textures = (normal_texture_path, alert_texture_path) => {
  const alert_background_loader = new THREE.TextureLoader();
  alert_background_loader.load(alert_texture_path, function (texture) {
    alert_background_texture = texture;
  });

  const normal_background_loader = new THREE.TextureLoader();
  normal_background_loader.load(normal_texture_path, function (texture) {
    normal_background_texture = texture;
    scene.background = normal_background_texture;
  });
};

const load_lighting = () => {
  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 4.5);
  scene.add(hemisphereLight);

  const directionalLight = new THREE.DirectionalLight(0xfbfcf6, 4.5);
  scene.add(directionalLight);
};

const load_camera = () => {
  const camera = new THREE.PerspectiveCamera(
    45,
    SCREEN_DIMENSIONS.width / SCREEN_DIMENSIONS.height,
    0.1,
    1000
  );
  camera.position.set(2, 2.1, 2);
  scene.add(camera);

  return camera;
};

const load_renderer = () => {
  const renderer = new THREE.WebGL1Renderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });

  renderer.setSize(SCREEN_DIMENSIONS.width, SCREEN_DIMENSIONS.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.updateShadowMap.enabled = false;
  renderer.gammaOutput = true;

  return renderer;
};

const load_controls = (camera, renderer) => {
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableDamping = true;

  return controls;
};

function animate(camera, renderer, controls, threshold) {
  let current_value = 0;
  let current_blink_value = 0;

  const _animate = () => {
    if (current_value < threshold) {
      alert_sound.pause();
    } else if (current_value >= threshold && current_value <= MAX_VALUE) {
      alert_sound.play();

      if (current_blink_value < 60) {
        scene.background = normal_background_texture;
      } else if (current_blink_value >= 60) {
        scene.background = alert_background_texture;
      }

      current_blink_value += BLINK_RATE;
      if (current_blink_value > 120) {
        current_blink_value = 0;
      }
    }

    controls.update();

    if (current_value <= MAX_VALUE) {
      requestAnimationFrame(_animate);
    }
    renderer.render(scene, camera);

    current_value += CURRENT_VALUE_INCREMENT_RATE;
    console.log(`Current Value: ${current_value}`);
    console.log(`current_blink_value Value: ${current_blink_value}`);
  };

  _animate();
}

function main() {
  let threshold;

  // 1. Loading the 3D model.
  load_3d_model(MODEL_PATH);

  // 2. Load background textures.
  load_background_textures(
    NORMAL_BACKGROUND_TEXTURE_PATH,
    ALERT_BACKGROUND_TEXTURE_PATH
  );

  // 3. Load Lighting
  load_lighting();

  // 4. Load Camera
  const camera = load_camera();

  // 5. Load Renderer
  const renderer = load_renderer();

  // 6. Load controller
  const controls = load_controls(camera, renderer);

  const onSubmit = (event) => {
    // Prevents Browser from refreshing after clicking submit button
    event.preventDefault();

    threshold = parseInt(document.getElementById("thresholdInput").value);

    scene.background = new THREE.Color(0xf8f8ff);

    animate(camera, renderer, controls, threshold);
  };

  document
    .getElementById("thresholdSubmitButton")
    .addEventListener("click", onSubmit);
}

main();
