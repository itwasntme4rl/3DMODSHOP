(function () {
  const stage = document.getElementById("m4a1Viewer");
  const loading = document.getElementById("m4a1Loading");

  if (!stage || !window.THREE || !window.THREE.GLTFLoader) {
    if (loading) {
      loading.textContent = "3D preview unavailable";
    }
    return;
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x242526);

  const camera = new THREE.PerspectiveCamera(35, 16 / 10, 0.01, 1000);
  camera.position.set(0, 0.6, 5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  stage.prepend(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.85;
  controls.enablePan = false;

  const hemi = new THREE.HemisphereLight(0xffffff, 0x202020, 1.6);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(3, 4, 5);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xc3c6bd, 1.2);
  fill.position.set(-4, 1.5, -3);
  scene.add(fill);

  const loader = new THREE.GLTFLoader();
  let previewLoaded = false;
  if (window.THREE.DRACOLoader) {
    const dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath("assets/draco/");
    dracoLoader.setDecoderConfig({ type: "js" });
    loader.setDRACOLoader(dracoLoader);
  }
  let model = null;

  function resize() {
    const rect = stage.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function frameModel(object) {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxSize = Math.max(size.x, size.y, size.z);
    const distance = maxSize / (2 * Math.tan((camera.fov * Math.PI) / 360));

    object.position.sub(center);
    object.rotation.y = Math.PI * 0.08;

    camera.position.set(0, maxSize * 0.16, distance * 1.75);
    camera.near = Math.max(0.01, distance / 100);
    camera.far = distance * 100;
    camera.updateProjectionMatrix();

    controls.target.set(0, 0, 0);
    controls.minDistance = distance * 0.7;
    controls.maxDistance = distance * 4;
    controls.update();
  }

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  window.addEventListener("resize", resize);
  resize();
  animate();

  loader.load(
    window.M4A1_GLB_DATA_URI || "assets/M4.glb",
    function (gltf) {
      previewLoaded = true;
      model = gltf.scene;
      scene.add(model);
      frameModel(model);
      resize();
      if (loading) {
        loading.classList.add("is-hidden");
      }
    },
    undefined,
    function () {
      if (loading) {
        loading.textContent = "Could not load 3D preview";
      }
    }
  );

  setTimeout(function () {
    if (!previewLoaded && loading) {
      loading.textContent = "Still loading preview";
    }
  }, 10000);
})();
