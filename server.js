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

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, "uploads");
fs.ensureDirSync(UPLOAD_DIR);

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR); // Save files in 'uploads' directory
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Upload Endpoint
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const fileUrl = `http://static.jobspring.org/uploads/${req.file.filename}`;
  res
    .status(200)
    .json({ message: "Image uploaded successfully", url: fileUrl });
});

// Serve Uploaded Files
app.use("/uploads", express.static(UPLOAD_DIR));

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
