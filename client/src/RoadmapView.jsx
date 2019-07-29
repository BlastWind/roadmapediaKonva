import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { Segment, Button } from "semantic-ui-react";
import axios from "axios";
import {
  Stage,
  Layer,
  Rect,
  Transformer,
  Ellipse,
  Circle,
  Star,
  Text,
  Arrow
} from "react-konva";
import "./RoadmapView.css";
class RoadmapView extends Component {
  constructor(props) {
    super(props);
    this.state = { roadmap: null, show: true };
  }

  async componentDidMount() {
    //get relative URL with this.props.histoyr.path.name and then slice
    //then do a post request to retrieve roadmap data,
    var path = this.props.history.location.pathname.slice(9);
    await fetch("/api/roadmap/getRoadmapById", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roadmapId: path })
    }).then(res => {
      res.json().then(roadmap => {
        let data = roadmap;
        data.data = JSON.parse(data.data);
        console.log(data);
        this.setState(
          {
            _id: data._id,
            roadmap: data.data,
            hearts: data.hearts,
            title: data.title,
            views: data.views,
            author_id: data.author_id,
            category: data.category,
            date: data.date
          },
          () => {
            console.log(this.state);
            fetch("/api/users/getUserById", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: this.state.author_id })
            }).then(res =>
              res.json().then(authorInfo => {
                console.log(authorInfo.profilePic);
                this.setState(
                  {
                    date: authorInfo.date,
                    name: authorInfo.name,
                    profilePic:
                      "data:image/jpeg;base64," + authorInfo.profilePic
                  },
                  () => {
                    console.log(this.state);
                  }
                );
              })
            );
          }
        );
      });
    });
  }

  saveRoadmapToUser = () => {
    if (this.props.auth.isAuthenticated) {
      fetch("/api/users/saveRoadmapToUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roadmapId: this.state._id,
          userId: this.props.auth.user.id
        })
      });
    } else {
      console.log(this.props.auth);
      alert("show modal here");
    }
  };

  render() {
    let content;

    if (this.state.roadmap) {
      content = (
        <div>
          <img
            src={this.state.profilePic}
            style={{ width: "50px", height: "50px", borderRadius: "50%" }}
          />
          <div>Username: {this.state.name}</div>

          <div>
            <Button onClick={this.saveRoadmapToUser}>
              Star and save this roadmap!
            </Button>
          </div>
        </div>
      );
    } else {
      content = <div>content</div>;
    }

    return (
      <div>
        {this.state.roadmap ? (
          <React.Fragment>
            <Stage
              height={window.innerHeight}
              width={window.innerWidth}
              draggable
            >
              <Layer height={window.innerHeight} width={window.innerWidth}>
                {this.state.roadmap.rects.map(eachRect => (
                  <Rect
                    x={eachRect.x}
                    y={eachRect.y}
                    fill={eachRect.fill}
                    width={eachRect.width}
                    height={eachRect.height}
                    stroke={eachRect.stroke}
                    strokeWidth={eachRect.strokeWidth}
                    rotation={eachRect.rotation}
                  />
                ))}
                {this.state.roadmap.ellipses.map(eachEllipse => (
                  <Ellipse
                    x={eachEllipse.x}
                    y={eachEllipse.y}
                    fill={eachEllipse.fill}
                    radiusX={eachEllipse.radiusX}
                    radiusY={eachEllipse.radiusY}
                    stroke={eachEllipse.stroke}
                    strokeWidth={eachEllipse.strokeWidth}
                    rotation={eachEllipse.rotation}
                  />
                ))}
                {this.state.roadmap.stars.map(eachStar => (
                  <Star
                    x={eachStar.x}
                    y={eachStar.y}
                    innerRadius={eachStar.innerRadius}
                    outerRadius={eachStar.outerRadius}
                    fill={eachStar.fill}
                    stroke={eachStar.stroke}
                    strokeWidth={eachStar.strokeWidth}
                    rotation={eachStar.rotation}
                  />
                ))}
                {this.state.roadmap.texts.map(eachText => (
                  <Text
                    fontFamily={eachText.fontFamily}
                    fontSize={eachText.fontSize}
                    text={eachText.text}
                    x={eachText.x}
                    y={eachText.y}
                    fill={eachText.fill}
                    width={eachText.width}
                    height={eachText.height}
                    stroke={eachText.stroke}
                    strokeWidth={eachText.strokeWidth}
                    rotation={eachText.rotation}
                  />
                ))}
                {this.state.roadmap.arrows.map(eachArrow => (
                  <Arrow
                    x={eachArrow.x}
                    y={eachArrow.y}
                    fill={eachArrow.fill}
                    points={eachArrow.points}
                    stroke={eachArrow.stroke}
                    strokeWidth={eachArrow.strokeWidth}
                  />
                ))}
              </Layer>
            </Stage>
            <Segment.Group id="roadmapFloat" className="roadmapFloatShow">
              <Segment
                style={{
                  height: window.innerHeight,
                  overflow: "auto"
                }}
              >
                {content}
              </Segment>
            </Segment.Group>
            <div
              style={{
                position: "absolute",
                top: window.innerHeight / 2,
                width: "25px",
                height: "50px",
                backgroundColor: "white",
                borderBottomLeftRadius: "200px",
                borderTopLeftRadius: "200px",
                border: "2px solid gray",
                borderRight: "0"
              }}
              className={this.state.show ? "show" : "hide"}
              ref={() => {
                this.top =
                  document
                    .getElementById("roadmapFloat")
                    .getBoundingClientRect().height / 2;
              }}
              onClick={() => {
                const roadmapFloat = document.getElementById("roadmapFloat");
                roadmapFloat.classList.toggle("roadmapFloatHide");
                //at first collapsed, set to uncollpased
                this.setState({ show: !this.state.show });
              }}
            >
              <div
                style={{
                  marginLeft: "10px",
                  marginTop: "16px",
                  width: 0,
                  height: 0,
                  borderStyle: "solid",
                  borderWidth: "5px 8.7px 5px 0",
                  borderColor: "transparent gray transparent transparent"
                }}
              />
            </div>
          </React.Fragment>
        ) : (
          <div>loading, no roadmap yettt!</div>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth
});
export default connect(mapStateToProps)(withRouter(RoadmapView));
