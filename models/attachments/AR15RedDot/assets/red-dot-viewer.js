(function () {
  const stage = document.getElementById("redDotViewer");
  const loading = document.getElementById("redDotLoading");

  if (!stage || !window.THREE || !window.RED_DOT_GLB_DATA_URI) {
    if (loading) {
      loading.textContent = "3D preview unavailable";
    }
    return;
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x242526);

  const camera = new THREE.PerspectiveCamera(35, 16 / 10, 0.01, 1000);
  camera.position.set(0, 0.35, 4);

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
  controls.autoRotateSpeed = 0.9;
  controls.enablePan = false;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x202020, 1.7));

  const key = new THREE.DirectionalLight(0xffffff, 2.3);
  key.position.set(3, 4, 5);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xc3c6bd, 1.2);
  fill.position.set(-4, 1.5, -3);
  scene.add(fill);

  const loader = new THREE.GLTFLoader();

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
    object.rotation.y = Math.PI * 0.15;

    camera.position.set(0, maxSize * 0.12, distance * 1.9);
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
    window.RED_DOT_GLB_DATA_URI,
    function (gltf) {
      scene.add(gltf.scene);
      frameModel(gltf.scene);
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
})();
