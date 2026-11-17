export type Service = {
  id: string;
  name: string;
  category: string;
  description: string;
  inclusions: string[];
  startingPrice: number;
};

export type GalleryCategory =
  | "Wedding"
  | "Birthday"
  | "Baby"
  | "Outdoor"
  | "Portrait";

export type GalleryImage = {
  id: string;
  title: string;
  category: GalleryCategory;
  image: string;
  alt: string;
};

export type Review = {
  id: string;
  quote: string;
  author: string;
  context: string;
};

export type PriceOption = {
  id: string;
  label: string;
  amount: number;
};
