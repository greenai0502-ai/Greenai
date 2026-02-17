import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Map, Leaf, Flower2, CircleDot } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { getSpeciesById, Species } from '@/data/mockData';

const categoryIcons = {
  plants: Leaf,
  flowers: Flower2,
  mushrooms: CircleDot,
};

const categoryLabels = {
  plants: 'Plant',
  flowers: 'Flower',
  mushrooms: 'Mushroom',
};

export default function SpeciesDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const species = id ? getSpeciesById(id) : undefined;

  if (!species) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Species not found</p>
          <Button onClick={() => navigate('/home')} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const CategoryIcon = categoryIcons[species.category];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Hero Image */}
        <div className="relative rounded-2xl overflow-hidden mb-6 card-shadow animate-scale-in">
          <img
            src={species.image}
            alt={species.scientificName}
            className="w-full aspect-[16/10] object-cover"
          />
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-sm text-sm font-medium">
              <CategoryIcon className="w-4 h-4 text-primary" />
              {categoryLabels[species.category]}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2 italic">
            {species.scientificName}
          </h1>
          {/* Removed name field */}

          <div className="flex items-center gap-2 text-muted-foreground mb-6">
            <MapPin className="w-5 h-5" />
            <span>{species.location}</span>
          </div>

          <div className="bg-card rounded-2xl p-6 mb-6 card-shadow">
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">
              Description
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {species.description}
            </p>
          </div>

          <Button
            className="w-full h-14 rounded-xl nature-gradient text-primary-foreground font-semibold text-lg"
            onClick={() => {
              if (species.latitude && species.longitude) {
                window.open(`https://www.google.com/maps?q=${species.latitude},${species.longitude}`, '_blank');
              } else {
                window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(species.location + " MCC Tambaram")}`, '_blank');
              }
            }}
          >
            <Map className="w-5 h-5 mr-2" />
            View on Map (MCC Campus)
          </Button>
        </div>
      </div>
    </div>
  );
}
