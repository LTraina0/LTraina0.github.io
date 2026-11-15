import * as THREE from 'three';

const MOVE_KEYS = new Set(['KeyW', 'KeyS', 'KeyA', 'KeyD', 'Space', 'ShiftLeft', 'ShiftRight']);
const SPRINT_KEYS = new Set(['AltLeft', 'AltRight', 'ControlLeft', 'ControlRight']);
const HORIZONTAL_KEY_CODES = new Set(['KeyW', 'KeyS', 'KeyA', 'KeyD']);

let activeDom = null;

/**
 * Attaches Minecraft Editor style WASD + Space (ascend) + Shift (descend) flight
 * to an existing OrbitControls setup by translating both camera and target together.
 */
export function installFlightControls({
  controls,
  getCamera,
  domElement,
  onMove,
  getSpan = () => 30,
  listenWindows = [window],
  shouldHandle = () => true,
}) {
  if (domElement.tabIndex < 0) domElement.tabIndex = 0;

  const keys = new Set();
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const lookDir = new THREE.Vector3();
  const delta = new THREE.Vector3();
  let rafId = 0;
  let lastTime = 0;
  let lastWTapAt = 0;
  let doubleTapSprint = false;
  let pointerDownCount = 0;
  let lastShiftWheelAt = 0;

  const activate = () => {
    activeDom = domElement;
  };
  if (!activeDom) activeDom = domElement;

  const hasMoveKey = () => {
    for (const code of keys) if (MOVE_KEYS.has(code)) return true;
    return false;
  };

  const stop = () => {
    keys.clear();
    doubleTapSprint = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };

  const isEditableTarget = target => {
    if (!target || typeof target.closest !== 'function') return false;
    if (target.closest('input, textarea, [contenteditable]')) return true;
    const dialog = document.querySelector('#material-dialog');
    return Boolean(dialog && !dialog.hidden);
  };

  const isInteractiveControl = target =>
    Boolean(target && typeof target.closest === 'function' && target.closest('button, select, summary, a'));

  const isVisibleElement = el => Boolean(el?.isConnected && el.getClientRects().length > 0);

  const isOwner = () => {
    if (!isVisibleElement(domElement)) return false;
    if (activeDom && isVisibleElement(activeDom) && activeDom !== domElement) return false;
    return shouldHandle();
  };

  function step(now) {
    rafId = 0;
    if (document.hidden || !hasMoveKey() || !isOwner()) {
      if (document.hidden || !isOwner()) stop();
      return;
    }

    const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 1 / 60;
    lastTime = now;

    const camera = getCamera();
    if (!camera) return;

    const sprinting =
      doubleTapSprint ||
      keys.has('AltLeft') ||
      keys.has('AltRight') ||
      keys.has('ControlLeft') ||
      keys.has('ControlRight');

    const baseSpeed = Math.max(10, Math.min(18, Number(getSpan() || 30) * 0.16));
    const speed = baseSpeed * (sprinting ? 1.75 : 1) * dt;
    const zoomFactor = 1 + (sprinting ? 2.1 : 1.3) * dt;

    delta.set(0, 0, 0);
    camera.getWorldDirection(lookDir);
    right.set(1, 0, 0).applyQuaternion(camera.quaternion).setY(0);
    if (right.lengthSq() > 1e-6) right.normalize();

    if (camera.isOrthographicCamera) {
      const pitchY = Math.abs(lookDir.y);
      const isPlan = pitchY > 0.92;
      const isLevelElevation = pitchY < 0.15;

      // Pan horizontally along XZ in angled 3/4 views, or along screen-up in plan views.
      if (isPlan) {
        forward.set(0, 1, 0).applyQuaternion(camera.quaternion).setY(0);
      } else {
        forward.copy(lookDir).setY(0);
      }
      if (forward.lengthSq() > 1e-6) forward.normalize();

      if (isLevelElevation) {
        if (keys.has('KeyW')) camera.zoom = Math.min(controls.maxZoom || 24, camera.zoom * zoomFactor);
        if (keys.has('KeyS')) camera.zoom = Math.max(controls.minZoom || 0.2, camera.zoom / zoomFactor);
        if (keys.has('KeyW') || keys.has('KeyS')) camera.updateProjectionMatrix();
      } else {
        if (keys.has('KeyW')) delta.addScaledVector(forward, speed);
        if (keys.has('KeyS')) delta.addScaledVector(forward, -speed);
      }

      if (keys.has('KeyD')) delta.addScaledVector(right, speed);
      if (keys.has('KeyA')) delta.addScaledVector(right, -speed);

      if (isPlan) {
        // Space ascends (zooms out), Shift descends closer to blocks (zooms in).
        if (keys.has('Space')) camera.zoom = Math.max(controls.minZoom || 0.2, camera.zoom / zoomFactor);
        if (keys.has('ShiftLeft') || keys.has('ShiftRight')) {
          camera.zoom = Math.min(controls.maxZoom || 24, camera.zoom * zoomFactor);
        }
        if (keys.has('Space') || keys.has('ShiftLeft') || keys.has('ShiftRight')) {
          camera.updateProjectionMatrix();
        }
      } else {
        if (keys.has('Space')) delta.y += speed;
        if (keys.has('ShiftLeft') || keys.has('ShiftRight')) delta.y -= speed;
      }
    } else {
      // Minecraft Editor style flight: WASD moves horizontally on XZ, Space/Shift handle vertical Y.
      if (Math.abs(lookDir.y) > 0.92) {
        forward.set(0, 1, 0).applyQuaternion(camera.quaternion).setY(0);
      } else {
        forward.copy(lookDir).setY(0);
      }
      if (forward.lengthSq() > 1e-6) forward.normalize();

      if (keys.has('KeyW')) delta.addScaledVector(forward, speed);
      if (keys.has('KeyS')) delta.addScaledVector(forward, -speed);
      if (keys.has('KeyD')) delta.addScaledVector(right, speed);
      if (keys.has('KeyA')) delta.addScaledVector(right, -speed);
      const shiftHeld =
        (keys.has('ShiftLeft') || keys.has('ShiftRight')) &&
        pointerDownCount === 0 &&
        now - lastShiftWheelAt > 300;
      if (keys.has('Space')) delta.y += speed;
      if (shiftHeld) delta.y -= speed;
    }

    camera.position.add(delta);
    controls.target.add(delta);
    onMove?.();

    rafId = requestAnimationFrame(step);
  }

  function ensureLoop() {
    if (!rafId && hasMoveKey() && !document.hidden) {
      lastTime = performance.now();
      rafId = requestAnimationFrame(step);
    }
  }

  function onKeyDown(e) {
    if (e.metaKey || document.hidden || !isOwner()) return;
    if (!MOVE_KEYS.has(e.code) && !SPRINT_KEYS.has(e.code)) return;

    // Never hijack browser shortcuts (Ctrl+W/S/A/D, Alt+D).
    if (e.ctrlKey && HORIZONTAL_KEY_CODES.has(e.code)) return;
    if (e.altKey && e.code === 'KeyD') return;

    const target = e.target;
    if (isEditableTarget(target)) return;
    if (e.code === 'Space' && isInteractiveControl(target)) return;

    if (MOVE_KEYS.has(e.code)) {
      e.preventDefault();
      if (e.code === 'KeyW' && !e.repeat) {
        const now = performance.now();
        doubleTapSprint = now - lastWTapAt < 280;
        lastWTapAt = now;
      }
      keys.add(e.code);
      ensureLoop();
    } else {
      if (e.code === 'AltLeft' || e.code === 'AltRight') e.preventDefault();
      keys.add(e.code);
    }
  }

  function onKeyUp(e) {
    keys.delete(e.code);
    if (e.code === 'KeyW') doubleTapSprint = false;
    if (!hasMoveKey() && rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  function onPointerDown() {
    activate();
    pointerDownCount++;
  }
  function onPointerEnd() {
    pointerDownCount = Math.max(0, pointerDownCount - 1);
  }
  function onWheelActivity(e) {
    if (e.shiftKey) lastShiftWheelAt = performance.now();
  }

  domElement.addEventListener('pointerdown', onPointerDown);
  domElement.addEventListener('pointerup', onPointerEnd);
  domElement.addEventListener('pointercancel', onPointerEnd);
  domElement.addEventListener('wheel', onWheelActivity, { passive: true, capture: true });
  domElement.addEventListener('pointerenter', activate);
  domElement.addEventListener('focus', activate);

  const onVisibility = () => {
    if (document.hidden) stop();
  };
  document.addEventListener('visibilitychange', onVisibility);

  for (const win of listenWindows) {
    win.addEventListener('keydown', onKeyDown);
    win.addEventListener('keyup', onKeyUp);
    win.addEventListener('blur', stop);
  }

  return { stop, isActive: hasMoveKey };
}
