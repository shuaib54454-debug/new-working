import express from "express";
import { GoogleGenAI } from "@google/genai";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, cert, getApps, App as FirebaseAdminApp } from "firebase-admin/app";

const rootDir = process.cwd();
const distPath = path.join(rootDir, "dist");
const publicPath = path.join(rootDir, "public");
const configPath = path.join(rootDir, "firebase-applet-config.json");

const app = express();
const PORT = Number.parseInt(process.env.PORT || "3000", 10);
const OWNER_EMAIL = String(process.env.OWNER_EMAIL || "shuaib54454@gmail.com").trim().toLowerCase();

let firebaseConfig: any = {};
try {
  if (existsSync(configPath)) {
    firebaseConfig = JSON.parse(readFileSync(configPath, "utf-8"));
  }
} catch (error) {
  console.error("Failed to load Firebase config:", error instanceof Error ? error.message : "unknown error");
}
const PRIMARY_PROJECT_ID = String(firebaseConfig?.projectId || "crack-petal-506818-c8");
const ALLOWED_PROJECT_IDS = new Set<string>(
  [
    PRIMARY_PROJECT_ID,
    process.env.FIREBASE_PROJECT_ID,
    process.env.GOOGLE_CLOUD_PROJECT,
    process.env.GCP_PROJECT,
    "crack-petal-506818-c8",
    "gen-lang-client-0213401665",
    ...(Array.isArray(firebaseConfig?.allowedProjectIds) ? firebaseConfig.allowedProjectIds : [])
  ]
    .filter(Boolean)
    .map(String)
);
const firebaseApps = new Map<string, FirebaseAdminApp>();

function getFirebaseAuthForProject(projectId: string) {
  if (!ALLOWED_PROJECT_IDS.has(projectId)) throw new Error(`Unauthorized Firebase project: ${projectId}`);
  let firebaseApp = firebaseApps.get(projectId);
  if (!firebaseApp) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (serviceAccountJson) {
      try {
        const serviceAccount = JSON.parse(serviceAccountJson);
        if (String(serviceAccount.project_id || "") === projectId) {
          firebaseApp = initializeApp({ credential: cert(serviceAccount), projectId }, `auth-${projectId}`);
        }
      } catch (err) {
        console.warn("Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON, falling back to public key verification:", err instanceof Error ? err.message : err);
      }
    }
    if (!firebaseApp) {
      firebaseApp = getApps().find((candidate) => candidate.name === `auth-${projectId}`) ||
        initializeApp({ projectId }, `auth-${projectId}`);
    }
    firebaseApps.set(projectId, firebaseApp);
  }
  return getAuth(firebaseApp);
}

function getTokenProjectId(idToken: string): string {
  const parts = idToken.split(".");
  if (parts.length !== 3) throw new Error("Malformed Firebase ID token");
  const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
  const projectId = typeof payload?.aud === "string" ? payload.aud : "";
  if (!projectId || !ALLOWED_PROJECT_IDS.has(projectId)) throw new Error(`Unauthorized Firebase project: ${projectId}`);
  return projectId;
}

async function verifyPassportScanAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ success: false, error: "Authentication required" });
  const idToken = authHeader.slice(7).trim();
  if (!idToken || idToken === "guest" || idToken === "applet-agency-session" || idToken.startsWith("local-mode-user:")) {
    return res.status(401).json({ success: false, error: "A verified Firebase ID token is required" });
  }
  try {
    const projectId = getTokenProjectId(idToken);
    const auth = getFirebaseAuthForProject(projectId);
    // checkRevoked requires service account credentials with IAM permissions.
    // If a service account is configured, checkRevoked = true; otherwise cryptographic public-key verification (checkRevoked = false).
    const hasServiceAccount = Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    const decoded = await auth.verifyIdToken(idToken, hasServiceAccount);
    const email = typeof decoded.email === "string" ? decoded.email.trim().toLowerCase() : "";
    if (!email || email !== OWNER_EMAIL) return res.status(403).json({ success: false, error: "Owner account required" });
    (req as any).user = decoded;
    return next();
  } catch (error) {
    console.warn("Passport scan authentication failed:", error instanceof Error ? error.message : "unknown error");
    return res.status(401).json({ success: false, error: "Invalid or expired authentication token" });
  }
}

const geminiKey = process.env.GEMINI_API_KEY;
const ai = geminiKey ? new GoogleGenAI({ apiKey: geminiKey }) : null;

