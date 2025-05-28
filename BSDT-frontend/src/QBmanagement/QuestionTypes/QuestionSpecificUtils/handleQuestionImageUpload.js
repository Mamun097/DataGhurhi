import { supabase } from "../../../../db";

export const handleQuestionImageUpload = async (event, id, setQuestions) => {
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

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, image: urlData.data.publicUrl } : q
      )
    );

    console.log("Upload successful:", data);
  } catch (error) {
    console.error(`Upload failed for picture:`, error);
  }
};
