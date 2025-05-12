// src/utils/handleImageUpload.js

import getDominantColor from "./getDominantColor";

export const handleImageUpload = (event, setBackgroundImage, setThemeColor) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const dominantColor = getDominantColor(img);
        setThemeColor(dominantColor);
        setBackgroundImage(img.src);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};
