/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useRef, useEffect } from "react";
import LFDWrapper from "@/components/detect/Wrapper";
import { IconCamera, IconUpload } from "@tabler/icons-react";
import { Button } from "../ui/button";
import { LangGraphVisual } from "./Langgraph";
import { LFD_ } from "../types/diagnoseResult";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

export default function DetectionMenu() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploaded, setUploaded] = useState<LFD_ | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("idle");
  const { user, anonUser } = useAuth();

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
    setCapturedFile(null);
    if (capturedImageUrl) {
      URL.revokeObjectURL(capturedImageUrl);
      setCapturedImageUrl(null);
    }
    setIsPreviewOpen(false);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      
      // Clean up previous URL if exists
      if (capturedImageUrl) {
        URL.revokeObjectURL(capturedImageUrl);
      }
      
      // Save the file object and create URL
      setCapturedFile(file);
      const imageUrl = URL.createObjectURL(file);
      setCapturedImageUrl(imageUrl);
    }
  };

  // Memicu klik pada input file
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isPreviewOpen) return; // Only block if camera preview is open
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
      
      // Clean up previous URL if exists
      if (capturedImageUrl) {
        URL.revokeObjectURL(capturedImageUrl);
      }
      
      // Save the file object and create URL
      setCapturedFile(file);
      const imageUrl = URL.createObjectURL(file);
      setCapturedImageUrl(imageUrl);
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
      
      // Clean up previous URL if exists
      if (capturedImageUrl) {
        URL.revokeObjectURL(capturedImageUrl);
      }
      
      // Create File object from blob and URL
      const file = new File([blob], "captured-image.png", { type: "image/png" });
      setCapturedFile(file);
      const imageUrl = URL.createObjectURL(file);
      setCapturedImageUrl(imageUrl);

      setIsPreviewOpen(false);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }
  };

  // Membersihkan stream kamera dan URL gambar saat komponen unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (capturedImageUrl) {
        URL.revokeObjectURL(capturedImageUrl);
      }
    };
  }, [stream, capturedImageUrl]);

  const processImage = async () => {
    setIsLoading(true);
    setUploadStatus("prepare");
    try {
      if (!capturedFile) {
        throw new Error('No file to upload');
      }

      // Create FormData
      const formData = new FormData();
      formData.append('image', capturedFile);
      formData.append('auth_user', user?.id || "");
      formData.append('anon_user', anonUser?.id || "");

      // Send to API
      const uploadResponse = await fetch('/api/detect', {
        method: 'POST',
        body: formData,
      });
      if (!uploadResponse.ok) {
        setUploadStatus("error");
        throw new Error('Failed to upload image');
      }
      const imageData = await uploadResponse.json();

      const dataPrepare = {
        image_url: imageData.url,
        created_by: user?.id || null,
        id_anon: anonUser?.id || null,
        is_public: user ? false : true,
        is_bookmark: user ? true : false,
      }
      const { data, error: dbError } = await supabase
        .from('diagnoses')
        .insert(dataPrepare)
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        setUploadStatus("error");
        return;
      } else if (!data) {
        console.error('No data returned from database');
        setUploadStatus("error");
        return;
      }
      
      setUploaded(data);
      setUploadStatus("success");
    } catch (error) {
      console.error("Error processing image:", error);
      setUploadStatus("error");
    }
  };

  return (
    <LFDWrapper onDrop={handleDrop} onDragOver={handleDragOver}>
      <LangGraphVisual 
        diagnose_data={uploaded}
        trigger={isLoading}
        setTrigger={setIsLoading}
        uploadStatus={uploadStatus}
        setUploadStatus={setUploadStatus}
      />
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
      {!capturedFile ? (
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
          className="border-border bg-card/[0.5] mx-2 border-[2px] border-dashed p-4 shadow-sm backdrop-blur-xs sm:mx-0 sm:p-6"
          id="preview-image"
        >
          <h1 className="text-foreground mb-4 text-center font-mono text-sm font-bold uppercase sm:mb-6 sm:text-base">
            Pratinjau
          </h1>

          <div className="border-border dark:bg-input flex flex-col items-center justify-center gap-1 rounded-xl border-[1px] bg-zinc-100 p-3 sm:rounded-[20px] sm:p-4">
            {capturedFile && (
              <img
                src={capturedImageUrl || ""}
                alt="Captured Image"
                className="max-h-[50vh] w-full max-w-full rounded-md object-contain"
              />
            )}
            <div className="mt-3 text-center sm:mt-4">
              <h1 className="text-foreground line-clamp-1 text-xs font-bold sm:text-sm">
                {capturedFile?.name}
              </h1>
              <h2 className="text-muted-foreground mt-1 text-xs">
                {capturedFile
                  ? `${(capturedFile.size / 1024).toFixed(2)} KB`
                  : "Tidak ada file yang diunggah"}
              </h2>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6">
            <Button
              variant="secondary"
              onClick={() => {
                if (capturedImageUrl) {
                  URL.revokeObjectURL(capturedImageUrl);
                  setCapturedImageUrl(null);
                }
                setCapturedFile(null);
                // Reset file input
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="py-2 text-xs sm:text-sm"
            >
              Kembali
            </Button>
            <button
              onClick={processImage}
              className={`bg-primary hover:bg-primary/80 rounded-md py-2 text-xs font-medium text-white transition-all duration-200 sm:text-sm ${
                !capturedFile ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              }`}
              disabled={!capturedFile}
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
