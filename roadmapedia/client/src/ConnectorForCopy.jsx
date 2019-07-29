import React, { Component } from "react";
import { Arrow } from "react-konva";
class Connector extends Component {
  getConnectorPoints = stuff => {
    var points = stuff.points;
    var from = stuff.from;
    var to = stuff.to;
    var mouseX = stuff.mouseX;
    var mouseY = stuff.mouseY;
    var point = { x: mouseX, y: mouseY };

    if (stuff.type === "FromAndTo") {
      if (to.attrs.name.includes("rect") && from.attrs.name.includes("rect")) {
        //only works for rect because the calculation for origin is different for circle and rect
        var dy =
          to.attrs.y +
          to.attrs.width / 2 -
          (from.attrs.y + from.attrs.width / 2);
        var dx =
          to.attrs.x +
          to.attrs.width / 2 -
          (from.attrs.x + from.attrs.width / 2);
        var theta = Math.atan2(dy, dx);
        let angle = (theta / Math.PI) * 180;

        if (angle <= 45 && angle >= -45) {
          points[0] += from.attrs.width;
          points[1] += from.attrs.width / 2;
          points[3] += to.attrs.width / 2;
        } else if (angle > 45 && angle < 135) {
          points[0] += from.attrs.width / 2;
          points[1] += from.attrs.width;
          points[2] += to.attrs.width / 2;
        } else if (
          (angle > 135 && angle < 180) ||
          (angle > -180 && angle < -135)
        ) {
          points[1] += from.attrs.width / 2;
          points[2] += to.attrs.width;
          points[3] += to.attrs.width / 2;
        } else if (angle < -45 && angle > -135) {
          points[0] += from.attrs.width / 2;
          points[3] += to.attrs.width;
          points[2] += to.attrs.width / 2;
        }
      }
      if (
        to.attrs.name.includes("circle") &&
        from.attrs.name.includes("circle")
      ) {
        //two circles
        var origin = { x: from.attrs.x, y: from.attrs.y };
        const dy = points[3] - points[1];
        const dx = points[2] - points[0];
        let angle = Math.atan2(-dy, dx);
        points[0] += -from.attrs.radius * Math.cos(angle + Math.PI);
        points[1] += from.attrs.radius * Math.sin(angle + Math.PI);
        points[2] += to.attrs.radius * Math.cos(angle + Math.PI);
        points[3] -= to.attrs.radius * Math.sin(angle + Math.PI);
      } else if (
        to.attrs.name.includes("rect") &&
        from.attrs.name.includes("circle")
      ) {
      }
    }

    if (stuff.type === "onlyFrom") {
      if (from.attrs.name.includes("rect")) {
        var origin = {
          x: from.attrs.x + from.attrs.width / 2,
          y: from.attrs.y + from.attrs.width / 2
        };
        var dy = point.y - origin.y;
        var dx = point.x - origin.x;
        var theta = Math.atan2(dy, dx);
        var angle = (theta / Math.PI) * 180;
        if (angle <= -45 && angle >= -135) {
          //top
          points[0] += from.attrs.width / 2;
        } else if (angle > 45 && angle < 135) {
          //bottom
          points[0] += from.attrs.width / 2;
          points[1] += from.attrs.width;
        } else if (
          (angle > 135 && angle < 180) ||
          (angle > -180 && angle < -135)
        ) {
          //left
          points[1] += from.attrs.width / 2;
        } else if (angle > -45 && angle < 45) {
          points[0] += from.attrs.width;
          points[1] += from.attrs.width / 2;
        }
      } else if (from.attrs.name.includes("circle")) {
        var origin = {
          x: from.attrs.x,
          y: from.attrs.y
        };

        const dy = points[3] - points[1];
        const dx = points[2] - points[0];
        let angle = Math.atan2(-dy, dx);

        //  console.log("we messing with a circle", points, angle, from);

        points[0] += -from.attrs.radius * Math.cos(angle + Math.PI);
        points[1] += from.attrs.radius * Math.sin(angle + Math.PI);
      }
    } else if (stuff.type === "onlyTo") {
      if (to.attrs.name.includes("rect")) {
        var endPoint = { x: points[0], y: points[1] };
        var origin = {
          x: to.attrs.x + to.attrs.width / 2,
          y: to.attrs.y + to.attrs.width / 2
        };

        var dy = endPoint.y - origin.y;
        var dx = endPoint.x - origin.x;
        var theta = Math.atan2(dy, dx);
        var angle = (theta / Math.PI) * 180;



        if (angle > 45 && angle < 135) {
          points[2] += to.attrs.width / 2;
          points[3] += to.attrs.width;
        } else if (
          (angle > 135 && angle < 180) ||
          (angle > -180 && angle < -135)
        ) {
          points[3] += to.attrs.width / 2;
        } else if (angle > -135 && angle < -45) {
          points[2] += to.attrs.width / 2;
        } else {
          points[2] += to.attrs.width;
          points[3] += to.attrs.width / 2;
        }
      } else if (to.attrs.name.includes("circle")) {
        const dy = points[3] - points[1];
        const dx = points[2] - points[0];
        let angle = Math.atan2(-dy, dx);
        //      console.log(dy, dx);

        points[2] += to.attrs.radius * Math.cos(angle + Math.PI);
        points[3] -= to.attrs.radius * Math.sin(angle + Math.PI);
      }
    }

    return points;
  };

