import { Link } from 'react-router-dom';
import { Upload, Camera, Leaf, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { CategorySection } from '@/components/CategorySection';
import { SpeciesDistributionChart } from '@/components/SpeciesDistributionChart';
import { getSpeciesByCategory } from '@/data/mockData';

export default function Home() {
    const plants = getSpeciesByCategory('plants');
    const mushrooms = getSpeciesByCategory('mushrooms');

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 nature-gradient opacity-10" />
                <div className="container mx-auto px-4 py-8 md:py-20 relative">
                    <div className="text-center max-w-2xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-medium mb-4 md:mb-6">
                            <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
                            AI-Powered Recognition
                        </div>
                        <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-foreground mb-3 md:mb-4 px-2">
                            {' '}
                            <span className="text-gradient">REPOT</span>
                        </h1>
                        <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 max-w-[300px] md:max-w-none mx-auto">
                            Instantly identify plants & mushrooms using our advanced AI.
                            Simply upload or capture a photo!
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
                            <Link
                                to="/upload"
                                className="group flex items-center justify-center gap-2 px-6 py-3 rounded-2xl nature-gradient text-primary-foreground font-semibold text-base md:text-lg transition-all hover:opacity-90 hover:scale-[1.02] card-shadow"
                            >
                                <Upload className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:-translate-y-0.5" />
                                Upload Image
                            </Link>
                            <Link
                                to="/upload?mode=camera"
                                className="group flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-card border-2 border-primary text-primary font-semibold text-base md:text-lg transition-all hover:bg-primary/5 hover:scale-[1.02] card-shadow"
                            >
                                <Camera className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:-translate-y-0.5" />
                                Capture Photo
                            </Link>
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -left-20 top-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl opacity-50 md:opacity-100" />
                    <div className="absolute -right-20 bottom-20 w-60 h-60 bg-accent/20 rounded-full blur-3xl opacity-50 md:opacity-100" />
                </div>
            </section>

            {/* Categories */}
            <div className="container mx-auto px-4 pb-8 md:pb-12">
                <CategorySection title="Plants" category="plants" species={plants} />
                <CategorySection title="Mushrooms" category="mushrooms" species={mushrooms} />

                {/* Statistics */}
                <div className="mt-8 md:mt-12 mb-4 md:mb-8">
                    <SpeciesDistributionChart />
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-card border-t border-border py-8">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Leaf className="w-5 h-5 text-primary" />
                        <span className="font-display font-semibold text-foreground">REPOT</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        © 2026 REPOT. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
