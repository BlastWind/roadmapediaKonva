const express = require('express')
const router = express.Router()
const multer = require('multer')
const User = require('../../models/User')
const Roadmap = require('../../models/Roadmap')
const fs = require('fs')

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

router.post('/getRoadmapsBySearch', (req, res) => {
    Roadmap.find(
        { $text: { $search: req.body.searchPhrase }, deleted: false },
        {
            thumbnail: 0
        }
    ).then(roadmaps => {
        res.json(roadmaps)
    })
})
router.post('/getRoadmapsBySearchThumbnails', (req, res) => {
    Roadmap.find(
        { $text: { $search: req.body.searchPhrase }, deleted: false },
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
    ).then(roadmaps => {
        res.json(roadmaps)
    })
})

//methods to retrieve roadmaps, update roadmaps, submit roadmaps
router.get('/roadmapCount', (req, res) => {
    Roadmap.find({ is_draft: false, deleted: false }, { thumbnail: 0 }).count()
})

router.post('/incrementView', (req, res) => {
    const roadmapId = req.body.roadmapId

    Roadmap.findOneAndUpdate({ _id: roadmapId }, { $inc: { views: 1 } }).then(
        roadmap => res.json({ success: true })
    )
})

router.post('/modifyDraftDB', (req, res) => {
    let roadmapId = req.body.roadmapId
    let newRoadmapData = req.body.data

    Roadmap.findOneAndUpdate(
        { _id: roadmapId },
        { $set: { data: JSON.stringify(newRoadmapData) } }
    ).then(roadmap => {
    //no need to res json, we aren't really retrieving anything, client has "saved" to help us
    //determine whether or not to save state

        res.json({ success: true })
    })
})

router.post('/modifyCreatedRoadmap', function(req, res) {
    upload(req, res, function(err) {
        const thumbnail = {
                data: fs.readFileSync(req.file.path),
                contentType: req.file.mimetype
            },
            data = JSON.stringify(req.body.data),
            title = req.body.title,
            category = req.body.category,
            description = req.body.description,
            roadmapId = req.body.roadmapId
        Roadmap.findOneAndUpdate(
            { _id: roadmapId },
            {
                $set: {
                    //
                    thumbnail: thumbnail,
                    title: title,
                    description: description,
                    data: data,
                    category: category
                }
            }
        ).then(roadmap => {
            res.json({ success: true, roadmapId: roadmap._id })
        })
    })
})

router.post('/deleteRoadmap', (req, res) => {
    var roadmapId = req.body.roadmapId

    Roadmap.findOneAndUpdate(
        { _id: roadmapId },
        { $set: { deleted: true } }
    ).then(roadmap => {
        res.json({ message: 'delete' })
    })
})

router.post('/saveRoadmapToDB', function(req, res) {
    upload(req, res, function(err) {
        if (req.body.roadmapType && req.body.roadmapType === 'draft') {
            //save draft, no need for thumbnail
            var today = new Date()
            var date =
        today.getFullYear() +
        '-' +
        (today.getMonth() + 1) +
        '-' +
        today.getDate()

            //    console.log(JSON.stringify(req.body.data));

            const newRoadmap = new Roadmap({
                title: 'draft created at' + date,
                category: 'draft',
                description: 'draft',
                data: JSON.stringify(req.body.data),
                author_id: req.body.userId,
                is_draft: true
            })

            //save roadmap as draft,
            newRoadmap
                .save()
                .then(roadmap => {
                    var userId = roadmap.author_id
                    //    console.log("68 roadmap: ", roadmap);
                    User.findOneAndUpdate(
                        { _id: userId },
                        { $push: { draftRoadmap: roadmap._id } },
                        { thumbnail: 0 }
                    )
                        .then(user => {
                            res.json({ success: true, roadmapId: roadmap._id })
                        })
                        .catch(err =>
                            res.status(500).json({ error: 'Something is wrong' })
                        )
                })
                .catch(err => res.status(500).json({ error: 'Something is wrong' }))
        } else if (req.body.alreadyCreated) {
        } else {
            //  console.log("the json object: ", req.body.data);
            //  console.log("Request ---", req.body);
            //  console.log("Request file ---", req.file); //Here you get file.

            //  console.log(
            //    "the roadmap we are deleting because is draft",
            //    req.body.deleteDraft
            //    );
            Roadmap.deleteOne({ _id: req.body.deleteDraft })
                .then(roadmap => {
                    //    console.log("this is the roadmap we deleted", roadmap);
                })
                .catch(err => res.status(500).json({ error: 'Something is wrong' }))

            const newRoadmap = new Roadmap({
                title: req.body.title,
                category: req.body.category,
                description: req.body.description,
                data: JSON.stringify(req.body.data),
                thumbnail: {
                    data: fs.readFileSync(req.file.path),
                    contentType: req.file.mimetype
                },
                author_id: req.body.author_id,

                is_draft: req.body.is_draft
            })

            newRoadmap
                .save()
                .then(roadmap => {
                    var userId = roadmap.author_id
                    //      console.log("bruh momentp: ", roadmap);
                    User.findOneAndUpdate(
                        { _id: userId },
                        { $push: { yourRoadmap: roadmap._id } },
                        { thumbnail: 0 }
                    )
                        .then(user => {
                            //        console.log("user", user);
                            res.json({ success: true, roadmapId: roadmap._id })
                        })
                        .catch(err =>
                            res.status(500).json({ error: 'Something is wrong' })
                        )
                })
                .catch(err => res.status(500).json({ error: 'Something is wrong' }))
        }
    })
})

