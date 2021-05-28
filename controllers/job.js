const { join } = require ('path');

const Queue = require('bull');

const config = require ('../utils/config');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const opts = config.redisOpts;
const trQueue = new Queue('tr', opts);

exports.getLogs = async function(req, res) {
	let id = parseInt(req.params.id),
		logs = { "Error": "Invalid request" };
	try {
		logs = await trQueue.getJobLogs(id, 0);
		res.json({ id, logs });
	} catch(e) {
		res.status(500).json({ "Error": e });
	}
		
}

exports.retryJob = async function(req, res) {
	// Only for failed jobs

	let id = req.params.id;
	try {
		let x = await trQueue.getJob(id);
		await x.retry();
		res.json({ id, status: "back in queue" });
	} catch(e) {
		res.status(500).json({ "Error": e });
	}
}

exports.removeJob = async function(req, res) {
	let id = req.params.id;
	try {
		let x = await trQueue.getJob(id);
		await x.remove();
		res.json({ id, status: "removed from queue" });
	} catch(e) {
		res.status(500).json({ "Error": e });
	}
}

exports.pauseQueue = async function(req, res) {
	let mode = getMode(req);
	try {
		await trQueue.pause();
		res.json({ "status": "Queue paused" });
	} catch(e) {
		res.status(500).json({ "Error": e });
	}
}

exports.resumeQueue = async function(req, res) {
	try {
		await trQueue.resume();
		res.json({ "status": "Queue resumed" });
	} catch(e) {
		res.status(500).json({ "Error": e });
	}
}

exports.activateJob = async function(req, res) {
	let id = req.params.id;
	try {
		trQueue.moveToActive(id);
		res.json({ "status": "Moved" });
	} catch(e) {
		res.status(500).json({ "Error": e });
	}
}

exports.status = async (req, res) => {
    let id = req.params.id;
    let job = await trQueue.getJob(id);

    if (job === null || job === undefined) {
        res.status(404).end();
    } else {
        let state = await job.getState();
        let progress = job._progress;
        let reason = job.failedReason;
        let responseFinal = job.returnvalue;
        res.json({ id, state, progress, reason, responseFinal });
    }
};