"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { LFDProduct_ } from "../types/diagnoseResult";
import { IconExternalLink } from "@tabler/icons-react";

export function ProductRecommendation({
  products,
}: { products: LFDProduct_[] }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="mt-6 sm:mt-8">
      <h3 className="mb-3 text-lg font-semibold sm:mb-4 sm:text-xl">
        Rekomendasi Produk
      </h3>
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product, index) => (
          <div
            key={product.id + index}
            className="border-border dark:bg-border flex h-24 w-full items-center gap-1 rounded-xl border bg-zinc-100 transition-shadow hover:shadow-sm"
          >
            <div className="flex aspect-square h-full min-w-[80px] items-center justify-center overflow-hidden rounded-l-lg bg-gray-100 dark:bg-gray-800">
              <Image
                src={product.image_url || "/not-found.png"}
                alt={product.name}
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex w-full flex-col justify-between h-full p-2 overflow-hidden">
              <h4 className="text-foreground line-clamp-1 text-sm font-medium">
                {product.name}
              </h4>
              <p className="text-muted-foreground mb-1 line-clamp-1 text-xs">
                {product.description}
              </p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-foreground text-xs font-bold whitespace-nowrap">
                  {product.price}
                </span>
                <Button asChild size="sm" className="h-7 px-2 text-xs">
                  <Link href={product.link} target="_blank" rel="noopener noreferrer">
                    <IconExternalLink />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
