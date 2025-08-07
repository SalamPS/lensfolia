'use client'

import BookmarksPage from '@/components/bookmarks/BookmarksPage';
import Navbar from '@/components/home/Navbar';

const BookmarksWrapper = () => {
	return (<>
		<Navbar/>
		<BookmarksPage/>
	</>);
}

export default BookmarksWrapper;