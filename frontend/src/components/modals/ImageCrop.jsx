import { useRef, useState, useEffect } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  convertToPixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import "./imageCrop.scss";

const ASPECT_RATIO = 1;
const MIN_DIMENSION = 150;

const setCanvasPreview = (image, canvas, crop) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("No 2d context");
  }

  const pixelRatio = window.devicePixelRatio;
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = "high";
  ctx.save();

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;

  ctx.translate(-cropX, -cropY);
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight
  );

  ctx.restore();
};

export default function ImageCrop({show, onClose}) {
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState();
  const [error, setError] = useState("");
  const imageCropRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (imageCropRef.current && !imageCropRef.current.contains(e.target)) {
        setImgSrc("");
        setCrop(null);
        setError("");
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  })

  const onSelectFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const imageElement = new Image();
      const imageUrl = reader.result?.toString() || "";
      imageElement.src = imageUrl;

      imageElement.addEventListener("load", (e) => {
        if (error) setError("");
        const { naturalWidth, naturalHeight } = e.currentTarget;
        if (naturalWidth < MIN_DIMENSION || naturalHeight < MIN_DIMENSION) {
          setError("Image must be at least 150 x 150 pixels.");
          return setImgSrc("");
        }
      });
      setImgSrc(imageUrl);
    });
    reader.readAsDataURL(file);
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const cropWidthInPercent = (MIN_DIMENSION / width) * 100;

    const crop = makeAspectCrop(
      {
        unit: "%",
        width: cropWidthInPercent,
      },
      ASPECT_RATIO,
      width,
      height
    );
    const centeredCrop = centerCrop(crop, width, height);
    setCrop(centeredCrop);
  };
  if(!show) return null;
  return (
      <div className="image-crop-modal d-flex flex-column" ref={imageCropRef}>
        <label htmlFor="image">Select image: </label>
        <input type="file" name="image" id="image" onChange={onSelectFile} />
        <button className="btn-close" style={{position: 'absolute', top: '5px', right:'5px'}} onClick={onClose}></button>
        {imgSrc && (
          <div className="image-preview align-self-center">
            <ReactCrop
              crop={crop}
              onChange={(pixelCrop, percentCrop) => setCrop(percentCrop)}
              circularCrop
              keepSelection
              aspect={1}
              minWidth={75}
            >
              <img
                ref={imgRef}
                src={imgSrc}
                alt="Crop me"
                onLoad={onImageLoad}
                style={{ maxWidth: "100%" }}
              />
            </ReactCrop>
          </div>
        )}
        {crop && (
          <button
            className="btn btn-info align-self-center"
            onClick={() => {
              setCanvasPreview(
                imgRef.current,
                previewCanvasRef.current,
                convertToPixelCrop(
                  crop,
                  imgRef.current.width,
                  imgRef.current.height
                )
              );
              const dataUrl = previewCanvasRef.current.toDataURL();
            }}
          >
            Submit
          </button>
        )}
        {crop && (
          <canvas
            ref={previewCanvasRef}
            className="align-self-center mt-3"
            style={{
              borderRadius: '50%',
              border: "1px solid black",
              objectFit: "contain",
              width: 150,
              height: 150,
            }}
          />
        )}
      </div>
  );
}
