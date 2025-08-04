import Navbar from "@/components/home/Navbar";
import React from "react";
import LFDResultPage from "@/components/detect/Result";
import { userNavbar_ } from "@/components/types/user";
import StaticBG from "@/components/StaticBG";

export default async function LFDResultContainer({
  params,
}: {
  params: Promise<{ detId: string }>;
}) {
  const { detId } = await params;
  if (!detId) {
    return <div className="text-center">Deteksi tidak ditemukan.</div>;
  }
  const res = {
    id: detId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    imageUrl: `http://localhost:3000/examples/daun.jpeg`,
    imageName: "daun.jpeg",
    result: [
      {
        diseaseName: "Anthracnose",
        confidence: 0.95,
        exampleImageUrl:
          "http://localhost:3000/examples/anthracnose_example.jpg",
        overview:
          "Anthracnose adalah penyakit tanaman yang disebabkan oleh jamur Colletotrichum. Penyakit ini menyerang daun, batang, dan buah tanaman, menyebabkan bercak-bercak coklat atau hitam yang dapat menyebar dengan cepat, terutama dalam kondisi lembab.",
        treatment:
          "Untuk mengatasi Anthracnose, lakukan pemangkasan pada bagian tanaman yang terinfeksi. Gunakan fungisida yang mengandung Chlorothalonil atau Mancozeb sesuai petunjuk. Pastikan sirkulasi udara baik dan hindari penyiraman dari atas untuk mengurangi kelembaban.",
        recommendation:
          "Anthracnose dapat bertahan di daun yang jatuh ke tanah. Bersihkan area sekitar tanaman secara teratur. Rotasi tanaman dengan jenis yang tidak rentan dapat membantu memutus siklus penyakit.",
        aibubble: [
          "Apa penyebab Anthracnose pada tanaman?",
          "Apakah hujan berpengaruh pada penyebaran Anthracnose?",
          "Bagaimana cara mencegah Anthracnose?",
          "Tanaman apa saja yang rentan terhadap Anthracnose?",
        ],
        products: [
          {
            id: "p1",
            name: "Fungisida Antracol",
            description: "Fungisida sistemik untuk mengendalikan Anthracnose",
            price: 125000,
            imageUrl: "/hero-image.webp",
            link: "/products/p1",
          },
          
        ],
      },
      {
        diseaseName: "Embun Tepung",
        confidence: 0.92,
        exampleImageUrl:
          "http://localhost:3000/examples/embuntepung_example.jpg",
        overview:
          "Embun Tepung (Powdery Mildew) adalah penyakit jamur yang ditandai dengan lapisan putih seperti tepung pada permukaan daun. Penyakit ini berkembang pesat dalam kondisi kelembaban tinggi dan sirkulasi udara yang buruk.",
        treatment:
          "Atasi Embun Tepung dengan fungisida sulfur atau baking soda solution (1 sendok makan baking soda + 1/2 sendok teh sabun cair + 1 liter air). Semprotkan pada pagi hari. Tingkatkan sirkulasi udara dengan pemangkasan selektif.",
        recommendation:
          "Embun Tepung menyukai kondisi lembab tetapi tidak memerlukan air bebas untuk berkembang. Hindari pemupukan nitrogen berlebihan yang dapat membuat tanaman lebih rentan. Varietas tanaman yang tahan penyakit lebih disarankan.",
        aibubble: [
          "Apa perbedaan Embun Tepung dengan penyakit jamur lainnya?",
          "Bagaimana cara membedakan Embun Tepung dengan debu biasa?",
          "Apakah Embun Tepung bisa menular ke tanaman lain?",
          "Bagaimana pengaruh suhu terhadap perkembangan Embun Tepung?",
        ],
      },
    ],
  };
  return (
    <main className="bg-background h-full w-full">
      <Navbar user={user} />
      <StaticBG>
        <div className="relative z-10 mt-4 flex h-[20rem] items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-4 px-4">
            <h1 className="bg-gradient-to-b from-zinc-500 to-zinc-700 bg-clip-text text-center text-2xl font-bold text-wrap text-transparent md:text-4xl dark:from-zinc-50 dark:to-zinc-400">
              LensFolia—Deteksi Penyakit Tanaman dengan AI
            </h1>
            <p className="text-muted-foreground max-w-2xl text-center text-sm text-pretty">
              Kami telah menganalisis gambar daun yang Anda unggah. Berikut
              adalah hasil deteksi dan rekomendasi perawatan yang sesuai.
            </p>
          </div>
        </div>
      </StaticBG>
      <LFDResultPage result={res} />
    </main>
  );
}

const user: userNavbar_ = {
  id: "123",
  name: "Salam PS",
  email: "salamp@salamp.id",
  profilePicture: "/profile.jpg",
  createdAt: "2023-01-01",
};