router.post('/getRoadmapById', (req, res) => {
    //console.log("we in getRoadmapbyId");
    var id = req.body.roadmapId
    //  console.log(id);
    Roadmap.findOne({ _id: id }, { thumbnail: 0 }).then(roadmap => {
        if (roadmap.deleted) {
            res.json({ message: 'This roadmap was deleted!' })
        }
        //console.log("roadmapInfo", roadmap);
        if (roadmap.is_draft) {
            if (roadmap.author_id === req.body.userId) {
                res.json(roadmap)
            } else {
                res.json({
                    message: 'You do not have permission to access this roadmap'
                })
            }
        } else {
            res.json(roadmap)
        }
        if (!roadmap) {
            res.json({ message: 'No such roadmap exist!' })
        }
    })
})

router.post('/photos', (req, res) => {
    var id = req.body.id

    Roadmap.findOne({ _id: id, deleted: false }, { data: 1, _id: 0 }).then(
        roadmap => {
            res.json(roadmap)
        }
    )
})

router.get('/getAllRoadmaps', (req, res) => {
    //console.log("we deep");
    Roadmap.find({ is_draft: false, deleted: false })
        .sort({ date: -1 })
        .then(roadmaps => res.json(roadmaps))
})

router.post('/getRoadmapThumbnailsByIds', (req, res) => {
    //  console.log("body", req.body);
    Roadmap.find(
        { _id: { $in: req.body.ids }, deleted: false },
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
        .then(roadmaps => {
            //    console.log("the thumbnails", roadmaps, "the request IDS", req.body.ids);

            res.json(roadmaps)
        })
        .catch(err => {
            if (err) res.json(error)
        })
})

router.get('/getBestByCategoryThumbnails', (req, res) => {
    //  console.log("we deep");
    Roadmap.find(
        { is_draft: false, deleted: false },
        {
            thumbnail: 0
        }
    )
        .sort({ views: -1 })
        .limit(25)
        .then(roadmaps => res.json(roadmaps))
})

router.get('/getBestByCategoryNoThumbnails', (req, res) => {
    Roadmap.find(
        { is_draft: false, deleted: false },
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
        .sort({ views: -1 })
        .limit(25)
        .then(roadmaps => res.json(roadmaps))
        .catch(err => {
            if (err) res.json(error)
        })
})

router.post('/getFeaturedRoadmapsThumbnails', (req, res) => {
    //  console.log("we deep in thumbnails");
    Roadmap.find(
        { is_draft: false, deleted: false },
        {
            title: 0,
            description: 0,

            views: 0,
            hearts: 0,
            date: 0,
            author_id: 0,

            data: 0
        }
    )
        .sort({ views: -1 })
        .limit(req.body.limit)
        .then(roadmaps => res.json(roadmaps))
        .catch(err => {
            if (err) res.json(error)
        })
})

router.post('/getFeaturedRoadmapsButThumbnails', (req, res) => {
    //  console.log("we deep");
    Roadmap.find(
        { is_draft: false, deleted: false },
        {
            thumbnail: 0
        }
    )
        .sort({ views: -1 })
        .limit(req.body.limit)
        .then(roadmaps => res.json(roadmaps))
})

router.get('/', (req, res) => {
    res.json({ success: true })
})
module.exports = router
