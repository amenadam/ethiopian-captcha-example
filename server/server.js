import express from "express";
import cors from "cors";
import { createCaptcha } from "ethiopian-captcha";

const TYPES = ["fidel", "geez-math", "click-image"];

const captcha = createCaptcha({
  secret: process.env.CAPTCHA_SECRET, // set a long random value in production
  imageBaseUrl: process.env.IMAGE_BASE_URL, // where CAPTCHA_ETHIOPIAN_ITEMS.png is served
  count: 4,
  maxAttempts: 3,
});

const app = express();
app.use(cors());
app.use(express.json({ limit: "1kb" }));

app.get("/", (req, res) => {
  res.json({ success: true, message: "API Working..." });
});

app.post("/captcha", async (req, res) => {
  const type = TYPES.includes(req.body?.type) ? req.body.type : "fidel";
  res.json(await captcha.generate(type));
});

app.post("/captcha/validate", async (req, res) => {
  const { captchaId, input } = req.body ?? {};
  res.json(await captcha.validate(captchaId, input));
});

const PORT = process.env.PORT || 5501;
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
});
