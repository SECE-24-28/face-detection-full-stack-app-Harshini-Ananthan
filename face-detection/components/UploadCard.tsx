"use client";

import { useMemo, useRef, useState } from "react";
import FaceBox from "./FaceBox";

type BoundingBox = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type DetectionResult = {
  imageUrl: string;
  faceCount: number;
  faces: BoundingBox[];
};

export default function UploadCard() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const boxes = useMemo(() => {
    if (!result || !imageRef.current) return [];

    const img = imageRef.current;
    const scaleX = img.width / img.naturalWidth;
    const scaleY = img.height / img.naturalHeight;

    return result.faces.map((face) => ({
      top: face.top * scaleY,
      left: face.left * scaleX,
      width: face.width * scaleX,
      height: face.height * scaleY,
    }));
  }, [result]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    if (!selected) return;
    setFile(selected);
    setResult(null);

    const blobUrl = URL.createObjectURL(selected);
    setPreview(blobUrl);
  };

  const handleDetect = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    // Upload file to server first
    const uploadFd = new FormData();
    uploadFd.append("file", file);

    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: uploadFd,
    });
    const uploadJson = await uploadRes.json();
    const shortUrl = uploadJson?.url;
    if (!shortUrl) {
      setLoading(false);
      return;
    }
    const imageUrl = shortUrl.startsWith("http") ? shortUrl : `${window.location.origin}${shortUrl}`;

    const query = `mutation DetectFace($imageUrl: String!) { detectFace(imageUrl: $imageUrl) { imageUrl faceCount faces { top left width height } } }`;

    const response = await fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { imageUrl } }),
    });
    const json = await response.json();

    if (json.data?.detectFace) {
      setResult(json.data.detectFace);
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-xl bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Face Detection</h1>
          <p className="mt-2 text-sm text-slate-500">Upload an image and detect faces with server-side GraphQL.</p>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Upload image</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-3 block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
          />
        </label>

        <button
          type="button"
          onClick={handleDetect}
          disabled={!file || loading}
          className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-white transition disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? "Detecting..." : "Detect Face"}
        </button>

        {preview ? (
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
            <img
              ref={imageRef}
              src={preview}
              alt="Preview"
              className="block w-full h-auto"
              onLoad={() => setResult((prev) => (prev ? { ...prev } : prev))}
            />
            {boxes.map((box, index) => (
              <FaceBox key={`${index}-${box.top}-${box.left}`} box={box} />
            ))}
          </div>
        ) : null}

        {result ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold">Detection count</p>
            <p>{result.faceCount} face{result.faceCount === 1 ? "" : "s"} detected</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
