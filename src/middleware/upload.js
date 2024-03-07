import multer from "multer";
import fs from "fs";

let uploadImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    var destinationPath = "./src/uploads/";

    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, {
        recursive: true,
      });
    }
    cb(null, destinationPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});
export const uploadImageFile = multer({ storage: uploadImageStorage });
