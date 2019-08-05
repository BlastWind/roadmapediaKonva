const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const keys = require('../../config/keys')
const multer = require('multer')
const fs = require('fs')
// Load input validation
const validateRegisterInput = require('../../validation/register')
const validateLoginInput = require('../../validation/login')
// Load User model
const User = require('../../models/User')
const Roadmap = require('../../models/Roadmap')
// @route POST api/users/register
// @desc Register user
// @access Public

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads') //save to /uploads?
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
})

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }
}).single('file')

router.put('/updateProfilePic', function(req, res) {
    //console.log("we in");
    upload(req, res, function(err) {
    //  console.log("req body: ", req.body);
    //  console.log("req file: ", req.file);
        User.findOneAndUpdate(
            { _id: req.body.userId },
            { $set: { profilePic: fs.readFileSync(req.file.path) } }
        ).then(user => res.json({ success: true }))
    })
})

router.post('/getUserAttribute', (req, res) => {
    let userId = req.body.userId
    let attribute = req.body.attribute

    User.findOne({ _id: userId }, { thumbnail: 0 }).then(user => {
        res.json({ attribute: user[attribute] })
    })
})

router.put('/updateUserDescription', (req, res) => {
    User.findOneAndUpdate(
        { _id: req.body.userId },
        { $set: { userDescription: req.body.userDescription } },
        { fields: { thumbnail: 0 }, new: true }
    ).then(user => res.json(user))
})

router.post('/saveRoadmapToUser', (req, res) => {
    const user_id = req.body.userId
    const roadmap_id = req.body.roadmapId
    Roadmap.findOne({ _id: roadmap_id }, { $inc: { hearts: 1 } })
    User.findOneAndUpdate(
        { _id: user_id },
        { $addToSet: { savedRoadmap: roadmap_id } }
    )
        .then(user => {
            res.json(user)
        })
        .catch(err => {})
})

router.post('/removeRoadmapFromUser', (req, res) => {
    const user_id = req.body.userId
    const roadmap_id = req.body.roadmapId

    //find user with userid, remove roadmap with roadmap_id from array of savedRoadmap
    Roadmap.findOne({ _id: roadmap_id }, { $inc: { hearts: -1 } })

    User.update({ _id: user_id }, { $pull: { savedRoadmap: roadmap_id } })
        .then(user => {
            //    console.log(user);
            res.json(user)
        })
        .catch(err => {
            //  console.log("err" + err);
        })
})

router.post('/getUserById', (req, res) => {
    //later on we will also return drafts & your roadmaps

    //  console.log(req.body);
    let user_id = req.body.userId

    User.findOne({ _id: user_id })
        .then(user => {
            //  console.log("yourRoadmap", user.yourRoadmap);
            //  console.log("user", user);
            let savedRoadmap = [],
                draftRoadmap = [],
                yourRoadmap = []

            Roadmap.find(
                { _id: { $in: user.savedRoadmap }, deleted: false },
                { thumbnail: 0 }
            )
                .then(roadmaps => {
                    //    console.log(roadmaps);
                    savedRoadmap = roadmaps
                })
                .then(
                    Roadmap.find(
                        { _id: { $in: user.draftRoadmap }, deleted: false },
                        { thumbnail: 0 }
                    ).then(roadmaps => {
                        draftRoadmap = roadmaps
                    })
                )
                .then(
                    () => {
                        Roadmap.find(
                            { _id: { $in: user.yourRoadmap }, deleted: false },
                            { thumbnail: 0 }
                        )
                            .then(roadmaps => {
                                //      console.log("we used these IDs: ", user.yourRoadmap);
                                //    console.log("and we found", roadmaps);

                                yourRoadmap = roadmaps
                            })
                            .then(() => {
                                //  console.log("about to return");
                                /*  console.log(
                  "saved",
                  savedRoadmap,
                  "draft",
                  draftRoadmap,
                  "yours",
                  yourRoadmap
                ); */
                                res.json({
                                    userInfo: user,
                                    savedRoadmapsInfo: savedRoadmap,
                                    draftRoadmapsInfo: draftRoadmap,
                                    yourRoadmapsInfo: yourRoadmap,
                                    a: 'a'
                                })
                            })
                    }

                    //user yourRoadmap looks like: [{$oid: 290gjw09j1ffjwf190j}, {$oid: 2j90ejf9vwjerf}, {...}, ...]
                )

            /*user.savedRoadmap.forEach(function(eachRoadmap) {
      console.log(eachRoadmap);
      Roadmap.findOne({ _id: eachRoadmap }, { thumbnail: 0 }).then(roadmap => {
        console.log("saved roadmap: ", roadmap);
        savedRoadmap.push(roadmap);
      });
    });

    let userWithRoadmaps = user;
    userWithRoadmaps.savedRoadmapInfo = savedRoadmap;
    console.log("user with roadmaps", userWithRoadmaps);
    console.log("just saved roadmap", savedRoadmap);
    res.json(userWithRoadmaps);

*/
        })
        .catch(err => res.status(400))
})

router.post('/getUserInfoOnly', (req, res) => {
    //later on we will also return drafts & your roadmaps

    let user_id = req.body.userId

    User.findOne(
        { _id: user_id },
        { savedRoadmap: 0, draftRoadmap: 0, yourRoadmap: 0, email: 0, password: 0 }
    )
        .then(user => {
            res.json(user)
        })
        .catch(err => res.status(400))
})

router.post('/register', (req, res) => {
    // Form validation
    const { errors, isValid } = validateRegisterInput(req.body)
    // Check validation

    if (!isValid) {
        return res.status(400).json(errors)
    }

    User.findOne({ email: req.body.email }).then(user => {
        if (user) {
            return res.status(400).json({ email: 'Email already exists' })
        } else {
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            })
            // Hash password before saving in database
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err
                    newUser.password = hash
                    newUser.save()

                    return res.status(200).json({ success: true })
                })
            })
        }
    })
})

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post('/login', (req, res) => {
    //console.log("in login backend");
    // Form validation
    const { errors, isValid } = validateLoginInput(req.body)
    // Check validation
    if (!isValid) {
        return res.status(400).json(errors)
    }
    const email = req.body.email
    const password = req.body.password
    // Find user by email
    User.findOne({ email }).then(user => {
    // Check if user exists
        if (!user) {
            return res.status(404).json({ emailnotfound: 'Email not found' })
        }
        // Check password
        bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {
                // User matched
                // Create JWT Payload
                const payload = {
                    //these are from mlab, add more attributes to store more things into redux
                    //ex: in the future, roadmaps: user.roadmaps
                    id: user.id,
                    name: user.name,
                    profilePic: user.profilePic
                }
                // Sign token
                jwt.sign(
                    payload,
                    keys.secretOrKey,
                    {
                        expiresIn: 31556926 // 1 year in seconds
                    },
                    (err, token) => {
                        res.json({
                            success: true,
                            token: 'Bearer ' + token
                        })
                    }
                )
            } else {
                return res
                    .status(400)
                    .json({ passwordincorrect: 'Password incorrect' })
            }
        })
    })
})

module.exports = router
