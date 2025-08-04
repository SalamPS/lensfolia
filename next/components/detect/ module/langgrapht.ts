import { LGStep_ } from "./langgraph_type";

export const LGSteps:LGStep_[] = [
	{
		step: "image_analysis",
		title: "Analisis Gambar",
		description: "Menganalisis gambar untuk mendeteksi penyakit tanaman.",
		icon: "observer"
	},
	{
		step: "plant_disease_detection",
		title: "Deteksi Penyakit Tanaman",
		description: "Mendeteksi penyakit pada tanaman berdasarkan analisis gambar.",
		icon: "leaf"
	},
	{
		step: "overview_query_generation",
		title: "Pembuatan Query Overview",
		description: "Membuat query untuk mendapatkan gambaran umum.",
		icon: "document"
	},
	{
		step: "overview_rag",
		title: "Overview RAG",
		description: "Menghasilkan gambaran umum menggunakan RAG.",
		icon: "pen"
	},
	{
		step: "treatment_query_generation",
		title: "Pembuatan Query Perawatan",
		description: "Membuat query untuk rekomendasi perawatan tanaman.",
		icon: "gear"
	},
	{
		step: "treatment_rag",
		title: "Perawatan RAG",
		description: "Menghasilkan rekomendasi perawatan menggunakan RAG.",
		icon: "cure"
	},
	{
		step: "product_query_generation",
		title: "Pembuatan Query Produk",
		description: "Membuat query untuk rekomendasi produk.",
		icon: "gear"
	},
	{
		step: "product_rag",
		title: "Produk RAG",
		description: "Menghasilkan rekomendasi produk menggunakan RAG.",
		icon: "product"
	},
	{
		step: "create_final_response",
		title: "Pembuatan Respon Akhir",
		description: "Menyusun respon akhir berdasarkan semua data yang tersedia.",
		icon: "document-check"
	}
];

