import React, { Component } from "react";
import "./Landing.css";
import react from "./react.svg";
import R from "./R.png";
import { Link } from "react-router-dom";

class Landing extends Component {
  render() {
    return (
      <div>
        <div class="gradient" style={{ height: "40rem" }}>
          <div class="logo" style={{ height: "100%" }}>
            <Link to="/home">
              <img
                src={R}
                class="foreground"
                style={{ height: "200px", left: "30rem", top: "20%" }}
              />
            </Link>
            <img
              src={react}
              class="foregroundRotate"
              style={{ height: "25px", left: "10.5em", top: "34%" }}
            />

            <img
              src={react}
              class="background"
              style={{ height: "30px", left: "57%", top: "60%" }}
            />
          </div>
        </div>
        <Link to="/home">
          <div>
            <button class="goButton" style={{ height: "60px", width: "270px" }}>
              Let's go
            </button>
          </div>
        </Link>
      </div>
    );
  }
}

export default Landing;
