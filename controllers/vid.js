const path = require ('path');

const atools = require ('../utils/atools');
const wtools = require ('../utils/wtools');
const xtools = require ('../utils/xtools');

exports.getByUrl = async function(req, res) {
	let q = req.query,
		url = "";

	if (q.url) {
		url = (q.url);
	}

	if (url == "") {
		if (process.env.DEBUG_SAM) 
			console.log("getByUrl route error: Empty URL parameter.");
		res.json({ "error": "Empty query. Please supply a parameter." });
	} else {
		try {
			let vidAddr = await wtools.fetchVideo(url);
			if (process.env.DEBUG_SAM) 
				console.log("File downloaded.", vidAddr);
			let wavAddr = await xtools.extractAV(vidAddr);
			if (process.env.DEBUG_SAM) 
				console.log("Audio extracted.", wavAddr);
			let wordsInWav = await atools.Ds_Wrap(null, null, wavAddr);

			if (process.env.DEBUG_SAM && process.env.VERBOSE_SAM) 
				console.log("Final response of getByUrl route:", wordsInWav);
			res.json(wordsInWav);

			// - [ ] now delete the files
		} catch (e) {
			res.json({ "error": e });
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
 * @returns response: 202 || 400
 */
exports.getByUpload = async (req, res, next) => {
	if (!req.file) {
		if (process.env.DEBUG_SAM) 
			console.log("getByUpload error: ", "File missing.");
		return res.status(400).json({ "message": "No file selected!" });
	}

	// - [x] save file here
	// - [x] then call deepspeech
	// - [x] respond with the returned json array

	try {
		let wavAddr = 
			await xtools.extractAV(
				path.join(__dirname, "..", "uploads", "tmp", req.currentFilename)
		);
		if (process.env.DEBUG_SAM) 
			console.log("Audio extracted.", wavAddr);
		let wordsInWav = await atools.Ds_Wrap(null, null, wavAddr);

		if (process.env.DEBUG_SAM && process.env.VERBOSE_SAM) 
			console.log("Final response for getByUpload route:", wordsInWav); 
		res.json(wordsInWav);
		// - [ ] now delete the files
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
	return res.status(500).json({ "message": err });
}