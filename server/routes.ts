import { Express, Request } from "express";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Record } from "./models/Record";
import { User } from "./models/User";

// Allowed MIME types for medical record uploads
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, images, Word documents, and text files are allowed."));
    }
  },
});

/**
 * Resolves a file path within the uploads directory and validates
 * that it does not escape outside the uploads directory (path traversal protection).
 */
function safeFilePath(fileName: string): string | null {
  const uploadsDir = path.resolve("uploads");
  const filePath = path.resolve(uploadsDir, fileName);
  if (!filePath.startsWith(uploadsDir + path.sep)) {
    return null; // Path traversal detected
  }
  return filePath;
}

export function registerRoutes(app: Express) {

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "Backend working 🚀" });
  });

  // Upload Record
  app.post("/api/records/upload", upload.single("file"), async (req, res) => {
    try {
      const { title, type } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const newRecord = await Record.create({
        title,
        type,
        fileName: req.file.filename
      });

      res.json({ message: "Record saved", record: newRecord });
    } catch (error) {
      res.status(500).json({ message: "Upload failed" });
    }
  });
// State variables for smooth biometric walks
let baseHeartRate = 72;
let baseOxygen = 98;
let baseSleep = 85;
let baseSys = 120;
let baseDia = 80;

// 🔥 Real-time metrics API (Smooth simulated biometrics)
app.get("/api/metrics", async (req, res) => {
  const time = Date.now() / 1000;
  
  // Smooth sine wave variations mixed with slight random noise
  const heartRate = Math.floor(baseHeartRate + Math.sin(time / 2) * 5 + (Math.random() * 2 - 1));
  const oxygenLevel = Math.floor(baseOxygen + Math.cos(time / 5) * 1 + (Math.random() * 0.5));
  const sys = Math.floor(baseSys + Math.sin(time / 3) * 3);
  const dia = Math.floor(baseDia + Math.cos(time / 3) * 2);
  const sleepScore = Math.floor(baseSleep + (Math.random() * 2 - 1)); // Slow drift

  // Keep within realistic bounds
  baseHeartRate = Math.max(60, Math.min(100, baseHeartRate));
  baseOxygen = Math.max(90, Math.min(100, baseOxygen));

  res.json({
    heartRate: Math.min(100, Math.max(60, heartRate)),
    bloodPressure: `${sys}/${dia}`,
    oxygenLevel: Math.min(100, Math.max(90, oxygenLevel)),
    sleepScore: Math.min(100, Math.max(0, sleepScore)),
    timestamp: new Date().toISOString(),
  });
});

  // Add User Profile
  app.post("/api/user/profile", async (req, res) => {
    try {
      const { uid, fullName, email, photoURL, phone, address, twoFactorEnabled } = req.body;
      
      if (!uid) {
        return res.status(400).json({ message: "Firebase UID required" });
      }

      // Upsert user: Create if not exists, update if exists. Refresh lastLogin to prevent RAM TTL deletion.
      const userDoc = await User.findOneAndUpdate(
        { uid }, 
        { 
          uid, 
          fullName, 
          email, 
          photoURL,
          ...(phone && { phone }),
          ...(address && { address }),
          ...(twoFactorEnabled !== undefined && { twoFactorEnabled }),
          lastLogin: new Date() // Resets TTL
        },
        { new: true, upsert: true }
      );

      res.json({ message: "Profile saved successfully to DB (Auto-purges after 24h)", user: userDoc });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to save profile" });
    }
  });

  // Get User Profile
  app.get("/api/user/profile/:uid", async (req, res) => {
    try {
      const userDoc = await User.findOne({ uid: req.params.uid });
      if (!userDoc) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(userDoc);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve profile" });
    }
  });

  // Get All Records
  app.get("/api/records", async (req, res) => {
    const records = await Record.find().sort({ uploadedAt: -1 });
    res.json(records);
  });

  // Download a Record File
  app.get("/api/records/:id/download", async (req, res) => {
    try {
      const record = await Record.findById(req.params.id);
      if (!record) {
        return res.status(404).json({ message: "Record not found" });
      }
      const filePath = safeFilePath(record.fileName);
      if (!filePath) {
        return res.status(400).json({ message: "Invalid file path" });
      }
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found on server" });
      }
      res.download(filePath, `${record.title}.${record.type.toLowerCase().replace(/[^a-z]/g, '')}`);
    } catch (error) {
      res.status(500).json({ message: "Download failed" });
    }
  });

  // Delete a Record
  app.delete("/api/records/:id", async (req, res) => {
    try {
      const record = await Record.findById(req.params.id);
      if (!record) {
        return res.status(404).json({ message: "Record not found" });
      }
      // Delete file from disk (with path traversal protection)
      const filePath = safeFilePath(record.fileName);
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      await Record.findByIdAndDelete(req.params.id);
      res.json({ message: "Record deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Delete failed" });
    }
  });

  // AI Chat Assistant Route
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Check for OpenAI Key - Fallback to Professional Mock AI
      if (!process.env.OPENAI_API_KEY) {
        const lowerMsg = message.toLowerCase();
        let mockReply = "Based on your query, our diagnostic framework suggests maintaining a healthy lifestyle, adequate hydration, and balanced nutrition. **Disclaimer:** This assessment is generated by the AI-Optimized Edge Engine. Always consult a certified medical professional for a formal diagnosis.";
        
        if (lowerMsg.includes("headache") || lowerMsg.includes("migraine")) {
          mockReply = "Recurrent headaches can be triggered by stress, dehydration, lack of sleep, or eye strain. We recommend reviewing your screen time and hydration levels. If symptoms persist or are accompanied by visual disturbances, please consult a neurologist. **Disclaimer:** Consult a doctor for a definitive diagnosis.";
        } else if (lowerMsg.includes("fever") || lowerMsg.includes("temperature")) {
          mockReply = "An elevated temperature indicates your body is fighting an infection. Rest, hydration, and over-the-counter antipyretics can help manage symptoms. Monitor for associated symptoms like respiratory distress. **Disclaimer:** Seek immediate medical attention if fever exceeds 103°F (39.4°C).";
        } else if (lowerMsg.includes("heart") || lowerMsg.includes("chest") || lowerMsg.includes("pain")) {
          mockReply = "⚠️ **High Priority Alert:** Chest pain or heart-related discomfort can be indicative of severe cardiovascular events. Our protocols strictly advise seeking immediate emergency medical assistance. Do not delay. **Disclaimer:** This is not medical advice, call emergency services.";
        } else if (lowerMsg.includes("sleep") || lowerMsg.includes("insomnia")) {
          mockReply = "Sleep disturbances are often linked to circadian rhythm disruptions. We recommend establishing a strict sleep hygiene protocol: limit screen exposure 2 hours before bed, control room temperature, and consider a consistent sleep schedule. **Disclaimer:** Consult a sleep specialist if insomnia persists.";
        } else if (lowerMsg.includes("diabetes") || lowerMsg.includes("blood sugar") || lowerMsg.includes("glucose")) {
          mockReply = "Diabetes management requires regular monitoring of blood glucose levels, a balanced diet low in refined carbohydrates, regular exercise, and adherence to prescribed medications. Key targets: fasting glucose 80-130 mg/dL, post-meal <180 mg/dL. Regular HbA1c tests (every 3 months) are essential. **Disclaimer:** Consult your endocrinologist for personalized treatment.";
        } else if (lowerMsg.includes("blood pressure") || lowerMsg.includes("hypertension") || lowerMsg.includes("bp")) {
          mockReply = "Normal blood pressure is below 120/80 mmHg. Stage 1 hypertension: 130-139/80-89 mmHg. Management includes reducing sodium intake (<2300mg/day), regular cardiovascular exercise, stress management, and medication as prescribed. Monitor BP twice daily and maintain a log. **Disclaimer:** Consult a cardiologist for persistent readings above 140/90.";
        } else if (lowerMsg.includes("allergy") || lowerMsg.includes("allergic") || lowerMsg.includes("rash")) {
          mockReply = "Allergic reactions can range from mild (hives, itching) to severe (anaphylaxis). Identify and avoid triggers. For mild symptoms, antihistamines may help. For severe reactions with breathing difficulty or swelling, use an epinephrine auto-injector and call emergency services immediately. **Disclaimer:** Consult an allergist for proper allergy testing and treatment plans.";
        } else if (lowerMsg.includes("anxiety") || lowerMsg.includes("stress") || lowerMsg.includes("depression") || lowerMsg.includes("mental")) {
          mockReply = "Mental health is a critical component of overall wellbeing. For anxiety and stress: practice deep breathing exercises (4-7-8 technique), engage in regular physical activity, maintain social connections, and consider cognitive behavioral therapy (CBT). If symptoms significantly impact daily life, professional support from a licensed therapist or psychiatrist is recommended. **Disclaimer:** If you're experiencing a crisis, contact your local mental health helpline immediately.";
        } else if (lowerMsg.includes("diet") || lowerMsg.includes("nutrition") || lowerMsg.includes("food") || lowerMsg.includes("eat")) {
          mockReply = "A balanced diet should include: lean proteins (25-35% calories), complex carbohydrates (45-55%), healthy fats (20-35%), and at least 5 servings of fruits/vegetables daily. Stay hydrated with 8-10 glasses of water. Limit processed foods, added sugars (<25g/day), and sodium. Consider Mediterranean or DASH diets for cardiovascular health. **Disclaimer:** Consult a registered dietitian for personalized nutrition plans.";
        } else if (lowerMsg.includes("exercise") || lowerMsg.includes("workout") || lowerMsg.includes("fitness")) {
          mockReply = "WHO recommends 150-300 minutes of moderate aerobic activity or 75-150 minutes of vigorous activity per week, plus muscle-strengthening exercises 2+ days/week. Start gradually, warm up properly, and listen to your body. Benefits include improved cardiovascular health, weight management, better sleep, and reduced anxiety. **Disclaimer:** Consult your physician before starting a new exercise program, especially with pre-existing conditions.";
        } else if (lowerMsg.includes("stomach") || lowerMsg.includes("digest") || lowerMsg.includes("nausea") || lowerMsg.includes("vomit")) {
          mockReply = "Digestive issues can indicate various conditions. For acute nausea: try the BRAT diet (Bananas, Rice, Applesauce, Toast), stay hydrated with clear fluids, and avoid spicy/fatty foods. Persistent symptoms lasting >48 hours, blood in stool, or severe abdominal pain require immediate medical evaluation. **Disclaimer:** Consult a gastroenterologist for chronic digestive issues.";
        } else if (lowerMsg.includes("covid") || lowerMsg.includes("corona") || lowerMsg.includes("pandemic")) {
          mockReply = "COVID-19 management: Isolate if symptomatic, monitor oxygen levels (seek help if SpO2 <94%), stay hydrated, rest, and take prescribed medications. Ensure vaccinations and boosters are up to date. Long COVID symptoms may include persistent fatigue, brain fog, and shortness of breath. **Disclaimer:** Follow your local health authority guidelines and consult a physician for treatment.";
        } else if (lowerMsg.includes("skin") || lowerMsg.includes("acne") || lowerMsg.includes("eczema")) {
          mockReply = "Skin health requires proper cleansing, moisturizing, and sun protection (SPF 30+). For acne: use gentle cleansers, avoid touching your face, and consider products with salicylic acid or benzoyl peroxide. Eczema benefits from fragrance-free moisturizers and avoiding triggers. Any changing moles or persistent lesions should be evaluated by a dermatologist. **Disclaimer:** Consult a dermatologist for persistent skin concerns.";
        } else if (lowerMsg.includes("weight") || lowerMsg.includes("obesity") || lowerMsg.includes("bmi")) {
          mockReply = "Healthy weight management combines balanced nutrition with regular physical activity. A sustainable deficit of 500 calories/day leads to ~1 lb/week loss. BMI ranges: Underweight <18.5, Normal 18.5-24.9, Overweight 25-29.9, Obese 30+. Focus on body composition rather than just scale weight. **Disclaimer:** Extreme diets can be dangerous. Consult a healthcare provider for a personalized weight management plan.";
        } else if (lowerMsg.includes("medication") || lowerMsg.includes("medicine") || lowerMsg.includes("drug") || lowerMsg.includes("prescription")) {
          mockReply = "Always take medications as prescribed. Store medications properly (away from heat/moisture), check expiration dates regularly, and never share prescriptions. Report any side effects to your healthcare provider immediately. Keep an updated list of all medications and supplements. **Disclaimer:** Never modify dosages without consulting your prescribing physician. Drug interactions can be dangerous.";
        } else if (lowerMsg.includes("eye") || lowerMsg.includes("vision") || lowerMsg.includes("sight")) {
          mockReply = "Eye health: Follow the 20-20-20 rule (every 20 minutes, look at something 20 feet away for 20 seconds), maintain adequate lighting, wear UV-protective sunglasses, and get annual eye exams. Sudden vision changes, flashes of light, or floating spots require immediate ophthalmological evaluation. **Disclaimer:** Consult an ophthalmologist for vision concerns and regular screenings.";
        } else if (lowerMsg.includes("back") || lowerMsg.includes("spine") || lowerMsg.includes("posture")) {
          mockReply = "Back health is crucial for daily function. Maintain proper posture, use ergonomic furniture, strengthen core muscles, and lift with your legs (not your back). For acute pain: apply ice (first 48h) then heat, gentle stretching, and OTC anti-inflammatory medication. Seek medical attention for pain radiating down legs, numbness, or bladder/bowel changes. **Disclaimer:** Consult an orthopedic specialist for persistent back pain.";
        } else if (lowerMsg.includes("breath") || lowerMsg.includes("respiratory") || lowerMsg.includes("asthma") || lowerMsg.includes("lung")) {
          mockReply = "Respiratory health: Avoid smoking and secondhand smoke, practice deep breathing exercises, maintain good air quality at home (air purifiers, plants), and stay active. For asthma: keep rescue inhalers accessible, identify triggers, and follow your action plan. SpO2 should be ≥95%. **Disclaimer:** Seek emergency care for acute breathing difficulty or SpO2 below 92%.";
        } else if (lowerMsg.includes("hello") || lowerMsg.includes("hi") || lowerMsg.includes("hey")) {
          mockReply = "Hello! Welcome to MediChain AI — your decentralized health assistant. I can help with health queries about conditions, symptoms, nutrition, fitness, medications, and more. What would you like to know? **Note:** For emergencies, always call your local emergency services first.";
        } else if (lowerMsg.includes("vaccine") || lowerMsg.includes("vaccination") || lowerMsg.includes("immuniz")) {
          mockReply = "Vaccinations are crucial for disease prevention. Ensure routine vaccines are up to date: annual flu shot, COVID-19 boosters, Tdap every 10 years, and age-appropriate screenings (shingles after 50, pneumonia after 65). Vaccines are safe, thoroughly tested, and significantly reduce disease severity. **Disclaimer:** Consult your physician for a personalized vaccination schedule.";
        }

        // Simulate network delay for realism
        await new Promise(resolve => setTimeout(resolve, 800));

        return res.json({ 
          reply: mockReply
        });
      }

      // Dynamic Import to ensure it doesn't crash the server if OpenAI init fails globally
      const { OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Using the highest accuracy model available
        messages: [
          {
            role: "system",
            content: "You are the MediChain AI Assistant, a highly advanced, professional, and 100% accurate decentralized healthcare diagnostic engine. Provide precise, brief, and structured answers to the user's health queries. Never hallucinate. Always state that this is for informational purposes and they should consult a real doctor for a final diagnosis."
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.1, // Low temperature for maximum factual accuracy and consistency
        max_tokens: 500,
      });

      const replyContent = response.choices[0]?.message?.content || "I am unable to formulate a response at this time.";

      res.json({ reply: replyContent });
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });
}