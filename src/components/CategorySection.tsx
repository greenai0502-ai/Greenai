import { Link } from 'react-router-dom';
import { ChevronRight, Leaf, Flower2, CircleDot } from 'lucide-react';
import { SpeciesCard } from './SpeciesCard';
import type { Species } from '@/data/mockData';

interface CategorySectionProps {
  title: string;
  category: Species['category'];
  species: Species[];
}

const categoryIcons = {
  plants: Leaf,
  flowers: Flower2,
  mushrooms: CircleDot,
};

const categoryColors = {
  plants: 'text-primary',
  flowers: 'text-nature-flower',
  mushrooms: 'text-nature-mushroom',
};

export function CategorySection({ title, category, species }: CategorySectionProps) {
  const Icon = categoryIcons[category];
  
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-secondary ${categoryColors[category]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-foreground">{title}</h2>
        </div>
        <Link
          to={`/category/${category}`}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-accent transition-colors"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {species.slice(0, 4).map((item, index) => (
          <div 
            key={item.id} 
            className="animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <SpeciesCard species={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
