import React, { useRef, useEffect } from "react";
import "./App.css";
//import { drawMesh, displayIrisPosition} from "./util";
import { normalize, isFaceRotated } from "./util";
//import * as tf from "@tensorflow/tfjs-core";
import * as facemesh from "@tensorflow-models/face-landmarks-detection";
import "@tensorflow/tfjs-backend-webgl";
import Webcam from "react-webcam";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  let positionXLeftIris;
  let positionYLeftIris;
  let event;

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

      // const ctx = canvasRef.current.getContext("2d");
      // requestAnimationFrame(() => {
      //   // drawMesh(predictions, ctx);
      //   //displayIrisPosition(predictions, ctx);
      // });
      //  console.log("predictions " + JSON.stringify(predictions, null, 4));
      const event = await renderPrediction(predictions, webcamRef);
      console.log("direction " + event);
    }
  };

  useEffect(() => {
    runFaceMesh();
  });

  async function renderPrediction(predictions, webcamRef) {
    if (predictions.length > 0) {
      predictions.forEach((prediction) => {
        positionXLeftIris = prediction.annotations.leftEyeIris[0][0];
        positionYLeftIris = prediction.annotations.leftEyeIris[0][1];

        const faceBottomLeftX =
          webcamRef.current.video.width - prediction.boundingBox.bottomRight[0]; // face is flipped horizontally so bottom right is actually bottom left.
        const faceBottomLeftY = prediction.boundingBox.bottomRight[1];

        const faceTopRightX =
          webcamRef.current.video.width - prediction.boundingBox.topLeft[0]; // face is flipped horizontally so top left is actually top right.
        const faceTopRightY = prediction.boundingBox.topLeft[1];

        if (
          faceBottomLeftX > 0 &&
          !isFaceRotated(prediction.annotations, webcamRef)
        ) {
          const positionLeftIrisX =
            webcamRef.current.video.width - positionXLeftIris;
          const normalizedXIrisPosition = normalize(
            positionLeftIrisX,
            faceTopRightX,
            faceBottomLeftX
          );
          const normalizedYIrisPosition = normalize(
            positionYLeftIris,
            faceTopRightY,
            faceBottomLeftY
          );

          if (normalizedXIrisPosition > 0.34) {
            event = "RIGHT";
          } else if (normalizedXIrisPosition < 0.28) {
            event = "LEFT";
          }
          if (normalizedYIrisPosition > 0.7) {
            event = "TOP";
          } else if (
            normalizedYIrisPosition < 0.6 &&
            normalizedXIrisPosition < 0.4 &&
            normalizedXIrisPosition > 0.3
          ) {
            event = "STRAIGHT";
          }
        }
      });
    }
    return event;
  }
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
