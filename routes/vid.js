const path = require('path');

const express = require('express');
const chalk = require('chalk');
const multer = require('multer');

const vid = require('../controllers/vid');
const wtools = require('../utils/wtools');

const router = express.Router();
const fileFilter = function fileFilter(req, file, callback) {
    if (file.mimetype === 'video/mp4' || file.mimetype === 'application/octet-stream') {
        callback(null, true);
    } else {
        callback(null, false);
        console.log(chalk.yellow('Only mp4 file type is allowed!'));
    }
}

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, "..", "uploads", "tmp"))
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        let currentFilename = file.fieldname +
            '-' + uniqueSuffix +
            file.originalname.substring(file.originalname.length - 4);
        req.currentFilename = path
            .join(__dirname, "..", "uploads", "tmp", currentFilename);;
        cb(null, currentFilename);
    }
})

const upload = multer({
    limits: { fileSize: 524288000 },
    fileFilter,
    storage
});

router.post("/", upload.single("video"), wtools.reqTimeout, vid.getByUpload, vid.uploadErrors);

router.post("/link", vid.getByUrl);

module.exports = router;