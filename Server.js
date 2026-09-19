const express = require("express");
const multer = require("multer");

const app = express();

const upload = multer({
  storage: multer.memoryStorage()
});

app.use(express.static("public"));

app.post("/check", upload.single("photo"), (req, res) => {

  if (!req.file) {
    return res.status(400).json({
      error: "Photo नहीं मिली"
    });
  }

  console.log("Photo मिली:", req.file.originalname);

  res.json({
    message: "Photo server तक पहुँच गई"
  });

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server चालू है: " + PORT);
});
