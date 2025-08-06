/* eslint-disable @typescript-eslint/no-explicit-any */

import { supabase } from "@/lib/supabase";
import { Comment, ForumPost } from "./MockData";

const getTimeAgo = (dateString: string): string => {
	const now = new Date();
	const postDate = new Date(dateString);
	const diffInMs = now.getTime() - postDate.getTime();
	
	const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
	const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
	const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
	const diffInWeeks = Math.floor(diffInDays / 7);
	const diffInMonths = Math.floor(diffInDays / 30);
	const diffInYears = Math.floor(diffInDays / 365);
	
	if (diffInYears > 0) {
		return `${diffInYears} tahun lalu`;
	} else if (diffInMonths > 0) {
		return `${diffInMonths} bulan lalu`;
	} else if (diffInWeeks > 0) {
		return `${diffInWeeks} minggu lalu`;
	} else if (diffInDays > 0) {
		return `${diffInDays} hari lalu`;
	} else if (diffInHours > 0) {
		return `${diffInHours} jam lalu`;
	} else if (diffInMinutes > 0) {
		return `${diffInMinutes} menit lalu`;
	} else {
		return 'Baru saja';
	}
};

export const ForumQuery = async () => {
	const response = await supabase
	.from("forums")
	.select(`
		*,
		user_profiles (
			id,
			name,
			profile_picture
		),
		diagnoses(*),
		rating(*),
		forums_discussions(*,
			rating(*),
			forums_comments(*,
				rating(*)
			)
		)
	`);
	return response.data
}

export const ForumDetailQuery = async (id:string) => {
	const response = await supabase
	.from("forums")
	.select(`*,
		user_profiles (
			id,
			name,
			profile_picture
		),
		diagnoses(*),
		rating(*),
		forums_discussions(*,
			user_profiles (
				id,
				name,
				profile_picture
			),
			rating(*),
			forums_comments(*,
				user_profiles (
					id,
					name,
					profile_picture
				),
				rating(*)
			)
		)
	`)
	.eq("id", id);
	return response.data
}

export const ForumReplyConverter = (comments: any): Comment => {
	return {
		id: comments.id,
		author: comments.user_profiles.name,
		authorId: comments.user_profiles.id,
		authorImg: comments.user_profiles.profile_picture,
		timeAgo: getTimeAgo(comments.created_at),
		content: comments.content,
		upvotes: comments.rating.filter((rating: any) => rating.is_upvote === true).map((rating: any) => rating?.created_by),
		downvotes: comments.rating.filter((rating: any) => rating.is_upvote === false).map((rating: any) => rating?.created_by),
		nullvotes: comments.rating.filter((rating: any) => rating.is_upvote === null).map((rating: any) => rating?.created_by),
	}
}

export const ForumCommentConverter = (post: any): Comment[] => {
	return post.forums_discussions.map((discussion: any) => ({
		id: discussion.id,
		author: discussion.user_profiles.name,
		authorId: discussion.user_profiles.id,
		authorImg: discussion.user_profiles.profile_picture,
		timeAgo: getTimeAgo(discussion.created_at),
		content: discussion.content,
		upvotes: discussion.rating.filter((rating: any) => rating.is_upvote === true).map((rating: any) => rating?.created_by),
		downvotes: discussion.rating.filter((rating: any) => rating.is_upvote === false).map((rating: any) => rating?.created_by),
		nullvotes: discussion.rating.filter((rating: any) => rating.is_upvote === null).map((rating: any) => rating?.created_by),
		replies: discussion.forums_comments.map((reply: any) => ForumReplyConverter(reply)),
	}))
}

export const ForumConverter = (post: any):ForumPost => {
	return {
		id: post.id,
		title: post.content,
		content: post.contents,
		authorImg: post.user_profiles.profile_picture,
		authorId: post.user_profiles.id,
		author: post.user_profiles.name,
		timeAgo: getTimeAgo(post.created_at),
		type: post.category,
		tags: post.tags,
		imageUrl: post.media_url,
		comments: post.forums_discussions.map((discussion: any) => (discussion.id)),
		views: post.views,
		upvotes: post.rating.filter((rating: any) => rating.is_upvote === true).map((rating: any) => rating?.created_by),
		downvotes: post.rating.filter((rating: any) => rating.is_upvote === false).map((rating: any) => rating?.created_by),
		nullvotes: post.rating.filter((rating: any) => rating.is_upvote === null).map((rating: any) => rating?.created_by),
	}
}