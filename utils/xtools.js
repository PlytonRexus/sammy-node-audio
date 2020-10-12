const path = require ('path');
const fs = require ('fs');

// For extracting audio
const fea = require ('ffmpeg-extract-audio');

exports.extractAV = function(addr) {
	// This should probably be in `vtools.js`
	// ffmpeg-extract-audio
	// return address of extracted audio
	return new Promise(async (resolve, reject) => {
		let uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9),
			currentFilename = 'extract-' + uniqueSuffix + ".wav",
			filePath = path.join(__dirname, "..", "uploads", "tmp", currentFilename);

		if (process.env.DEBUG_SAM) console.log("Extracting audio from: \n" + filePath);

		fea({
			input: addr,
			format: 'wav',
			output: filePath
		})
		.then(() => {
			if (process.env.DEBUG_SAM) console.log("Extracted audio to: \n" + filePath);
			resolve(filePath);
		})
		.catch(() => reject("Something went wrong while extraction."));
	});
}

exports.delay = function (ms) {
	if (process.env.DEBUG_SAM) console.log("Waiting " + ms/1000 + " seconds.");
	return new Promise(resolve => setTimeout(resolve, ms));
}