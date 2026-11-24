
import express from "express";

const app = express();

app.use(express.json({ limit: "8mb" }));
app.use(express.static("public"));

app.post("/send-photo", async (req, res) => {
  const { imageData } = req.body;

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId || !imageData) {
    return res.status(400).send("Configuration missing");
  }

  try {
    const match = imageData.match(
      /^data:image\/(jpeg|png|webp);base64,(.+)$/
    );

    if (!match) {
      return res.status(400).send("Invalid image");
    }

    const photo = Buffer.from(match[2], "base64");

    if (photo.length > 5 * 1024 * 1024) {
      return res.status(413).send("Image too large");
    }

    const form = new FormData();
    form.append("chat_id", chatId);
    form.append("photo", new Blob([photo]), "photo.jpg");

    const result = await fetch(
      `https://api.telegram.org/bot${token}/sendPhoto`,
      { method: "POST", body: form }
    );

    if (!result.ok) throw new Error("Telegram error");

    res.send("Photo sent");
  } catch {
    res.status(500).send("Sending failed");
  }
});

app.listen(process.env.PORT || 3000);
