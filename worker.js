const path = require ('path');

const throng = require('throng');
const Queue = require("bull");

// const atools = require ('./utils/atools');
const azure = require('./utils/azure')
const wtools = require ('./utils/wtools');
const xtools = require ('./utils/xtools');
const config = require ('./utils/config');

let REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const opts = config.redisOpts;

// Spin up multiple processes to handle jobs to 
// take advantage of more CPU cores
let workers = process.env.WEB_CONCURRENCY || 2;

// The maximum number of jobs each worker should process at once. This will need
// to be tuned for your application. If each job is mostly waiting on network 
// responses it can be much higher. If each job is CPU-intensive, it might need
// to be much lower.
let maxJobsPerWorker = 10;

// Connect to the named work queue
let trQueue = new Queue('tr', opts);

function start() {
    trQueue.process(maxJobsPerWorker, async (job) => {
        	/* [ 
        		extract, transcribe,
        		finalise, delete
        	] */
        job.progress(0);
        let toDelete = [];
        let url = "",
			vidAddr = job.data.currentFilename;
		if (job.data.url) url = (job.data.url);

		try {
			if (!vidAddr) {
				vidAddr = await wtools.fetchVideo(url);
				if (process.env.DEBUG_SAM) 
					console.log("File downloaded.", vidAddr);
				job.progress(10);
				job.log("File download complete, beginning extraction...");
			}
			let wavAddr = await xtools.extractAV(vidAddr);
			if (process.env.DEBUG_SAM) 
				console.log("Audio extracted.", wavAddr);
			job.progress(20);
			job.log("Audio extraction complete, initiating transcription...");

			let wordsInWav = await azure.azureFromFile(wavAddr);
			job.progress(75);
			job.log("Transcription complete, formatting response...");

			wordsInWav.words = wordsInWav.words.map(obj => {
				let rep = obj;
				rep.time = Math.round(obj.time * 1000);
				return rep;
			});

			console.log(wordsInWav);

			if (process.env.DEBUG_SAM)
				console.log("Final response ready");
			job.log("Final response ready, waiting for deletion...");
			job.progress(80);

			if (process.env.DEBUG_SAM && process.env.VERBOSE_SAM) 
				console.log("Final response of getByUrl route:", wordsInWav);

			toDelete.push(vidAddr);
			toDelete.push(wavAddr);
			await xtools.deleteManyFiles(toDelete);
			if (process.env.DEBUG_SAM)
				console.log("Deleted residual files");
			job.log("Deleted residual files. Job done.");
			job.progress(100);
			job.data.responseFinal = wordsInWav;

			return wordsInWav;
		} catch(e) {
			job.log(e.message)
			return e;
		}
    });
}

throng({ workers, start });

/*
http://localhost:5000/vid?url=https://thepaciellogroup.github.io/AT-browser-tests/video/ElephantsDream.mp4
*/