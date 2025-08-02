import { EncyclopediaEntry } from "../types/encyclopedia";


export const mockEncyclopediaData: EncyclopediaEntry[] = [
  {
    id: "1",
    title: "Kutu Daun (Aphids)",
    description:
      "Serangga kecil yang menghisap cairan tanaman dan dapat menyebarkan virus.",
    imageUrl: "https://a-z-animals.com/media/2022/07/aphids.jpg",
    type: "hama",
    date: "2023-05-15",
    symptoms: [
      "Daun menguning dan keriting",
      "Pertumbuhan tanaman terhambat",
      "Adanya embun madu pada daun",
      "Semut berkumpun di sekitar tanaman",
    ],
    prevention: [
      "Menanam tanaman penangkal seperti bawang putih",
      "Menggunakan mulsa reflektif",
      "Memelihara predator alami seperti ladybug",
    ],
    treatment: [
      "Semprot dengan air sabun",
      "Gunakan insektisida organik seperti neem oil",
      "Pengendalian biologis dengan predator alami",
    ],
    content: `
      <article>
        <h2>Deskripsi Umum</h2>
        <p>Kutu daun (<em>Aphidoidea</em>) adalah serangga kecil berukuran 1-10 mm yang termasuk dalam ordo <strong>Hemiptera</strong>. Mereka memiliki beberapa ciri khas:</p>
        <ul>
          <li>Tubuh lunak berbentuk buah pir</li>
          <li>Memiliki sepasang cornicle (tabung kecil) di bagian belakang abdomen</li>
          <li>Warna bervariasi (hijau, hitam, coklat, merah, kuning)</li>
        </ul>
        
        <h2>Siklus Hidup</h2>
        <p>Siklus hidup kutu daun sangat menarik:</p>
        <ol>
          <li>Telur menetas di musim semi</li>
          <li>Betina partenogenetik menghasilkan nimfa</li>
          <li>Nimfa berkembang dalam 7-10 hari</li>
          <li>Pada musim gugur, menghasilkan jantan dan betina untuk reproduksi seksual</li>
        </ol>
        
        <h2>Gambar Ilustrasi</h2>
        <img src="/images/aphid-lifecycle.jpg" alt="Siklus hidup kutu daun" />
        
        <h2>Dampak pada Tanaman</h2>
        <p>Kutu daun menyebabkan kerusakan melalui:</p>
        <table>
          <tr>
            <th>Jenis Kerusakan</th>
            <th>Keterangan</th>
          </tr>
          <tr>
            <td>Hisapan langsung</td>
            <td>Mengambil nutrisi dari floem tanaman</td>
          </tr>
          <tr>
            <td>Penyebaran virus</td>
            <td>Vektor lebih dari 150 jenis virus tanaman</td>
          </tr>
        </table>
      </article>
    `,
  },
  {
    id: "2",
    title: "Penyakit Layu Fusarium",
    description: "Penyakit jamur yang menyerang sistem pembuluh tanaman.",
    imageUrl: "/diseases/fusarium-wilt.jpg",
    type: "penyakit",
    date: "2023-06-20",
    symptoms: [
      "Daun layu mulai dari bagian bawah",
      "Pembuluh batang berwarna coklat",
      "Tanaman mati secara bertahap",
    ],
    prevention: [
      "Gunakan varietas tahan penyakit",
      "Rotasi tanaman",
      "Sterilisasi media tanam",
    ],
    treatment: [
      "Cabut dan hancurkan tanaman yang terinfeksi",
      "Aplikasi fungisida sistemik",
      "Peningkatan pH tanah",
    ],
  },
  {
    id: "3",
    title: "Ulat Grayak (Spodoptera litura)",
    description:
      "Ulat pemakan daun yang sangat rakus dan menyerang berbagai jenis tanaman.",
    imageUrl: "/pests/armyworm.jpg",
    type: "hama",
    date: "2023-07-10",
    symptoms: [
      "Daun berlubang tidak beraturan",
      "Adanya kotoran ulat di sekitar tanaman",
      "Kerusakan parah dalam waktu singkat",
    ],
    prevention: [
      "Pemasangan perangkap feromon",
      "Pengamatan rutin di malam hari",
      "Sanitasi kebun",
    ],
    treatment: [
      "Pengumpulan manual ulat",
      "Aplikasi Bacillus thuringiensis",
      "Insektisida selektif",
    ],
  },
  {
    id: "4",
    title: "Penyakit Embun Tepung",
    description:
      "Infeksi jamur yang menimbulkan bercak putih seperti tepung pada permukaan daun.",
    imageUrl: "/diseases/powdery-mildew.jpg",
    type: "penyakit",
    date: "2023-04-05",
    symptoms: [
      "Bercak putih seperti tepung di daun",
      "Daun menguning dan rontok",
      "Pertumbuhan terhambat",
    ],
    prevention: [
      "Sirkulasi udara yang baik",
      "Hindari penyiraman di atas daun",
      "Jarak tanam tidak terlalu rapat",
    ],
    treatment: [
      "Semprot dengan larutan soda kue",
      "Fungisida berbahan aktif sulfur",
      "Pemangkasan bagian terinfeksi",
    ],
  },
  {
    id: "5",
    title: "Tungau Laba-Laba (Spider Mites)",
    description:
      "Hama kecil yang menghisap cairan daun dan membuat jaring halus.",
    imageUrl: "/pests/spider-mites.jpg",
    type: "hama",
    date: "2023-08-12",
    symptoms: [
      "Bintik-bintik kuning kecil di daun",
      "Jaring halus di bawah daun",
      "Daun mengering dan rontok",
    ],
    prevention: [
      "Peningkatan kelembaban udara",
      "Penyemprotan air secara teratur",
      "Penggunaan predator alami",
    ],
    treatment: [
      "Semprot dengan air bertekanan tinggi",
      "Aplikasi mitisida",
      "Minyak hortikultura",
    ],
  },
  // Tambahkan lebih banyak data sesuai kebutuhan
];
