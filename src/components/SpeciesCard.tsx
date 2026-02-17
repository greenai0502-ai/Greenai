import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import type { Species } from '@/data/mockData';

interface SpeciesCardProps {
  species: Species;
}

export function SpeciesCard({ species }: SpeciesCardProps) {
  return (
    <Link
      to={`/species/${species.id}`}
      className="group block bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={species.image}
          alt={species.scientificName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors italic">
          {species.scientificName}
        </h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="w-3.5 h-3.5" />
          <span>{species.location}</span>
        </div>
      </div>
    </Link>
  );
}
