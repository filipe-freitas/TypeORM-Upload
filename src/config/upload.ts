import path from 'path';
import multer from 'multer';
import crypto from 'crypto';

const tmpFolder = path.join(__dirname, '..', '..', 'tmp');

export default {
  directory: tmpFolder,
  storage: multer.diskStorage({
    destination: tmpFolder,
    filename: (_req, file, callback) => {
      const hash = crypto.randomBytes(10).toString('hex');
      const fileName = `${hash}-${file.originalname}`;

      return callback(null, fileName);
    },
  }),
};
