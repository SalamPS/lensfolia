import {
  IconBolt,
  IconCpu,
  IconPlant,
  IconSparkles,
} from "@tabler/icons-react";
import Image from "next/image";
import React from "react";
import TitleBadge from "../ui/title-badge";

const featureCards = [
  {
    icon: IconPlant,
    borderColor: "border-teal-500",
    bgColor: "bg-teal-400",
    shadowColor: "shadow-[0px_0px_48px_rgba(20,184,166,0.7)]",
    title: "Mendukung Berbagai Jenis Tanaman",
    description:
      "Cocok untuk petani, peneliti, dan hobiis dengan beragam tanaman.",
    colSpan: "md:col-span-1", 
  },
  {
    icon: IconBolt,
    borderColor: "border-yellow-500",
    bgColor: "bg-yellow-400",
    shadowColor: "shadow-[0px_0px_48px_#eab308]",
    title: "Deteksi Cepat & Akurat",
    description:
      "AI kami memberikan hasil dalam hitungan detik dengan tingkat akurasi tinggi.",
    colSpan: "md:col-span-1",
  },
  {
    icon: IconCpu,
    borderColor: "border-sky-500",
    bgColor: "bg-sky-400",
    shadowColor: "shadow-[0px_0px_48px_#0EA5E9]",
    title: "Berbasis Machine Learning",
    description:
      "Dilatih menggunakan ribuan data visual dari daun tanaman yang terinfeksi.",
    colSpan: "md:col-span-1",
  },
  {
    icon: IconSparkles,
    borderColor: "border-violet-500",
    bgColor: "bg-violet-400",
    shadowColor: "shadow-[0px_0px_48px_#8B5CF6]",
    title: "Konsultasi Langsung dengan AI",
    description: "Ada Asisten AI yang akan membantu anda.",
    colSpan: "md:col-span-1",
  },
];

const Features = () => {
  return (
    <section id="features">
      <div className="dark:bg-background h-full w-full items-center justify-center bg-zinc-200/50">
        <div className="flex w-full items-center justify-center px-4">
          {/* Main Container */}
          <div className="flex w-full max-w-4xl flex-col items-center justify-center gap-4 py-12 md:gap-8">
            {/* Content container */}
            <div className="dark:bg-background dark:border-border flex w-full flex-col gap-4 rounded-3xl border border-zinc-300 bg-zinc-100 p-4 shadow-xl md:gap-6 md:p-6 dark:border">
              {/* Row 1 */}
              <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
                {/* Header Card */}
                <div className="relative flex flex-col justify-center gap-6 overflow-hidden rounded-lg bg-linear-to-tr from-teal-900 via-teal-500 to-teal-300 p-4 shadow-md inset-shadow-sm inset-shadow-white/50 md:col-span-2">
                  <Image
                    src="/LogoIcon.svg"
                    alt="lensfolia-logo"
                    width={24}
                    height={24}
                    className="absolute right-0 bottom-0 h-[120px] w-[120px] opacity-20 invert md:h-[180px] md:w-[180px]"
                  />
                  {/* Badge */}
                  <TitleBadge
                    title="Fitur"
                    iconDark="/sparkle.svg"
                    iconLight="/sparkle-color-primary.svg"
                  />
                  <h1 className="w-3/4 pr-4 text-xl font-bold text-zinc-50 md:text-3xl">
                    Apa yang Membuat LensFolia Unggul?
                  </h1>
                </div>
                
                <FeatureCard {...featureCards[0]} />
              </div>

              {/* Row 2*/}
              <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
                {featureCards.slice(1).map((card, index) => (
                  <FeatureCard key={index} {...card} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({
  icon: Icon,
  borderColor,
  bgColor,
  shadowColor,
  title,
  description,
  colSpan = "md:col-span-1",
}: {
  icon: React.ComponentType<{ size: number; className?: string }>;
  borderColor: string;
  bgColor: string;
  shadowColor: string;
  title: string;
  description: string;
  colSpan?: string;
}) => {
  return (
    <div
      className={`bg-card flex flex-col items-center justify-center gap-4 overflow-hidden rounded-xl p-4 shadow-md inset-shadow-sm inset-shadow-white/10 ${colSpan}`}
    >
      <div
        className={`my-3 rounded-full border-2 ${borderColor} ${bgColor} p-3 ${shadowColor} dark:bg-transparent`}
      >
        <Icon size={24} className="dark:text-foreground text-white" />
      </div>
      <div className="flex w-full flex-col items-center justify-center gap-2 p-3">
        <h3 className="text-foreground text-center font-semibold text-pretty">
          {title}
        </h3>
        <p className="text-muted-foreground text-center text-xs text-pretty">
          {description}
        </p>
      </div>
    </div>
  );
};

export default Features;
