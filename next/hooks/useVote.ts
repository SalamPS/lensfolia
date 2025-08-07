'use client'

import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from "@/hooks/useAuth";

interface PostMetadata {
	id: string;
	title: string;
	authorId: string;
	reference: string;
}

interface VoteHandlerParams extends PostMetadata {
	initialUpvotes: string[];
	initialDownvotes: string[];
	initialNullvotes: string[];
}

export function useVote() {
	const { user } = useAuth();
	const [postData, setPostData] = useState<PostMetadata>({id: "", title: "", authorId: "", reference: "" });
	const [postUpvotes, setPostUpvotes] = useState<string[]>([]);
	const [postDownvotes, setPostDownvotes] = useState<string[]>([]);
	const [postNullvotes, setPostNullvotes] = useState<string[]>([]);
	
	const [activeVote, setActiveVote] = useState<"up" | "down" | null>(null);
	const [isVoted, setIsVoted] = useState(false);

	useEffect(() => {
		if (user) {
			const upvoted = postUpvotes.includes(user.id);
			const downvoted = postDownvotes.includes(user.id);
			const nullvoted = postNullvotes.includes(user.id);
			setActiveVote(upvoted ? "up" : downvoted ? "down" : null);
			setIsVoted(upvoted || downvoted || nullvoted);
		}
	}, [user, postUpvotes, postDownvotes, postNullvotes]);

	const rate = async (type:string) => {
		let action: boolean | null = null;
		const REFERENCE = postData.reference === "forum" 
			? "ref_forums" : postData.reference === "discussion"
			? "ref_discussions"
			: "ref_comments";

		if (!user) {
			alert("Please log in to vote.");
			return;
		}

		const backupUpvotes = [...postUpvotes];
		const backupDownvotes = [...postDownvotes];
		const backupNullvotes = [...postNullvotes];

		let result: PostgrestSingleResponse<null> = {
			error: null,
			data: null,
			count: null,
			status: 200,
			statusText: "OK",
		};
		if (isVoted) {
			if (activeVote === "up" && type === "up") {
				setPostUpvotes((prev) => prev.filter((id) => id !== user.id));
				setPostNullvotes((prev) => [...prev, user.id]);
				setActiveVote(null);
				action = null;
			}
			if (activeVote === "down" && type === "down") {
				setPostDownvotes((prev) => prev.filter((id) => id !== user.id));
				setPostNullvotes((prev) => [...prev, user.id]);
				setActiveVote(null);
				action = null;
			}
			if (activeVote === "up" && type === "down") {
				setPostUpvotes((prev) => prev.filter((id) => id !== user.id));
				setPostDownvotes((prev) => [...prev, user.id]);
				setActiveVote("down");
				action = false;
			}
			if (activeVote === "down" && type === "up") {
				setPostDownvotes((prev) => prev.filter((id) => id !== user.id));
				setPostUpvotes((prev) => [...prev, user.id]);
				setActiveVote("up");
				action = true;
			}
			if (activeVote === null && type === "up") {
				setPostNullvotes((prev) => prev.filter((id) => id !== user.id));
				setPostUpvotes((prev) => [...prev, user.id]);
				setActiveVote("up");
				action = true;
			}
			if (activeVote === null && type === "down") {
				setPostNullvotes((prev) => prev.filter((id) => id !== user.id));
				setPostDownvotes((prev) => [...prev, user.id]);
				setActiveVote("down");
				action = false;
			}
			result = await supabase
				.from("rating")
				.update({ is_upvote: action })
				.eq(REFERENCE, postData.id)
				.eq("created_by", user.id);
		} 
		else {
			switch (type) {
				case "up":
					setActiveVote("up");
					setPostUpvotes((prev) => [...prev, user.id]);
					break;
				case "down":
					setActiveVote("down");
					setPostDownvotes((prev) => [...prev, user.id]);
					break;
			}
			result = await supabase
				.from("rating")
				.insert({
					[REFERENCE]: postData.id,
					content: postData.title.length > 30 ? `${postData.title.slice(0, 30)}...` : postData.title,
					content_creator: postData.authorId,
					is_upvote: type === "up" ? true : false,
				});
			setIsVoted(true);
		}

		console.log(result)

		if (result.error) {
			console.error("Error upvoting:", result.error);
			setPostUpvotes(backupUpvotes);
			setPostDownvotes(backupDownvotes);
			setPostNullvotes(backupNullvotes);
			return;
		}
	}

	const downVote = async () => {await rate("down")}
	const upVote = async () => {await rate("up")}
	const getDownVoteCount = ():number => {return postDownvotes.length}
	const getUpVoteCount = ():number => {return postUpvotes.length}
	const getUserUpVoting = ():boolean => {return postUpvotes.includes(user?.id || "")}
	const getUserDownVoting = ():boolean => {return postDownvotes.includes(user?.id || "")}

	const syncVote = async ({
		id,
		title,
		authorId,
		reference,
		initialUpvotes,
		initialDownvotes,
		initialNullvotes,
	}: VoteHandlerParams) => {
		if (user) {
			const upvoted = initialUpvotes.includes(user.id);
			const downvoted = initialDownvotes.includes(user.id);
			const nullvoted = initialNullvotes.includes(user.id);
			setActiveVote(upvoted ? "up" : downvoted ? "down" : null);
			setIsVoted(upvoted || downvoted || nullvoted);
		}
		setPostData({ id, title, authorId, reference });
		setPostUpvotes(initialUpvotes);
		setPostDownvotes(initialDownvotes);
		setPostNullvotes(initialNullvotes);
	}

	return { 
		getUpVoteCount,
		getDownVoteCount,
		getUserUpVoting,
		getUserDownVoting,
		activeVote, 
		setActiveVote, 
		isVoted, 
		setIsVoted, 
		upVote, 
		downVote,
		syncVote
	};
}
