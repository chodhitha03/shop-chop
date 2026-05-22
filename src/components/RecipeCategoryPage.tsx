import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { type LucideIcon, Clock, Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getRecipesByCategory, type Recipe } from '@/data/recipes';
import {
  PageTransition, FadeUp, StaggerChildren, StaggerItem,
  HoverLift, motion
} from '@/components/motion';
import { api } from '@/lib/api';

type RecipeCategory = 'breakfast' | 'lunch' | 'dinner' | 'desserts';

interface RecipeCategoryPageProps {
  title: string;
  description: string;
  category: RecipeCategory;
  icon: LucideIcon;
  accentClass: string;
  eyebrow: string;
}

const RecipeCategoryPage = ({
  title,
  description,
  category,
  icon: Icon,
  accentClass,
  eyebrow,
}: RecipeCategoryPageProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>(getRecipesByCategory(category));

  useEffect(() => {
    fetchRecipes();
  }, [category]);

  const fetchRecipes = async () => {
    try {
      const res = await fetch(api(`/api/recipes?category=${category}`));
      if (res.ok) {
        const data = await res.json();
        setRecipes(data);
      }
    } catch (error) {
      console.error('Fetch recipes error:', error);
    }
  };

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="min-h-screen pb-24">
        <section className="section-tight">
          <div className="container">
            <FadeUp>
              <div className="surface-panel bg-background/80 p-8 md:p-10">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      <Icon className="h-4 w-4 text-foreground" />
                      {eyebrow}
                    </div>
                    <h1 className="text-3xl font-display md:text-5xl">{title}</h1>
                    <p className="max-w-2xl text-lg text-muted-foreground">{description}</p>
                  </div>
                  <div className="w-full max-w-md">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder={`Search ${category} recipes...`}
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className="pl-11"
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="border-border/60">
                        {filteredRecipes.length} recipes
                      </Badge>
                      <span>Use keywords to narrow results</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeUp>

            <StaggerChildren className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredRecipes.map((recipe) => {
                const recipeKey = (recipe as Recipe & { slug?: string }).slug || recipe.id;
                return (
                <StaggerItem key={recipeKey}>
                  <HoverLift>
                    <Card className="group overflow-hidden bg-panel">
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={recipe.image}
                          alt={recipe.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${accentClass}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{recipe.name}</CardTitle>
                            <CardDescription className="line-clamp-2">
                              {recipe.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-0">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {recipe.cookingTime} min
                          </span>
                          <span className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {recipe.servings} servings
                          </span>
                        </div>
                        <Button variant="outline" size="sm" asChild className="w-full">
                          <Link to={`/recipe/${recipeKey}`}>View recipe</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </HoverLift>
                </StaggerItem>
                );
              })}
            </StaggerChildren>

            {filteredRecipes.length === 0 && (
              <motion.div
                className="mt-12 text-center text-muted-foreground"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-5xl mb-3">🔍</div>
                <p className="font-medium text-foreground">No recipes found</p>
                <p className="text-sm mt-1">Try a different keyword to find what you're looking for.</p>
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default RecipeCategoryPage;
