"use client";

import React, { useEffect, useState } from "react";

interface EncyclopediaHTMLRenderProps {
  html?: string; // Jadikan optional
  className?: string;
}

const EncyclopediaHTMLRender: React.FC<EncyclopediaHTMLRenderProps> = ({
  html = "", // Default value untuk html
  className,
}) => {
  const [cleanHTML, setCleanHTML] = useState("");

  useEffect(() => {
    if (!html) return; // Jika html kosong, tidak perlu proses

    // Dynamic import untuk DOMPurify
    import("dompurify")
      .then((module) => {
        const DOMPurify = module.default; // Akses default export
        setCleanHTML(
          DOMPurify.sanitize(html, {
            ALLOWED_TAGS: ["h1", "h2", "h3", "p", "ul", "ol", "li", "img", "a"],
            ALLOWED_ATTR: ["class", "src", "alt", "href"],
          }),
        );
      })
      .catch((error) => {
        console.error("Gagal memuat DOMPurify:", error);
        // Fallback ke html asli jika DOMPurify gagal dimuat
        setCleanHTML(html);
      });
  }, [html]);

  if (!cleanHTML) return null; // Tidak render apa-apa jika cleanHTML kosong

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: cleanHTML }}
    />
  );
};

export default EncyclopediaHTMLRender;
