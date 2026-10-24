require("dotenv").config();

const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20kb" }));
app.use(express.static(__dirname));

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("خطأ: مفتاح Gemini غير موجود في ملف .env");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "السيرفر يعمل" });
});

app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        error: "اكتب سؤالك الأول."
      });
    }

    if (question.length > 4000) {
      return res.status(400).json({
        error: "السؤال طويل جدًا، اختصره من فضلك."
      });
    }

    const result = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: question,
      config: {
        systemInstruction:
          "أنت المعلّم الذكي، مساعد تعليمي لطلاب المرحلة الإعدادية في مصر. اشرح بالعربية البسيطة، خطوة بخطوة، ووضّح الأمثلة، وشجّع الطالب على الفهم. إذا طلب الطالب تدريبًا، أنشئ أسئلة مناسبة ثم وضّح الإجابات عند طلبها."
      }
    });

    res.json({
      answer: result.text || "لم أتمكن من إنشاء إجابة، حاول مرة أخرى."
    });

  } catch (error) {
    console.error("خطأ Gemini:", error.message || error);

    res.status(500).json({
      error:
        "تعذر الحصول على إجابة من Gemini. راجع رسالة الخطأ في نافذة الأوامر."
    });
  }
});

app.listen(PORT, () => {
  console.log("المعلّم الذكي يعمل على http://localhost:" + PORT);
});