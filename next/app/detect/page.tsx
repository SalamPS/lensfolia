/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useRef, useEffect } from 'react';
import LFDWrapper from '@/components/detect/Wrapper';

export default function LFDImageUpload() {
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
		<LFDWrapper>
			<header className='flex flex-col gap-4 w-[40vw]'>
				<h1 className="text-4xl font-bold text-center mb-4 two-lines">
					Foto langsung atau Unggah dari perangkat anda
				</h1>
				<p className="text-base text-center text-muted-foreground">
					Pastikan gambar yang akan diidentifikasi memiliki kualitas yang bagus dan tidak blur, posisikan daun sehingga terlihat dengan jelas.
				</p>
			</header>
			{!captureUrl ? 
				<section className="grid grid-cols-2 gap-5 items-center border-[1px] bg-card/[0.08] border-border rounded-2xl p-5"
					id='set-image'>
						<LFDISContainer
							icon='camera'
							onClick={openCamera}
							title='Ambil Foto Langsung'
							subtitle='Izinkan penggunaan kamera Anda'>
						</LFDISContainer>
						<LFDISContainer
							icon='upload'
							onClick={captureAndUpload}
							title='Unggah dari perangkat Anda'
							subtitle='Drag and drop file atau klik untuk upload'>
						</LFDISContainer>
				</section> 
				: 
				<section className=""
					id='preview-image'>
					<video ref={videoRef} autoPlay className="w-full max-w-md" />
					<canvas ref={canvasRef} className="hidden" />
					{captureUrl && (
						<img src={captureUrl} alt="Captured Image" className="mt-4 max-w-md" />
					)}
				</section>
			}
		</LFDWrapper>
	);
}

interface LFDISContainerProps {
	children?: React.ReactNode;
	icon: string;
	title: string;
	subtitle: string;
	onClick: () => void;
}

function LFDISContainer({children, icon, title, subtitle, onClick}: LFDISContainerProps) {
	return <div className={`p-5 border-[1px] border-border border-dashed bg-card/[0.08]`}>
		<div className="flex flex-col aspect-[4/3] items-center justify-center gap-1 p-18 rounded-md cursor-pointer bg-card"
		 	onClick={onClick}>
			<div className='bg-primary shadow-inner shadow-foreground/[0.5] rounded-md p-4 mb-5 aspect-square flex items-center justify-center'>
				{icon[0]}
			</div>
			<h1 className='text-sm font-bold'>{title}</h1>
			<h2 className='text-xs text-muted-foreground'>{subtitle}</h2>
			{children}
		</div>
	</div>
}