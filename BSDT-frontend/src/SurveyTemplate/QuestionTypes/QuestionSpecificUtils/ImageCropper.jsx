import React, { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Cropper from "react-easy-crop";
import { Modal } from "bootstrap";
import { supabase } from "../../../../db";
import { v4 as uuidv4 } from "uuid";

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

export default function ImageCropper({
  file,
  questionId,
  setQuestions,
  getLabel,
  onClose,
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const modalRef = useRef(null);
  const [aspectWidth, setAspectWidth] = useState(16);
  const [aspectHeight, setAspectHeight] = useState(9);

  useEffect(() => {
    const modalElement = modalRef.current;
    const modal = new Modal(modalElement, { backdrop: "static" });
    modal.show();

    return () => {
      modal.hide();
    };
  }, []);

  const onCropComplete = useCallback((_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const uploadCroppedImage = async () => {
    const croppedBlob = await getCroppedImg(
      URL.createObjectURL(file),
      croppedAreaPixels
    );
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

    const { data } = supabase.storage
      .from("survey-images")
      .getPublicUrl(filePath);
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              imageUrls: [
                ...(q.imageUrls || []),
                { url: data.publicUrl, alignment: "start" },
              ],
            }
          : q
      )
    );

    handleClose();
  };

  const handleClose = () => {
    const modalElement = modalRef.current;
    const modal = Modal.getInstance(modalElement);
    modal.hide();
    onClose();
  };

  const modalContent = (
    <div ref={modalRef} className="modal" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-lg max-w-4xl mx-auto" role="document">
        <div className="modal-content bg-white rounded-lg shadow-xl">
          <div className="modal-header border-b border-gray-200 p-4">
            <h5 className="modal-title text-lg font-semibold text-gray-800">
              {getLabel("Crop Your Image")}
            </h5>
            <button
              type="button"
              className="btn-close hover:text-red-500 transition-colors"
              onClick={handleClose}
            ></button>
          </div>
          <div className="modal-body relative" style={{ height: 400 }}>
            <Cropper
              image={URL.createObjectURL(file)}
              crop={crop}
              zoom={zoom}
              aspect={aspectWidth / aspectHeight}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              mediaStyle={{ objectFit: "cover" }}
              containerStyle={{ backgroundColor: "#f9fafb" }}
              //background={false}
              viewMode={1}
              //responsive={true}
              autoCropArea={1}
            />
          </div>
          <div className="modal-footer border-t border-gray-200 p-4 flex justify-between items-center">
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="form-range w-1/2"
            />
            <div className="d-flex items-center gap-2">
              <label className="me-1">{getLabel("Aspect Ratio:")}</label>
              <input
                type="number"
                min={1}
                value={aspectWidth}
                onChange={(e) => setAspectWidth(Number(e.target.value))}
                className="form-control w-10"
                style={{ display: "inline-block" }}
              />
              <span>:</span>
              <input
                type="number"
                min={1}
                value={aspectHeight}
                onChange={(e) => setAspectHeight(Number(e.target.value))}
                className="form-control w-10"
                style={{ display: "inline-block" }}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-outline-primary hover:bg-blue-700 rounded-md px-4 py-2 transition-colors me-2"
                onClick={uploadCroppedImage}
              >
                {getLabel("Upload")}
              </button>
              <button
                type="button"
                className="btn btn-outline-danger hover:bg-gray-600 rounded-md px-4 py-2 transition-colors"
                onClick={handleClose}
              >
                {getLabel("Cancel")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
