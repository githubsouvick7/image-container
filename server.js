const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
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

// Set up Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "./uploads";
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

// Image upload route
app.post("/upload", upload.single("image"), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send("No file uploaded.");
  }

  const filePath = `/var/www/images/${file.filename}`;

  // Move the image to the main images folder
  fs.renameSync(file.path, filePath);

  // Send response with the image URL
  res.json({ imageUrl: `https://images.jobspring.org/${file.filename}` });
});

// New route to serve the images via GET
app.get("/images/:imageName", (req, res) => {
  const imageName = req.params.imageName;

  const imagePath = path.join(__dirname, "/var/www/images/", imageName);

  // Check if the image exists
  fs.exists(imagePath, (exists) => {
    if (!exists) {
      return res.status(404).send("Image not found.");
    }

    // Serve the image file
    res.sendFile(imagePath);
  });
});

app.listen(8888, () => {
  console.log("Server running on http://localhost:8888");
});
