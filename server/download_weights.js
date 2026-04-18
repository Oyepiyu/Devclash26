const fs = require('fs');
const https = require('https');
const path = require('path');

const baseUrl = 'https://raw.githubusercontent.com/vladmandic/face-api/master/model/';
const models = [
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model-shard1',
  'ssd_mobilenetv1_model-shard2',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2'
];

const dir = path.join(__dirname, 'weights');

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

const download = (filename) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(dir, filename);
    if (fs.existsSync(filePath)) {
      console.log(`${filename} already exists.`);
      return resolve();
    }
    console.log(`Downloading ${filename}...`);
    const file = fs.createWriteStream(filePath);
    https.get(baseUrl + filename, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => reject(err));
    });
  });
};

(async () => {
  try {
    for (const model of models) {
      await download(model);
    }
    console.log('All models downloaded successfully!');
  } catch(e) {
    console.error('Error downloading models', e);
  }
})();
