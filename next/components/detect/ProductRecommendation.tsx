"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { LFDProduct_ } from "../types/diagnoseResult";

export function ProductRecommendation({
  products,
}: { products: LFDProduct_[] }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="mb-4 text-xl font-semibold">Rekomendasi Produk</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product,index) => (
          <div
            key={product.id + index}
            className="border-border bg-zinc-100 dark:bg-border flex h-24 tems-center gap-1 rounded-lg border w-fit"
          >
            <div className="flex aspect-square h-full overflow-hidden items-center justify-center rounded-l-lg  bg-gray-100">
              <Image
                src={product.image_url || "/not-found.png"}
                alt={product.name}
                width={50}
                height={50}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-col justify-between p-2">
              <h4 className="text-foreground text-sm">{product.name}</h4>
              <p className="text-muted-foreground mb-2 text-xs">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(product.price)}
                </span>
                <Button asChild size="sm">
                  <Link href={product.link}>Beli</Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
