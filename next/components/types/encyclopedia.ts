export type EncyclopediaEntry = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  type: "hama" | "penyakit";
  date: string;
  symptoms: string[];
  prevention: string[];
  treatment: string[];
  content?: string;
};
