import BookmarksPage from '@/components/bookmarks/BookmarksPage';
import Navbar from '@/components/home/Navbar';
import { userNavbar_ } from '@/components/types/user';
import React from 'react'

const BookmarksWrapper = () => {
	return (<>
		<Navbar user={user}/>
		<div className='bg-background h-full w-full p-44 flex flex-col gap-8'>
			<BookmarksPage bookmarks={Bookmarks}/>
		</div>
	</>);
}

const user:userNavbar_ = {
	id: '123',
	name: 'Salam PS',
	email: 'salamp@salamp.id',
	profilePicture: '/profile.jpg',
	createdAt: '2023-01-01',
}

export default BookmarksWrapper;

const Bookmarks = [
	{
		id: '123',
		title: 'Bookmark 1',
		description: 'This is the first bookmark.',
		imageName: 'anthracnose_example.jpg',
		date: '2023-10-01',
	},
	{
		id: '234',
		title: 'Bookmark 2',
		description: 'This is the second bookmark.',
		imageName: 'anthracnose_example.jpg',
		date: '2023-10-01',
	},
	{
		id: '345',
		title: 'Bookmark 3',
		description: 'This is the third bookmark.',
		imageName: 'anthracnose_example.jpg',
		date: '2023-10-01',
	},
	{
		id: '456',
		title: 'Bookmark 4',
		description: 'This is the fourth bookmark.',
		imageName: 'anthracnose_example.jpg',
		date: '2023-10-01',
	},
	{
		id: '567',
		title: 'Bookmark 5',
		description: 'This is the fifth bookmark.',
		imageName: 'anthracnose_example.jpg',
		date: '2023-10-01',
	},
	{
		id: '678',
		title: 'Bookmark 6',
		description: 'This is the sixth bookmark.',
		imageName: 'anthracnose_example.jpg',
		date: '2023-10-01',
	},
	{
		id: '789',
		title: 'Bookmark 7',
		description: 'This is the seventh bookmark.',
		imageName: 'anthracnose_example.jpg',
		date: '2023-10-01',
	},
	{
		id: '890',
		title: 'Bookmark 8',
		description: 'This is the eighth bookmark.',
		imageName: 'anthracnose_example.jpg',
		date: '2023-10-01',
	},
	{
		id: '901',
		title: 'Bookmark 9',
		description: 'This is the ninth bookmark.',
		imageName: 'anthracnose_example.jpg',
		date: '2023-10-01',
	},
	{
		id: '012',
		title: 'Bookmark 10',
		description: 'This is the tenth bookmark.',
		imageName: 'anthracnose_example.jpg',
		date: '2023-10-01',
	},
	{
		id: '1234',
		title: 'Bookmark 11',
		description: 'This is the eleventh bookmark.',
		imageName: 'anthracnose_example.jpg',
		date: '2023-10-01',
	},
	{
		id: '2345',
		title: 'Bookmark 12',
		description: 'This is the twelfth bookmark.',
		imageName: 'anthracnose_example.jpg',
		date: '2023-10-01',
	},
]