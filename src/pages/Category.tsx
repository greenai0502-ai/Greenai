import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Leaf, Flower2, CircleDot } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { SpeciesCard } from '@/components/SpeciesCard';
import { getSpeciesByCategory, Species } from '@/data/mockData';

const categoryMeta: Record<Species['category'], { title: string; icon: typeof Leaf; description: string }> = {
  plants: {
    title: 'Plants',
    icon: Leaf,
    description: 'Explore various plant species identified on campus',
  },
  flowers: {
    title: 'Flowers',
    icon: Flower2,
    description: 'Discover beautiful flowering plants in our collection',
  },
  mushrooms: {
    title: 'Mushrooms',
    icon: CircleDot,
    description: 'Learn about different mushroom species found nearby',
  },
};

export default function Category() {
  const { category } = useParams<{ category: Species['category'] }>();
  
  if (!category || !categoryMeta[category]) {
    return <div>Category not found</div>;
  }

  const species = getSpeciesByCategory(category);
  const { title, icon: Icon, description } = categoryMeta[category];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/home"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl nature-gradient flex items-center justify-center">
              <Icon className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">{title}</h1>
              <p className="text-muted-foreground">{description}</p>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {species.map((item, index) => (
            <div 
              key={item.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <SpeciesCard species={item} />
            </div>
          ))}
        </div>

        {species.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No species found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
