import axios from "axios";
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

const translateText = async (textArray, targetLang = "bn") => {
  console.log("Translating text:", textArray, "to language:", targetLang);

  // Ensure textArray is an array or a single string
  const inputText = Array.isArray(textArray) ? textArray : [textArray];

  if (!inputText.length) {
    console.warn("No text provided for translation");
    return { data: { data: { translations: [] } } }; // Return empty translations
  }

  try {
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`,
      {
        q: inputText,
        target: targetLang,
        format: "text",
      }
    );
    console.log("API response:", response.data); // Log the full response for debugging
    return response;
  } catch (error) {
    console.error("Translation error:", error.response?.data || error.message);
    throw new Error("Failed to translate text");
  }
};

export default translateText;