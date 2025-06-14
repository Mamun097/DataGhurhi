// src/utils/handleImageUpload.js
import { supabase } from "../../../db";

export const handleImageUpload = async (event, setImage) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const { data, error } = await supabase.storage
      .from("survey-images")
      .upload(`${file.name}`, file, {
        upsert: true, // Update the file if it already exists
      });

    if (error) {
      console.error("Upload failed:", error.message);
      return;
    }
    const urlData = supabase.storage
      .from("survey-images")
      .getPublicUrl(`${file.name}`);

    console.log("publicURL", urlData.data.publicUrl);
    // Update the background Image URL in the database
    // await updateImageInDB(type, urlData.data.publicUrl);

    console.log(`Picture URL:`, urlData.data.publicUrl);
    setImage(urlData.data.publicUrl);
    console.log("Upload successful:", data);
  } catch (error) {
    console.error(`Upload failed for picture:`, error);
  }
};
