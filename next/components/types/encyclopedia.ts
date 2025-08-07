export type EncyclopediaEntry = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  type: "hama" | "penyakit" | string;
  date: string;
  symptoms: string[];
  prevention: string[];
  treatment: string[];
  content?: string;
};

export type EncyclopediaEntryDB = {
  id: string;
  name: string;
  description: string;
  created_at: Date;
  category: "insects" | "diseases" | string;
  image_url: string;
  symptoms: string[];
  treatment: string[];
  prevention: string[];
  content: string;
};

export function mapEncyclopediaEntryDBToEntry(dbEntry: EncyclopediaEntryDB): EncyclopediaEntry {
  return {
    id: dbEntry.id,
    title: dbEntry.name,
    description: dbEntry.description,
    imageUrl: dbEntry.image_url,
    type: dbEntry.category == "insects" ? "hama" : dbEntry.category == "diseases" ? "penyakit" : "tanaman",
    date: new Date(dbEntry.created_at).toISOString().split('T')[0],
    symptoms: dbEntry.symptoms,
    prevention: dbEntry.prevention,
    treatment: dbEntry.treatment,
    content: dbEntry.content,
  };
}