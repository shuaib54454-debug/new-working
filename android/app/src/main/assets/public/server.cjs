var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_genai = require("@google/genai");
var import_fs = require("fs");
var import_path = __toESM(require("path"), 1);
var import_auth = require("firebase-admin/auth");
var import_app = require("firebase-admin/app");
var rootDir = process.cwd();
var distPath = import_path.default.join(rootDir, "dist");
var publicPath = import_path.default.join(rootDir, "public");
var configPath = import_path.default.join(rootDir, "firebase-applet-config.json");
var app = (0, import_express.default)();
var PORT = Number.parseInt(process.env.PORT || "3000", 10);
var OWNER_EMAIL = String(process.env.OWNER_EMAIL || "shuaib54454@gmail.com").trim().toLowerCase();
var firebaseConfig = {};
try {
  if ((0, import_fs.existsSync)(configPath)) {
    firebaseConfig = JSON.parse((0, import_fs.readFileSync)(configPath, "utf-8"));
  }
} catch (error) {
  console.error("Failed to load Firebase config:", error instanceof Error ? error.message : "unknown error");
}
var PRIMARY_PROJECT_ID = String(firebaseConfig?.projectId || "crack-petal-506818-c8");
var ALLOWED_PROJECT_IDS = new Set(
  [
    PRIMARY_PROJECT_ID,
    process.env.FIREBASE_PROJECT_ID,
    process.env.GOOGLE_CLOUD_PROJECT,
    process.env.GCP_PROJECT,
    "crack-petal-506818-c8",
    "gen-lang-client-0213401665",
    ...Array.isArray(firebaseConfig?.allowedProjectIds) ? firebaseConfig.allowedProjectIds : []
  ].filter(Boolean).map(String)
);
var firebaseApps = /* @__PURE__ */ new Map();
function getFirebaseAuthForProject(projectId) {
  if (!ALLOWED_PROJECT_IDS.has(projectId)) throw new Error(`Unauthorized Firebase project: ${projectId}`);
  let firebaseApp = firebaseApps.get(projectId);
  if (!firebaseApp) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (serviceAccountJson) {
      try {
        const serviceAccount = JSON.parse(serviceAccountJson);
        if (String(serviceAccount.project_id || "") === projectId) {
          firebaseApp = (0, import_app.initializeApp)({ credential: (0, import_app.cert)(serviceAccount), projectId }, `auth-${projectId}`);
        }
      } catch (err) {
        console.warn("Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON, falling back to public key verification:", err instanceof Error ? err.message : err);
      }
    }
    if (!firebaseApp) {
      firebaseApp = (0, import_app.getApps)().find((candidate) => candidate.name === `auth-${projectId}`) || (0, import_app.initializeApp)({ projectId }, `auth-${projectId}`);
    }
    firebaseApps.set(projectId, firebaseApp);
  }
  return (0, import_auth.getAuth)(firebaseApp);
}
function getTokenProjectId(idToken) {
  const parts = idToken.split(".");
  if (parts.length !== 3) throw new Error("Malformed Firebase ID token");
  const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
  const projectId = typeof payload?.aud === "string" ? payload.aud : "";
  if (!projectId || !ALLOWED_PROJECT_IDS.has(projectId)) throw new Error(`Unauthorized Firebase project: ${projectId}`);
  return projectId;
}
async function verifyPassportScanAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ success: false, error: "Authentication required" });
  const idToken = authHeader.slice(7).trim();
  if (!idToken || idToken === "guest" || idToken === "applet-agency-session" || idToken.startsWith("local-mode-user:")) {
    return res.status(401).json({ success: false, error: "A verified Firebase ID token is required" });
  }
  try {
    const projectId = getTokenProjectId(idToken);
    const auth = getFirebaseAuthForProject(projectId);
    const hasServiceAccount = Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    const decoded = await auth.verifyIdToken(idToken, hasServiceAccount);
    const email = typeof decoded.email === "string" ? decoded.email.trim().toLowerCase() : "";
    if (!email || email !== OWNER_EMAIL) return res.status(403).json({ success: false, error: "Owner account required" });
    req.user = decoded;
    return next();
  } catch (error) {
    console.warn("Passport scan authentication failed:", error instanceof Error ? error.message : "unknown error");
    return res.status(401).json({ success: false, error: "Invalid or expired authentication token" });
  }
}
var geminiKey = process.env.GEMINI_API_KEY;
var ai = geminiKey ? new import_genai.GoogleGenAI({ apiKey: geminiKey }) : null;
var configuredOrigins = String(process.env.ALLOWED_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean);
var allowedOrigins = /* @__PURE__ */ new Set([
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
app.use(import_express.default.json({ limit: "12mb" }));
app.use(import_express.default.urlencoded({ extended: true, limit: "1mb" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.post("/api/scan-passport", verifyPassportScanAuth, async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg" } = req.body || {};
    const allowedMimeTypes = /* @__PURE__ */ new Set(["image/jpeg", "image/png", "image/webp"]);
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
    const estimatedBytes = Math.floor(rawBase64.length * 3 / 4);
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
    "nationality": "Country name in Arabic or English e.g. \u0625\u062B\u064A\u0648\u0628\u064A\u0627 / Ethiopia",
    "jobTitle": "Job or occupation if visible"
  },
  "overallStatus": "VERIFIED or NEEDS_REVIEW"
}
If the MRZ on the document is partially obscured, blurry, or missing, extract all clearly visible text from the visual zone and reconstruct the standard 44-character TD3 MRZ lines (line1 starting with P< and line2 with passport number, dates, and check digits) based on the visual fields so that the user receives complete, actionable data.`;
    const models = ["gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-3.6-flash", "gemini-flash-latest"];
    let lastError = null;
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
          const rawMrz = typeof parsed.mrz === "string" ? parsed.mrz.split("\n").map((s) => s.trim()).filter(Boolean) : [];
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
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.get("/manifest.webmanifest", (_req, res) => {
      const distFile = import_path.default.join(distPath, "manifest.webmanifest");
      if ((0, import_fs.existsSync)(distFile)) return res.sendFile(distFile);
      return res.sendFile(import_path.default.join(publicPath, "manifest.webmanifest"));
    });
    app.get("/sw.js", (_req, res) => {
      const distFile = import_path.default.join(distPath, "sw.js");
      if ((0, import_fs.existsSync)(distFile)) return res.sendFile(distFile);
      return res.sendFile(import_path.default.join(publicPath, "sw.js"));
    });
    app.use(import_express.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
