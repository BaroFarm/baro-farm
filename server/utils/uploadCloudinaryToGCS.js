const { Storage } = require('@google-cloud/storage');
const axios = require('axios');
const path = require('path');

const storage = new Storage({
  projectId: 'gen-lang-client-0997166309',
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const bucketName = 'barofarm-assets';

async function uploadCloudinaryToGCS(imageUrl, destinationPath) {
  const response = await axios.get(imageUrl, { responseType: 'stream' });

  const ext = path.extname(imageUrl).split('?')[0] || '.jpg';
  const file = storage.bucket(bucketName).file(destinationPath);

  await new Promise((resolve, reject) => {
    response.data
      .pipe(file.createWriteStream({ resumable: false, contentType: 'image/jpeg' }))
      .on('finish', resolve)
      .on('error', reject);
  });

  return `gs://${bucketName}/${destinationPath}`;
}

module.exports = { uploadCloudinaryToGCS };
