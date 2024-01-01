import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// @ts-ignore
import * as Gsplat from "@mkkellogg/gaussian-splats-3d";
import useThreeCamera from "./hooks/useThreeCamera";
import useWindowSize from "./hooks/useWindowSize";

function useThreeScene() {
  const [scene, setScene] = useState<THREE.Scene | null>(null);

  useEffect(() => {
    const newScene = new THREE.Scene();
    newScene.background = new THREE.Color("#ffffff");
    setScene(newScene);
    return () => {
      // !TODO: dispose the scene
    };
  }, []);

  return scene;
}

export default function ThreeSplatScene({ src }: { src: string }) {
  const scene = useThreeScene();
  const windowSize = useWindowSize();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // const camera =
  const { camera } = useThreeCamera();
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const viewer = useRef<Gsplat.Viewer>(null);
  const [controls, setControls] = useState<OrbitControls | null>(null);

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (scene != null && canvasRef.current != null) {
      const newRenderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
        // alpha: false,
      });
      newRenderer.setClearColor(0xffffff, 100);
      newRenderer.setSize(windowSize.width, windowSize.height);

      const newControls = new OrbitControls(camera, canvasRef.current);
      newControls.screenSpacePanning = true;
      newControls.update();

      if (src.match(/splat$|ply$/)) {
        console.log(src);
        viewer.current = new Gsplat.Viewer({
          selfDrivenMode: false,
          renderer: newRenderer,
          scene: scene,
          camera: camera,
          useBuiltInControls: false,
          controls: newControls,
        });
        viewer.current.addSplatScene(src).then(() => {
          setIsReady(true);
        });
      }
      setRenderer(newRenderer);
      setControls(newControls);
    }
  }, [scene]);
  useEffect(() => {
    if (scene != null && renderer != null) {
      renderer.setSize(windowSize.width, windowSize.height);
      camera.aspect = windowSize.width / windowSize.height;
      camera.updateProjectionMatrix();
      controls?.update();
    }
  }, [windowSize]);

  const animationFrameId = useRef(-1);
  const draw = () => {
    if (renderer != null && scene != null && controls != null) {
      controls.update();
      renderer.render(scene, camera);
      if (viewer.current != null) {
        viewer.current.update();
        viewer.current.render();
      }
    }
    animationFrameId.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    if (isReady) {
      animationFrameId.current = requestAnimationFrame(draw);
    }
    return () => {
      if (animationFrameId.current != -1) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isReady]);
  return <canvas ref={canvasRef}></canvas>;
}
