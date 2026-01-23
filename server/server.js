import express from "express";
import cors from "cors";
import {
  generateCaptcha,
  validateCaptcha,
  captchaConfig,
} from "ethiopian-captcha";

captchaConfig.count = 4;
captchaConfig.maxAttempts = 3;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/images", express.static("./assets/images"));

app.get("/", (req, res) => {
  res.json({ success: true, message: "API Working..." });
});
app.get("/captcha", (req, res) => {
  res.json(generateCaptcha());
});

app.post("/captcha/validate", (req, res) => {
  const { captchaId, input } = req.body;

  res.json(validateCaptcha(captchaId, input));
});

app.listen(5501, () => {
  console.log("Test server running on http://localhost:5500");
});
