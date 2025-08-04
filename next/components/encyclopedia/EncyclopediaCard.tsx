import React from "react";
import { EncyclopediaEntry } from "../types/encyclopedia";
import SpotlightCard from "../SpotlightCard";
import Image from "next/image";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import Link from "next/link";

interface EncyclopediaCardProps {
  data: EncyclopediaEntry;
}

const EncyclopediaCard: React.FC<EncyclopediaCardProps> = ({ data }) => {
  return (
    <SpotlightCard
      className="custom-spotlight-card"
      spotlightColor="rgba(0, 187, 167, 0.2)"
    >
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={data.imageUrl}
          alt={data.title}
          fill
          className="rounded-sm object-cover"
        />
      </div>
      <div className="px-2 py-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Badge variant={data.type === "hama" ? "destructive" : "warning"}>
              {data.type}
            </Badge>
            <span className="text-muted-foreground text-xs">
              {new Date(data.date).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          <h3 className="text-foreground text-lg font-semibold">
            {data.title}
          </h3>
        </div>
        <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
          {data.description}
        </p>
        <div className="mt-4 flex items-center">
          <Link href={`/encyclopedia/${data.id}`}>
            <Button
              variant="secondary"
              size="sm"
              className="shadow-primary/30 transition-all hover:shadow-lg"
            >
              Baca selengkapnya
            </Button>
          </Link>
        </div>
      </div>
    </SpotlightCard>
  );
};

export default EncyclopediaCard;
