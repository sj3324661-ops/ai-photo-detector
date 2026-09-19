const express = require("express");
const multer = require("multer");

const app = express();

const upload = multer({
  storage: multer.memoryStorage()
});

app.use(express.static("public"));

app.post("/check", upload.single("photo"), async (req, res) => {
  try {
    console.log("CHECK request मिली");

    if (!req.file) {
      console.log("Photo नहीं मिली");

      return res.status(400).json({
        error: "Photo नहीं मिली"
      });
    }

    console.log("Photo मिली:", req.file.originalname);
    console.log("Photo type:", req.file.mimetype);
    console.log("Photo size:", req.file.size);

    const token = process.env.AIORNOT_API_KEY;

    if (!token) {
      console.log("AIORNOT_API_KEY नहीं मिला");

      return res.status(500).json({
        error: "AI or Not API token नहीं मिला"
      });
    }

    const formData = new FormData();

    const blob = new Blob(
      [req.file.buffer],
      {
        type: req.file.mimetype
      }
    );

    formData.append(
      "image",
      blob,
      req.file.originalname
    );

    console.log("AI or Not API को request भेज रहे हैं...");

    const response = await fetch(
      "https://api.aiornot.com/v2/image/sync",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + token
        },
        body: formData
      }
    );

    const responseText = await response.text();

    console.log("AI or Not status:", response.status);
    console.log("AI or Not response:", responseText);

    if (!response.ok) {
      return res.status(response.status).json({
        error: "AI detection API में समस्या",
        details: responseText
      });
    }

    let data;

    try {
      data = JSON.parse(responseText);
    } catch (error) {
      return res.status(500).json({
        error: "AI or Not ने सही JSON response नहीं दिया",
        details: responseText
      });
    }

    res.json(data);

  } catch (error) {
    console.error("SERVER ERROR:", error);

    res.status(500).json({
      error: "Server में समस्या हुई",
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server चालू है: " + PORT);
});
