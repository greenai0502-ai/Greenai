import { Link } from 'react-router-dom';
import { Leaf, Flower2, CircleDot, ChevronRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { getSpeciesByCategory } from '@/data/mockData';

const categories = [
  {
    id: 'plants',
    title: 'Plants',
    icon: Leaf,
    color: 'from-primary to-accent',
    description: 'Trees, shrubs, herbs and more',
  },
  {
    id: 'flowers',
    title: 'Flowers',
    icon: Flower2,
    color: 'from-nature-flower to-rose-400',
    description: 'Beautiful blooming species',
  },
  {
    id: 'mushrooms',
    title: 'Mushrooms',
    icon: CircleDot,
    color: 'from-nature-mushroom to-amber-500',
    description: 'Fungi and mushroom varieties',
  },
];

export default function Categories() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Categories
          </h1>
          <p className="text-muted-foreground">
            Browse species by category
          </p>
        </div>

        <div className="grid gap-4 max-w-lg mx-auto">
          {categories.map((cat, index) => {
            const count = getSpeciesByCategory(cat.id as any).length;
            const Icon = cat.icon;
            
            return (
              <Link
                key={cat.id}
                to={`/category/${cat.id}`}
                className="group flex items-center gap-4 p-4 bg-card rounded-2xl card-shadow hover:card-shadow-hover transition-all hover:-translate-y-0.5 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{cat.description}</p>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-sm font-medium">{count}</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
