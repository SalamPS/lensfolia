/* eslint-disable @next/next/no-img-element */
"use client";

import {
  IconFilter,
  IconSearch,
  IconSortAscending,
  IconSortDescending,
  IconX,
} from "@tabler/icons-react";
import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { EncyclopediaEntry, mapEncyclopediaEntryDBToEntry } from "../types/encyclopedia";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import EncyclopediaCardSkeleton from "./EncyclopediaCardSkeleton";
import EncyclopediaCard from "./EncyclopediaCard";
// import { mockEncyclopediaData } from "./MockData";
import StaticBG from "../StaticBG";
import { supabase } from "@/lib/supabase";

const EncyclopediaPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [entries, setEntries] = useState<EncyclopediaEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<EncyclopediaEntry[]>(
    [],
  );
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from("encyclopedia")
          .select("*");

        if (error) {
          console.error("Error fetching data:", error);
          return;
        }

        const entry = data.map((each) => {
          return mapEncyclopediaEntryDBToEntry(each);
        });
        setEntries(entry);
        setFilteredEntries(entry);
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
 
  useEffect(() => {
    let result = [...entries];
  
    if (searchQuery) {
      result = result.filter(
        (entry) =>
          entry.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (typeFilter !== "all") {
      result = result.filter((entry) => entry.type === typeFilter);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    setFilteredEntries(result);
    setCurrentPage(1);
  }, [searchQuery, typeFilter, sortOrder, entries]);

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const clearFilters = () => {
    setTypeFilter("all");
    setSortOrder("newest");
  };

  return (
    <>
      {/* hero section */}
      <StaticBG>
        <div className="relative z-10 mt-4 flex h-[20rem] items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-4 px-4">
            <h1 className="bg-gradient-to-b from-zinc-500 to-zinc-700 bg-clip-text text-center text-2xl font-bold text-wrap text-transparent md:text-4xl dark:from-zinc-50 dark:to-zinc-400">
              Lensiklopedia
            </h1>
            <p className="text-muted-foreground max-w-2xl text-center text-sm text-pretty">
              Kami menyediakan ensiklopedia khusus hama dan penyakit tanaman
              untuk membantu anda dalam memahami berbagai masalah yang terjadi
              pada tanaman.
            </p>
          </div>
        </div>
      </StaticBG>

      {/* content section */}
      <section className="bg-background min-h-screen p-4">
        <div className="mx-auto flex w-full flex-col gap-4 md:max-w-7xl">
          {/* Filter and search header */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-fit gap-2">
                    <IconFilter size={16} />
                    Filter
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Filter Ensiklopedia</DialogTitle>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    {/* Tipe Filter */}
                    <div className="grid grid-cols-4 items-center gap-2">
                      <label htmlFor="type" className="text-sm">
                        Tipe
                      </label>
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua</SelectItem>
                          <SelectItem value="hama">Hama</SelectItem>
                          <SelectItem value="penyakit">Penyakit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sort Order */}
                    <div className="grid grid-cols-4 items-center gap-2">
                      <label htmlFor="sort" className="text-sm">
                        Urutkan
                      </label>
                      <Select
                        value={sortOrder}
                        onValueChange={(value: "newest" | "oldest") =>
                          setSortOrder(value)
                        }
                      >
                        <SelectTrigger>
                          <div className="flex items-center gap-2">
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">
                            <div className="flex items-center gap-2">
                              <IconSortDescending size={16} />
                              Terbaru
                            </div>
                          </SelectItem>
                          <SelectItem value="oldest">
                            <div className="flex items-center gap-2">
                              <IconSortAscending size={16} />
                              Terlama
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Items Per Page */}
                    <div className="grid grid-cols-4 items-center gap-2">
                      <label htmlFor="items" className="text-sm">
                        Tampilkan
                      </label>
                      <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) =>
                          setItemsPerPage(Number(value))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="30">30</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Reset Button */}
                  {(typeFilter !== "all" || sortOrder !== "newest") && (
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={clearFilters}
                      >
                        <IconX size={16} />
                        Reset Filter
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              <form
                onSubmit={handleSearch}
                className="flex w-full items-center gap-2 md:w-auto"
              >
                <Input
                  placeholder="Cari disini..."
                  className="w-full md:w-96"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button
                  type="submit"
                  variant="default"
                  className="gap-2 shadow-lg"
                >
                  <IconSearch size={16} />
                  <span className="sr-only md:not-sr-only">Telusuri</span>
                </Button>
              </form>
            </div>
          </div>

          <div className="text-muted-foreground text-sm">
            Menampilkan {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, filteredEntries.length)} dari{" "}
            {filteredEntries.length} entri
          </div>

          {/* Encyclopedia content */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              Array.from({ length: itemsPerPage }).map((_, index) => (
                <EncyclopediaCardSkeleton key={index} />
              ))
            ) : paginatedEntries.length > 0 ? (
              paginatedEntries.map((entry) => (
                <EncyclopediaCard key={entry.id} data={entry} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center gap-4 py-12">
                <img
                  src="/not-found-404.svg"
                  alt="Not found"
                  width={200}
                  height={200}
                  className="rounded-2xl"
                />
                <h3 className="text-xl font-semibold">Data tidak ditemukan</h3>
                <p className="text-muted-foreground max-w-md text-center">
                  Tidak ada entri yang cocok dengan pencarian atau filter Anda.
                  Coba gunakan kata kunci lain atau atur ulang filter.
                </p>
                
              </div>
            )}
          </div>

          {/* Pagination */}
          {!isLoading && filteredEntries.length > 0 && (
            <div className="mt-4 mb-10 flex flex-col items-center">
              <Pagination className="w-fit">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }).map((_, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(index + 1);
                        }}
                        isActive={currentPage === index + 1}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages)
                          setCurrentPage(currentPage + 1);
                      }}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default EncyclopediaPage;
