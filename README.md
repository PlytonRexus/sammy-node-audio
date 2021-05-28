## Prerequisite Dependencies

1. `node-tesseract-ocr`
- Tesseract
```sh
	aptitude install tesseract-ocr
```

2. `deepspeech`
- Model and Scorer
```sh
	# Download pre-trained English model files
	curl -LO https://github.com/mozilla/DeepSpeech/releases/download/v0.8.1/deepspeech-0.8.1-models.pbmm
	curl -LO https://github.com/mozilla/DeepSpeech/releases/download/v0.8.1/deepspeech-0.8.1-models.scorer
```
- Python3
```sh
	aptitude install python3
```
- TensorFlow
```sh
	pip3 install tensorflow
```
- Sox
```sh
	npm i sox
```

3. `@samuelcalegari/ds_ffmpeg`, `ffmpeg-extract-audio`, `ffmpeg-extract-frames-quality`
- ffmpeg
```sh
	aptitude install ffmpeg
```

---

## Heroku Instructions
1. Create heroku application
```sh
heroku create <name>
```

2. Add buildpacks
This is lot of buildpacks. I've tried at most 3. Be careful.
```sh
1. heroku/python
2. https://github.com/AirspaceTechnologies/tensorflow-buildpack.git
3. heroku-community/apt
4. https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git
5. heroku/nodejs
```

3. Deploy and test
```sh
git add .
git commit --allow-empty -m "Initial deploy"
git push heroku master
```
At this point a *very* long build process should run and download everything required.

4. Note the size of the compressed slug (it'll come up at the end of the build process).
If this size is less than or around, say, 250 MB, try enabling scorer and check if it fits.
To enable scorer, go to `.heroku/run.sh` and uncomment the last (or second-last) line that correspons to scorer.
Then, re-deploy (step-3).