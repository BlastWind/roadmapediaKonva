const express = require("express");
const router = express.Router();
const multer = require("multer");
const User = require("../../models/User");
const Roadmap = require("../../models/Roadmap");
const fs = require("fs");

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads"); //save to /uploads?
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }
}).single("file");

//methods to retrieve roadmaps, update roadmaps, submit roadmaps

router.post("/modifyDraftDB", (req, res) => {
  let roadmapId = req.body.roadmapId;
  let newRoadmapData = req.body.data;

  Roadmap.findOneAndUpdate(
    { _id: roadmapId },
    { $set: { data: JSON.stringify(newRoadmapData) } }
  )
    .then(roadmap => {
      //no need to res json, we aren't really retrieving anything, client has "saved" to help us
      //determine whether or not to save state
      console.log("modifeidd", roadmap);
      res.json({ success: true });
    })
    .catch(err => console.log(err));
});

router.post("/saveRoadmapToDB", function(req, res) {
  upload(req, res, function(err) {
    if (req.body.roadmapType && req.body.roadmapType === "draft") {
      //save draft, no need for thumbnails,
      var today = new Date();
      var date =
        today.getFullYear() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getDate();

      console.log(JSON.stringify(req.body.data));

      const newRoadmap = new Roadmap({
        title: "draft created at" + date,
        category: "draft",
        description: "draft",
        data: JSON.stringify(req.body.data),
        author_id: req.body.userId,
        is_draft: true
      });

      //save roadmap as draft,
      newRoadmap
        .save()
        .then(roadmap => {
          var userId = roadmap.author_id;
          console.log("68 roadmap: ", roadmap);
          User.findOneAndUpdate(
            { _id: userId },
            { $push: { draftRoadmap: roadmap._id } },
            { thumbnail: 0 }
          )
            .then(user => {
              console.log("user", user);
              res.json({ user: user, roadmap: roadmap });
            })
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    } else {
      console.log("the json object: ", req.body.data);
      console.log("Request ---", req.body);
      console.log("Request file ---", req.file); //Here you get file.

      const newRoadmap = new Roadmap({
        title: req.body.title,
        category: req.body.category,
        description: req.body.description,
        data: req.body.data,
        thumbnail: {
          data: fs.readFileSync(req.file.path),
          contentType: req.file.mimetype
        },
        author_id: req.body.author_id,

        is_draft: req.body.is_draft
      });

      newRoadmap
        .save()
        .then(roadmap => {
          console.log(roadmap);
        })
        .catch(err => console.log(err));

      if (!err) {
        return res.send(200).end();
      }
    }
  });
});

router.post("/getRoadmapById", (req, res) => {
  console.log("we in getRoadmapbyId");
  var id = req.body.roadmapId;
  console.log(id);
  Roadmap.findOne({ _id: id }, { data: 1, author_id: 1 })
    .then(roadmap => {
      console.log("roadmapInfo", roadmap);
      if (roadmap.author_id === req.body.userId) {
        res.json(roadmap);
      } else {
        res.json({
          message: "You do not have permission to access this roadmap"
        });
      }
    })
    .catch(err => console.log(err));
});

router.post("/photos", (req, res) => {
  var id = req.body.id;

  Roadmap.findOne({ _id: id }, { data: 1, _id: 0 })
    .then(roadmap => {
      res.json(roadmap);
    })
    .catch(err => console.log(err));
});

router.get("/getAllRoadmaps", (req, res) => {
  console.log("we deep");
  Roadmap.find({ is_draft: false })
    .sort({ date: -1 })
    .then(roadmaps => res.json(roadmaps));
});

router.post("/getRoadmapThumbnailsByIds", (req, res) => {
  console.log("body", req.body);
  Roadmap.find(
    { _id: { $in: req.body.ids } },
    {
      title: 0,
      description: 0,
      category: 0,
      views: 0,
      hearts: 0,
      date: 0,
      author_id: 0,
      _id: 0,
      data: 0
    }
  )
    .sort({ date: -1 })
    .then(roadmaps => {
      console.log(roadmaps);
      res.json(roadmaps);
    })
    .catch(err => {
      if (err) res.json(error);
    });
});

router.post("/getAllRoadmapsThumbnails", (req, res) => {
  console.log("we deep in thumbnails");
  Roadmap.find(
    { is_draft: false },
    {
      title: 0,
      description: 0,
      category: 0,
      views: 0,
      hearts: 0,
      date: 0,
      author_id: 0,
      _id: 0,
      data: 0
    }
  )
    .sort({ date: -1 })
    .then(roadmaps => res.json(roadmaps))
    .catch(err => {
      if (err) res.json(error);
    });
});

router.get("/getAllRoadmapsButThumbnails", (req, res) => {
  console.log("we deep");
  Roadmap.find(
    { is_draft: false },
    {
      thumbnail: 0
    }
  )
    .sort({ date: -1 })
    .then(roadmaps => res.json(roadmaps));
});

router.get("/", (req, res) => {
  res.json({ success: true });
});
module.exports = router;
