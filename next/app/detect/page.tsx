/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useRef, useEffect } from 'react';
import LFDWrapper from '@/components/detect/Wrapper';
import Loading from '@/components/Loading';
import { useRouter } from 'next/navigation';
import { IconCamera, IconUpload } from '@tabler/icons-react';

export default function LFDImageUpload() {
	const router = useRouter();
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [stream, setStream] = useState<MediaStream | null>(null);
	const [captureUrl, setCaptureUrl] = useState<string | null>(null);
	const [capturedFileInfo, setCapturedFileInfo] = useState<{ name: string; size: number } | null>(null);
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isDragging, setIsDragging] = useState(false);

	// Membuka kamera dan menampilkan stream ke elemen video
	const openCamera = async () => {
		try {
			const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
			if (videoRef.current) {
				videoRef.current.srcObject = mediaStream;
				videoRef.current.play();
			}
			setStream(mediaStream);
			setIsPreviewOpen(true);
		} catch (error) {
			console.error('Error opening camera:', error);
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
			if (!file.type.startsWith('image/')) {
				console.error('File yang diunggah bukan gambar.');
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
			if (!file.type.startsWith('image/')) {
				console.error('File yang diunggah bukan gambar.');
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
		const ctx = canvas.getContext('2d');
		if (ctx) {
			ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
			// Mengubah canvas menjadi data URL dan menampilkannya
			const dataUrl = canvas.toDataURL('image/png');
			const blob = await (await fetch(dataUrl)).blob();
			const fileSize = blob.size;

			setCaptureUrl(dataUrl);
			setCapturedFileInfo({ name: 'captured-image.png', size: fileSize });

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
			console.log('Processing image:', imageUrl);
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
			router.push('/result');
		} catch (error) {
			console.error('Error processing image:', error);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<LFDWrapper onDrop={handleDrop} onDragOver={handleDragOver}>
			<div className='fixed top-0 left-0 w-screen h-screen z-60 flex'
				style={{display: isDragging ? 'flex' : 'none'}} onDragLeave={() => setIsDragging(false)}>
			</div>
			<div className='fixed top-0 left-0 w-screen h-screen bg-background/80 z-50 flex items-center justify-center'
				style={{display: isDragging ? 'flex' : 'none'}}>
				<div className="flex items-center bg-background/60 justify-center w-[80vw] h-[80vh] rounded-3xl border-2 border-border border-dashed">
					<div className='animate-pulse text-white text-lg font-bold flex flex-col items-center justify-center'>
						<IconUpload size={40} />
						<p className='mt-4'>
							Drop it like it's hot
						</p>
					</div>
				</div>
			</div>
			{isLoading && <Loading />}
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
					id='set-image'
					onDragLeave={() => setIsDragging(false)}>
					
					<LFDISContainer
						onClick={openCamera}
						title='Ambil Foto Langsung'
						subtitle='Izinkan penggunaan kamera Anda'>
						<IconCamera size={20}/>
					</LFDISContainer>
					<LFDISContainer
						onClick={triggerFileUpload}
						title='Unggah dari perangkat Anda'
						subtitle='Drag and drop file atau klik untuk upload'>
						<IconUpload size={20}/>
					</LFDISContainer>
				</section> 
				: 
				<section className="p-6 border-[1px] border-border border-dashed bg-card/[0.12]"
					id='preview-image'>
					<h1 className='font-bold text-center mb-6'>Pratinjau</h1>
					<div className="flex flex-col items-center justify-center gap-1 border-[1px] border-border p-6 rounded-2xl bg-card"
						>
						{captureUrl && (
							<img src={captureUrl} alt="Captured Image" className="max-w-md rounded-xl" />
						)}
						<h1 className='text-sm font-bold mt-4'>{capturedFileInfo?.name}</h1>
						<h2 className='text-xs text-muted-foreground'>
							{capturedFileInfo ? `${(capturedFileInfo.size / 1024).toFixed(2)} KB` : 'Tidak ada file yang diunggah'}
						</h2>
					</div>
					<div className='grid grid-cols-2 gap-4 mt-6'>
						<button onClick={setCaptureUrl.bind(null, null)} 
							className="cursor-pointer bg-secondary text-white p-3 font-bold rounded-xl text-xs shadow-inner shadow-foreground/[0.1] hover:bg-secondary/80 duration-200">
							Kembali
						</button>
						<button onClick={processImage.bind(null, captureUrl!)} 
							className={`bg-primary text-white p-3 font-bold rounded-xl text-xs shadow-inner shadow-foreground/[0.3] hover:bg-primary/80 duration-200 ${!captureUrl ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
							Deteksi
						</button>
					</div>
				</section>
			}

			<div className="fixed items-center justify-center z-50"
				style={{ display: isPreviewOpen ? 'flex' : 'none' }}>
				<div className='flex bg-background/80 items-center justify-center h-screen w-screen'>
					<div className="bg-card border-border border-[1px] px-6 py-4 rounded-md relative drop-shadow-xl">
						<div className='flex items-center'>
							<span className='text-white text-xs font-bold grow'>Ambil Gambar</span>
							<button onClick={closePreview} className="cursor-pointer text-white text-xs shadow-inner shadow-foreground/[0.3] bg-destructive p-2 px-4 rounded-xl">Batal</button>
						</div>
						<div>
							<video ref={videoRef} autoPlay className="my-4 w-[480px] aspect-video rounded-2xl"/>
							<canvas ref={canvasRef} className="hidden" />
							{captureUrl && (
								<img src={captureUrl} alt="Captured Image" className="mt-4 max-w-md" />
							)}
						</div>
						<div className='flex justify-center'>
							<button onClick={captureAndUpload} className="cursor-pointer border-2 border-white aspect-square p-[1px] rounded-full shadow-md">
								<div className='bg-white p-4 border-2 border-border aspect-square rounded-full hover:bg-white/80'></div>
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

function LFDISContainer({children, title, subtitle, onClick}: LFDISContainerProps) {
	return <div className={`p-5 border-[1px] border-border border-dashed bg-card/[0.08]`}>
		<div className="flex flex-col aspect-[4/3] items-center justify-center gap-1 p-18 rounded-md cursor-pointer bg-card hover:scale-[1.02] duration-200"
			onClick={onClick}>
			<div className='bg-primary shadow-inner shadow-foreground/[0.6] rounded-md p-5 mb-5 aspect-square flex items-center justify-center duration-200'>
				{children}
			</div>
			<h1 className='text-sm font-bold'>{title}</h1>
			<h2 className='text-xs text-muted-foreground'>{subtitle}</h2>
		</div>
	</div>
}