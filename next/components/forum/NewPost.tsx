"use client";

import React, { useEffect, useState } from "react";
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
import { useAuth } from "@/hooks/useAuth";
import StaticBG from "../StaticBG";
import Loading from "../Loading";
import { userBasic_ } from "../types/user";
import { supabase } from "@/lib/supabase";
import { LFD_ } from "../types/diagnoseResult";
import { PostType } from "./ForumCard";
import { useRouter } from "next/navigation";

const NewPost = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [userData, setUserData] = useState<userBasic_ | null>(null);
  const [diagnosesData, setDiagnosesData] = useState<LFD_[]>([]);
  const [diagnosesFilter, setDiagnosesFilter] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<PostType | string>("general");
  const [selectedDiagnosis, setSelectedDiagnosis] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    (async () => {
      if (user) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (error) {
          console.error("Error fetching user data:", error);
          return;
        }
        setUserData(data);
        const { data: diagnoses, error: diagError } = await supabase
          .from('diagnoses')
          .select('*')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false });
        if (diagError) {
          console.error("Error fetching diagnoses data:", diagError);
          return;
        }
        setDiagnosesData(diagnoses || []);
      }
    })();
  }, [user]);

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

  // Filter diagnoses based on search keyword
  const filteredDiagnoses = diagnosesData.filter((diagnosis) => {
    const name = diagnosis.name || diagnosis.created_at.split("T")[0];
    return name.toLowerCase().includes(diagnosesFilter.toLowerCase());
  });

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };

  // Remove selected file
  const removeFile = () => {
    setSelectedFile(null);
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validation
    if (!title.trim()) {
      alert("Judul harus diisi!");
      return;
    }
    if (!description.trim()) {
      alert("Deskripsi harus diisi!");
      return;
    }
    if (!category) {
      alert("Kategori harus dipilih!");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageData = { url: null };
      if (selectedFile) {
        const formData = new FormData();
        formData.append("image", selectedFile);
        formData.append("bucket", "image-forum");
        formData.append("path", "uploads");
        const uploadResponse = await fetch('/api/v1/upload', {
          method: 'POST',
          body: formData
        });
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }
        imageData = await uploadResponse.json();
      }

      const postData = {
        content: title.trim(),
        contents: description.trim(),
        diagnoses_ref: selectedDiagnosis || null,
        media_url: imageData.url || null,
        category,
        tags,
      };

      // Insert post to database
      const { data: forumResult, error } = await supabase
        .from('forums')
        .insert(postData)
        .select()
        .single();

      if (error) {
        console.error("Error creating post:", error);
        alert("Gagal membuat postingan!");
        return;
      }

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("general");
      setSelectedDiagnosis("");
      setTags([]);
      setSelectedFile(null);

      // Redirect to the new post detail page
      router.push(`/forum/post/${forumResult.id}`);
      
    } catch (error) {
      console.error("Error submitting post:", error);
      alert("Terjadi kesalahan saat membuat postingan!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (<Loading/>);
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        Silahkan daftar / masuk ke akun anda untuk membuat postingan baru.
      </div>
    );
  }

  return (<StaticBG overlay>
    <section className="min-h-screen">
      <div className="w-full px-4 pt-24 pb-8">
        <div className="mx-auto max-w-4xl">
          {/* Post Form Card */}
          <div className="bg-background/40 backdrop-blur-sm border-border flex flex-col gap-4 rounded-lg border p-4 md:p-6 shadow-md">
            {/* header */}
            <div className="mb-4 flex justify-between">
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold mb-1">Buka Forum Diskusi Baru</h1>
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
            <div className="mb-1 flex items-center gap-3">
              <Avatar>
                <AvatarImage src={userData?.profile_picture} />
                {/* src={authorImg} */}
              </Avatar>
              <div>
                <p className="font-medium">{userData?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date().toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* form */}
            <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
              {/* baris 1 */}
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <div className="grid w-full items-center gap-1.5">
                  <Label className="text-sm" htmlFor="category">
                    Kategori
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category" className="w-full">
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Daftar postingan</SelectLabel>
                        <SelectItem value="general">Umum</SelectItem>
                        <SelectItem value="pests">Hama</SelectItem>
                        <SelectItem value="diseases">Penyakit</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label className="text-sm" htmlFor="diagnoses_ref">
                    Hubungkan ke Diagnosis (opsional)
                  </Label>
                  <div className="">
                    <Select value={selectedDiagnosis} onValueChange={setSelectedDiagnosis}>
                      <SelectTrigger id="diagnoses_ref" className="w-full">
                        <SelectValue placeholder="Pilih Diagnosis" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Daftar diagnosis</SelectLabel>
                          <Input
                            type="text"
                            placeholder="Cari diagnosis..."
                            value={diagnosesFilter}
                            onChange={(e) => setDiagnosesFilter(e.target.value)}
                            className="w-full outline-none focus:border-0 focus:outline-0 ring-0 focus:ring-0 focus-visible:outline-0 focus-visible:ring-0"
                          />
                          {filteredDiagnoses.length === 0 && diagnosesFilter && (
                            <div className="px-2 py-1 text-sm text-muted-foreground">
                              Tidak ada diagnosis yang cocok dengan &quot;{diagnosesFilter}&quot;
                            </div>
                          )}
                          {filteredDiagnoses.map((diagnosis, index) => 
                            index < 4 && (
                            <SelectItem key={diagnosis.id} value={diagnosis.id}>
                              {diagnosis.name || diagnosis.created_at.split("T")[0]}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* baris 2 */}
              <div className="grid w-full items-center gap-1">
                <Label className="text-sm" htmlFor="content">
                  Judul
                </Label>
                <Input
                  type="text"
                  id="content"
                  placeholder="contoh: Masalah pada tumbuhan jagung"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* baris 3 */}
              <div className="grid w-full items-center gap-1">
                <Label className="text-sm" htmlFor="contents">
                  Deskripsi
                </Label>
                <Textarea
                  className="h-32"
                  id="contents"
                  placeholder="contoh: jagung saya mengalami masalah pertumbuhan, daun menguning, dan akar busuk. Saya ingin tahu cara mengatasinya."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
              <div className="grid w-full items-center gap-3">
                <Label className="text-sm" htmlFor="attachment">
                  Tambahkan link atau file (opsional)
                </Label>
                <div className="grow flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 rounded w-full"
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
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      onChange={handleFileSelect}
                    />
                    <span>
                      {selectedFile ? "Ganti file" : "Pilih file"}
                    </span>
                  </Button>
                </div>

                {/* Display selected file */}
                {selectedFile && (
                  <div className="mt-2 flex items-center justify-between rounded-md border border-neutral-600 p-2">
                    <div className="flex items-center gap-2">
                      <IconPaperclip size={16} />
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                    >
                      <IconX size={16} />
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid w-full grid-cols-2 items-center gap-1">
                <Link href="/forum">
                  <Button type="button" variant="secondary" className="w-full" disabled={isSubmitting}>
                    Batalkan
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Buat postingan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  </StaticBG>);
};

export default NewPost;
