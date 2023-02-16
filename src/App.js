import React, { useRef, useEffect } from "react";
import "./App.css";
import { drawMesh, displayIrisPosition } from "./util";
import * as tf from "@tensorflow/tfjs-core";
import * as facemesh from "@tensorflow-models/face-landmarks-detection";
import "@tensorflow/tfjs-backend-webgl";
import Webcam from "react-webcam";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const runFaceMesh = async () => {
    const model = facemesh.SupportedPackages.mediapipeFacemesh;
    // const detectorConfig = {
    //   runtime: "tfjs",
    //   solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh",
    // };
    const detector = await facemesh.load(model);
    setInterval(() => {
      detect(detector);
    }, 10);
  };
  const detect = async (detector) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const predictions = await detector.estimateFaces({
        input: video,
        returnTensors: false,
        flipHorizontal: false,
        predictIrises: true,
      });

      const ctx = canvasRef.current.getContext("2d");
      requestAnimationFrame(() => {
        drawMesh(predictions, ctx);
        // displayIrisPosition(predictions, ctx);
      });
      console.log("predictions " + JSON.stringify(predictions, null, 4));

      //console.log("direction " + direction);
    }
  };

  useEffect(() => {
    runFaceMesh();
  });

  return (
    <div className="App">
      <div className="App">
        <header className="App-header">
          <Webcam
            ref={webcamRef}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 0,
              right: 0,
              textAlign: "center",
              zindex: 9,
              width: 640,
              height: 480,
            }}
          />

          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 0,
              right: 0,
              textAlign: "center",
              zindex: 9,
              width: 640,
              height: 480,
            }}
          />
        </header>
      </div>
    </div>
  );
}

export default App;
