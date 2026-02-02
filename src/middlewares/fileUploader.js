const multer = require("multer");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const AppError = require("../errorHandler/index");

const allowedMimeTypes = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/quicktime", // For .mov files
  "video/x-msvideo", // For .avi files
  "video/x-matroska", // For .mkv files
  "video/webm",
  "video/ogg",
  "application/pdf",
  "text/csv",
];

const fileUploader = (field, folder) => {
  console.log("Initializing file uploader for folder:", folder);
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      if (!fs.existsSync(`public/${folder}`)) {
        fs.mkdirSync(`public/${folder}`, { recursive: true });
      }
      cb(null, `public/${folder}`);
    },
    filename: function (req, file, cb) {
      const { originalname } = file;
      let fileExt = ".jpeg";
      const extI = originalname.lastIndexOf(".");
      if (extI !== -1) {
        fileExt = originalname.substring(extI).toLowerCase();
      }
      const fileName = `${folder}-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${fileExt}`;
      cb(null, fileName);
    },
  });

  const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      allowedMimeTypes.includes(file.mimetype)
        ? cb(null, true)
        : cb(new AppError("Invalid file type", 400));
    },
    limits: {
      fileSize: 20 * 1024 * 1024, // 20 MB max (adjustable)
    },
  }).fields([...field]);

  return (req, res, next) => {
    upload(req, res, async (err) => {
      if (err) return next(err);

      if (!req.files) return next();

      // Compress images larger than 5 MB
      const compressTasks = Object.values(req.files)
        .flat()
        .map(async (file) => {
          if (
            file.size > 5 * 1024 * 1024 &&
            file.mimetype.startsWith("image/")
          ) {
            const outputFilePath = path.join(
              file.destination,
              `compressed-${file.filename}`
            );
            await sharp(file.path)
              .resize(1080) // Resize width to max 1080px
              .jpeg({ quality: 70 }) // Reduce quality
              .toFile(outputFilePath);
            fs.unlinkSync(file.path); // Delete original large file
            file.path = outputFilePath;
            file.filename = `compressed-${file.filename}`;
          }
        });

      await Promise.all(compressTasks);
      next();
    });
  };
};

module.exports = fileUploader;
