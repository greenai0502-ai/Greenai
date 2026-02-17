export interface Species {
  id: string;
  scientificName: string;
  location: string;
  description: string;
  category: 'plants' | 'flowers' | 'mushrooms';
  image: string;
  latitude?: number;
  longitude?: number;
}

export const mockSpecies: Species[] = [
  // Plants (Updated from MCC Campus Survey)
  {
    id: 'p1',
    scientificName: 'Alstonia scholaris',
    location: 'Anderson Hall',
    description: 'A tropical evergreen tree with distinct whorled leaves and scented flowers. Known locally as Ezhilam Pala.',
    category: 'plants',
    image: '/images/plants/alstonia_scholaris.jpg',
    latitude: 12.9222,
    longitude: 80.1238,
  },
  {
    id: 'p2',
    scientificName: 'Murraya paniculata',
    location: 'MMIP',
    description: 'A small tropical evergreen shrub with white, fragrant flowers. Often used as an ornamental hedge.',
    category: 'plants',
    image: '/images/plants/murraya_paniculata.jpg',
    latitude: 12.9218,
    longitude: 80.1242,
  },
  {
    id: 'p3',
    scientificName: 'Pandanus baptistii',
    location: 'Canteen',
    description: 'Known for its spiral arrangement of leaves and prop roots. A decorative variety of Pandanus.',
    category: 'plants',
    image: '/images/plants/pandanus_baptistii.jpg',
    latitude: 12.9212,
    longitude: 80.1228,
  },
  {
    id: 'p4',
    scientificName: 'Phyllanthus acidus',
    location: 'QSC',
    description: 'Small tree bearing sour, edible yellow fruits. The fruits are used in pickles and jams.',
    category: 'plants',
    image: '/images/plants/phyllanthus_acidus.jpg',
    latitude: 12.9208,
    longitude: 80.1218,
  },
  {
    id: 'p5',
    scientificName: 'Polyalthia longifolia',
    location: 'Botany Tank',
    description: 'Tall, lofty evergreen tree native to India. Common in avenue planting due to its effective noise pollution control.',
    category: 'plants',
    image: '/images/plants/polyalthia_longifolia.jpg',
    latitude: 12.923,
    longitude: 80.125,
  },
  {
    id: 'p6',
    scientificName: 'Psychotria nervosa',
    location: 'QSC',
    description: 'Shrub native to Florida but found in tropical regions. Known for its "coffee bean" like red fruits which attract birds.',
    category: 'plants',
    image: '/images/plants/psychotria_nervosa.jpg',
    latitude: 12.9208,
    longitude: 80.1218,
  },
  {
    id: 'p7',
    scientificName: 'Zamia furfuracea',
    location: 'QSC',
    description: 'Cycad with thick, leathery leaves that resemble cardboard. Not a true palm but an ancient plant lineage.',
    category: 'plants',
    image: '/images/plants/zamia_furfuracea.jpg',
    latitude: 12.9208,
    longitude: 80.1218,
  },
  // Flowers
  {
    id: 'f1',
    scientificName: 'Rosa indica',
    location: 'College Garden',
    description: 'Classic flowering plant symbolizing love and beauty. Available in various colors and fragrances.',
    category: 'flowers',
    image: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=400&h=300&fit=crop',
    latitude: 12.922,
    longitude: 80.1235,
  },
  {
    id: 'f2',
    scientificName: 'Nelumbo nucifera',
    location: 'Campus Pond',
    description: 'Aquatic perennial plant considered sacred in many cultures. Known for its beautiful blooms rising from muddy waters.',
    category: 'flowers',
    image: 'https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?w=400&h=300&fit=crop',
    latitude: 12.92,
    longitude: 80.122,
  },
  {
    id: 'f3',
    scientificName: 'Tagetes erecta',
    location: 'Main Gate',
    description: 'Bright orange and yellow flowers used in festivals and ceremonies. Known for natural pest-repelling properties.',
    category: 'flowers',
    image: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=400&h=300&fit=crop',
    latitude: 12.925,
    longitude: 80.127,
  },
  {
    id: 'f4',
    scientificName: 'Hibiscus rosa-sinensis',
    location: 'Science Block',
    description: 'Tropical flowering plant with large, colorful blooms. Often used in hair care and traditional medicine.',
    category: 'flowers',
    image: 'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=400&h=300&fit=crop',
    latitude: 12.9225,
    longitude: 80.124,
  },
  // Mushrooms
  {
    id: 'm1',
    scientificName: 'Agaricus bisporus',
    location: 'MCC IOB Road',
    description: 'Most commonly cultivated edible mushroom worldwide. White to light brown cap with mild flavor.',
    category: 'mushrooms',
    image: 'https://images.unsplash.com/photo-1504545102780-26774c1bb073?w=400&h=300&fit=crop',
    latitude: 12.921,
    longitude: 80.1255,
  },
  {
    id: 'm2',
    scientificName: 'Pleurotus ostreatus',
    location: 'Forest Trail',
    description: 'Fan-shaped edible mushroom that grows on decaying wood. Popular in Asian cuisines.',
    category: 'mushrooms',
    image: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=400&h=300&fit=crop',
    latitude: 12.918,
    longitude: 80.118,
  },
  {
    id: 'm3',
    scientificName: 'Lentinula edodes',
    location: 'Biology Lab',
    description: 'East Asian mushroom prized for its rich, savory taste. Used in medicine and cooking for centuries.',
    category: 'mushrooms',
    image: 'https://images.unsplash.com/photo-1552825898-7f0d75d1d34e?w=400&h=300&fit=crop',
    latitude: 12.9228,
    longitude: 80.1248,
  },
  {
    id: 'm4',
    scientificName: 'Cantharellus cibarius',
    location: 'Western Woods',
    description: 'Golden-colored wild mushroom with fruity aroma. Highly valued in gourmet cooking.',
    category: 'mushrooms',
    image: 'https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400&h=300&fit=crop',
    latitude: 12.9185,
    longitude: 80.119,
  },
];

export const getSpeciesByCategory = (category: Species['category']) =>
  mockSpecies.filter(s => s.category === category);

export const getSpeciesById = (id: string) =>
  mockSpecies.find(s => s.id === id);
