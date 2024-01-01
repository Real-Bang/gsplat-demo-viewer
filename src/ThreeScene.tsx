import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
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

export default function ThreeScene({ src }: { src: string }) {
  const scene = useThreeScene();
  const windowSize = useWindowSize();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // const camera =
  const { camera } = useThreeCamera();
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  // const viewer = useRef<Gsplat.Viewer>(null);
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

      let light = new THREE.PointLight(0xffffff, 100); //조명
      light.position.copy(new THREE.Vector3().fromArray([0, 0, 0]));
      scene.add(light);

      if (src.match(/obj$/)) {
        const loader = new OBJLoader();
        // const materialLoader = new MTLLoader();
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
          "/sugarfine_3Dgs7000_sdfestim02_sdfnorm02_level03_decim1000000_normalconsistency01_gaussperface1.png",
          function (texture) {
            loader.load(src, function (object) {
              object.traverse(function (child) {
                //@ts-ignore
                if (child instanceof THREE.Mesh) {
                  console.log(child);
                  //@ts-ignore
                  // child.material = child.material.clone();
                  //@ts-ignore
                  child.material.map = texture;
                  texture.needsUpdate = true;
                }
              });
              scene.add(object);
              console.log(object);
              setIsReady(true);
            });
            // materialLoader.load(
            //   "/sugarfine_3Dgs7000_sdfestim02_sdfnorm02_level03_decim1000000_normalconsistency01_gaussperface1.mtl",
            //   function (materials) {
            //     materials.preload();
            //     loader.setMaterials(materials);
            //     // loader.setResourcePath("/");
            //     console.log(materials);

            //   }
            // );
          }
        );
        // textureLoader.load(
        //   "/sugarfine_3Dgs7000_sdfestim02_sdfnorm02_level03_decim1000000_normalconsistency01_gaussperface1.png",
        //   function (texture) {

        //   }
        // );
      } else if (src.match(/gltf$|glb$/)) {
        console.log(src);
        const loader = new GLTFLoader();
        loader.load(
          src,
          function (gltf) {
            scene.add(gltf.scene);
            setIsReady(true);
          },
          undefined,
          function (e) {
            console.error(e);
          }
        );
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