// CORS is allowlisted. Never reflect an arbitrary Origin while credentials are enabled.
const configuredOrigins = String(process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set<string>([
  ...configuredOrigins,
  "capacitor://localhost",
  "http://localhost",
  "https://localhost",
  "http://localhost:3000",
  "https://localhost:3000"
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, Cache-Control, Pragma, X-Client-Version, X-Platform");
  if (req.method === "OPTIONS") {
    if (origin && !allowedOrigins.has(origin)) return res.sendStatus(403);
    return res.sendStatus(204);
  }
  return next();
});

app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Health is intentionally non-diagnostic: do not expose project IDs, key presence,
// or deployment details to unauthenticated callers.
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.post("/api/scan-passport", verifyPassportScanAuth, async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg" } = req.body || {};
    const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (typeof imageBase64 !== "string" || imageBase64.length < 100) {
      return res.status(400).json({ success: false, error: "Valid passport image is required" });
    }
    if (!allowedMimeTypes.has(mimeType)) {
      return res.status(400).json({ success: false, error: "Unsupported image type" });
    }
    const rawBase64 = imageBase64.replace(/^data:[^;]+;base64,/, "").replace(/\s/g, "");
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(rawBase64) || rawBase64.length % 4 !== 0) {
      return res.status(400).json({ success: false, error: "Invalid image encoding" });
    }
    // Limit decoded image payload to approximately 8 MiB.
    const estimatedBytes = Math.floor((rawBase64.length * 3) / 4);
    if (estimatedBytes > 8 * 1024 * 1024) {
      return res.status(413).json({ success: false, error: "Passport image is too large" });
    }
    if (!ai) return res.status(503).json({ success: false, error: "Passport scanning service is not configured" });

    const prompt = `You are an expert passport OCR reader specialized in ICAO Doc 9303 standards.
Analyze this image to locate the passport bio-data page and extract all identity and MRZ (Machine Readable Zone) information.
Note: The image may be a single passport photo, a scanned document, a mobile screenshot, or a composite/collage (e.g. a passport page displayed next to a personal photo or full-body picture). Always locate the passport data page and extract its data.

Return ONLY a valid JSON object with the following structure:
{
  "mrzLine1": "P<ETH... 44 characters or empty string",
  "mrzLine2": "... 44 characters or empty string",
  "visualZone": {
    "firstName": "Given name in English/Latin or transliterated",
    "lastName": "Surname in English/Latin or transliterated",
    "fullName": "Full name in English/Latin",
    "fullNameArabic": "Full name in Arabic if visible or transliterated",
    "passportNumber": "Passport number e.g. EP1234567 or A12345678",
    "birthDate": "YYYY-MM-DD",
    "expiryDate": "YYYY-MM-DD",
    "gender": "female or male",
    "nationality": "Country name in Arabic or English e.g. إثيوبيا / Ethiopia",
    "jobTitle": "Job or occupation if visible"
  },
  "overallStatus": "VERIFIED or NEEDS_REVIEW"
}
If the MRZ on the document is partially obscured, blurry, or missing, extract all clearly visible text from the visual zone and reconstruct the standard 44-character TD3 MRZ lines (line1 starting with P< and line2 with passport number, dates, and check digits) based on the visual fields so that the user receives complete, actionable data.`;
    const models = ["gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-3.6-flash", "gemini-flash-latest"];
    let lastError: unknown = null;

    for (const model of models) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const result = await ai.models.generateContent({
            model,
            contents: [{
              role: "user",
              parts: [
                { inlineData: { mimeType, data: rawBase64 } },
                { text: prompt }
              ]
            }],
            config: { responseMimeType: "application/json" }
          });
          const text = result.text?.trim();
          if (!text) throw new Error("Empty Gemini response");
          const parsed = JSON.parse(text);

          // Standardize response payload so client always receives mrzLine1, mrzLine2 and visualZone
          const rawMrz = typeof parsed.mrz === "string" ? parsed.mrz.split("\n").map((s: string) => s.trim()).filter(Boolean) : [];
          const mrzLine1 = parsed.mrzLine1 || rawMrz[0] || "";
          const mrzLine2 = parsed.mrzLine2 || rawMrz[1] || "";
          const vz = parsed.visualZone || {};
          const visualZone = {
            firstName: vz.firstName || parsed.firstName || parsed.givenNames || "",
            lastName: vz.lastName || parsed.lastName || parsed.surname || "",
            fullName: vz.fullName || parsed.fullName || (parsed.givenNames && parsed.surname ? `${parsed.givenNames} ${parsed.surname}` : ""),
            fullNameArabic: vz.fullNameArabic || parsed.fullNameArabic || "",
            passportNumber: vz.passportNumber || parsed.passportNumber || "",
            birthDate: vz.birthDate || parsed.birthDate || parsed.dateOfBirth || "",
            expiryDate: vz.expiryDate || parsed.expiryDate || parsed.dateOfExpiry || "",
            gender: vz.gender || (parsed.sex === "F" ? "female" : parsed.sex === "M" ? "male" : parsed.sex) || (parsed.gender === "female" ? "female" : "male"),
            nationality: vz.nationality || parsed.nationality || parsed.issuingCountry || "",
            jobTitle: vz.jobTitle || parsed.jobTitle || ""
          };

          return res.json({
            success: true,
            data: {
              mrzLine1,
              mrzLine2,
              visualZone,
              overallStatus: parsed.overallStatus || "VERIFIED"
            },
            model
          });
        } catch (error) {
          lastError = error;
          const msg = error instanceof Error ? error.message : String(error);
          const isBusy = msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("high demand") || msg.includes("429");
          if (isBusy && attempt === 0) {
            await new Promise((resolve) => setTimeout(resolve, 800));
            continue;
          }
          break;
        }
      }
    }

    console.error("All Gemini passport scan models failed:", lastError instanceof Error ? lastError.message : "unknown error");
    return res.status(502).json({ success: false, error: "Passport scanning service temporarily unavailable. Please retry in a few moments." });
  } catch (error) {
    console.error("Passport scan request failed:", error instanceof Error ? error.message : "unknown error");
    return res.status(500).json({ success: false, error: "Passport scan request failed" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.get("/manifest.webmanifest", (_req, res) => {
      const distFile = path.join(distPath, "manifest.webmanifest");
      if (existsSync(distFile)) return res.sendFile(distFile);
      return res.sendFile(path.join(publicPath, "manifest.webmanifest"));
    });
    app.get("/sw.js", (_req, res) => {
      const distFile = path.join(distPath, "sw.js");
      if (existsSync(distFile)) return res.sendFile(distFile);
      return res.sendFile(path.join(publicPath, "sw.js"));
    });
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
