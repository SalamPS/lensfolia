"use client";

/* eslint-disable @next/next/no-img-element */
import { IconArrowBadgeLeftFilled, IconArrowBadgeRightFilled, IconBookmark, IconEdit, IconFilter, IconPlus, IconSearch, IconTrash } from "@tabler/icons-react";
import { Button } from "../ui/button";
import { useState } from "react";
import ReactPaginate from "react-paginate";
import IconDotsDropdown from "./Dropdown";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import Link from "next/link";

interface bookmarks_ 
{
	id: string;
	title: string;
	description: string;
	imageName: string;
	date: string;
}

export default function BookmarksPage ({bookmarks}: {bookmarks: bookmarks_[]}) {
	const itemsPerPage = 8;
	const [currentPage, setCurrentPage] = useState(0);

	// Hitung index awal dan akhir bookmark yang ditampilkan
	const offset = currentPage * itemsPerPage;
	const currentBookmarks = bookmarks?.slice(offset, offset + itemsPerPage) || [];
	const pageCount = Math.ceil(bookmarks.length / itemsPerPage);

	const handlePageClick = (event: { selected: number }) => {
			setCurrentPage(event.selected);
	};

	return (<>
		<header className="flex items-end">
			<div className="grow">
				<h1 className="grow text-4xl font-bold my-4">Bookmark anda</h1>
				<p className="text-muted-foreground">
					Kelola dan jelajahi Bookmark hasil deteksi milik Anda
				</p>
			</div>
			<Button>
				<IconPlus size={24} />
				Buat Deteksi
			</Button>
		</header>
		<main className="flex flex-col gap-6 p-4 border-[1px] border-border bg-card rounded-2xl">
			<div className="flex">
				<div className="grow">
					<div className="bg-primary/40 text-foreground rounded-xl p-3 flex items-center gap-1 w-fit">
						<IconBookmark size={24} />
						<span>{bookmarks.length} Bookmark tersedia</span>
					</div>
				</div>
				<div className="flex items-center gap-4">
					<div className="grow relative">
						<IconSearch
							className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
							size={20} 
						/>
						<input 
							type="text" 
							placeholder="Telusuri..." 
							className="pl-10 outline-none border border-border p-3 rounded-xl w-full"
						/>
					</div>
					<button className="cursor-pointer flex items-center gap-2 border-border border-[1px] p-3 px-4 rounded-xl text-muted-foreground hover:bg-card/80 transition-colors">
						<IconFilter size={20} />
						<span className="material-icons">Terbaru</span>
					</button>
				</div>
			</div>
			<div id="boomark-list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{currentBookmarks?.map((bookmark:bookmarks_) => (
					<div key={bookmark.id} className="bg-secondary border border-border rounded-2xl p-2">
						<Link href={`/result/${bookmark.id}`}>
							<img 
								src={`/examples/${bookmark.imageName}`} 
								alt={bookmark.title} 
								className="w-full h-40 object-cover rounded-lg mb-3"
							/>
						</Link>
						<div className="pl-2">
							<div className="flex items-center">
								<h2 className="text-lg font-semibold grow">{bookmark.title}</h2>
								<IconDotsDropdown>
									<DropdownMenuItem onClick={() => console.log("Rename clicked")}>
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
							</div>
							<span className="text-xs text-muted-foreground">{bookmark.date}</span>
						</div>
					</div>
				))}
			</div>
			<div className="flex justify-center mt-4">
				<ReactPaginate
					previousLabel={<IconArrowBadgeLeftFilled size={20}/>}
					nextLabel={<IconArrowBadgeRightFilled size={20}/>}
					breakLabel={"..."}
					pageCount={pageCount}
					marginPagesDisplayed={1}
					pageRangeDisplayed={2}
					onPageChange={handlePageClick}
					containerClassName={"flex gap-2 flex items-center"}
					pageClassName={"px-3 py-1 cursor-pointer text-foreground hover:text-foreground rounded-xl "}
					previousClassName={"cursor-pointer mx-4 text-foreground/80 hover:text-foreground rounded-xl"}
					nextClassName={"cursor-pointer mx-4 text-foreground/80 hover:text-foreground rounded-xl"}
					activeClassName={"bg-primary text-foreground"}
					forcePage={currentPage}
				/>
			</div>
		</main>
	</>)
}