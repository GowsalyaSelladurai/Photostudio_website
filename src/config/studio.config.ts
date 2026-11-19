import type {
  GalleryImage,
  PriceOption,
  Review,
  Service,
} from "@/types/studio";

const demoImage = (id: string, width = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

export const studioConfig = {
  demoMode: true,
  name: "StudioFrame",
  tagline: "Photographs that feel like home.",
  description:
    "A demo photography studio celebrating people, places, and the moments in between.",
  currency: "INR",
locale: "en-IN",
  about: {
    introduction: {
      eyebrow: "The studio · demo",
      title: "Good photographs begin with feeling at ease.",
      description:
        "StudioFrame is a demonstration photography studio built around thoughtful portraits, honest connection, and the moments people want to remember.",
    },
    
story: {
  eyebrow: "Our Story · Rooted in Tradition",
  title: "Every frame carries a feeling. Every story deserves to be remembered.",
  paragraphs: [
    "Inspired by the colours, traditions, and beautiful celebrations of Tamil Nadu and Kerala, StudioFrame brings meaningful moments to life through photography.",
    "From traditional weddings and intimate celebrations to everyday portraits, we believe the most beautiful photographs are the ones that feel real, natural, and timeless."
  ],
  image:
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85",
  imageAlt: "A photographer capturing a traditional South Indian wedding"
},

    approach: {
      eyebrow: "How we work · demo",
      title: "A thoughtful approach, from hello to the final frame.",
      description:
        "Sample approach details: every session can be adapted to the approved studio's real process and the people in front of the camera.",
      principles: [
        {
          title: "Start with a conversation",
          description:
            "We learn what matters to you, answer questions, and plan a session that feels comfortable.",
        },
        {
          title: "Leave room to be yourself",
          description:
            "Gentle direction and an unhurried pace help real expressions find their way into the photographs.",
        },
        {
          title: "Finish with care",
          description:
            "A considered edit brings the images together into a gallery made to revisit and share.",
        },
      ],
    },
    team: {
  eyebrow: "Meet the creative minds",
  title: "The people behind every beautiful frame.",
  description:
    "A passionate creative team bringing stories to life through photography, imagination, and attention to detail.",
  members: [
    {
      name: "Arjun Mehta",
      role: "Creative Director",
      description:
        "Develops creative concepts and brings a unique vision to every photography experience.",
      image: demoImage("photo-1506794778202-cad84cf45f1d", 700),
      imageAlt: "Portrait of a creative director",
    },
    {
      name: "Maya Sharma",
      role: "Lead Photographer",
      description:
        "Captures genuine expressions, beautiful details, and meaningful moments through her lens.",
      image: demoImage("photo-1524504388940-b1c1722653e1", 700),
      imageAlt: "Portrait of a female photographer",
    },
    {
      name: "Daniel Thomas",
      role: "Visual Storyteller",
      description:
        "Transforms photographs into timeless visual stories through thoughtful editing and design.",
      image: demoImage("photo-1507003211169-0a1dd7228f2d", 700),
      imageAlt: "Portrait of a visual storyteller",
    },
  ],
},
    visit: {
      eyebrow: "Find the studio · demo details",
      title: "A place for your next story.",
      description:
        "Address, hours, and map details are placeholders until approved studio information is available.",
    },
    contactEyebrow: "Start a conversation · demo",
    contactTitle: "Ready to make a plan?",
    contactLinkLabel: "Get in touch",
  },
  home: {
    introduction: {
      eyebrow: "A little about us",
      title: "Made slowly. Remembered forever.",
      description:
        "We make photographs with room to breathe — honest portraits, thoughtful celebrations, and small moments worth keeping.",
      image: demoImage("photo-1492691527719-9d1e07e534b4", 1400),
      imageAlt: "A photographer preparing a camera for a portrait session",
      linkLabel: "Meet the studio",
    },
    popularServices: {
      eyebrow: "Time together",
      title: "A session for every story.",
      linkLabel: "View all services",
    },
    featuredGallery: {
      eyebrow: "A few favorites",
      title: "Small moments, held close.",
      description:
        "A selection of demo photographs from the StudioFrame portfolio. Select a photograph to view it up close.",
      linkLabel: "View the gallery",
    },
    testimonials: {
      eyebrow: "Kind words",
      title: "Good things, said simply.",
      description:
        "Fictional demo reviews, included to show how client stories may appear.",
    },
    instagram: {
      eyebrow: "A peek behind the scenes",
      title: "Little moments from the studio.",
      description:
        "Sample social images. Connect the approved studio account for a live feed.",
      linkLabel: "Instagram · demo link",
    },
    closing: {
      eyebrow: "Your story, your way",
      title: "Let’s make something worth keeping.",
      linkLabel: "Tell us what you have in mind",
    },
  },
  contact: {
  mapLocation: "Ammapet, Salem, Tamil Nadu, India",

  introduction: {
    eyebrow: "Say hello",
    title: "We would love to hear what you are dreaming up.",
    description: "For a session, a question, or simply to say hello.",
  },
    email: "hello@example.org",
    phoneDisplay: "+1 (202) 555-0100",
    phoneHref: "+12025550100",
    whatsappHref: "https://wa.me/12025550100",
    address: "Demo address — configured by StudioFrame",
    hours: "Demo hours: Monday–Saturday, 9:00 AM–5:00 PM",
    mapsUrl: null,
    mapPlaceholder: {
      title: "Google Maps preview · placeholder",
      description:
        "A verified map pin will be added when the studio address is approved.",
    },
    detailsLabels: {
      email: "Email · placeholder",
      phone: "Phone · placeholder",
      address: "Demo address",
      hours: "Demo opening hours",
      whatsapp: "WhatsApp · demo contact",
    },
    placeholderNote:
      "Placeholder contact details for the StudioFrame demonstration.",
    enquiry: {
      eyebrow: "General enquiry",
      title: "Send us a note.",
      description:
        "Share a little about what you need. Please include an email address or mobile number so the demo studio can reply.",
      contactHint:
        "Please share an email address or mobile number so this demo studio can reply.",
      fieldLabels: {
        name: "Your name",
        email: "Email",
        mobile: "Mobile",
        message: "Message",
      },
      sendButtonLabel: "Send enquiry",
      sendingLabel: "Sending…",
      validationError: "Please check the highlighted fields.",
      requestError: "We could not send your message. Please try again.",
      networkError: "The service could not be reached. Please try again later.",
      successEyebrow: "Message received",
      successTitle: "Thank you for reaching out.",
      successMessage:
        "Your demo enquiry has been saved. The studio will follow up using the contact details you provided.",
      anotherMessageLabel: "Send another message",
    },
    instagramUrl: "https://www.instagram.com/",
    socialLinks: [
      { name: "Instagram · demo link", href: "https://www.instagram.com/" },
      { name: "Facebook · demo link", href: "https://www.facebook.com/" },
    ],
  },
  

hero: {
  slides: [
    {
      eyebrow: "The beauty of Tamil traditions",
      title: "Honest moments.\nBeautifully held.",
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=85",
      imageAlt: "Traditional Indian wedding celebration",
    },
    {
      eyebrow: "A celebration of togetherness",
      title: "Keep close\nto what matters.",
      image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=2000&q=85",
      imageAlt: "Family celebrating together",
    },
  ],
  bookingLinkLabel: "Begin with a conversation",
  galleryLinkLabel: "Explore the gallery",
},

  offer: {
    label: "A little something extra",
    message: "Complimentary keepsake print with every demo portrait session.",
  },
  priceCatalogueHref: "/api/price-catalogue",
} as const;

export const services: Service[] = [
  {
    id: "wedding",
    name: "Wedding Stories",
    category: "Wedding",
    description: "A thoughtful record of the people and moments around you.",
    inclusions: ["Pre-session consultation", "Edited digital gallery"],
    startingPrice: 1250,
  },
  {
    id: "pre-wedding",
    name: "Before the Day",
    category: "Pre-Wedding",
    description: "Relaxed portraits that tell the story before your celebration.",
    inclusions: ["Location planning", "Edited digital gallery"],
    startingPrice: 450,
  },
  {
    id: "baby",
    name: "Little Beginnings",
    category: "Baby",
    description: "Gentle, unhurried portraits of your growing family.",
    inclusions: ["Studio session", "Edited digital gallery"],
    startingPrice: 325,
  },
  {
    id: "passport",
    name: "Passport Portraits",
    category: "Passport-Size",
    description: "Simple, carefully lit portraits for everyday documents.",
    inclusions: ["Guided posing", "Digital selection"],
    startingPrice: 35,
  },
  {
    id: "events",
    name: "Gatherings",
    category: "Events",
    description: "The energy, details, and people that make an event yours.",
    inclusions: ["Event coverage", "Edited digital gallery"],
    startingPrice: 600,
  },
  {
    id: "video",
    name: "Moving Stories",
    category: "Video",
    description: "A considered short film, made to revisit and share.",
    inclusions: ["Creative planning", "Highlight film"],
    startingPrice: 750,
  },
  {
    id: "editing",
    name: "Photo Finishing",
    category: "Editing",
    description: "Careful image finishing for photographs you already love.",
    inclusions: ["Color and tone", "High-resolution delivery"],
    startingPrice: 25,
  },
];

export const galleryImages: GalleryImage[] = [
  {
    id: "wedding-light",
    title: "The long way home",
    category: "Wedding",
    image: demoImage("photo-1537633552985-df8429e8048b", 900),
    alt: "Newlyweds walking together in warm evening light",
  },
  {
    id: "birthday-table",
    title: "A table full of stories",
    category: "Birthday",
    image: demoImage("photo-1530103862676-de8c9debad1d", 900),
    alt: "Colorful birthday gathering with decorations",
  },
  {
    id: "baby-morning",
    title: "A slow Sunday",
    category: "Baby",
    image: demoImage("photo-1511895426328-dc8714191300", 900),
    alt: "Parents holding their young child outdoors",
  },
  {
    id: "outdoor-field",
    title: "Where the light lands",
    category: "Outdoor",
    image: demoImage("photo-1470252649378-9c29740c9fa8", 900),
    alt: "Golden light settling over a quiet landscape",
  },
  {
    id: "portrait-window",
    title: "A little more you",
    category: "Portrait",
    image: demoImage("photo-1534528741775-53994a69daeb", 900),
    alt: "A softly lit portrait against a neutral background",
  },
  {
    id: "wedding-flowers",
    title: "In the in-between",
    category: "Wedding",
    image: demoImage("photo-1511285560929-80b456fea0bc", 900),
    alt: "Wedding celebration surrounded by flowers",
  },
];

export const reviews: Review[] = [
  {
    id: "review-one",
    quote:
      "The photographs feel just like the day did: warm, easy, and completely ours.",
    author: "Avery & Jordan",
    context: "Demo wedding clients",
  },
  {
    id: "review-two",
    quote:
      "We forgot the camera was there. Looking through the gallery felt like reliving it.",
    author: "Morgan L.",
    context: "Demo family session",
  },
  {
    id: "review-three",
    quote:
      "A calm experience from the first conversation to the prints on our wall.",
    author: "Riley & Sam",
    context: "Demo portrait clients",
  },
];

export const framePricing = {
  sizes: [
    { id: "small", label: "Small · 8 × 10 in", amount: 48 },
    { id: "medium", label: "Medium · 12 × 16 in", amount: 78 },
    { id: "large", label: "Large · 16 × 20 in", amount: 118 },
  ] satisfies PriceOption[],
  materials: [
    { id: "oak", label: "Natural oak", amount: 0 },
    { id: "walnut", label: "Dark walnut", amount: 18 },
    { id: "black", label: "Matte black", amount: 12 },
  ] satisfies PriceOption[],
  customizations: [
    { id: "none", label: "No mat", amount: 0 },
    { id: "mat", label: "Archival mat", amount: 16 },
    { id: "engraving", label: "Name engraving", amount: 22 },
  ] satisfies PriceOption[],
};

export const albumPricing = {
  sizes: [
    { id: "classic", label: "Classic · 8 × 8 in", amount: 160 },
    { id: "wide", label: "Wide · 10 × 10 in", amount: 210 },
    { id: "grand", label: "Grand · 12 × 12 in", amount: 285 },
  ] satisfies PriceOption[],
  pages: [
    { id: "20", label: "20 pages", amount: 0 },
    { id: "30", label: "30 pages", amount: 35 },
    { id: "40", label: "40 pages", amount: 70 },
  ] satisfies PriceOption[],
  finishes: [
    { id: "linen", label: "Linen", amount: 0 },
    { id: "leather", label: "Italian leather", amount: 45 },
    { id: "photo", label: "Photo cover", amount: 25 },
  ] satisfies PriceOption[],
};

export const galleryCategories = [
  "All",
  "Wedding",
  "Birthday",
  "Baby",
  "Outdoor",
  "Portrait",
] as const;

