export default function extractJson(rawString) {
  if (typeof rawString !== "string") return rawString;

  let str = rawString.trim();

  // 1. अगर AI ने मार्कडाउन ```json ... ``` ब्लॉक दिया है तो उसे क्लीन करें
  if (str.startsWith("```")) {
    str = str.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
  }

  // 2. पहला प्रयास: स्टैंडर्ड पार्सिंग
  try {
    return JSON.parse(str);
  } catch (e) {
    console.log("⚡ Standard JSON failed. Running Ultra-Extraction Core...");
  }

  // 3. अल्टीमेट अचूक फॉलबैक: सीधे टेक्स्ट में से "code" की वैल्यू काटना (No JSON.parse Required!)
  try {
    const codeMarker = '"code":';
    let codeIndex = str.indexOf(codeMarker);

    if (codeIndex !== -1) {
      // "code": के ठीक बाद का हिस्सा लें
      let remaining = str.substring(codeIndex + codeMarker.length).trim();
      
      // अगर शुरुआत में डबल कोट '"' है, तो उसे हटाकर असली कंटेंट ढूंढें
      if (remaining.startsWith('"')) {
        remaining = remaining.substring(1);
      }

      // अब आखिरी छोर से उल्टे पैर चलें और क्लोजिंग ब्रैकेट/कोट्स को साफ़ करें
      let cleanCode = remaining;
      
      // अगर JSON के अंत में '}' या '"]}' जैसी चीज़ें बची हैं, उन्हें ट्रिम करें
      if (cleanCode.endsWith("}")) cleanCode = cleanCode.slice(0, -1).trim();
      if (cleanCode.endsWith("]")) cleanCode = cleanCode.slice(0, -1).trim();
      if (cleanCode.endsWith('"')) cleanCode = cleanCode.slice(0, -1).trim();
      if (cleanCode.endsWith('\\"')) cleanCode = cleanCode.slice(0, -2).trim();

      // वापस एक वैलिड ऑब्जेक्ट बनाकर भेज दें ताकि कंट्रोलर को उसका 'parsed.code' मिल जाए
      return {
        message: "Successfully recovered via structural text carving",
        code: cleanCode
      };
    }
  } catch (fallbackErr) {
    console.error("🚨 Core Carver Failed:", fallbackErr);
  }

  // अगर सब कुछ बर्बाद हो जाए तो ओरिजिनल एरर फेंकें
  throw new Error("JSON structure is completely corrupted by AI model.");
}