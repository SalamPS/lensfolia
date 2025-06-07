"use client";
import React from "react";
import TitleBadge from "../ui/title-badge";
import Accordion, { type AccordionItem } from "../ui/accordion";

const items: AccordionItem[] = [
  {
    id: "faq-1",
    title: "Apakah layanan ini gratis?",
    content:
      "Tentu saja, semua layanan pada platform ini gratis! Daftar dengan akun anda  jika hasil deteksi anda ingin disimpan. ",
  },
  {
    id: "faq-2",
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit?",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    id: "faq-3",
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit?",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    id: "faq-4",
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit?",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
];

const Faq = () => {
  return (
    <section id="faq">
      <div className="dark:bg-background relative h-full w-full items-center justify-center bg-zinc-200/50">
        <div className="flex w-full items-center justify-center px-4 pb-16">
          <div className="flex w-full max-w-4xl flex-col items-center justify-center gap-4 py-12 md:gap-8">
            <div className="dark:bg-background flex w-full max-w-4xl flex-col items-center justify-center gap-4 bg-transparent py-12 md:gap-6">
              {/* Badge */}
              <TitleBadge
                title="Frequently Asked Questions"
                iconDark="/sparkle.svg"
                iconLight="/sparkle-color-primary.svg"
              />

              {/* Title */}
              <h1 className="max-w-4xl bg-gradient-to-b from-zinc-500 to-zinc-700 bg-clip-text py-4 text-center text-xl font-bold text-pretty text-transparent md:text-3xl dark:from-zinc-50 dark:to-zinc-400">
                Pertanyaan yang Sering Diajukan
              </h1>

              {/* Accordion */}
              <div className="w-full max-w-3xl">
                <Accordion items={items} />
              </div>
            </div>
          </div>
        </div>
        <div className="border-border bg-muted text-muted-foreground absolute bottom-0 mx-auto flex w-full items-center justify-center border-t p-3 text-sm">
          Copyright © ReaksiJS 2025
        </div>
      </div>
    </section>
  );
};

export default Faq;
