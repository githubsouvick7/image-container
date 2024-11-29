const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(
  cors({
    origin: [
      "https://www.jobspring.org",
      "https://admin.jobspring.org",
      "https://jobspring.org",
      "http://localhost:3000",
      "http://localhost:3001",
    ],

    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

const imagesDirectory = "/var/www/images/";

if (!fs.existsSync(imagesDirectory)) {
  fs.mkdirSync(imagesDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDirectory);
  },
  filename: (req, file, cb) => {
    const filename = Date.now() + "-" + file.originalname;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const mimeType = allowedTypes.test(file.mimetype);
  if (mimeType) {
    cb(null, true);
  } else {
    cb(new Error("File type not supported"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
}).single("image");

app.post("/upload", (req, res) => {
  console.log("Received upload request:", req.body);

  upload(req, res, (err) => {
    if (err) {
      console.error("Upload error:", err);
      if (err.message === "File type not supported") {
        return res.status(400).send("Only image files are allowed.");
      }
      return res.status(500).send("Error uploading file.");
    }

    const fileUrl = `https://images.jobspring.org/${req.file.filename}`;
    console.log("Upload successful:", fileUrl);
    res.status(200).json({ message: "File uploaded successfully", fileUrl });
  });
});

app.get("/image/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(imagesDirectory, filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send("Image not found");
    }

    res.sendFile(filePath);
  });
});

app.get("/images", (req, res) => {
  fs.readdir(imagesDirectory, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return res.status(500).send("Error reading images directory.");
    }

    const imageFiles = files.filter((file) =>
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );

    if (imageFiles.length === 0) {
      return res.status(404).send("No images found.");
    }

    const imageUrls = imageFiles.map(
      (file) => `https://images.jobspring.org/${file}`
    );

    res.json({ images: imageUrls });
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start the server
app.listen(8888, () => {
  console.log(`Server is running on port ${PORT}`);
});
