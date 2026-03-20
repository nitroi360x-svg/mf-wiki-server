const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

const app = express();
app.use(cors());
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));

// ——— Настройки Cloudinary ———
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET
});

// ——— Загрузка изображения ———
app.post("/upload", async (req, res) => {
  if (!req.files || !req.files.image) {
    return res.status(400).json({ error: "No file" });
  }

  try {
    const file = req.files.image;
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "mf-wiki-arts"
    });

    res.json({
      url: result.secure_url,
      id: result.public_id
    });
  } catch (err) {
    res.status(500).json({ error: "Upload failed", details: err });
  }
});

// ——— Получение списка всех изображений ———
app.get("/list", async (req, res) => {
  try {
    let allFiles = [];
    let nextCursor = null;

    do {
      const result = await cloudinary.api.resources({
        type: "upload",
        prefix: "mf-wiki-arts/",
        max_results: 100,
        next_cursor: nextCursor
      });

      console.log("Получено ресурсов:", result.resources.length, "next_cursor:", result.next_cursor);

      allFiles = allFiles.concat(result.resources.map(img => ({
        url: img.secure_url,
        id: img.public_id
      })));

      nextCursor = result.next_cursor;
    } while (nextCursor);

    console.log("Всего ресурсов после цикла:", allFiles.length);

    res.json(allFiles);
  } catch (err) {
    res.status(500).json({ error: "List failed", details: err });
  }
});

// ——— Удаление изображения ———
app.delete("/delete", async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).send("No id");

  try {
    await cloudinary.uploader.destroy(id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed", details: err });
  }
});

// ——— Запуск сервера ———
const PORT = process.env.PORT || 1000;
app.listen(PORT, () => console.log(`Cloudinary server running on port ${PORT}`));