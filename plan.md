Build a professional single-page React web application called the 
"Sofaamy Project Assistant" — a demo tool for Sofaamy Co. Ltd., a glass 
and aluminium supplier in Accra, Ghana (sofaamy.com).

This is a business proposal demo. It must look world-class, work on mobile, 
and be fully frontend-only (no backend). Deploy target is Vercel.

---

## TECH STACK
- React + Vite
- Tailwind CSS
- openai API  called directly from frontend (demo only)
- jsPDF + jspdf-autotable (PDF generation)
- API key stored in .env as VITE_OPENAI_API_KEY

---

## DESIGN DIRECTION

Premium African construction brand aesthetic:
- Color palette: Deep forest green (#1B3A2D) as primary, warm gold (#C9A84C) 
  as accent, off-white (#F8F5EF) as background, charcoal (#1C1C1C) for text
- Typography: Use Google Fonts — "Playfair Display" for headings, 
  "DM Sans" for body text
- Feel: Refined, trustworthy, modern — like a premium Ghanaian brand
- Header: "SOFAAMY" in Playfair Display bold, gold colored, with tagline 
  "Glass · Aluminium · Alucobond · Security Doors" in small caps beneath
- Subtle green geometric pattern as header background
- Card-based layout with soft shadows
- Gold accent line separators
- Mobile-first, responsive down to 375px
- Smooth tab transitions with fade animation
- Loading spinner in gold when Claude API is thinking

---

## APP STRUCTURE

Two tabs in the main navigation:

Tab 1: "Glass Advisor" (icon: lightbulb)
Tab 2: "Material Estimator" (icon: calculator)

Tab 1 feeds directly into Tab 2 — there is a 
"Use This Recommendation → Get Estimate" button at the end of Tab 1 
that pre-fills Tab 2 and switches to it automatically.

---

## TAB 1 — GLASS ADVISOR

Purpose: Help contractors who don't know which glass/material to use.
Replaces the need to call the sales team for product advice.

### UI Flow — 4 steps with a progress bar

Step 1: Project Type
  Question: "What are you building?"
  Options as clickable cards (with icons):
  - 🏪 Shopfront / Facade
  - 🪟 Windows (Residential)
  - 🏢 Office Partition
  - 🚿 Shower Enclosure
  - 🏗️ Curtain Wall
  - 🚪 Security Door
  - 🏛️ Balustrade / Railing

Step 2: Location & Environment
  Question: "Where is this project located?"
  Options as clickable cards:
  - 🌊 Coastal Area (High humidity, salt air)
  - ☀️ Accra / Urban Inland
  - 🏔️ Northern Ghana (Dry heat)
  - 🏢 High-rise (Above 5 floors)

Step 3: Primary Concern
  Question: "What matters most for this project?"
  Multi-select cards (user can pick up to 2):
  - 🔒 Security & Strength
  - 🌡️ Heat & Sun Control
  - 👁️ Privacy
  - 💡 Maximum Natural Light
  - 💰 Best Value for Budget
  - ✨ Premium Aesthetics

Step 4: Results — AI Recommendation
  Call openai API with the selections above.
  
  System prompt:
  "You are a glass and aluminium product expert for Sofaamy Co. Ltd. in Ghana. 
  Based on the project details provided, recommend the best glass type and 
  aluminium profile. Be specific and practical. Structure your response as JSON:
  {
    primaryRecommendation: {
      product: string,
      thickness: string,
      reason: string (2-3 sentences, practical, Ghana-specific context)
    },
    alternativeRecommendation: {
      product: string,
      thickness: string,
      reason: string
    },
    profileRecommendation: {
      product: string,
      reason: string
    },
    importantNote: string (one practical installation or maintenance tip 
                           specific to Ghana climate/context)
  }
  Return ONLY valid JSON."

  Display results as:
  - ✅ Primary Recommendation card (green border) — product name, 
    thickness, explanation
  - 🔄 Alternative Option card (gold border) — budget or alternative option
  - 🔩 Recommended Profile card — which aluminum profile to pair with it
  - 💡 Ghana-specific tip card (light background)
  
  Below results, show a prominent gold CTA button:
  "Use This Recommendation → Get My Cost Estimate"
  
  Clicking this switches to Tab 2 and pre-fills:
  - Glass Type from primary recommendation
  - Glass Thickness from primary recommendation
  - Profile Type from profile recommendation

---

## TAB 2 — MATERIAL ESTIMATOR

Purpose: Calculate exact materials needed and total cost estimate.

### Two Input Modes — toggle switch at top

MODE A: "Describe Your Project" (AI-powered, default)
  A large text area with placeholder:
  "E.g. I need glass panels for a shop front, 6 meters wide by 3 meters 
  high, tempered glass with aluminum frames. Also need 2 security doors."
  
  "Parse My Project →" button calls Claude API:
  
  System prompt:
  "You are a materials parsing assistant for Sofaamy Co. Ltd., a glass and 
  aluminium supplier in Ghana. Parse the contractor's project description 
  and return ONLY this JSON:
  {
    projectType: one of [Shopfront, Windows, Partition, Balustrade, 
                         Security Door, Curtain Wall, Shower Enclosure],
    quantity: number,
    width: number (meters),
    height: number (meters),
    glassType: one of [Clear Float, Tempered, Frosted, Tinted, 
                       Laminated, Reflective],
    glassThickness: one of [4mm, 6mm, 8mm, 10mm, 12mm],
    profileType: one of [None, Standard Window Frame, Curtain Wall Profile, 
                         Casement Frame, Sliding Door Track] or null,
    includeAlucobond: boolean,
    alucobondArea: number or null,
    includeSecurityDoor: boolean,
    securityDoorQuantity: number or null
  }
  Return ONLY valid JSON, no markdown."
  
  After parsing, show what was detected in a summary card:
  "We understood your project as: [summary]"
  User can confirm or switch to manual mode to adjust.

MODE B: "Manual Entry" (structured form)
  Fields:
  - Project Type: select dropdown
  - Number of panels/units: number input
  - Width (m): number input
  - Height (m): number input
  - Glass Type: select dropdown
  - Glass Thickness: select dropdown
  - Aluminum Profile: select dropdown
  - Include Alucobond Panels? toggle → if yes, show area (sqm) input
  - Include Security Door? toggle → if yes, show quantity input

### Calculation Engine (runs client-side, no API needed)

Glass:
  netArea = width × height × quantity
  totalGlassArea = netArea × 1.15  // 15% waste factor
  
Aluminum Profile (if selected):
  perimeterPerUnit = 2 × (width + height)
  totalProfile = perimeterPerUnit × quantity × 1.10  // 10% waste
  
Alucobond (if selected):
  alucobondTotal = inputArea × 1.10

Glass unit prices (GHS per sqm):
  Clear Float 4mm: 85
  Clear Float 6mm: 120
  Tempered 8mm: 280
  Tempered 10mm: 340
  Tempered 12mm: 410
  Frosted 6mm: 155
  Tinted 6mm: 145
  Laminated 6mm: 190
  Reflective 6mm: 200

Aluminum Profile prices (GHS per linear meter):
  Standard Window Frame: 45
  Curtain Wall Profile: 95
  Casement Frame: 55
  Sliding Door Track: 70

Alucobond Panel: 320 per sqm
Security Door (standard): 1,800 per unit

Subtotal = sum of all line items
Installation & Accessories = subtotal × 0.10
VAT = (subtotal + installation) × 0.15
TOTAL = subtotal + installation + VAT

### Results Display

Show a detailed breakdown card:
- Line items table: Description | Qty/Area | Unit Price | Total
- Subtotal row
- Installation & Accessories row
- VAT (15%) row
- TOTAL in large gold text
- Disclaimer in small text: 
  "Indicative estimate only. Final pricing subject to site assessment 
  and current stock availability. Prices in GHS."

### Three Action Buttons

1. 📄 "Download PDF Quote" — green button
   Generate PDF using jsPDF with:
   - Header: "SOFAAMY CO. LTD" in large text
   - Subheader: "Glass · Aluminium · Alucobond · Security Doors"
   - Address: Off Legon GIMPA Road, Achimota, Accra
   - Phone: +233 247 958 357 | +233 544 564 160
   - Date generated
   - Project Summary section
   - Materials table (use jspdf-autotable)
   - Totals section
   - Footer: "To confirm this quote, contact our team on WhatsApp 
     or visit our showroom. Valid for 7 days."
   - File saved as: sofaamy-estimate-[date].pdf

2. 💬 "Send to Sofaamy on WhatsApp" — gold button, most prominent
   Opens: https://wa.me/233247958357 with pre-filled message:
   "Hi Sofaamy Team, I used your online estimator and got a quote for 
   my project. Here are the details:
   
   Project: [projectType]
   Glass: [glassType] [thickness] — [area] sqm
   [other items if selected]
   Estimated Total: GHS [total]
   
   I'd like to confirm this quote. Please advise on availability."

3. 🔄 "New Estimate" — outlined button, resets form

---

## FOOTER

Simple footer with:
- "Powered by Veloxa Technology Limited"
- Small text: "Built for Sofaamy Co. Ltd. · Demo Version"

---

## FILE STRUCTURE

sofaamy-estimator/
  src/
    components/
      Header.jsx
      TabNav.jsx
      GlassAdvisor.jsx
      MaterialEstimator.jsx
      ResultsCard.jsx
      PDFGenerator.js
    utils/
      calculations.js      // all pricing + calculation logic here
      claudeClient.js      // Claude API calls, handles fetch + parsing
    App.jsx
    main.jsx
    index.css
  .env
  .env.example            // VITE_ANTHROPIC_API_KEY=your_key_here
  index.html
  vite.config.js
  tailwind.config.js

---

## IMPORTANT NOTES

1. The openai API is called directly from the frontend — this is intentional 
   for demo purposes. Add a comment in openaiClient.js noting this should 
   move to a backend before production.

2. All open API calls must have proper error handling:
   - Loading state with spinner
   - Error message if API fails with a "Try manual entry instead" fallback

3. If the API key is missing, show a banner: 
   "Demo mode — AI features require API key. Manual entry still works."
   Manual entry and calculations must work without any API key.

4. Pricing disclaimer must appear on every screen that shows prices.

5. The WhatsApp button must be visible and accessible at all times on 
   the results screen — this is the primary conversion goal.