/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useRef, useEffect } from 'react';
import Image from "next/image";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captureUrl, setCaptureUrl] = useState<string | null>(null);

  // Membuka kamera dan menampilkan stream ke elemen video
  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setStream(mediaStream);
    } catch (error) {
      console.error('Error opening camera:', error);
    }
  };

  // Menangkap gambar dari elemen video dan menampilkan hasilnya
  const captureAndUpload = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // Mengubah canvas menjadi data URL dan menampilkannya
      const dataUrl = canvas.toDataURL('image/png');
      console.log('Captured image data URL:', dataUrl);
      if (captureUrl) {
        setCaptureUrl(dataUrl);
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

  return (
    <div className="grid items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-poppins)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <button
            id="open-camera"
            className="rounded-full cursor-pointer border border-solid border-transparent transition-colors flex items-center justify-center bg-r-green/80 text-background gap-2 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto hover:bg-r-green hover:border-transparent"
            onClick={openCamera}
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Open Camera
          </button>
          <button
            className="rounded-full border cursor-pointer border-solid border-black/[.08] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            onClick={captureAndUpload}
          >
            Take &amp; Up
          </button>
        </div>

        {/* Tampilan preview video */}
        <div className="mt-4">
          <video ref={videoRef} autoPlay className="w-full max-w-md" />
          <canvas ref={canvasRef} className="hidden" />
          {captureUrl && (
            <img src={captureUrl} alt="Captured Image" className="mt-4 max-w-md" />
          )}
        </div>
      </main>
    </div>
  );
}