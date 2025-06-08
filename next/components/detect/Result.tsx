"use client";

/* eslint-disable @next/next/no-img-element */
import { IconArrowLeft, IconBookmark, IconBookmarkFilled, IconClipboardText, IconEdit, IconSend, IconSparkles, IconThumbUp } from "@tabler/icons-react";
import LFDWrapper from "./Wrapper";
import { Button } from "../ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LFDResultPage ({result}: {result?: LFDResult_}) {
	const router = useRouter();
	const [bookmarked, setBookmarked] = useState(false);

	const handleBookmark = () => {
		// Implement bookmark functionality here
		setBookmarked(!bookmarked);
	}

	return <LFDWrapper>
		<header className="text-center w-[40vw] my-8 z-20">
			<h1 className="bg-gradient-to-b from-zinc-500 to-zinc-700 bg-clip-text py-4 text-center text-xl font-bold text-transparent md:text-4xl dark:from-zinc-50 dark:to-zinc-400">LensFolia—Deteksi Penyakit Tanaman dengan AI</h1>
			<p className=" text-muted-foreground">Kami telah menganalisis gambar daun yang Anda unggah. Berikut adalah hasil deteksi dan rekomendasi perawatan yang sesuai.</p>
		</header>
		<section id='preview-image' className="p-6 border-[1px] border-border border-dashed bg-card/[0.12] backdrop-blur-md">
			<div className='mb-6 flex items-center gap-4 text-sm font-semibold'>
				<Button className="inline-block py-2 aspect-square bg-secondary/40 rounded-full cursor-pointer hover:bg-secondary transition-colors"
					onClick={() => {router.back()}}>
					<IconArrowLeft size={18}/>
				</Button>
				{result?.imageName}
			</div>
			<div className="flex flex-col items-center justify-center gap-1 border-[1px] border-border p-6 rounded-2xl bg-card">
				<img src={result?.imageUrl} alt="Captured Image" className="max-w-md rounded-xl" />
			</div>
		</section>
		<section id='disease-result' className="z-20">
			<h1 className="text-4xl font-bold mt-8 mb-4 text-transparent text-center bg-gradient-to-b from-zinc-500 to-zinc-700 dark:from-primary dark:to-emerald-800 bg-clip-text">
				{!result?.result.length? 
				<span className="">Tidak ada penyakit terdeteksi!</span> 
				: 
				<span className="">{result.result.length} Penyakit Terdeteksi!</span> 
				}
			</h1>
			{result?.result.length ? 
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-14"
				style={result?.result.length == 1 ? { gridTemplateColumns: 'repeat(auto-fill, minmax(0, 1fr))' } : {}}>
				{result.result.map((disease, index) => (
					<div key={index} className="p-4 border-[1px] border-border rounded-2xl bg-card flex flex-col items-center">
						<img src={disease.exampleImageUrl} alt={disease.diseaseName} className="h-full w-64 object-cover rounded-xl mb-2" />
						<h2 className="text-lg font-semibold my-2">{disease.diseaseName}</h2>
						<p 
							className={`text-xs font-semibold text-foreground mt-1 border-[1px] rounded-full p-2 px-4 mb-2
								${disease.confidence > 0.8 ? 'bg-primary/30' : disease.confidence > 0.5 ? 'bg-[#FF8904]/30' : 'bg-destructive/30'}
								${disease.confidence > 0.8 ? 'border-primary' : disease.confidence > 0.5 ? 'border-[#FF8904]' : 'border-destructive'}
							`}>
							Tingkat Keyakinan: {Math.round(disease.confidence * 100)}%
						</p>
					</div>
				))}
			</div>
			: ''}
			<div className="flex justify-center">
				<Button onClick={() => {handleBookmark()}}>
					{bookmarked ?<>
						<IconBookmarkFilled size={24} /> Hasil Deteksi Tersimpan
					</> : <>
						<IconBookmark size={24} /> Simpan Hasil Deteksi
					</>}
				</Button>
			</div>
		</section>
		<section id='discussion' className="z-20 my-16 p-8 px-4 pb-4 w-[60vw] rounded-4xl bg-card flex flex-col gap-4">
			<h2 className="text-2xl font-semibold mb-4 text-center">Pembahasan Terkait Penyakit Tanaman</h2>
			<Discussion title="Overview"
				description={result?.overview || "Tidak ada overview yang tersedia."}>
				<IconClipboardText className="text-primary" size={24} />
			</Discussion>
			<Discussion title="Rekomendasi"
				description={result?.recommendation || "Tidak ada rekomendasi yang tersedia."}>
				<IconThumbUp className="text-[#53EAFD]" size={24} />
			</Discussion>
			<Discussion title="Catatan Penting"
				description={result?.notes || "Tidak ada catatan penting yang tersedia."}>
				<IconEdit className="text-[#FB7185]" size={24} />
			</Discussion>
			<p className="text-muted-foreground text-sm px-6">
				*Catatan: Informasi ini hanya sebagai referensi. Untuk penanganan lebih lanjut, konsultasikan dengan ahli pertanian atau dokter tanaman.
			</p>
			<div id="ask-ai" className="border-border border-[1px] rounded-3xl">
				<h3 className="flex items-center justify-center font-semibold p-2 py-6 border-b-[1px] border-border">
					<IconSparkles className="inline mr-2" size={24} />
					Konsultasi  lebih lanjut dengan AI
				</h3>
				<div className="flex flex-col gap-4 px-6">
					<div className="grow flex flex-col items-center justify-center h-80">
						<h4 className="font-semibold mb-8">Apa yang bisa saya bantu?</h4>
						<div className="text-center w-[80%]">
							{result?.aibubble && result.aibubble.length > 0 &&
								result.aibubble.map((text, index) => (
									<AIBubble key={index} text={text} />
								))
							}
						</div>
					</div>
					<div className="flex mt-2 bg-secondary rounded-t-2xl p-3 px-5">
						<input className="grow outline-none text-muted-foreground" type="text" placeholder="Tanyakan apapun terkait deteksi daunmu"/>
						<button className="bg-foreground text-background p-3 rounded-full hover:bg-primary/10 transition-colors">
							<IconSend/>
						</button>
					</div>
				</div>
			</div>
		</section>
	</LFDWrapper>
}

interface LFDResult_ {
  id: string;
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
	imageName: string;
	overview: string;
	recommendation: string;
	notes: string;
  result: {
    diseaseName: string;
    confidence: number;
		exampleImageUrl: string;
  }[];
	aibubble?: string[];
}

interface DiscussionProps {
	children: React.ReactNode;
	title: string;
	description: string;
}

const AIBubble = ({text}: {text:string}) => {
	return <div className="cursor-pointer text-xs bg-secondary p-2 px-3 shadow-inner shadow-foreground/[0.1] rounded-full m-1 inline-block hover:bg-secondary/80 transition-colors">
		{text}
	</div>
}

const Discussion: React.FC<DiscussionProps> = ({children, title, description}) => {
	return <div className="border-border border-[1px] rounded-2xl p-4">
		<div className="flex items-center mb-4 w-fit">
			<div className="p-3 border-border border-[1px] flex items-center justify-center rounded-full bg-card mr-3 shadow-2xl">
				{children}
			</div>
			<h3 className="text-lg font-semibold">
				{title}
			</h3>
		</div>
		<p className="text-muted-foreground">
			{description}
		</p>
	</div>
}