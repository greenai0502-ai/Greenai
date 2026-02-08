export interface Species {
  id: string;
  name: string;
  scientificName: string;
  location: string;
  description: string;
  category: 'plants' | 'flowers' | 'mushrooms';
  image: string;
}

export const mockSpecies: Species[] = [
  // Plants
  {
    id: 'p1',
    name: 'Neem',
    scientificName: 'Azadirachta indica',
    location: 'Hostel Area',
    description: 'A fast-growing evergreen tree native to the Indian subcontinent. Known for its medicinal properties and ability to purify air.',
    category: 'plants',
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=400&h=300&fit=crop',
  },
  {
    id: 'p2',
    name: 'Tulsi',
    scientificName: 'Ocimum tenuiflorum',
    location: 'Temple Garden',
    description: 'Sacred basil plant with aromatic leaves. Widely used in Ayurvedic medicine and religious ceremonies.',
    category: 'plants',
    image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=300&fit=crop',
  },
  {
    id: 'p3',
    name: 'Fern',
    scientificName: 'Pteridophyta',
    location: 'Botany Lab',
    description: 'Ancient vascular plants that reproduce via spores. Thrives in moist, shaded environments.',
    category: 'plants',
    image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=300&fit=crop',
  },
  {
    id: 'p4',
    name: 'Monstera',
    scientificName: 'Monstera deliciosa',
    location: 'Library Entrance',
    description: 'Popular ornamental plant with distinctive split leaves. Native to tropical forests of Central America.',
    category: 'plants',
    image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=400&h=300&fit=crop',
  },
  // Flowers
  {
    id: 'f1',
    name: 'Rose',
    scientificName: 'Rosa indica',
    location: 'College Garden',
    description: 'Classic flowering plant symbolizing love and beauty. Available in various colors and fragrances.',
    category: 'flowers',
    image: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=400&h=300&fit=crop',
  },
  {
    id: 'f2',
    name: 'Lotus',
    scientificName: 'Nelumbo nucifera',
    location: 'Campus Pond',
    description: 'Aquatic perennial plant considered sacred in many cultures. Known for its beautiful blooms rising from muddy waters.',
    category: 'flowers',
    image: 'https://images.unsplash.com/photo-1474557157379-8aa74a6ef541?w=400&h=300&fit=crop',
  },
  {
    id: 'f3',
    name: 'Marigold',
    scientificName: 'Tagetes erecta',
    location: 'Main Gate',
    description: 'Bright orange and yellow flowers used in festivals and ceremonies. Known for natural pest-repelling properties.',
    category: 'flowers',
    image: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=400&h=300&fit=crop',
  },
  {
    id: 'f4',
    name: 'Hibiscus',
    scientificName: 'Hibiscus rosa-sinensis',
    location: 'Science Block',
    description: 'Tropical flowering plant with large, colorful blooms. Often used in hair care and traditional medicine.',
    category: 'flowers',
    image: 'https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=400&h=300&fit=crop',
  },
  // Mushrooms
  {
    id: 'm1',
    name: 'Button Mushroom',
    scientificName: 'Agaricus bisporus',
    location: 'MCC IOB Road',
    description: 'Most commonly cultivated edible mushroom worldwide. White to light brown cap with mild flavor.',
    category: 'mushrooms',
    image: 'https://images.unsplash.com/photo-1504545102780-26774c1bb073?w=400&h=300&fit=crop',
  },
  {
    id: 'm2',
    name: 'Oyster Mushroom',
    scientificName: 'Pleurotus ostreatus',
    location: 'Forest Trail',
    description: 'Fan-shaped edible mushroom that grows on decaying wood. Popular in Asian cuisines.',
    category: 'mushrooms',
    image: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=400&h=300&fit=crop',
  },
  {
    id: 'm3',
    name: 'Shiitake',
    scientificName: 'Lentinula edodes',
    location: 'Biology Lab',
    description: 'East Asian mushroom prized for its rich, savory taste. Used in medicine and cooking for centuries.',
    category: 'mushrooms',
    image: 'https://images.unsplash.com/photo-1552825898-7f0d75d1d34e?w=400&h=300&fit=crop',
  },
  {
    id: 'm4',
    name: 'Chanterelle',
    scientificName: 'Cantharellus cibarius',
    location: 'Western Woods',
    description: 'Golden-colored wild mushroom with fruity aroma. Highly valued in gourmet cooking.',
    category: 'mushrooms',
    image: 'https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=400&h=300&fit=crop',
  },
];

export const getSpeciesByCategory = (category: Species['category']) => 
  mockSpecies.filter(s => s.category === category);

export const getSpeciesById = (id: string) => 
  mockSpecies.find(s => s.id === id);
