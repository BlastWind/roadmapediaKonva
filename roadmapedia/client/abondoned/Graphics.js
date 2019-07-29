import React, { Component } from "react";
import { scaleOrdinal } from "d3-scale";
import { arc as D3Arc, pie as d3Pie } from "d3-shape";
import { csvParse } from "d3-dsv";
import * as d3 from "d3";
import logo from "./logo.png";

class Graphics extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const rectWidth = 500,
      rectHeight = 500,
      svgWidth = 1500,
      svgHeight = 500;

    var svg = d3
      .select(".for-svg")
      .append("svg")
      .attr("class", "mySvg")
      .attr("width", svgWidth)
      .attr("height", svgHeight);

    var rect = svg
      .append("g")
      .attr("class", "toolbar")
      .append("rect")
      .attr("width", rectWidth)
      .attr("height", rectHeight)
      .style("fill", "white")
      .attr("stroke", "blue");

    var drag = d3.drag().on("drag", function() {
      d3.select(this)
        .attr("cx", d3.event.x)
        .attr("cy", d3.event.y);
    });

    var dragdrop = d3
      .drag()
      .on("start", function() {
        const uh = d3.select(this.parentNode);
        uh.append("circle")
          .attr("class", "draggableCircle")

          .attr("r", 20)
          .attr("cx", 50)
          .attr("cy", 50)
          .on("click", function(d, i) {
            d3.select(this).remove();
          });
      })
      .on("drag", function() {
        const uh = d3
          .selectAll(".draggableCircle")
          .filter(function(d, i) {
            const uh = d3.select(this.parentNode);

            const numChildren = uh._groups[0][0].children.length;
    console.log(i);
            //make numChildren - 2 = i
            return i == numChildren - 2;

          }) //first element index 0,

          .attr("cx", function(d, i) {
            const uh = d3.select(this.parentNode);

            const numChildren = uh._groups[0][0].children.length;

            return d3.event.x;
          })
          .attr("cy", function(d) {
            return d3.event.y;
          });
      })
      .on("end", function() {
        const endCircle = d3
          .selectAll(".draggableCircle")
          .filter(function(d, i) {
            const uh = d3.select(this.parentNode);

            const numChildren = uh._groups[0][0].children.length;

            //make numChildren - 2 = i
            return i == numChildren - 2;
          });

        const endX = endCircle.attr("cx");

        if (endX <= 500) {
          d3.selectAll(".draggableCircle")
            .filter(function(d, i) {
              const uh = d3.select(this.parentNode);

              const numChildren = uh._groups[0][0].children.length;

              //make numChildren - 2 = i
              return i == numChildren - 2;
            })
            .remove();
        }
      });

    var staticCircle = d3
      .select(".toolbar")
      .append("g")
      .append("circle")
      .attr("class", "staticCircle")
      .attr("r", 10)
      .attr("cx", 150)
      .attr("cy", 150)
      .on("click", function(d) {

      })
      .call(dragdrop);

    /*    var dragDropRect = svg
      .append("g")
      .append("circle")
      .attr("r", 20)

      .call(drag);}
*/
  }
  componentDidUpdate() {}

  render() {
    //define consts and data here
    const width = 900,
      height = 600;

    return <div class="for-svg" />;
  }
}

export default Graphics;
