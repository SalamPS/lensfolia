"use client";

/* eslint-disable @next/next/no-img-element */
import { IconBookmark, IconEdit, IconPlus, IconSearch, IconSortAscending, IconSortDescending, IconTrash } from "@tabler/icons-react";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
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
import IconDotsDropdown from "./Dropdown";
import BookmarkCardSkeleton from "./BookmarkCardSkeleton";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import Link from "next/link";
import Loading from "../Loading";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { LFD_ } from "../types/diagnoseResult";
import { useRouter } from "next/navigation";
import StaticBG from "../StaticBG";

export default function BookmarksPage () {
	const itemsPerPage = 8;
	const [currentPage, setCurrentPage] = useState(1);
	const [bookmarks, setBookmarks] = useState<LFD_[]>([]);
	const [filteredBookmarks, setFilteredBookmarks] = useState<LFD_[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
	const [isLoading, setIsLoading] = useState(true);
	const [editIndex, setEditIndex] = useState<number | null>(null);
	const [editValue, setEditValue] = useState<string>("");
	const { user, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		(async () => {
			if (loading || !user) return;
			
			setIsLoading(true);
			try {
				const response = await supabase
					.from("diagnoses")
					.select("*, diagnoses_result(*)")
					.eq("created_by", user?.id)
					.order("created_at", { ascending: false });
				if (response.data) {
					setBookmarks(response.data);
				}
				console.log(response);
			} catch (error) {
				console.error("Error fetching bookmarks:", error);
			} finally {
				setIsLoading(false);
			}
		})();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user])

	// Filter and sort bookmarks
	useEffect(() => {
		let result = [...bookmarks];

		// Apply search filter
		if (searchQuery) {
			result = result.filter((bookmark) => {
				const name = bookmark.name || "";
				return name.toLowerCase().includes(searchQuery.toLowerCase());
			});
		}

		// Apply sorting
		result.sort((a, b) => {
			const dateA = new Date(a.created_at).getTime();
			const dateB = new Date(b.created_at).getTime();
			return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
		});

		setFilteredBookmarks(result);
		setCurrentPage(1); // Reset to first page when filters change
	}, [searchQuery, sortOrder, bookmarks]);

	// Hitung index awal dan akhir bookmark yang ditampilkan
	const offset = (currentPage - 1) * itemsPerPage;
	const currentBookmarks = filteredBookmarks?.slice(offset, offset + itemsPerPage) || [];
	const pageCount = Math.ceil(filteredBookmarks.length / itemsPerPage);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		// Search is already handled by useEffect, this just prevents form submission
	};

	if (loading) {
		return <Loading/>
	}

	if (!user) {
		return <div className="flex items-center p-8 text-center justify-center min-h-screen">Silahkan daftar / masuk ke akun anda untuk mengakses bookmark anda</div>
	}

	const handleRename = async (id:string, index:number) => {
		const { error } = await supabase
			.from("diagnoses")
			.update({ name: editValue })
			.eq("id", id);
		if (!error) {
			setBookmarks((prev) =>
				prev.map((b, i) =>
					i === offset + index ? { ...b, name: editValue } : b
				)
			);
			setEditIndex(null);
			setEditValue("");
		}
	}

	return (<>
		<StaticBG>
			<header className="flex p-4 z-10 mx-auto w-full items-center md:items-end gap-8">
				<div className="grow flex flex-col items-start justify-center gap-2 md:gap-4">
					<h1 className="bg-gradient-to-b from-zinc-500 to-zinc-700 bg-clip-text text-2xl font-bold text-wrap text-transparent md:text-4xl dark:from-zinc-50 dark:to-zinc-400">
						Bookmark anda
					</h1>
					<p className="text-muted-foreground max-w-2xl text-sm text-pretty">
						Kelola dan jelajahi Bookmark hasil deteksi milik Anda
					</p>
				</div>
				<Button onClick={() => {router.push("/detect")}}>
					<IconPlus size={24} />
					Buat Deteksi
				</Button>
			</header>
		</StaticBG>
		<div className='bg-background p-4'>
			<div className='mx-auto flex w-full flex-col gap-4 md:max-w-7xl'>
				<main className="flex flex-col gap-6 p-4 border-[1px] border-border bg-card rounded-2xl">
					<div className="flex gap-4">
						<div className="grow">
							<div className="bg-primary/40 text-foreground rounded-xl p-3 flex items-center gap-1 w-fit">
								<IconBookmark size={24} />
								<span>{filteredBookmarks.length}</span>
								<span className="hidden md:inline">
									Bookmark tersedia
								</span>
							</div>
						</div>
						<div className="flex items-center gap-4">
							<form onSubmit={handleSearch} className="grow relative">
								<IconSearch
									className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
									size={20} 
								/>
								<input 
									type="text" 
									placeholder="Telusuri..." 
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10 outline-none border border-border p-3 rounded-xl w-full"
								/>
							</form>
							<Select
								value={sortOrder}
								onValueChange={(value: "newest" | "oldest") => setSortOrder(value)}
							>
								<SelectTrigger className="w-[140px]">
									<div className="flex items-center gap-2">
										{sortOrder === "newest" ? (
											<IconSortDescending size={16} />
										) : (
											<IconSortAscending size={16} />
										)}
										<SelectValue placeholder="Urutkan" />
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
					</div>
					
					<div className="text-muted-foreground text-sm">
						Menampilkan {((currentPage - 1) * itemsPerPage) + 1}-
						{Math.min(currentPage * itemsPerPage, filteredBookmarks.length)} dari{" "}
						{filteredBookmarks.length} bookmark
					</div>
					
					<div id="boomark-list" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
						{isLoading ? (
							Array.from({ length: itemsPerPage }).map((_, index) => (
								<BookmarkCardSkeleton key={index} />
							))
						) : currentBookmarks.length > 0 ? (
							currentBookmarks?.map((bookmark:LFD_, index:number) => (
								<div key={bookmark.id} className="bg-secondary border border-border rounded-2xl p-2">
									<Link href={`/result/${bookmark.id}`}>
										<img 
											src={bookmark.diagnoses_result[0]?.annotated_image} 
											alt={
												bookmark.name
													? bookmark.name
													: new Date(bookmark.created_at).toISOString().slice(0, 10)
											}
											className="w-full h-40 object-cover rounded-lg mb-3"
										/>
									</Link>
									<div>
										<div className={`flex items-center ${editIndex === index ? "pl-1" : "pl-2"}`}>
											{editIndex === index ? (<>
												<input
													type="text"
													className="grow border bg-background/40 p-2 px-3 text-sm border-border outline-none rounded-lg w-full"
													placeholder="Nama bookmark"
													value={editValue || ""}
													onChange={(e) => {
														setEditValue(e.target.value);
													}}
												/>
												<Button
													variant="ghost"
													size="icon"
													className="w-fit mx-1 ml-2 p-0"
													onClick={async () => {
														if (!editValue.trim()) return;
														handleRename(bookmark.id, index);
													}}
													title="Simpan"
												>
													<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
														<path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
													</svg>
												</Button>
												<span className="mx-[2px] text-neutral-400">
													|
												</span>
												<Button
													variant="ghost"
													size="icon"
													className="w-fit mx-1 p-0"
													onClick={() => {
														setEditIndex(null);
														setEditValue("");
													}}
													title="Batal"
												>
													<svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
														<path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
													</svg>
												</Button>
											</>) : (<>
												<h2
													className={`text-lg font-semibold grow truncate ${editIndex !== index ? "pt-1" : ""}`}
													style={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
												>
													{bookmark.name
														? bookmark.name
														: new Date(bookmark.created_at).toISOString().slice(0, 10)
													}
												</h2>
												<IconDotsDropdown>
													<DropdownMenuItem onClick={() => {
														console.log("Rename clicked");
														setEditIndex(index); 
														setEditValue(bookmark.name || "");
													}}>
														<IconEdit size={16} className="mr-2" />
														Rename
													</DropdownMenuItem>
													<DropdownMenuItem
														variant="destructive"
														onClick={() => console.log("Delete clicked")}
													>
														<IconTrash size={16} className="mr-2" />
														Delete
													</DropdownMenuItem>
												</IconDotsDropdown>
											</>)}
										</div>
										<p className={`text-xs text-muted-foreground inline-block pl-2 ${editIndex !== index ? "pb-2" : ""}`}>
											{new Date(bookmark.created_at).toLocaleDateString('id-ID')}
										</p>
									</div>
								</div>
							))
						) : (
							<div className="col-span-full flex flex-col items-center justify-center gap-4 py-12">
								<div className="w-32 h-32 rounded-2xl bg-muted flex items-center justify-center">
									<IconBookmark size={48} className="text-muted-foreground" />
								</div>
								<h3 className="text-xl font-semibold">Tidak ada bookmark ditemukan</h3>
								<p className="text-muted-foreground max-w-md text-center">
									{searchQuery 
										? `Tidak ada bookmark yang cocok dengan pencarian "${searchQuery}".`
										: "Anda belum memiliki bookmark apapun. Mulai buat deteksi untuk menyimpan hasil sebagai bookmark."
									}
								</p>
							</div>
						)}
					</div>
					{/* Pagination */}
					{!isLoading && filteredBookmarks.length > 0 && (
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

									{Array.from({ length: pageCount }).map((_, index) => (
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
												if (currentPage < pageCount)
													setCurrentPage(currentPage + 1);
											}}
											className={
												currentPage === pageCount
													? "pointer-events-none opacity-50"
													: ""
											}
										/>
									</PaginationItem>
								</PaginationContent>
							</Pagination>
						</div>
					)}
				</main>
			</div>
		</div>
	</>)
}