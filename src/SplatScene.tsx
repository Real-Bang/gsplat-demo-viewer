import * as SPLAT from "gsplat";
import useWindowSize from "./hooks/useWindowSize";
import { useEffect, useRef, useState } from "react";

export default function SplatScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const windowSize = useWindowSize();

  const scene = useRef<SPLAT.Scene>(new SPLAT.Scene());
  const camera = useRef<SPLAT.Camera>(new SPLAT.Camera());

  const [renderer, setRenderer] = useState<SPLAT.WebGLRenderer | null>();
  const [controls, setControls] = useState<SPLAT.OrbitControls | null>();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (canvasRef.current != null) {
      const renderer = new SPLAT.WebGLRenderer(canvasRef.current);
      const controls = new SPLAT.OrbitControls(
        camera.current,
        canvasRef.current
      );
      setRenderer(renderer);
      setControls(controls);
      SPLAT.PLYLoader.LoadAsync("/point_cloud.ply", scene.current).then(() => {
        setIsReady(true);
      });
    }
  }, []);

  const animationFrameId = useRef(-1);
  const draw = () => {
    if (renderer != null && scene != null) {
      controls?.update();
      renderer.render(scene.current, camera.current);
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

  return <canvas ref={canvasRef} {...windowSize}></canvas>;
}
