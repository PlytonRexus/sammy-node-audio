const express = require('express');

const job = require('../controllers/job');

const router = express.Router();

router.get('/:id/status', job.status);

router.get("/:id/logs", job.getLogs);

router.get("/:id/retry", job.retryJob);

router.get("/:id/remove", job.removeJob);

router.get("/:id/activate", job.activateJob);

router.get("/pause", job.pauseQueue);

router.get("/resume", job.resumeQueue);

module.exports = router;