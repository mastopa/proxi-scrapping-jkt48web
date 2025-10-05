import express from "express";
import cors from "cors";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Vercel Puppeteer proxy is running 🚀",
    usage: "/fetch?url=YOUR_URL",
  });
});

app.get("/fetch", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).json({ error: "Missing ?url=" });

  console.log(`[INFO] Fetching via headless Chrome: ${targetUrl}`);

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
    );

    await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: 30000 });
    const html = await page.content();
    await browser.close();

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err) {
    console.error("[ERROR] Puppeteer fetch failed:", err.message);
    res.status(500).json({
      error: "Puppeteer fetch failed",
      detail: err.message,
    });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () =>
  console.log(`✅ Vercel Puppeteer proxy running on port ${port}`)
);
