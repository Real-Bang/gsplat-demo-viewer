import { ReactEventHandler, useEffect, useState } from "react";
import { ReactCompareSlider } from "react-compare-slider";
import "./App.css";
import ThreeScene from "./ThreeScene";
import ThreeSplatScene from "./ThreeSplatScene";

interface ComparableModel {
  name: string;
  path: string;
}

function App() {
  const [models, setModels] = useState<ComparableModel[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [selectedModelPath, setSelectedModelPath] = useState<string | null>();
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      const models: ComparableModel[] = await fetch("/list.json")
        .then((res) => res.text())
        .then((text) => JSON.parse(text));
      setModels(models);
      if (models.length != 0) setSelectedModelPath(models[0].path);
      setIsReady(true);
    })();
  }, []);

  const selectModel: ReactEventHandler<HTMLSelectElement> = (e) => {
    setSelectedModelPath(e.currentTarget.value);
  };

  const submit = () => {
    setIsSubmitted(true);
  };

  return (
    <>
      {isReady ? (
        isSubmitted && selectedModelPath != null ? (
          <ReactCompareSlider
            onlyHandleDraggable={true}
            itemOne={<ThreeScene src={`${selectedModelPath}model.glb`} />}
            itemTwo={
              <ThreeSplatScene src={`${selectedModelPath}point_cloud.ply`} />
            }
          ></ReactCompareSlider>
        ) : (
          <div className="w-screen h-screen grid place-content-center">
            <div className="flex flex-row gap-4 items-center">
              <select
                onChange={selectModel}
                className="w-32 h-8 border-solid border-2 border-black rounded"
              >
                {models.map((model) => {
                  return (
                    <option key={model.name} value={model.path}>
                      {model.name}
                    </option>
                  );
                })}
              </select>

              <button
                className="rounded px-4 py-2 text-indigo-50 bg-indigo-500 hover:brightness-95 active:brightness-90"
                onClick={submit}
              >
                {"Start ->"}
              </button>
            </div>
          </div>
        )
      ) : (
        <div>wait</div>
      )}
    </>
  );
}

export default App;
