/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useRef, useEffect } from "react";
import LFDWrapper from "@/components/detect/Wrapper";
import Loading from "@/components/Loading";
import { useRouter } from "next/navigation";
import { IconCamera, IconUpload } from "@tabler/icons-react";
import { Button } from "../ui/button";

export default function DetectionMenu() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captureUrl, setCaptureUrl] = useState<string | null>(null);
  const [capturedFileInfo, setCapturedFileInfo] = useState<{
    name: string;
    size: number;
  } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Membuka kamera dan menampilkan stream ke elemen video
  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setStream(mediaStream);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error("Error opening camera:", error);
    }
  };

  // Menutup popup preview
  const closePreview = () => {
    setCaptureUrl(null);
    setCapturedFileInfo(null);
    setIsPreviewOpen(false);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Cek apakah file yang diunggah adalah gambar
      if (!file.type.startsWith("image/")) {
        console.error("File yang diunggah bukan gambar.");
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setCaptureUrl(dataUrl);
        setCapturedFileInfo({ name: file.name, size: file.size });
      };
    }
  };

  // Memicu klik pada input file
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (captureUrl || isPreviewOpen) return;
    setIsDragging(true);
  };

  // Handler drop untuk menangani file yang di-drag dan di-drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      // Cek apakah file yang di-drop adalah gambar
      if (!file.type.startsWith("image/")) {
        console.error("File yang diunggah bukan gambar.");
        setIsDragging(false);
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setCaptureUrl(dataUrl);
        setCapturedFileInfo({ name: file.name, size: file.size });
      };
    }
    setIsDragging(false);
  };

  // Menangkap gambar dari elemen video dan menampilkan hasilnya
  const captureAndUpload = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // Mengubah canvas menjadi data URL dan menampilkannya
      const dataUrl = canvas.toDataURL("image/png");
      const blob = await (await fetch(dataUrl)).blob();
      const fileSize = blob.size;

      setCaptureUrl(dataUrl);
      setCapturedFileInfo({ name: "captured-image.png", size: fileSize });

      setIsPreviewOpen(false);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }
  };

  // Membersihkan stream kamera saat komponen unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const processImage = async (imageUrl: string) => {
    setIsLoading(true);
    try {
      console.log("Processing image:", imageUrl);
      // const response = await fetch('/api/detect', {
      // 	method: 'POST',
      // 	headers: {
      // 		'Content-Type': 'application/json',
      // 	},
      // 	body: JSON.stringify({ imageUrl }),
      // });
      // if (!response.ok) {
      // 	throw new Error('Failed to process image');
      // }
      // const data = await response.json();
      // console.log('Detection result:', data);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      router.push("/result/123");
    } catch (error) {
      console.error("Error processing image:", error);
    }
  };

  return (
    <LFDWrapper onDrop={handleDrop} onDragOver={handleDragOver}>
      <div
        className="fixed top-0 left-0 z-100 flex h-screen w-screen"
        style={{ display: isDragging ? "flex" : "none" }}
        onDragLeave={() => setIsDragging(false)}
      ></div>
      <div
        className="bg-background/80 fixed top-0 left-0 z-80 flex h-screen w-screen items-center justify-center"
        style={{ display: isDragging ? "flex" : "none" }}
        onDragLeave={() => setIsDragging(false)}
      >
        <div className="bg-background/60 border-border flex h-[80vh] w-[80vw] items-center justify-center rounded-3xl border-2 border-dashed">
          <div className="flex animate-pulse flex-col items-center justify-center text-lg font-bold text-white">
            <IconUpload size={40} />
            <p className="mt-4">Drop it like it{"'"}s hot</p>
          </div>
        </div>
      </div>
      {isLoading && <Loading>Memproses Deteksi Daun ...</Loading>}
      {!captureUrl ? (
        <section
          className="bg-card/[0.4] border-border m-4 grid grid-cols-1 items-center gap-5 rounded-2xl border-[1px] p-4 backdrop-blur-xs md:grid-cols-2"
          id="set-image"
        >
          <LFDISContainer
            onClick={openCamera}
            title="Ambil Foto Langsung"
            subtitle="Izinkan penggunaan kamera Anda"
          >
            <IconCamera size={20} className="text-white" />
          </LFDISContainer>
          <LFDISContainer
            onClick={triggerFileUpload}
            title="Unggah dari perangkat Anda"
            subtitle="Drag and drop file atau klik untuk upload"
          >
            <IconUpload size={20} className="text-white" />
          </LFDISContainer>
        </section>
      ) : (
        <section
          className="border-border shadoew-md bg-card/[0.5] border-[2px] border-dashed p-6 backdrop-blur-xs"
          id="preview-image"
        >
          <h1 className="mb-6 text-center text-foreground font-mono uppercase font-bold">Pratinjau</h1>
          <div className="border-border dark:bg-input flex flex-col items-center justify-center gap-1 rounded-[20px] border-[1px] bg-zinc-100 p-4">
            {captureUrl && (
              <img
                src={captureUrl}
                alt="Captured Image"
                className="max-w-md rounded-md"
              />
            )}
            <h1 className="mt-4 text-sm text-foreground font-bold">{capturedFileInfo?.name}</h1>
            <h2 className="text-muted-foreground text-xs">
              {capturedFileInfo
                ? `${(capturedFileInfo.size / 1024).toFixed(2)} KB`
                : "Tidak ada file yang diunggah"}
            </h2>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              onClick={setCaptureUrl.bind(null, null)}
            >
              Kembali
            </Button>
            <button
              onClick={processImage.bind(null, captureUrl!)}
              className={`bg-primary dark:shadow-foreground/[0.3] hover:bg-primary/80 rounded-md p-2 text-sm font-medium text-white transition-all duration-200 dark:shadow-inner ${!captureUrl ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            >
              Deteksi
            </button>
          </div>
        </section>
      )}

      <div
        className="fixed top-0 z-50 items-center justify-center"
        style={{ display: isPreviewOpen ? "flex" : "none" }}
      >
        <div className="flex h-screen w-screen items-center justify-center bg-black/80">
          <div className="dark:bg-card border-border relative m-4 rounded-xl border-[1px] bg-zinc-100 p-4 drop-shadow-xl">
            <div className="border-border flex items-center border-b pb-4">
              <span className="text-foreground grow font-bold">
                Ambil Gambar
              </span>
              <Button onClick={closePreview} variant="destructive">
                Batal
              </Button>
            </div>
            <div>
              <video
                ref={videoRef}
                autoPlay
                className="my-4 aspect-video w-full rounded-2xl"
              />
              <canvas ref={canvasRef} className="hidden" />
              {captureUrl && (
                <img
                  src={captureUrl}
                  alt="Captured Image"
                  className="mt-4 w-full"
                />
              )}
            </div>
            <div className="flex justify-center">
              <button
                onClick={captureAndUpload}
                className="aspect-square cursor-pointer items-center justify-center rounded-full border-3 border-red-500 p-[8px] shadow-md"
              >
                <div className="mx-auto aspect-square rounded-full bg-red-500 p-[24px] transition-all hover:scale-110 hover:bg-red-500/80"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Input file tersembunyi untuk unggahan dari perangkat */}
      <input
        type="file"
        accept="image/*"
        hidden
        ref={fileInputRef}
        onChange={handleFileSelect}
      />
    </LFDWrapper>
  );
}

interface LFDISContainerProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}

function LFDISContainer({
  children,
  title,
  subtitle,
  onClick,
}: LFDISContainerProps) {
  return (
    <div
      className={`border-border bg-card/[0.5] border-[2px] border-dashed p-4`}
    >
      <div
        className="dark:bg-input border-border flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border bg-zinc-100 p-18 duration-200 hover:scale-[1.02] md:aspect-[4/3] dark:border-none"
        onClick={onClick}
      >
        <div className="bg-primary dark:shadow-foreground/[0.6] mb-5 flex aspect-square items-center justify-center rounded-md p-5 duration-200 dark:shadow-inner">
          {children}
        </div>
        <h1 className="text-foreground text-center text-sm font-bold">
          {title}
        </h1>
        <h2 className="text-muted-foreground text-center text-xs">
          {subtitle}
        </h2>
      </div>
    </div>
  );
}
