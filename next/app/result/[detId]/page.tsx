import DynamicBG from '@/components/DynamicBG';
import Navbar from '@/components/home/Navbar';
import React from 'react'
import LFDResultPage from "@/components/detect/Result";
import { userNavbar_ } from '@/components/types/user';

export default async function LFDResultContainer({
  params,
}: { params: Promise<{ detId: string }> }) {
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
        exampleImageUrl: "http://localhost:3000/examples/anthracnose_example.jpg",
      },
      {
        diseaseName: "Embun Tepung",
        confidence: 0.92,
        exampleImageUrl: "http://localhost:3000/examples/embuntepung_example.jpg",
      },
    ],
    overview: "Hasil deteksi penyakit tanaman menggunakan sistem ini menunjukkan bahwa ada dua jenis penyakit yang terdeteksi pada daun tanaman tersebut. Penyakit pertama adalah Anthracnose, yang terdeteksi dengan tingkat keyakinan 95%. Penyakit ini sering kali menyerang tanaman yang disebabkan oleh jamur Colletotrichum dan dapat menyebabkan bercak hitam pada daun, batang, atau buah. Penyakit kedua adalah Embun Tepung dengan tingkat keyakinan 92%.",
    recommendation: "Untuk mengatasi Anthracnose, disarankan untuk segera melakukan pemangkasan pada daun yang terinfeksi untuk mengurangi penyebaran jamur ke bagian tanaman yang sehat. Selain itu, penggunaan fungisida yang mengandung bahan aktif seperti Chlorothalonil atau Mancozeb dapat membantu mengendalikan infeksi. Lakukan pemakaian fungisida sesuai dosis yang tertera pada label produk, dan pastikan untuk melakukannya secara teratur untuk menjaga tanaman tetap sehat.",
    notes: "Selalu pastikan untuk memantau kondisi tanaman secara rutin, baik itu dari segi kesehatan daun, batang, maupun akar, terutama setelah tindakan pengendalian dilakukan. Penggunaan pestisida atau fungisida sebaiknya disesuaikan dengan petunjuk penggunaan yang tertera pada kemasan untuk menghindari dampak negatif terhadap lingkungan atau tanaman itu sendiri. Selain itu, penting untuk memperhatikan rotasi tanaman dan menghindari penanaman tanaman yang rentan di tempat yang sama secara terus-menerus.",
    aibubble: [
      'Apa penyebab Anthracnose pada tanaman?',
      'Apakah hujan berpengaruh?',
      'Bagaimana cara mencegah Anthracnose?',
      'Apa saja gejala awal Embun Tepung pada daun?',
      'Apa saja tanaman yang rentan terhadap Embun Tepung?',
    ]
  }
  return (
    <main className='bg-background h-full w-full'>
      <Navbar user={user}/>
      <DynamicBG/>
      <LFDResultPage result={res}/>;
    </main>
  );
}

const user:userNavbar_ = {
  id: '123',
  name: 'Salam PS',
  email: 'salamp@salamp.id',
  profilePicture: '/profile.jpg',
  createdAt: '2023-01-01',
}