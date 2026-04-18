const fs = require('fs');
const https = require('https');
const path = require('path');

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
const models = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model-shard1',
  'ssd_mobilenetv1_model-shard2',
];

const clientDir = path.join(__dirname, 'client', 'public', 'models');

if (!fs.existsSync(clientDir)) {
  fs.mkdirSync(clientDir, { recursive: true });
}

function download(filename, destDir) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(destDir, filename);
    // Always re-download to overwrite broken files
    console.log(`Downloading ${filename}...`);
    const file = fs.createWriteStream(filePath);
    
    const request = https.get(baseUrl + filename, (response) => {
      // Follow redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        https.get(response.headers.location, (res2) => {
          res2.pipe(file);
          file.on('finish', () => {
            file.close();
            const stats = fs.statSync(filePath);
            console.log(`  -> ${filename} (${(stats.size / 1024).toFixed(1)} KB)`);
            resolve();
          });
        }).on('error', (err) => {
          fs.unlink(filePath, () => reject(err));
        });
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          const stats = fs.statSync(filePath);
          console.log(`  -> ${filename} (${(stats.size / 1024).toFixed(1)} KB)`);
          resolve();
        });
      }
    });
    
    request.on('error', (err) => {
      fs.unlink(filePath, () => reject(err));
    });
  });
}

(async () => {
  try {
    console.log('\n=== Downloading face-api.js models for Client ===\n');
    for (const model of models) {
      await download(model, clientDir);
    }
    console.log('\n✅ All models downloaded successfully!\n');
  } catch (e) {
    console.error('Error downloading models:', e);
  }
})();
