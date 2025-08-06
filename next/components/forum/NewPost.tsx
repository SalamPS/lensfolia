"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { IconPaperclip, IconX } from "@tabler/icons-react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";
import { Label } from "@radix-ui/react-label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import Link from "next/link";

const NewPost = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  const handleAddTag = () => {
    if (inputValue.trim() && !tags.includes(inputValue.trim())) {
      setTags([...tags, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTag();
    }
  };

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <section className="bg-background min-h-screen">
      <div className="w-full px-4 pt-24 pb-8">
        <div className="mx-auto max-w-4xl">
          {/* Post Form Card */}
          <div className="bg-background/80 border-border flex flex-col gap-4 rounded-lg border p-4 shadow-md">
            {/* header */}
            <div className="mb-4 flex justify-between">
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold">Buat postingan baru</h1>
                <p className="text-muted-foreground text-sm">
                  Bagikan pertanyaan, pengalaman, atau pengetahuan perawatan
                  tanaman Anda dengan komunitas
                </p>
              </div>
              <Link href="/forum">
                <Button variant="outline" size="icon">
                  <IconX size={20} />
                </Button>
              </Link>
            </div>

            {/* user */}
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src="/sparkle-color-primary.svg" />
                {/* src={authorImg} */}
              </Avatar>
              <p className="font-medium">Salam Nigga</p>
            </div>

            {/* form */}
            <form action="" className="flex w-full flex-col gap-4">
              {/* baris 1 */}
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <div className="grid w-full items-center gap-1.5">
                  <Label className="text-sm" htmlFor="kategori">
                    Kategori
                  </Label>
                  <Select>
                    <SelectTrigger id="kategori" className="w-full">
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Kategori Postingan</SelectLabel>
                        <SelectItem value="umum">Umum</SelectItem>
                        <SelectItem value="hama">Hama</SelectItem>
                        <SelectItem value="penyakit">Penyakit</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label className="text-sm" htmlFor="diagnosis">
                    Hubungkan ke Diagnosis (opsional)
                  </Label>
                  <Select>
                    <SelectTrigger id="diagnosis" className="w-full">
                      <SelectValue placeholder="Pilih Diagnosis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Diagnosis baru-baru ini</SelectLabel>
                        <SelectItem value="umum">Nigga</SelectItem>
                        <SelectItem value="hama">Nigga</SelectItem>
                        <SelectItem value="penyakit">Nigga</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* baris 2 */}
              <div className="grid w-full items-center gap-1">
                <Label className="text-sm" htmlFor="judul">
                  Judul
                </Label>
                <Input
                  type="text"
                  id="judul"
                  placeholder="contoh: Masalah pada tumbuhan jagung"
                  required
                />
              </div>

              {/* baris 3 */}
              <div className="grid w-full items-center gap-1">
                <Label className="text-sm" htmlFor="deskripsi">
                  Deskripsi
                </Label>
                <Textarea
                  className="h-32"
                  id="deskripsi"
                  placeholder="contoh: jagung saya mengalami masalah pertumbuhan, daun menguning, dan akar busuk. Saya ingin tahu cara mengatasinya."
                  required
                />
              </div>

              {/* baris 4 */}
              <div className="space-y-2">
                <div className="grid w-full items-center gap-1">
                  <Label className="text-sm" htmlFor="tag">
                    Tambahkan Tag
                  </Label>
                  <div className="flex gap-1">
                    <Input
                      type="text"
                      id="tag"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="jagung; hama; penyakit"
                    />
                    <Button
                      variant="outline"
                      onClick={handleAddTag}
                      disabled={!inputValue.trim()}
                    >
                      Tambah tag
                    </Button>
                  </div>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <div
                        key={index}
                        className="dark:bg-muted bg-input text-foreground/70 flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold uppercase"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(index)}
                          className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                        >
                          <IconX size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* baris 5 */}
              <div className="grid w-full items-center gap-1">
                <Label className="text-sm" htmlFor="attachment">
                  Tambahkan link atau file (opsional)
                </Label>
                <div className="flex gap-1">
                  <Input
                    type="text"
                    id="attachment"
                    placeholder="https://example.com/"
                  />
                  <Button
                    variant="outline"
                    className="gap-2 rounded"
                    size="icon"
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                  >
                    <IconPaperclip size={20} />
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) {
                          console.log("File selected:", e.target.files[0]);
                          // Handle file upload logic here
                        }
                      }}
                    />
                  </Button>
                </div>
              </div>

              <div className="grid w-full grid-cols-2 items-center gap-1">
                <Link href="/forum">
                  <Button variant="secondary" className="w-full">
                    Batalkan
                  </Button>
                </Link>
                <Button type="submit">Buat postingan</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewPost;
