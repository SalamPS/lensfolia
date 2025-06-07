import DetectionMenu from '@/components/detect/DetectionMenu';
import DynamicBG from '@/components/DynamicBG';
import Navbar from '@/components/home/Navbar';
import React from 'react'

const DetectionPage = () => {
  return (<main className='bg-background h-full w-full'>
      <Navbar />
      <DynamicBG/>
      <DetectionMenu/>
    </main>
  );
}

export default DetectionPage;