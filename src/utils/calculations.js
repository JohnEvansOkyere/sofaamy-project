// Pricing (GHS) and calculation logic for Sofaamy Project Assistant

export const GLASS_PRICES = {
  'Clear Float': { '4mm': 85, '6mm': 120 },
  'Tempered': { '8mm': 280, '10mm': 340, '12mm': 410 },
  'Frosted': { '6mm': 155 },
  'Tinted': { '6mm': 145 },
  'Laminated': { '6mm': 190 },
  'Reflective': { '6mm': 200 },
};

/** Thickness options per glass type (only combinations with valid pricing) */
export const GLASS_THICKNESSES_BY_TYPE = {
  'Clear Float': ['4mm', '6mm'],
  'Tempered': ['8mm', '10mm', '12mm'],
  'Frosted': ['6mm'],
  'Tinted': ['6mm'],
  'Laminated': ['6mm'],
  'Reflective': ['6mm'],
};

export const PROFILE_PRICES = {
  'None': 0,
  'Standard Window Frame': 45,
  'Curtain Wall Profile': 95,
  'Casement Frame': 55,
  'Sliding Door Track': 70,
};

export const ALUCOBOND_PRICE = 320; // per sqm
export const SECURITY_DOOR_PRICE = 1800; // per unit
export const WASTE_GLASS = 1.15;
export const WASTE_PROFILE = 1.10;
export const WASTE_ALUCOBOND = 1.10;
export const INSTALLATION_RATE = 0.10;
export const VAT_RATE = 0.15;

/**
 * Get glass unit price (GHS per sqm). Handles various key formats.
 */
export function getGlassUnitPrice(glassType, thickness) {
  const typeKey = Object.keys(GLASS_PRICES).find(
    (k) => k.toLowerCase() === (glassType || '').toLowerCase()
  );
  if (!typeKey) return 0;
  const thicknessKey = Object.keys(GLASS_PRICES[typeKey]).find(
    (t) => t === thickness || t === `${thickness}mm` || `${t}` === `${thickness}`
  );
  if (!thicknessKey) return 0;
  return GLASS_PRICES[typeKey][thicknessKey];
}

/**
 * Get profile unit price (GHS per linear meter).
 */
export function getProfileUnitPrice(profileType) {
  if (!profileType || profileType === 'None') return 0;
  const key = Object.keys(PROFILE_PRICES).find(
    (k) => k.toLowerCase() === (profileType || '').toLowerCase()
  );
  return key ? PROFILE_PRICES[key] : 0;
}

/**
 * Calculate all line items and totals from form inputs.
 */
export function calculateEstimate(input) {
  const {
    projectType,
    quantity = 1,
    width = 0,
    height = 0,
    glassType,
    glassThickness,
    profileType,
    includeAlucobond = false,
    alucobondArea = 0,
    includeSecurityDoor = false,
    securityDoorQuantity = 0,
  } = input;

  const lines = [];
  let subtotal = 0;

  // Glass
  const netArea = width * height * quantity;
  const totalGlassArea = netArea * WASTE_GLASS;
  const glassUnitPrice = getGlassUnitPrice(glassType, glassThickness);
  if (glassType && glassThickness && totalGlassArea > 0 && glassUnitPrice > 0) {
    const glassTotal = totalGlassArea * glassUnitPrice;
    lines.push({
      description: `Glass — ${glassType} ${glassThickness}`,
      qtyOrArea: `${totalGlassArea.toFixed(2)} sqm`,
      unitPrice: glassUnitPrice,
      total: glassTotal,
    });
    subtotal += glassTotal;
  }

  // Aluminum profile
  if (profileType && profileType !== 'None') {
    const perimeterPerUnit = 2 * (width + height);
    const totalProfileM = perimeterPerUnit * quantity * WASTE_PROFILE;
    const profileUnitPrice = getProfileUnitPrice(profileType);
    if (profileUnitPrice > 0) {
      const profileTotal = totalProfileM * profileUnitPrice;
      lines.push({
        description: `Aluminium — ${profileType}`,
        qtyOrArea: `${totalProfileM.toFixed(2)} lm`,
        unitPrice: profileUnitPrice,
        total: profileTotal,
      });
      subtotal += profileTotal;
    }
  }

  // Alucobond
  if (includeAlucobond && alucobondArea > 0) {
    const alucobondTotalArea = alucobondArea * WASTE_ALUCOBOND;
    const alucobondTotal = alucobondTotalArea * ALUCOBOND_PRICE;
    lines.push({
      description: 'Alucobond panels',
      qtyOrArea: `${alucobondTotalArea.toFixed(2)} sqm`,
      unitPrice: ALUCOBOND_PRICE,
      total: alucobondTotal,
    });
    subtotal += alucobondTotal;
  }

  // Security doors
  if (includeSecurityDoor && securityDoorQuantity > 0) {
    const securityTotal = securityDoorQuantity * SECURITY_DOOR_PRICE;
    lines.push({
      description: 'Security door (standard)',
      qtyOrArea: securityDoorQuantity,
      unitPrice: SECURITY_DOOR_PRICE,
      total: securityTotal,
    });
    subtotal += securityTotal;
  }

  const installation = subtotal * INSTALLATION_RATE;
  const vat = (subtotal + installation) * VAT_RATE;
  const total = subtotal + installation + vat;

  return {
    lines,
    subtotal,
    installation,
    vat,
    total,
    projectType: projectType || 'Project',
    glassType,
    glassThickness,
    totalGlassArea: totalGlassArea || 0,
    profileType,
    includeAlucobond,
    alucobondArea: includeAlucobond ? alucobondArea : 0,
    includeSecurityDoor,
    securityDoorQuantity: includeSecurityDoor ? securityDoorQuantity : 0,
  };
}
