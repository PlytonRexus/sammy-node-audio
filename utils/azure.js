class Result {
    constructor(text, duration, start) {
        this.word = text
        this.time = duration + start
    }
}

const fs = require('fs')

// Azure speech SDK
const sdk = require("microsoft-cognitiveservices-speech-sdk");

const subscriptionKey = process.env.AZURE_AUDIO_API_KEY
const region = process.env.AZURE_AUDIO_REGION

const speechConfig = sdk.SpeechConfig
    .fromSubscription(subscriptionKey, region);
speechConfig.requestWordLevelTimestamps();

function azureFromFile(filePath) {
    function formatResults(results) {
        return results.map((r, i, a) => {
            if (!!i) r.word = r.word.replace(new RegExp(a[i - 1].word, 'i'), '')
            return r
        })
    }

    function resolveResult(results, resolve, result) {
        // results = formatResults(results)
        resolve({file: {length: result.duration, savedAs: filePath}, words: results});
        return results;
    }

    return new Promise((resolve, reject) => {
        let audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync(filePath));
        let recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
        let results = []
        let current = null

        recognizer.recognizing = (s, e) => {
            console.log(`RECOGNIZING: ${e.result.text}`);
            current = e.result
            // results.push(new Result(e.result.text, e.result.duration, e.result.offset))
        };

        recognizer.recognized = (s, e) => {
            if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
                console.log(`RECOGNIZED: ${e.result.text}`);
                results.push(new Result(e.result.text, e.result.duration, e.result.offset))
                // results = resolveResult(results, resolve, e.result);
            }
            else if (e.result.reason === sdk.ResultReason.NoMatch) {
                console.log("NOMATCH: Speech could not be recognized.");
            }
        };

        recognizer.canceled = (s, e) => {
            console.log(`CANCELED: Reason=${e.reason}`);

            if (e.reason === sdk.CancellationReason.Error) {
                console.log(`CANCELED: ErrorCode=${e.errorCode}`);
                console.log(`CANCELED: ErrorDetails=${e.errorDetails}`);
                console.log("CANCELED: Did you update the subscription info?");
            }

            recognizer.stopContinuousRecognitionAsync();
            resolveResult(
                [...results, new Result(current.text, current.duration, current.offset)],
                resolve, {duration: null})
        };

        recognizer.sessionStopped = (s, e) => {
            recognizer.stopContinuousRecognitionAsync();
            // results = formatResults(results)
            resolve({file: { length: null, savedAs: filePath }, words: results});
        };

        recognizer.startContinuousRecognitionAsync(() => {}, err => reject(err));
    })
}

module.exports = {azureFromFile}
