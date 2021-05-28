const { join } = require ('path');

const Queue = require('bull');

const wtools = require ('../utils/wtools');
const config = require ('../utils/config');

let REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const opts = config.redisOpts;
// Connect to the named work queue
const trQueue = new Queue('tr', opts);

exports.getByUrl = async function(req, res) {
	let q = req.query,
		url = "";

	if (q.url) {
		url = (q.url);
	}

	if (url === "") {
		if (process.env.DEBUG_SAM) 
			console.log("getByUrl route error: Empty URL parameter.");
		res.json({ "error": "Empty query. Please supply a parameter." });
	} else {
		try {
			let job = await trQueue.add({
				url
			});
			res.json({ id: job.id });

			// - [ ] now delete the files
		} catch (e) {
			res.json({ "Error": e });
		}
	}
}

/**
 * Saves an uploaded avatar to specified user document.
 * Request body should contain a file of one of these mimetypes:
 * video/mp4, application/octet-stream
 * 
 * It may be noted that `req` object contains field: 
 * `req.currentFilename` to identify current working file.
 *
 * @param {*} req
 * @param {*} res
 * @returns response: 200 || 400
 */
exports.getByUpload = async (req, res, next) => {
	if (!req.file) {
		if (process.env.DEBUG_SAM) 
			console.log("getByUpload error: ", "File missing.");
		return res.status(400).json({ "message": "No file selected!" });
	}
	try {
		let job = await trQueue.add({ 
			currentFilename: req.currentFilename
		});
		res.json({ id: job.id });
	} catch (e) {
		next(e);
	}
}


/**
 * Responds with errors occured during uploading file.
 *
 * @param {*} err
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns response: 500
 */
exports.uploadErrors = (err, req, res, next) => {
	if (process.env.DEBUG_SAM) 
		console.log("Error in getByUpload route.");
	if (process.env.DEBUG_SAM && process.env.VERBOSE_SAM)
		console.log(err); 
	return res.status(500).json({ "Error": err });
}