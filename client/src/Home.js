import React, { Component } from "react";
import { Card, Image, Icon } from "semantic-ui-react";
import react from "./react.svg";
import MediaQuery from "react-responsive";
import HomeNav from "./HomeNav.js";
import axios from "axios";
import cloudPic from "./upload.svg";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { setModalState } from "./actions/authActions";
//currently incorrect, getAllRoadaps should only return ID & thumbnail
//right now, getAllRoadmaps is also returning the data,

class Home extends Component {
  state = { imageSrc: cloudPic, roadmaps: [] };

  async componentDidMount() {
    console.log(this.props.history);

    if (this.props.history.location.state) {
      this.props.setModalState(true);
    }

    await fetch("/api/roadmap/getAllRoadmapsButThumbnails", { method: "GET" })
      .then(res => {
        res.json().then(roadmaps => {
          let data = [];
          roadmaps.forEach(roadmap => {
            var json = roadmap;
            json.data = JSON.parse(roadmap.data);

            data.push(json);
          });
          this.setState({ roadmaps: data });
        });
      })

      .catch(err => console.log(err));

    await fetch("/api/roadmap/getAllRoadmapsThumbnails", { method: "GET" })
      .then(res => {
        res.json().then(thumbnails => {
          console.log(thumbnails);
          //roadmaps: [[roadmap1], [roadmap2], ..]
          var base64Flag = "data:image/jpeg;base64,";
          thumbnails.forEach((thumbnail, index) => {
            console.log(thumbnail);
            var imgStr = this.arrayBufferToBase64(
              thumbnail.thumbnail.data.data
            );
            console.log("imgStr: ", imgStr);
            this.state.roadmaps[index].convertedThumbnail = base64Flag + imgStr;

            this.forceUpdate();
          });
        });
      })
      .catch(err => console.log(err));
  }

  arrayBufferToBase64 = buffer => {
    var binary = "";
    var bytes = [].slice.call(new Uint8Array(buffer));
    bytes.forEach(b => (binary += String.fromCharCode(b)));
    return window.btoa(binary);
  };

  render() {
    const CardGroupStyle = {
      maxWidth: "80rem",
      marginLeft: "auto",
      marginRight: "auto",
      marginTop: "3rem"
    };
    const ImageStyle = {
      width: "384px",
      height: "auto"
    };
    const ContentStyle = {
      paddingTop: "22px",
      paddingBottom: "18px"
    };
    const CardStyle = {
      maxWidth: "384px",
      cursor: "pointer"
    };

    const CardGroupStyleMid = {
      width: "95%",
      height: "auto",
      marginLeft: "auto",
      marginRight: "auto",
      marginTop: "3rem"
    };

    //CSS BREAKPOINTS: 576px, 768px,  1200px
    return (
      <React.Fragment>
        <HomeNav />
        <div>
          <Card.Group centered style={CardGroupStyle}>
            {this.state.roadmaps.length === 0 ? (
              <React.Fragment>
                <Card
                  style={CardStyle}
                  onClick={() => {
                    console.log("nani???");
                  }}
                >
                  <Icon
                    loading
                    name="circle notch"
                    size="massive"
                    color="black"
                  />
                  <Card.Content style={ContentStyle}>
                    <Card.Header>Loading...</Card.Header>
                    <Card.Description>Loading...</Card.Description>
                  </Card.Content>
                </Card>
                <Card style={CardStyle}>
                  <Icon
                    loading
                    name="circle notch"
                    size="massive"
                    color="black"
                  />
                  <Card.Content style={ContentStyle}>
                    <Card.Header>Loading...</Card.Header>
                    <Card.Description>Loading...</Card.Description>
                  </Card.Content>
                </Card>
                <Card style={CardStyle}>
                  <Icon
                    loading
                    name="circle notch"
                    size="massive"
                    color="black"
                  />
                  <Card.Content style={ContentStyle}>
                    <Card.Header>Loading...</Card.Header>
                    <Card.Description>Loading...</Card.Description>
                  </Card.Content>
                </Card>
              </React.Fragment>
            ) : (
              this.state.roadmaps.map((eachRoadmap, index) => (
                <Card
                  style={CardStyle}
                  onClick={() => {
                    console.log(eachRoadmap);
                    this.props.history.push(`/roadmap/${eachRoadmap._id}`);
                  }}
                >
                  {eachRoadmap.convertedThumbnail ? (
                    <Image
                      src={eachRoadmap.convertedThumbnail}
                      style={ImageStyle}
                    />
                  ) : (
                    <Icon
                      loading
                      name="circle notch"
                      size="massive"
                      color="black"
                    />
                  )}

                  <Card.Content style={ContentStyle}>
                    <Card.Header>{eachRoadmap.title}</Card.Header>
                    <Card.Description>
                      {eachRoadmap.description}
                    </Card.Description>
                  </Card.Content>
                </Card>
              ))
            )}
          </Card.Group>
        </div>
      </React.Fragment>
    );
  }
}
const mapStateToProps = state => ({
  auth: state.auth,
  modal: state.modal
});
export default connect(
  mapStateToProps,
  { setModalState }
)(withRouter(Home));
