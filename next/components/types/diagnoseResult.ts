export type LFDProduct_ = {
	id: string;
	name: string;
	description: string;
	price: number;
	image_url: string;
	link: string;
}

export type LFDResultChat_ = {
	id: string;
	created_at: Date;
	created_by: string;
	content: string;
	is_author_bot: boolean;
}

export type LFDResultEncyclopedia_ = {
	id: string;
	name: string;
	slug: string;
	image_url: string;
	category: string;
	description: string;
	symptoms: string[];
	prevention: string[];
	treatment: string[];
	content: string;
}

export type LFDResult_ = {
	id: string;
	created_at: Date;
	created_by: string;
	score: number;
	image_url: string;
	overview: string;
	treatment: string;
	recommend: string;
	ai_bubble: string[];
	products: string[];
	product_list: LFDProduct_[];
	diagnoses_chat: LFDResultChat_[];
	encyclopedia: LFDResultEncyclopedia_;
};

export type LFD_ = {
	id: string;
	created_at: string;
	created_by: string;
	image_url: string;
	is_public: boolean;
	is_bookmarked: boolean;
	id_anon: string;
	diagnoses_result: LFDResult_[];
}