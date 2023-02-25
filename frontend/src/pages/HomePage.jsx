import React, { useState } from "react";
import { Button } from "@material-ui/core";
import "./Home.css";

function Home() {
  let [url, setUrl] = useState("");

  const join = () => {
    console.log("url", url);
    if (url !== "") {
      url.split("/");
      window.location.href = `/${url[url.length - 1]}`;
    } else {
      const promiseUrl = new Promise((resolve, reject) => {
        setUrl(Math.random().toString(36).substring(2, 7));
        resolve(Math.random().toString(36).substring(2, 7));
      });
      promiseUrl.then((value) => {
        window.location.href = `/${value}`;
      });
    }
  };

  return (
    <div className="container2">
      <div>
        <h1 style={{ fontSize: "45px", color: "white" }}>@attention</h1>
        <p style={{ fontWeight: "200", color: "white" }}>
          Video conference website that makes your meetings more productive
        </p>
      </div>

      <div
        style={{
          background: "white",
          width: "30%",
          height: "auto",
          padding: "20px",
          minWidth: "400px",
          textAlign: "center",
          margin: "auto",
          marginTop: "100px",
        }}>
        <p
          style={{
            margin: 0,
            fontWeight: "bold",
            textAlign: "center",
            fontSize: "30px",
          }}>
          Start a meeting
        </p>
        <Button
          variant="contained"
          color="primary"
          onClick={join}
          style={{ margin: "20px", textAlign: "center" }}>
          Go
        </Button>
      </div>
    </div>
  );
}
export default Home;
