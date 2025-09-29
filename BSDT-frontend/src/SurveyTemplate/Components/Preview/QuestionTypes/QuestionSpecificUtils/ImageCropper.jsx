import React, { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Cropper from "react-easy-crop";
import { Modal } from "bootstrap";
import { supabase } from "../../../../db";
import { v4 as uuidv4 } from "uuid";

// Function to generate cropped image (assumed unchanged from original)
async function getCroppedImg(imageSrc, pixelCrop) {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));
  
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg");
  });
}

export default function ImageCropper({ file, questionId, setQuestions, onClose }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const modalRef = useRef(null);

  // Initialize Bootstrap modal when component mounts
  useEffect(() => {
    const modalElement = modalRef.current;
    const modal = new Modal(modalElement, { backdrop: "static" });
    modal.show();

    // Cleanup on unmount
    return () => {
      modal.hide();
    };
  }, []);

  // Store cropped area when crop is complete
  const onCropComplete = useCallback((_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  // Upload cropped image to Supabase and update state
  const uploadCroppedImage = async () => {
    const croppedBlob = await getCroppedImg(URL.createObjectURL(file), croppedAreaPixels);
    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${questionId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("survey-images")
      .upload(filePath, croppedBlob);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return;
    }

    const { data } = supabase.storage.from("survey-images").getPublicUrl(filePath);
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, imageUrl: data.publicUrl } : q
      )
    );

    handleClose();
  };

  // Close the modal and trigger onClose callback
  const handleClose = () => {
    const modalElement = modalRef.current;
    const modal = Modal.getInstance(modalElement);
    modal.hide();
    onClose();
  };

  // Modal content rendered via portal
  const modalContent = (
    <div ref={modalRef} className="modal" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Crop Your Image</h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>
          <div className="modal-body" style={{ height: 400, position: "relative" }}>
            <Cropper
              image={URL.createObjectURL(file)}
              crop={crop}
              zoom={zoom}
              background={false}
              guides={true}
              viewMode={1}
              responsive={true}
              autoCropArea={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="modal-footer">
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="form-range w-100"
            />
            <button type="button" className="btn btn-primary" onClick={uploadCroppedImage}>
              Upload Cropped
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render modal content directly into document.body
  return createPortal(modalContent, document.body);
}