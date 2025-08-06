import Link from 'next/link';
import { WifiOff } from 'lucide-react';
import Navbar from '@/components/home/Navbar';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center px-4">
          <div className="mb-8">
            <WifiOff className="w-24 h-24 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Anda Sedang Offline
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Tidak dapat terhubung ke internet. Beberapa fitur mungkin tidak tersedia.
            </p>
          </div>
          
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Halaman yang sudah dikunjungi sebelumnya masih dapat diakses
            </p>
            
            <div className="flex gap-4 justify-center">
              <Link 
                href="/" 
                className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Kembali ke Beranda
              </Link>
              
              <Link 
                href="/encyclopedia" 
                className="inline-block bg-secondary text-secondary-foreground px-6 py-3 rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Lihat Encyclopedia
              </Link>
            </div>
          </div>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Halaman yang tersedia offline:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 🏠 Halaman Utama (Beranda)</li>
              <li>• 📚 Encyclopedia Penyakit Tanaman</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-2">Tips saat offline:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Coba refresh halaman ketika koneksi sudah kembali</li>
              <li>• Halaman yang sudah dikunjungi masih bisa diakses</li>
              <li>• Fitur deteksi penyakit membutuhkan koneksi internet</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
