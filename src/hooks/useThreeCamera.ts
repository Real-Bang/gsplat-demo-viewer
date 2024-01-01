import * as THREE from "three";
import { create } from "zustand";
const useThreeCamera = create(() => {
  const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    500
  );
  camera.position.copy(new THREE.Vector3().fromArray([-1, -4, 6]));
  camera.up = new THREE.Vector3().fromArray([0, -1, -0.6]).normalize();
  camera.lookAt(new THREE.Vector3().fromArray([0, 4, -0]));
  return {
    camera,
  };
});

export default useThreeCamera;
