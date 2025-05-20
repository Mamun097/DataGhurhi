// src/utils/handleImageUpload.js
import { supabase } from "../../../db";
import getDominantColor from "./getDominantColor";

// export const handleImageUpload = (event, setBackgroundImage, setThemeColor) => {
//   const file = event.target.files[0];
//   if (file) {
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       const img = new Image();
//       img.onload = () => {
//         const dominantColor = getDominantColor(img);
//         setThemeColor(dominantColor);
//         setBackgroundImage(img.src);
//       };
//       img.src = e.target.result;
//     };
//     reader.readAsDataURL(file);
//   }
// };

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

  // const updateImageInDB = async (type, imageUrl) => {
  //   console.log("imageUrl", imageUrl);
  //   const token = localStorage.getItem("token");

  //   try {
  //     await axios.put(
  //       "http://localhost:2000/api/profile/update-profile-image",
  //       { imageUrl },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     console.log(`${type} image updated in database.`);
  //   } catch (error) {
  //     console.error(`Failed to update ${type} image in DB:`, error);
  //   }
  // };