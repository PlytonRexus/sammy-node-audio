const path = require ('path');
const fs = require ('fs');

// For extracting audio
const fea = require ('ffmpeg-extract-audio');

const extractAV = function(addr) {
	// This should probably be in `vtools.js`
	// ffmpeg-extract-audio
	// return address of extracted audio
	return new Promise(async (resolve, reject) => {
		let uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9),
			currentFilename = 'extract-' + uniqueSuffix + ".wav",
			filePath = path.join(__dirname, "..", "uploads", "tmp", currentFilename);

		if (process.env.DEBUG_SAM) console.log("Extracting audio to: \n" + filePath);

		fea({
			input: addr,
			format: 'wav',
			output: filePath
		})
		.then(() => {
			if (process.env.DEBUG_SAM) console.log("Extracted audio to: \n" + filePath);
			azureFromFile(filePath).then(res => console.log(res)).catch(err => console.log(err))
			resolve(filePath);
		})
		.catch(() => reject("Something went wrong while extraction."));
	});
}

// console.log(path.resolve(__dirname, '../binaries/videos/ElephantsDream.mp4'))
// extractAV(path.resolve(__dirname, '../binaries/videos/ElephantsDream.mp4'))
// .then((pathf) => {
// 	atools.Ds_Wrap(pathf)
// 	.then(res => console.log(res))
// 	.catch(err => console.log(err));
// })
// .catch(e => console.log(e));

// azureFromFile(path.resolve(__dirname, '../binaries/audios/voice-mail-spoken.wav'))
// 	.then(res => console.log("Result: ", res))
// 	.catch(err => console.log("Error: ", err))
