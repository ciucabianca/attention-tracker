import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
//import AssignmentIcon from "@material-ui/icons/Assignment";
import PhoneIcon from "@material-ui/icons/Phone";

import Peer from "simple-peer";
import io from "socket.io-client";

import React, { useEffect, useRef, useState } from "react";
import "./App.css";
//import { drawMesh, displayIrisPosition} from "./util";
import { normalize, isFaceRotated } from "./util";
//import * as tf from "@tensorflow/tfjs-core";
import * as facemesh from "@tensorflow-models/face-landmarks-detection";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-cpu";
import Webcam from "react-webcam";

const socket = io.connect("http://localhost:5000");

function App() {
  const [me, setMe] = useState("");
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");

  const webcamRef = useRef({});
  //const canvasRef = useRef(null);

  const userVideo = useRef();
  const connectionRef = useRef();

  let positionXLeftIris;
  let positionYLeftIris;
  let event;

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        webcamRef.current.srcObject = stream;
        runFaceMesh();
      });

    socket.on("me", (id) => {
      setMe(id);
    });

    socket.on("callUser", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });
  }, []);

  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name: name,
      });
    });

    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller });
    });

    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  };

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

      // canvasRef.current.width = videoWidth;
      // canvasRef.current.height = videoHeight;

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
          if (
            normalizedYIrisPosition < 0.6 &&
            normalizedXIrisPosition < 0.34 &&
            normalizedXIrisPosition > 0.28
          ) {
            event = "STRAIGHT";
          } else if (normalizedYIrisPosition > 0.7) {
            event = "TOP";
          }
        }
      });
    }
    return event;
  }

  return (
    <>
      <h1 style={{ textAlign: "center", color: "#fff" }}>Not Zoom</h1>
      <div className="container">
        <div className="video-container">
          <div className="video">
            {stream && (
              <Webcam
                playsInline
                muted
                ref={webcamRef}
                autoPlay
                style={{ width: "400px" }}
              />
            )}
          </div>
          <div className="video">
            {callAccepted && !callEnded ? (
              <Webcam
                playsInline
                ref={userVideo}
                autoPlay
                style={{ width: "400px" }}
              />
            ) : null}
          </div>
        </div>
        <div className="myId">
          <TextField
            id="filled-basic"
            label="Name"
            variant="filled"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginBottom: "20px" }}
          />

          <TextField
            id="filled-basic"
            label="ID to call"
            variant="filled"
            value={idToCall}
            onChange={(e) => setIdToCall(e.target.value)}
          />
          <div className="call-button">
            {callAccepted && !callEnded ? (
              <Button variant="contained" color="secondary" onClick={leaveCall}>
                End Call
              </Button>
            ) : (
              <IconButton
                color="primary"
                aria-label="call"
                onClick={() => callUser(idToCall)}>
                <PhoneIcon fontSize="large" />
              </IconButton>
            )}
            {idToCall}
          </div>
        </div>
        <div>
          {receivingCall && !callAccepted ? (
            <div className="caller">
              <h1>{name} is calling...</h1>
              <Button variant="contained" color="primary" onClick={answerCall}>
                Answer
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

export default App;
