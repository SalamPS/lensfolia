"use client";

import { OfflineTest } from "@/components/pwa/OfflineTest";
import { ServiceWorkerDebug } from "@/components/pwa/ServiceWorkerDebug";
import { LangGraphTestBox } from "@/components/lang/Tester";

export default function App() {
  

  return (
    <div>
      <div className="flex items-center justify-between bg-primary/60 p-4 text-white">
        <h1 className="text-2xl font-bold">LensFolia Debug Page</h1>
      </div>
      <div className="flex flex-col justify-center bg-background p-18 px-72">
        <LangGraphTestBox />
      </div>
      
      <div className="mb-8 border-t pt-8">
        <ServiceWorkerDebug />
      </div>
      
      <div className="mb-8 border-t pt-8">
        <OfflineTest />
      </div>
    </div>
  );
}