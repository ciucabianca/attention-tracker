import React, { Component } from "react";
import { Input, Button } from "@material-ui/core";
import "./Home.css";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: "",
    };
  }

  handleChange = (e) => this.setState({ url: e.target.value });

  join = () => {
    if (this.state.url !== "") {
      var url = this.state.url.split("/");
      window.location.href = `/${url[url.length - 1]}`;
    } else {
      var url = Math.random().toString(36).substring(2, 7);
      window.location.href = `/${url}`;
    }
  };

  render() {
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
            onClick={this.join}
            style={{ margin: "20px", textAlign: "center" }}>
            Go
          </Button>
        </div>
      </div>
    );
  }
}

export default Home;
