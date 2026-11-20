
export type Destination = {
  slug: string;
  name: string;
  category: string;
  location: string;
  shortDescription: string;
  description: string;
  coverImage: string;
  gallery: string[];
  highlights: string[];
};

export const destinations: Destination[] = [
  {
    slug: "salem",
    name: "Salem",
    category: "Wedding & Event Photography",
    location: "Salem, Tamil Nadu",
    shortDescription:
      "Beautiful celebrations and memorable moments captured in Salem.",
    description:
      "Explore our photography collection from Salem, featuring beautiful weddings, traditional ceremonies and unforgettable celebrations.",
    coverImage: "/images/journeys/salem/cover.PNG",
    gallery: ["/images/journeys/salem/gallery/01.jpg","/images/journeys/salem/gallery/02.jpeg",
      "/images/journeys/salem/gallery/03.jpeg","/images/journeys/salem/gallery/04.jpeg",
    ],
    highlights: ["Wedding & Event Photography"],
  },
  {
    slug: "namakkal",
    name: "Namakkal",
    category: "Wedding & Event Photography",
    location: "Namakkal, Tamil Nadu",
    shortDescription:
      "Wedding stories and beautiful celebrations captured in Namakkal.",
    description:
      "Explore our collection of memorable celebrations and special moments captured around Namakkal.",
    coverImage: "/images/journeys/namakkal/cover.PNG",
    gallery: [
      "/images/journeys/namakkal/gallery/01.jpeg","/images/journeys/namakkal/gallery/02.jpeg",
      "/images/journeys/namakkal/gallery/03.jpeg","/images/journeys/namakkal/gallery/04.jpeg",
    ],
    highlights: ["Wedding & Event Photography"],
  },
  {
    slug: "erode",
    name: "Erode",
    category: "Wedding & Event Photography",
    location: "Erode, Tamil Nadu",
    shortDescription:
      "A collection of special celebrations and wedding moments from Erode.",
    description:
      "Discover our photography stories from Erode, capturing beautiful weddings and memorable family celebrations.",
    coverImage: "/images/journeys/erode/cover.PNG",
    gallery: [
      "/images/journeys/erode/gallery/01.jpeg","/images/journeys/erode/gallery/02.jpeg",
      "/images/journeys/erode/gallery/03.jpeg","/images/journeys/erode/gallery/04.jpeg",
    ],
    highlights: ["Wedding & Event Photography"],
  },
  {
    slug: "dharmapuri",
    name: "Dharmapuri",
    category: "Wedding & Event Photography",
    location: "Dharmapuri, Tamil Nadu",
    shortDescription:
      "Heartfelt celebrations and beautiful moments captured in Dharmapuri.",
    description:
      "Explore our collection of wedding and event photographs captured around Dharmapuri.",
    coverImage: "/images/journeys/dharmapuri/cover.PNG",
    gallery: [
      "/images/journeys/dharmapuri/gallery/01.jpg","/images/journeys/dharmapuri/gallery/02.jpg",
      "/images/journeys/dharmapuri/gallery/03.jpeg","/images/journeys/dharmapuri/gallery/04.jpeg",
    ],
    highlights: ["Wedding & Event Photography"],
  },
  {
    slug: "krishnagiri",
    name: "Krishnagiri",
    category: "Wedding & Event Photography",
    location: "Krishnagiri, Tamil Nadu",
    shortDescription:
      "Unforgettable wedding stories and celebrations from Krishnagiri.",
    description:
      "Browse our collection of beautiful weddings and special occasions captured in Krishnagiri.",
    coverImage: "/images/journeys/krishnagiri/cover.PNG",
    gallery: [
      "/images/journeys/krishnagiri/gallery/01.jpeg","/images/journeys/krishnagiri/gallery/02.jpeg",
      "/images/journeys/krishnagiri/gallery/03.jpeg","/images/journeys/krishnagiri/gallery/04.jpeg",
    ],
    highlights: ["Wedding & Event Photography"],
  },
  {
    slug: "tiruchengode",
    name: "Tiruchengode",
    category: "Wedding & Event Photography",
    location: "Tiruchengode, Namakkal District",
    shortDescription:
      "Beautiful celebrations and memorable moments captured in Tiruchengode.",
    description:
      "Discover our photography collection featuring weddings and special events captured around Tiruchengode.",
    coverImage: "/images/journeys/tiruchengode/cover.PNG",
    gallery: ["/images/journeys/tiruchengode/gallery/01.jpeg","/images/journeys/tiruchengode/gallery/02.jpeg",
              "/images/journeys/tiruchengode/gallery/03.jpeg","/images/journeys/tiruchengode/gallery/04.jpeg",],
    highlights: ["Wedding & Event Photography"],
  },
];

export function getDestination(slug: string) {
  return destinations.find((destination) => destination.slug === slug);
}