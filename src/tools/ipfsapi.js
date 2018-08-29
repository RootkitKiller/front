// 封装ipfs api接口：上传文件、上传内容、根据哈希值获取文件、内容
const ipfsAPI = require('ipfs-api');
const addr = '119.28.52.50';

const ipfs = ipfsAPI({ host: addr, port: '5001', protocol: 'http' });

exports.add = buffer => {
  return new Promise((resolve, reject) => {
    try {
      ipfs.add(buffer, function(err, files) {
        if (err || typeof files === 'undefined') {
          reject(err);
        } else {
          resolve(files[0].hash);
        }
      });
    } catch (ex) {
      reject(ex);
    }
  });
};
exports.get = hash => {
  return new Promise((resolve, reject) => {
    try {
      ipfs.get(hash, function(err, files) {
        if (err || typeof files === 'undefined') {
          reject(err);
        } else {
          resolve(files[0].content);
        }
      });
    } catch (ex) {
      reject(ex);
    }
  });
};
