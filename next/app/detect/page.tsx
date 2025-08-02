import DetectionMenu from '@/components/detect/DetectionMenu';
import Navbar from '@/components/home/Navbar';
import StaticBG from '@/components/StaticBG';
import React from 'react'

const DetectionPage = () => {
  return (
    <main className="bg-background h-full w-full">
      <Navbar />
      <StaticBG>
        <div className="relative z-10 mt-4 flex h-[20rem] items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-4 px-4">
            <h1 className="bg-gradient-to-b from-zinc-500 to-zinc-700 bg-clip-text text-center text-2xl font-bold text-wrap text-transparent md:text-4xl dark:from-zinc-50 dark:to-zinc-400">
              Foto langsung atau Unggah dari perangkat anda
            </h1>
            <p className="text-muted-foreground max-w-2xl text-center text-sm text-pretty">
              Pastikan gambar yang akan diidentifikasi memiliki kualitas yang
              bagus dan tidak blur, posisikan daun sehingga terlihat dengan
              jelas.
            </p>
          </div>
        </div>
      </StaticBG>
      <DetectionMenu />
    </main>
  );
}

export default DetectionPage;