// src/utils/getDominantColor.js

const getDominantColor = (imageElement) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;
    context.drawImage(imageElement, 0, 0);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      r += imageData.data[i];
      g += imageData.data[i + 1];
      b += imageData.data[i + 2];
      count++;
    }
    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  export default getDominantColor;
  