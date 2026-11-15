import * as THREE from 'three';

/**
 * Enhances OrbitControls for notebook touchpads:
 * - Two-finger swipe orbits the camera
 * - Shift + two-finger swipe pans
 * - Pinch (ctrlKey + wheel) zooms smoothly
 * - Conventional mouse wheel keeps native OrbitControls zoom
 * - Optional drag-mode toggle ('rotate' | 'pan') and Shift/Alt + left-drag pan
 */
export function installTouchpadControls({
  controls,
  getCamera,
  domElement,
  onMove,
  toggleButton = null,
}) {
  const offset = new THREE.Vector3();
  const spherical = new THREE.Spherical();
  const right = new THREE.Vector3();
  const up = new THREE.Vector3();
  const panDelta = new THREE.Vector3();

  let dragMode = 'rotate'; // 'rotate' | 'pan'
  let modifierPan = false;
  let lastTouchpadGestureAt = 0;

  function syncLeftMouseButton() {
    const usePan = dragMode === 'pan' || modifierPan;
    controls.mouseButtons.LEFT = usePan ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE;
    if (toggleButton) {
      toggleButton.setAttribute('aria-pressed', String(dragMode === 'pan'));
      const label = toggleButton.querySelector('span');
      if (label) label.textContent = dragMode === 'pan' ? 'Mover' : 'Girar';
      toggleButton.title =
        dragMode === 'pan'
          ? 'Modo arraste: Mover (Pan). Clique para voltar a Girar.'
          : 'Modo arraste: Girar. Clique para alternar para Mover (Pan).';
    }
    domElement.style.cursor = usePan ? 'grab' : '';
  }

  if (toggleButton) {
    toggleButton.addEventListener('click', () => {
      dragMode = dragMode === 'rotate' ? 'pan' : 'rotate';
      syncLeftMouseButton();
    });
    syncLeftMouseButton();
  }

  function isTouchpadWheelEvent(e) {
    if (e.ctrlKey) return true; // Browser pinch-to-zoom on trackpad
    if (e.deltaMode !== 0) return false; // Line/page mode -> conventional mouse wheel
    if (Math.abs(e.deltaX) > 0) {
      lastTouchpadGestureAt = performance.now();
      return true;
    }
    const absY = Math.abs(e.deltaY);
    const isFineDelta = absY > 0 && (absY < 50 || !Number.isInteger(e.deltaY));
    if (isFineDelta) {
      lastTouchpadGestureAt = performance.now();
      return true;
    }
    // Keep classifying continuous follow-up events within 250ms of a touchpad gesture as touchpad.
    if (performance.now() - lastTouchpadGestureAt < 250) {
      lastTouchpadGestureAt = performance.now();
      return true;
    }
    return false;
  }

  function onWheel(e) {
    if (!isTouchpadWheelEvent(e)) return;

    const camera = getCamera();
    if (!camera) return;

    e.preventDefault();
    e.stopPropagation();

    offset.copy(camera.position).sub(controls.target);

    if (e.ctrlKey) {
      // Pinch-to-zoom
      if (camera.isOrthographicCamera) {
        const factor = Math.pow(0.992, e.deltaY);
        camera.zoom = THREE.MathUtils.clamp(
          camera.zoom * factor,
          controls.minZoom || 0.2,
          controls.maxZoom || 24,
        );
        camera.updateProjectionMatrix();
      } else {
        const dist = offset.length();
        if (dist > 1e-5) {
          const factor = Math.pow(0.992, -e.deltaY);
          const nextDist = THREE.MathUtils.clamp(
            dist * factor,
            controls.minDistance || 0.5,
            controls.maxDistance || 500,
          );
          offset.setLength(nextDist);
          camera.position.copy(controls.target).add(offset);
        }
      }
      onMove?.();
      return;
    }

    if (e.shiftKey) {
      // Shift + two-finger swipe -> Pan
      const h = Math.max(1, domElement.clientHeight);
      let panScale;
      if (camera.isOrthographicCamera) {
        panScale = (camera.top - camera.bottom) / Math.max(0.05, camera.zoom) / h;
      } else {
        const fovRad = THREE.MathUtils.degToRad(camera.fov || 37);
        panScale = (2 * offset.length() * Math.tan(fovRad / 2)) / h;
      }
      right.set(1, 0, 0).applyQuaternion(camera.quaternion);
      up.set(0, 1, 0).applyQuaternion(camera.quaternion);
      panDelta
        .set(0, 0, 0)
        .addScaledVector(right, e.deltaX * panScale)
        .addScaledVector(up, -e.deltaY * panScale);
      camera.position.add(panDelta);
      controls.target.add(panDelta);
      onMove?.();
      return;
    }

    // Two-finger swipe -> Orbit/Rotate
    const h = Math.max(1, domElement.clientHeight);
    const rotSpeed = (2 * Math.PI) / h;
    spherical.setFromVector3(offset);
    spherical.theta -= e.deltaX * rotSpeed * 0.85;
    spherical.phi = THREE.MathUtils.clamp(
      spherical.phi - e.deltaY * rotSpeed * 0.85,
      0.05,
      Math.PI - 0.05,
    );
    spherical.makeSafe();
    offset.setFromSpherical(spherical);
    camera.position.copy(controls.target).add(offset);
    camera.lookAt(controls.target);
    onMove?.();
  }

  function updateModifier(e) {
    const next = Boolean(e.shiftKey || e.altKey);
    if (next !== modifierPan) {
      modifierPan = next;
      syncLeftMouseButton();
    }
  }

  function clearModifier() {
    if (modifierPan) {
      modifierPan = false;
      syncLeftMouseButton();
    }
  }

  // Capture phase ensures touchpad 2-finger/pinch events are intercepted before OrbitControls.
  domElement.addEventListener('wheel', onWheel, { passive: false, capture: true });
  window.addEventListener('keydown', updateModifier);
  window.addEventListener('keyup', updateModifier);
  window.addEventListener('blur', clearModifier);

  return {
    setMode(mode) {
      dragMode = mode === 'pan' ? 'pan' : 'rotate';
      syncLeftMouseButton();
    },
    get mode() {
      return dragMode;
    },
  };
}
