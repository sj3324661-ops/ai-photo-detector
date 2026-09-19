const express = require("express");
const multer = require("multer");

const app = express();

const upload = multer({
  storage: multer.memoryStorage()
});

app.use(express.static("public"));

app.post("/check", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Photo नहीं मिली"
      });
    }

    console.log("Photo मिली:", req.file.originalname);

    const token = process.env.AIORNOT_API_KEY;

    if (!token) {
      return res.status(500).json({
        error: "AI or Not API token नहीं मिला"
      });
    }

    const formData = new FormData();

    const blob = new Blob(
      [req.file.buffer],
      { type: req.file.mimetype }
    );

    formData.append("image", blob, req.file.originalname);

    const response = await fetch(
      "https://api.aiornot.com/v2/check",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + token
        },
        body: formData
      }
    );

    const data = await response.json();

    console.log("AI or Not response:", data);

    if (!response.ok) {
      return res.status(response.status).json({
        error: "AI detection API में समस्या",
        details: data
      });
    }

    res.json(data);

  } catch (error) {
    console.error("Server error:", error);

    res.status(500).json({
      error: "Server में समस्या हुई"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server चालू है: " + PORT);
});
