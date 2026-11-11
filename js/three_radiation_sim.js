/**
 * three_radiation_sim.js - Interactive 3D WebGL Realized Gain Pattern
 * Built using Three.js (r128) - 100% offline and standalone
 */

(function () {
  'use strict';

  let scene, camera, renderer;
  let radiationMesh, substrateMesh, discMesh;
  let isRotating = true;
  let animId = null;
  let isInitialized = false;

  function init3DRadiation() {
    const container = document.getElementById('three-radiation-container');
    if (!container) return;
    if (isInitialized) {
      resize3DRadiation();
      return;
    }
    if (container.offsetParent === null) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 280;

    // 1. Scene & Camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(3.2, 2.5, 4.0);
    camera.lookAt(0, 0, 0);

    // 2. Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // Remove existing canvas if any, and insert canvas behind overlay controls
    const existingCanvas = container.querySelector('canvas');
    if (existingCanvas) existingCanvas.remove();
    container.insertBefore(renderer.domElement, container.firstChild);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 0.8);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf59e0b, 0.5);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    // 4. Create 3D Monopole Radiation Pattern (Doughnut Lobe with axial nulls)
    createRadiationPattern();

    // 5. Create Miniature 3D Antenna PCB at Center
    createAntennaModel();

    // 6. Coordinate Axes
    const axesHelper = new THREE.AxesHelper(1.8);
    scene.add(axesHelper);

    // 7. Mouse / Touch Drag to Rotate Interaction
    setupOrbitInteraction(renderer.domElement);

    // 8. Controls
    const btnRotate = document.getElementById('btn-3d-rotate');
    if (btnRotate) {
      btnRotate.addEventListener('click', () => {
        isRotating = !isRotating;
        btnRotate.textContent = isRotating ? '⏸ Pause 3D' : '▶ Auto-Rotate';
      });
    }

    const btnWireframe = document.getElementById('btn-3d-wireframe');
    if (btnWireframe) {
      btnWireframe.addEventListener('click', () => {
        if (radiationMesh) {
          radiationMesh.material.wireframe = !radiationMesh.material.wireframe;
          btnWireframe.textContent = radiationMesh.material.wireframe ? 'Solid View' : 'Wireframe';
        }
      });
    }

    isInitialized = true;
    animate();
  }

  function createRadiationPattern() {
    const uSegments = 48;
    const vSegments = 32;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const indices = [];

    // Parametric doughnut radiation lobe
    // r(theta, phi) has maximum at theta = 90 deg (xy plane) and deep nulls at theta = 0, 180 (z-axis)
    for (let j = 0; j <= vSegments; j++) {
      const v = j / vSegments;
      const theta = v * Math.PI; // 0 to PI

      for (let i = 0; i <= uSegments; i++) {
        const u = i / uSegments;
        const phi = u * Math.PI * 2; // 0 to 2*PI

        // Monopole radiation function: sin(theta)^1.3 with slight H-plane variation
        const sinT = Math.sin(theta);
        const gainNormalized = Math.pow(sinT, 1.3) * (0.95 + 0.05 * Math.cos(2 * phi));
        const r = 0.25 + 1.25 * gainNormalized; // scale

        const x = r * Math.sin(theta) * Math.cos(phi);
        const y = r * Math.cos(theta); // Y as vertical elevation
        const z = r * Math.sin(theta) * Math.sin(phi);

        positions.push(x, y, z);

        // Color mapping: Red at maximum gain (+3.43 dB), green/cyan at mid gain, deep blue/violet at nulls
        const color = new THREE.Color();
        if (gainNormalized > 0.75) {
          color.setHSL(0.02 + 0.08 * (1 - gainNormalized), 0.95, 0.55); // Crimson to Orange-Red
        } else if (gainNormalized > 0.4) {
          color.setHSL(0.12 + 0.25 * (1 - gainNormalized), 0.85, 0.5); // Amber to Green
        } else {
          color.setHSL(0.55 + 0.15 * (1 - gainNormalized), 0.9, 0.45); // Cyan to Deep Blue
        }
        colors.push(color.r, color.g, color.b);
      }
    }

    // Generate face indices
    for (let j = 0; j < vSegments; j++) {
      for (let i = 0; i < uSegments; i++) {
        const a = j * (uSegments + 1) + i;
        const b = (j + 1) * (uSegments + 1) + i;
        const c = (j + 1) * (uSegments + 1) + (i + 1);
        const d = j * (uSegments + 1) + (i + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const material = new THREE.MeshPhongMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88,
      shininess: 70,
      specular: 0x222222
    });

    radiationMesh = new THREE.Mesh(geometry, material);
    scene.add(radiationMesh);
  }

  function createAntennaModel() {
    // Miniature FR4 Substrate (translucent green/slate box)
    const subGeo = new THREE.BoxGeometry(0.5, 0.03, 0.52);
    const subMat = new THREE.MeshLambertMaterial({
      color: 0x1e3a34,
      transparent: true,
      opacity: 0.75
    });
    substrateMesh = new THREE.Mesh(subGeo, subMat);
    scene.add(substrateMesh);

    // Miniature Circular Disc Radiator (Gold)
    const discGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.005, 32);
    const discMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.8,
      roughness: 0.3
    });
    discMesh = new THREE.Mesh(discGeo, discMat);
    discMesh.position.set(-0.06, 0.02, 0);
    scene.add(discMesh);
  }

  function setupOrbitInteraction(domElement) {
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    domElement.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    domElement.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;

      if (radiationMesh) {
        radiationMesh.rotation.y += deltaX * 0.01;
        radiationMesh.rotation.x += deltaY * 0.01;
        substrateMesh.rotation.y = radiationMesh.rotation.y;
        substrateMesh.rotation.x = radiationMesh.rotation.x;
        discMesh.rotation.y = radiationMesh.rotation.y;
        discMesh.rotation.x = radiationMesh.rotation.x;
      }

      prevMousePos = { x: e.clientX, y: e.clientY };
    });

    // Touch support for mobile / tablets
    domElement.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    domElement.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMousePos.x;
      const deltaY = e.touches[0].clientY - prevMousePos.y;

      if (radiationMesh) {
        radiationMesh.rotation.y += deltaX * 0.012;
        radiationMesh.rotation.x += deltaY * 0.012;
        substrateMesh.rotation.y = radiationMesh.rotation.y;
        substrateMesh.rotation.x = radiationMesh.rotation.x;
        discMesh.rotation.y = radiationMesh.rotation.y;
        discMesh.rotation.x = radiationMesh.rotation.x;
      }

      prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });

    domElement.addEventListener('touchend', () => {
      isDragging = false;
    });
  }

  function animate() {
    animId = requestAnimationFrame(animate);

    if (isRotating && radiationMesh) {
      radiationMesh.rotation.y += 0.008;
      substrateMesh.rotation.y = radiationMesh.rotation.y;
      discMesh.rotation.y = radiationMesh.rotation.y;
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  // Handle slide visibility & resize
  window.addEventListener('slidechange', (e) => {
    if (e.detail.slideIndex === 10) { // Slide 11 (Part B Radiation)
      setTimeout(() => {
        if (!isInitialized) {
          init3DRadiation();
        } else {
          const container = document.getElementById('three-radiation-container');
          if (container && renderer && camera) {
            const width = container.clientWidth || 400;
            const height = container.clientHeight || 280;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
          }
        }
      }, 50);
    }
  });

  // Handle window resize
  function resize3DRadiation() {
    const container = document.getElementById('three-radiation-container');
    if (container && renderer && camera) {
      const width = container.clientWidth || 400;
      const height = container.clientHeight || 300;
      if (width > 0 && height > 0) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    }
  }

  window.addEventListener('resize', resize3DRadiation);
  window.init3DRadiation = init3DRadiation;
  window.resize3DRadiation = resize3DRadiation;

})();

