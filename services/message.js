const AWS = require("aws-sdk");

exports.uploadToS3 = (req) => {
  let s3Bucket = new AWS.S3({
    accessKeyId: process.env.IAM_USER_KEY,
    secretAccessKey: process.env.IAM_USER_SECRET,
  });
  const fileName = `GroupChat${req.file.originalname}/${new Date()}`;
  let params = {
    Bucket: process.env.BUCKET_NAME,
    Key: fileName,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
    ACL: "public-read",
  };
  return new Promise((resolve, reject) => {
    s3Bucket.upload(params, (err, response) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log(response);
        resolve(response.Location);
      }
    });
  });
};