  render() {
    const fromShape = this.props.from;

    var points = null;

    if (this.props.current) {
      if (this.props.from) {
        points = [
          this.props.from.attrs.x,
          this.props.from.attrs.y,
          this.props.arrowEndX,
          this.props.arrowEndY
        ];
        let stuff = {
          points: points,
          from: this.props.from,
          mouseX: this.props.arrowEndX,
          mouseY: this.props.arrowEndY,
          type: "onlyFrom"
        };
        points = this.getConnectorPoints(stuff);
      } 
    }
    if (this.props.current == false) {
      if (this.props.from && this.props.to) {
        points = [
          this.props.from.attrs.x,
          this.props.from.attrs.y,
          this.props.to.attrs.x,
          this.props.to.attrs.y
        ];

        let toSend = {
          points: points,
          from: this.props.from,
          to: this.props.to,
          type: "FromAndTo"
        };
        points = this.getConnectorPoints(toSend);

        //get connector points
      } else if (this.props.from) {
        points = [
          this.props.from.attrs.x,
          this.props.from.attrs.y,
          this.props.points[2],
          this.props.points[3]
        ];

        let endPoint = { x: this.props.points[2], y: this.props.points[3] };
        let from = this.props.from;
        let origin = {
          x: from.attrs.x + from.attrs.width / 2,
          y: from.attrs.y + from.attrs.width / 2
        };

        var dy = endPoint.y - origin.y;
        var dx = endPoint.x - origin.x;
        var theta = Math.atan2(dy, dx);
        let angle = (theta / Math.PI) * 180;

        if (angle <= -45 && angle >= -135) {
          //top
          points[0] += from.attrs.width / 2;
        } else if (angle > 45 && angle < 135) {
          //bottom
          points[0] += from.attrs.width / 2;
          points[1] += from.attrs.width;
        } else if (
          (angle > 135 && angle < 180) ||
          (angle > -180 && angle < -135)
        ) {
          //left
          points[1] += from.attrs.width / 2;
        } else if (angle > -45 && angle < 45) {
          points[0] += from.attrs.width;
          points[1] += from.attrs.width / 2;
        }
      } else if (this.props.to) {

        points = [
          this.props.points[0],
          this.props.points[1],
          this.props.to.attrs.x,
          this.props.to.attrs.y
        ];

        let stuff = {
          points: points,
          to: this.props.to,
          type: "onlyTo",
          mouseX: this.props.to.attrs.x,
          mouseY: this.props.to.attrs.y
        };
        points = this.getConnectorPoints(stuff);
      }
    }
    return (
      <Arrow
        name={this.props.name}
        points={points}
        stroke="black"
        fill="black"
        strokeWidth={1}
      />
    );
  }
}

export default Connector;
