/**
 * Country Name to ISO Code Mapping
 * Centralized mapping for Spanish and English country names to ISO 3166-1 alpha-2 codes
 * Used for displaying country flags and standardizing country data
 */

export const countryNameToCode = {
  // Spanish names
  "Estados Unidos": "US",
  "España": "ES",
  "Inglaterra": "IN",
  "Reino Unido": "GB",
  "México": "MX",
  "Alemania": "DE",
  "Japón": "JP",
  "Nueva Zelanda": "NZ",
  // English names (from TMDB)
  "United States of America": "US",
  "United States": "US",
  "Spain": "ES",
  "England": "GB",
  "United Kingdom": "GB",
  "Canada": "CA",
  "Mexico": "MX",
  "Germany": "DE",
  "Japan": "JP",
  "New Zealand": "NZ",
  "Australia": "AU",
  "France": "FR",
  "Italy": "IT",
  "Brazil": "BR",
  "Argentina": "AR",
  "Chile": "CL",
  "Colombia": "CO",
  "Peru": "PE",
  "Venezuela": "VE",
  "China": "CN",
  "India": "IN",
  "South Korea": "KR",
  "Russia": "RU",
  "Poland": "PL",
  "Netherlands": "NL",
  "Belgium": "BE",
  "Switzerland": "CH",
  "Austria": "AT",
  "Sweden": "SE",
  "Norway": "NO",
  "Denmark": "DK",
  "Finland": "FI",
  "Ireland": "IE",
  "Portugal": "PT",
  "Greece": "GR",
  "Turkey": "TR",
  "Egypt": "EG",
  "South Africa": "ZA",
  "Desconocido": "ZZ",
  "Unknown": "ZZ"
};

/**
 * Get country code from country name
 * @param {string} countryName - Country name in Spanish or English
 * @returns {string} ISO 3166-1 alpha-2 country code or 'ZZ' if unknown
 */
export const getCountryCode = (countryName) => {
  if (!countryName) return 'ZZ';
  
  // Try exact match first
  if (countryNameToCode[countryName]) {
    return countryNameToCode[countryName];
  }
  
  // Try case-insensitive match
  const normalizedName = countryName.trim();
  for (const [key, code] of Object.entries(countryNameToCode)) {
    if (key.toLowerCase() === normalizedName.toLowerCase()) {
      return code;
    }
  }
  
  // If country is a 2-letter code, use it directly
  if (normalizedName.length === 2 && /^[A-Z]{2}$/i.test(normalizedName)) {
    return normalizedName.toUpperCase();
  }
  
  return 'ZZ'; // Unknown
};

