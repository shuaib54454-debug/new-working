export interface CandidateIdCardData {
  fullName: string;
  jobTitle?: string;
  photoUrl?: string;
  idCardNumber?: string;
  passportNumber?: string;
  cocNumber?: string;
  medicalExamStatus?: string;
  organizationName?: string;
  logoUrl?: string;
  issueDate?: string;
  expiryDate?: string;
}

export interface IdCardRenderOptions {
  isAr?: boolean;
  showOrganization?: boolean;
  showLogo?: boolean;
  showDates?: boolean;
  maskSensitiveData?: boolean;
  showQrCode?: boolean;
  side?: "both" | "front" | "back";
}

var __defProp=Object.defineProperty;var __name=(target,value)=>__defProp(target,"name",{value,configurable:true});function escapeHtml(value){return String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}__name(escapeHtml,"escapeHtml");function safeImageUrl(value){const raw=String(value??"").trim();if(!raw)return"";if(/^(https?:\/\/|blob:)/i.test(raw))return raw;if(/^data:image\/(?:png|jpe?g|gif|webp);base64,/i.test(raw))return raw;return""}__name(safeImageUrl,"safeImageUrl");function maskSensitiveValue(value){if(!value)return"----";const clean=value.trim();if(clean.length<=4)return clean;const lastFour=clean.slice(-4);return`\u2022\u2022\u2022\u2022 ${lastFour}`}__name(maskSensitiveValue,"maskSensitiveValue");function getMedicalExamBadgeHtml(status,isAr=true){const normalized=(status||"").trim();if(normalized==="\u0645\u0643\u062A\u0645\u0644"||normalized.includes("\u0644\u0627\u0626\u0642")||normalized.toLowerCase().includes("complete")||normalized.toLowerCase().includes("fit")){return`
      <span class="cr80-badge cr80-badge-success">
        <svg class="cr80-badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>${isAr?"\u0645\u0643\u062A\u0645\u0644 (\u0644\u0627\u0626\u0642 \u0637\u0628\u064A\u0627\u064B)":"Completed (Fit)"}</span>
      </span>
    `}else if(normalized==="\u0642\u064A\u062F \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629"||normalized.includes("\u0628\u0627\u0646\u062A\u0638\u0627\u0631")||normalized.toLowerCase().includes("review")||normalized.toLowerCase().includes("pending")){return`
      <span class="cr80-badge cr80-badge-warning">
        <svg class="cr80-badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>${isAr?"\u0642\u064A\u062F \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629":"Under Review"}</span>
      </span>
    `}else{return`
      <span class="cr80-badge cr80-badge-danger">
        <svg class="cr80-badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        <span>${isAr?"\u063A\u064A\u0631 \u0645\u0643\u062A\u0645\u0644":"Incomplete"}</span>
      </span>
    `}}__name(getMedicalExamBadgeHtml,"getMedicalExamBadgeHtml");function getMedicalEmblemSvg(color="#c9a84c"){return`
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2v20M4 7c3-2 5-2 8 0 3-2 5-2 8 0M4 12c3-2 5-2 8 0 3-2 5-2 8 0M7 21h10M12 4a2 2 0 100-4 2 2 0 000 4z" />
      <circle cx="12" cy="2" r="1.5" fill="${color}" />
    </svg>
  `}__name(getMedicalEmblemSvg,"getMedicalEmblemSvg");function getDoctorFallbackAvatarSvg(){return`
    <svg viewBox="0 0 100 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="120" fill="#e2e8f0"/>
      <circle cx="50" cy="42" r="24" fill="#cbd5e1"/>
      <path d="M18 110c0-22 14-38 32-38s32 16 32 38" fill="#cbd5e1"/>
      <path d="M42 66 L50 82 L58 66 Z" fill="#38bdf8"/>
      <path d="M50 82 L50 110" stroke="#0284c7" stroke-width="4"/>
      <circle cx="50" cy="40" r="16" fill="#94a3b8"/>
      <path d="M38 34 Q50 24 62 34" stroke="#475569" stroke-width="3" fill="none"/>
    </svg>
  `}__name(getDoctorFallbackAvatarSvg,"getDoctorFallbackAvatarSvg");function generateQrCodeSvg(text,sizeMm=14){let hash=0;for(let i=0;i<text.length;i++){hash=(hash<<5)-hash+text.charCodeAt(i);hash|=0}const grid=21;const cells=[];const isFinderPattern=__name((r,c)=>{if(r<7&&c<7)return true;if(r<7&&c>=grid-7)return true;if(r>=grid-7&&c<7)return true;return false},"isFinderPattern");const getFinderColor=__name((r,c,originR,originC)=>{const dr=r-originR;const dc=c-originC;if(dr===0||dr===6||dc===0||dc===6)return true;if(dr>=2&&dr<=4&&dc>=2&&dc<=4)return true;return false},"getFinderColor");for(let r=0;r<grid;r++){for(let c=0;c<grid;c++){let isDark=false;if(r<7&&c<7){isDark=getFinderColor(r,c,0,0)}else if(r<7&&c>=grid-7){isDark=getFinderColor(r,c,0,grid-7)}else if(r>=grid-7&&c<7){isDark=getFinderColor(r,c,grid-7,0)}else if(r===6||c===6){isDark=(r+c)%2===0}else{const seed=Math.abs((hash^r*31+c*17)%100);isDark=seed%3===0||seed%5===0}if(isDark){cells.push(`<rect x="${c}" y="${r}" width="1.02" height="1.02" fill="#0c1a2e" />`)}}}return`
    <svg viewBox="0 0 ${grid} ${grid}" width="${sizeMm}mm" height="${sizeMm}mm" style="display:block;border-radius:1.5mm;background:#fff;padding:0.6mm;box-sizing:border-box;" xmlns="http://www.w3.org/2000/svg">
      ${cells.join("")}
    </svg>
  `}__name(generateQrCodeSvg,"generateQrCodeSvg");function getIdCardStyles(){return`
    /* CR80 Standard ID Card Typography & Reset */
    .cr80-wrapper {
      direction: rtl;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Cairo", "Tajawal", sans-serif;
      box-sizing: border-box;
      color: #0c1a2e;
      text-align: right;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .cr80-wrapper * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    /* Container for cards */
    .cr80-cards-container {
      display: flex;
      flex-wrap: wrap;
      gap: 6mm;
      justify-content: center;
      align-items: center;
    }

    /* CR80 Dimensions: EXACTLY 85.6mm x 54mm */
    .cr80-card {
      width: 85.6mm;
      height: 54mm;
      min-width: 85.6mm;
      max-width: 85.6mm;
      min-height: 54mm;
      max-height: 54mm;
      border-radius: 3.18mm; /* ISO CR80 standard corner radius */
      position: relative;
      overflow: hidden;
      background: #ffffff;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
      border: 0.25mm solid #cbd5e1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Subtle security guilloch\xE9 background watermark */
    .cr80-card::before {
      content: "";
      position: absolute;
      inset: 0;
      background-image: 
        radial-gradient(circle at 15% 50%, rgba(201, 168, 76, 0.04) 0%, transparent 60%),
        radial-gradient(circle at 85% 30%, rgba(15, 118, 110, 0.05) 0%, transparent 50%),
        linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(255, 255, 255, 0.95) 100%);
      pointer-events: none;
      z-index: 1;
    }

    .cr80-content {
      position: relative;
      z-index: 2;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 3mm 3.5mm;
    }

    /* =========================================================================
       FRONT SIDE STYLES
       ========================================================================= */
    .cr80-front-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 0.3mm solid #e2e8f0;
      padding-bottom: 1.8mm;
      margin-bottom: 2mm;
    }

    .cr80-header-info {
      display: flex;
      flex-direction: column;
      gap: 0.3mm;
    }

    .cr80-org-name {
      font-size: 2.6mm;
      font-weight: 800;
      color: #0c1a2e;
      line-height: 1.2;
      letter-spacing: -0.01em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 52mm;
    }

    .cr80-title-badge {
      display: inline-flex;
      align-items: center;
      gap: 1mm;
      font-size: 2.1mm;
      font-weight: 700;
      color: #c9a84c;
      letter-spacing: 0.02em;
    }

    .cr80-logo-box {
      width: 7.5mm;
      height: 7.5mm;
      border-radius: 1.5mm;
      background: #f1f5f9;
      border: 0.2mm solid #cbd5e1;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
    }

    .cr80-logo-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    /* Front Body: Photo + Doctor Info */
    .cr80-front-body {
      display: flex;
      gap: 3mm;
      align-items: center;
      flex: 1;
    }

    .cr80-photo-frame {
      width: 21mm;
      height: 26mm;
      min-width: 21mm;
      border-radius: 2mm;
      border: 0.35mm solid #c9a84c;
      box-shadow: 0 1mm 2mm rgba(0, 0, 0, 0.08);
      overflow: hidden;
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .cr80-photo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .cr80-doc-details {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      overflow: hidden;
    }

    .cr80-doc-name {
      font-size: 3.6mm;
      font-weight: 900;
      color: #0c1a2e;
      line-height: 1.15;
      margin-bottom: 0.8mm;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .cr80-job-chip {
      display: inline-flex;
      align-items: center;
      align-self: flex-start;
      padding: 0.4mm 1.8mm;
      border-radius: 1.2mm;
      background: #e0f2fe;
      border: 0.2mm solid #bae6fd;
      color: #0369a1;
      font-size: 2.3mm;
      font-weight: 800;
      margin-bottom: 1.2mm;
      line-height: 1.2;
    }

    .cr80-field-row {
      display: flex;
      align-items: center;
      gap: 1.2mm;
      font-size: 2mm;
      line-height: 1.3;
      color: #475569;
    }

    .cr80-field-label {
      font-weight: 700;
      color: #64748b;
      min-width: 14mm;
    }

    .cr80-field-val {
      font-weight: 800;
      color: #0f172a;
      font-family: monospace, system-ui;
      letter-spacing: 0.02em;
    }

    /* Front Footer */
    .cr80-front-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 0.25mm solid #e2e8f0;
      padding-top: 1.2mm;
      margin-top: 1mm;
      font-size: 1.8mm;
      color: #64748b;
    }

    .cr80-date-badge {
      display: flex;
      gap: 2mm;
      font-weight: 600;
    }

    .cr80-security-bar {
      display: flex;
      align-items: center;
      gap: 0.5mm;
    }

    .cr80-sec-dot {
      width: 1.2mm;
      height: 1.2mm;
      border-radius: 50%;
    }

    /* =========================================================================
       BACK SIDE STYLES
       ========================================================================= */
    .cr80-back-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #0c1a2e;
      color: #ffffff;
      margin: -3mm -3.5mm 2mm -3.5mm;
      padding: 1.8mm 3.5mm;
      border-bottom: 0.4mm solid #c9a84c;
    }

    .cr80-back-title {
      font-size: 2.3mm;
      font-weight: 800;
      letter-spacing: 0.01em;
      color: #f8fafc;
    }

    .cr80-back-id {
      font-size: 2.1mm;
      font-family: monospace, system-ui;
      font-weight: 700;
      color: #c9a84c;
    }

    .cr80-back-grid {
      display: flex;
      flex-direction: column;
      gap: 1.2mm;
      flex: 1;
      justify-content: center;
    }

    .cr80-grid-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f8fafc;
      border: 0.2mm solid #e2e8f0;
      border-radius: 1.4mm;
      padding: 1mm 2mm;
      font-size: 2.1mm;
    }

    .cr80-grid-label {
      font-weight: 700;
      color: #475569;
      display: flex;
      align-items: center;
      gap: 1mm;
    }

    .cr80-grid-value {
      font-weight: 800;
      color: #0c1a2e;
      font-family: monospace, system-ui;
      direction: ltr;
      text-align: left;
    }

    /* Status Badges */
    .cr80-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.8mm;
      padding: 0.3mm 1.5mm;
      border-radius: 1mm;
      font-size: 2mm;
      font-weight: 800;
      line-height: 1.2;
    }

    .cr80-badge-icon {
      width: 2.2mm;
      height: 2.2mm;
      flex-shrink: 0;
    }

    .cr80-badge-success {
      background: #ecfdf5;
      color: #065f46;
      border: 0.2mm solid #a7f3d0;
    }

    .cr80-badge-warning {
      background: #fffbeb;
      color: #92400e;
      border: 0.2mm solid #fde68a;
    }

    .cr80-badge-danger {
      background: #fef2f2;
      color: #991b1b;
      border: 0.2mm solid #fecaca;
    }

    /* Back Footer: Stamp & QR Code */
    .cr80-back-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 0.25mm solid #e2e8f0;
      padding-top: 1.2mm;
      margin-top: 1mm;
    }

    .cr80-stamp-box {
      display: flex;
      flex-direction: column;
      gap: 0.4mm;
      flex: 1;
    }

    .cr80-stamp-title {
      font-size: 1.7mm;
      font-weight: 700;
      color: #64748b;
    }

    .cr80-stamp-signature {
      height: 4.5mm;
      width: 28mm;
      border-bottom: 0.25mm dashed #94a3b8;
      display: flex;
      align-items: flex-end;
      font-size: 1.5mm;
      color: #94a3b8;
      font-style: italic;
    }

    .cr80-qr-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.3mm;
    }

    .cr80-qr-label {
      font-size: 1.4mm;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    /* =========================================================================
       PRINT MEDIA QUERY: EXACT CR80 PRINTING (85.6mm x 54mm, 0 MARGIN)
       ========================================================================= */
    @page {
      size: 85.6mm 54mm;
      margin: 0;
    }

    @media print {
      html, body {
        width: 85.6mm !important;
        height: 54mm !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      /* Hide any modal overlays, app headers, sidebars, buttons */
      body * {
        visibility: hidden;
      }

      /* Show only the CR80 card container */
      .cr80-wrapper,
      .cr80-wrapper * {
        visibility: visible;
      }

      .cr80-wrapper {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 85.6mm !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      .cr80-cards-container {
        display: block !important;
        gap: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      .cr80-card {
        margin: 0 !important;
        box-shadow: none !important;
        border: none !important;
        page-break-after: always !important;
        break-after: page !important;
        width: 85.6mm !important;
        height: 54mm !important;
      }

      .cr80-no-print {
        display: none !important;
      }
    }
  `}__name(getIdCardStyles,"getIdCardStyles");function generateFrontCardHtml(data: CandidateIdCardData,options: IdCardRenderOptions={}){const isAr=options.isAr!==false;const showOrg=options.showOrganization!==false;const showLogo=options.showLogo!==false;const showDates=options.showDates!==false;const orgName=showOrg&&data.organizationName?escapeHtml(data.organizationName):isAr?"\u0627\u0644\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u062A\u062E\u0635\u0635\u064A \u0644\u0644\u0631\u0639\u0627\u064A\u0629 \u0627\u0644\u0635\u062D\u064A\u0629":"Specialized Healthcare Center";const jobTitle=escapeHtml(data.jobTitle||(isAr?"\u0637\u0628\u064A\u0628":"Doctor"));const photoSrc=safeImageUrl(data.photoUrl);return`
    <div class="cr80-card cr80-card-front" id="cr80-card-front" style="direction: ${isAr?"rtl":"ltr"}; text-align: ${isAr?"right":"left"};">
      <div class="cr80-content">
        <!-- Header -->
        <div class="cr80-front-header">
          <div class="cr80-header-info">
            <span class="cr80-org-name">${orgName}</span>
            <div class="cr80-title-badge">
              <span>${isAr?"\u0628\u0637\u0627\u0642\u0629 \u062A\u0639\u0631\u064A\u0641 \u0645\u0647\u0646\u064A\u0629":"PROFESSIONAL ID"}</span>
              <span>\u2022</span>
              <span style="font-size: 1.8mm; color: #0284c7;">${isAr?"DOCTOR ID":"MEDICAL"}</span>
            </div>
          </div>
          ${showLogo?`<div class="cr80-logo-box">
                  ${safeImageUrl(data.logoUrl)?`<img src="${safeImageUrl(data.logoUrl)}" class="cr80-logo-img" alt="Logo" />`:getMedicalEmblemSvg("#0c1a2e")}
                </div>`:""}
        </div>

        <!-- Body: Photo + Info -->
        <div class="cr80-front-body">
          <div class="cr80-photo-frame">
            ${photoSrc?`<img src="${photoSrc}" class="cr80-photo-img" alt="${escapeHtml(data.fullName)}" />`:getDoctorFallbackAvatarSvg()}
          </div>
          <div class="cr80-doc-details">
            <div class="cr80-doc-name" title="${escapeHtml(data.fullName)}">${escapeHtml(data.fullName||(isAr?"\u0637\u0628\u064A\u0628 \u0645\u0639\u062A\u0645\u062F":"Certified Doctor"))}</div>
            <div class="cr80-job-chip">
              <svg style="width:2.2mm;height:2.2mm;margin-${isAr?"left":"right"}:0.8mm;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
              <span>${jobTitle}</span>
            </div>
            <div class="cr80-field-row">
              <span class="cr80-field-label">${isAr?"\u0631\u0642\u0645 \u0627\u0644\u062A\u0639\u0631\u064A\u0641:":"ID Number:"}</span>
              <span class="cr80-field-val">${escapeHtml(data.idCardNumber||"DOC-0001")}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="cr80-front-footer">
          ${showDates?`<div class="cr80-date-badge">
                  <span>${isAr?"\u0625\u0635\u062F\u0627\u0631:":"Issued:"} <b>${escapeHtml(data.issueDate||new Date().toISOString().slice(0,10))}</b></span>
                  <span>${isAr?"\u0627\u0646\u062A\u0647\u0627\u0621:":"Expires:"} <b>${escapeHtml(data.expiryDate||"2028-12-31")}</b></span>
                </div>`:`<div></div>`}
          <div class="cr80-security-bar">
            <span class="cr80-sec-dot" style="background:#c9a84c;"></span>
            <span class="cr80-sec-dot" style="background:#0f766e;"></span>
            <span class="cr80-sec-dot" style="background:#0284c7;"></span>
            <span style="font-size:1.6mm;font-weight:800;color:#94a3b8;margin-${isAr?"right":"left"}:1mm;">VERIFIED</span>
          </div>
        </div>
      </div>
    </div>
  `}__name(generateFrontCardHtml,"generateFrontCardHtml");function generateBackCardHtml(data: CandidateIdCardData,options: IdCardRenderOptions={}){const isAr=options.isAr!==false;const isMasked=!!options.maskSensitiveData;const showQr=options.showQrCode!==false;const notAvailableStr=isAr?"\u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631":"N/A";const displayPassport=isMasked?maskSensitiveValue(data.passportNumber):data.passportNumber||notAvailableStr;const displayCoc=isMasked?maskSensitiveValue(data.cocNumber):data.cocNumber||notAvailableStr;const verificationPayload=JSON.stringify({id:data.idCardNumber,name:data.fullName,med:data.medicalExamStatus,coc:displayCoc});return`
    <div class="cr80-card cr80-card-back" id="cr80-card-back" style="direction: ${isAr?"rtl":"ltr"}; text-align: ${isAr?"right":"left"};">
      <div class="cr80-content">
        <!-- Header -->
        <div class="cr80-back-header">
          <span class="cr80-back-title">${isAr?"\u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0647\u0646\u064A\u0629 \u0648\u0627\u0644\u0623\u0645\u0646\u064A\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629":"Certified Professional Credentials"}</span>
          <span class="cr80-back-id">${escapeHtml(data.idCardNumber||"DOC-0001")}</span>
        </div>

        <!-- Back Data Grid -->
        <div class="cr80-back-grid">
          <!-- Passport Number -->
          <div class="cr80-grid-item">
            <span class="cr80-grid-label">
              <svg style="width:2.2mm;height:2.2mm;" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2">
                <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                <line x1="7" y1="8" x2="17" y2="8"></line>
                <line x1="7" y1="12" x2="13" y2="12"></line>
              </svg>
              <span>${isAr?"\u0631\u0642\u0645 \u0627\u0644\u062C\u0648\u0627\u0632:":"Passport No:"}</span>
            </span>
            <span class="cr80-grid-value">${escapeHtml(displayPassport)}</span>
          </div>

          <!-- COC Number -->
          <div class="cr80-grid-item">
            <span class="cr80-grid-label">
              <svg style="width:2.2mm;height:2.2mm;" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
              <span>${isAr?"\u0634\u0647\u0627\u062F\u0629 \u0627\u0644\u0643\u0641\u0627\u0621\u0629 (COC):":"COC Certificate:"}</span>
            </span>
            <span class="cr80-grid-value">${escapeHtml(displayCoc)}</span>
          </div>

          <!-- Medical Exam Status -->
          <div class="cr80-grid-item">
            <span class="cr80-grid-label">
              <svg style="width:2.2mm;height:2.2mm;" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
              <span>${isAr?"\u0627\u0644\u0641\u062D\u0635 \u0627\u0644\u0637\u0628\u064A:":"Medical Exam:"}</span>
            </span>
            <span>${getMedicalExamBadgeHtml(data.medicalExamStatus,isAr)}</span>
          </div>
        </div>

        <!-- Back Footer: Stamp & QR -->
        <div class="cr80-back-footer">
          <div class="cr80-stamp-box">
            <span class="cr80-stamp-title">${isAr?"\u0627\u0644\u062A\u0648\u0642\u064A\u0639 \u0648\u0627\u0644\u062E\u062A\u0645 \u0627\u0644\u0645\u0639\u062A\u0645\u062F":"Authorized Stamp & Signature"}</span>
            <div class="cr80-stamp-signature">
              <span>${isAr?"\u062A\u0648\u0642\u064A\u0639 \u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0637\u0628\u064A / \u0627\u0644\u062E\u062A\u0645 \u0627\u0644\u0631\u0633\u0645\u064A":"Medical Director Signature / Seal"}</span>
            </div>
          </div>
          ${showQr?`<div class="cr80-qr-wrapper">
                  ${generateQrCodeSvg(verificationPayload,12)}
                  <span class="cr80-qr-label">${isAr?"\u0627\u0644\u062A\u062D\u0642\u0642 \u0627\u0644\u0630\u0643\u064A":"Smart Verify"}</span>
                </div>`:""}
        </div>
      </div>
    </div>
  `}__name(generateBackCardHtml,"generateBackCardHtml");function renderIdCard(rootElement: any,candidateData: CandidateIdCardData,options: IdCardRenderOptions={}){if(!rootElement){throw new Error("renderIdCard: rootElement must be a valid HTMLElement")}const side=options.side||"both";let cardsMarkup="";if(side==="both"||side==="front"){cardsMarkup+=generateFrontCardHtml(candidateData,options)}if(side==="both"||side==="back"){cardsMarkup+=generateBackCardHtml(candidateData,options)}const styles=getIdCardStyles();rootElement.innerHTML=`
    <div class="cr80-wrapper">
      <style>${styles}</style>
      <div class="cr80-cards-container cr80-printable-container">
        ${cardsMarkup}
      </div>
    </div>
  `}__name(renderIdCard,"renderIdCard");export{generateBackCardHtml,generateFrontCardHtml,generateQrCodeSvg,getIdCardStyles,maskSensitiveValue,renderIdCard};
