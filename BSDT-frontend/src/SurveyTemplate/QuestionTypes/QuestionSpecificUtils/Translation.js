import axios from "axios";
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;

const translateText = async (textArray, targetLang = "bn") => {
  const response = await axios.post(
    `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`,
    {
      q: textArray,
      target: targetLang,
      format: "text",
    }
  );
  return response;
};

export default translateText;