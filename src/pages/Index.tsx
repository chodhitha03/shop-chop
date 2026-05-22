import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Coffee, Sun, Moon, Cookie, Store, ChefHat,
  ShoppingBag, Clock, Users, ArrowRight, Sparkles
} from 'lucide-react';
import { recipes, type Recipe } from '@/data/recipes';
import heroImage from '@/assets/modern-hero-image.jpg';
import {
  PageTransition, FadeUp, StaggerChildren, StaggerItem,
  HoverLift, motion
} from '@/components/motion';
import { api } from '@/lib/api';

const Index = () => {
  const [recipeList, setRecipeList] = useState<Recipe[]>(recipes);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const res = await fetch(api('/api/recipes'));
      if (res.ok) {
        const data = await res.json();
        setRecipeList(data);
      }
    } catch (error) {
      console.error('Fetch recipes error:', error);
    }
  };

  const featuredRecipes = recipeList.slice(0, 4);
  const heroRecipe = recipeList[0] || recipes[0];

  const categories = [
    { name: 'Breakfast', path: '/breakfast', icon: Coffee, tone: 'bg-amber-100/80 text-amber-900', description: 'Bright starts for the week' },
    { name: 'Lunch', path: '/lunch', icon: Sun, tone: 'bg-orange-100/80 text-orange-900', description: 'Balanced plates for midday' },
    { name: 'Dinner', path: '/dinner', icon: Moon, tone: 'bg-slate-200/80 text-slate-900', description: 'Comforting evening meals' },
    { name: 'Desserts', path: '/desserts', icon: Cookie, tone: 'bg-rose-100/80 text-rose-900', description: 'Decadent finishing touches' },
  ];

  const stats = [
    { value: '200+', label: 'curated recipes' },
    { value: '30 min', label: 'average cook time' },
    { value: '₹', label: 'local pricing built-in' }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen pb-24">
        {/* Hero */}
        <section className="section relative overflow-hidden">
          <div className="container relative z-10">
            <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
              <motion.div
                className="space-y-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <div className="pill w-fit bg-background/70">
                  <Sparkles className="h-4 w-4 text-ember" />
                  <span>Plan a week of meals in minutes</span>
                </div>
                <h1 className="text-balance text-4xl font-display md:text-6xl lg:text-7xl">
                  Cook with intent. Shop with confidence. Eat beautifully.
                </h1>
                <p className="text-lg text-muted-foreground md:text-xl max-w-xl">
                  Shop & Chop brings curated recipes, intelligent planning, and grocery delivery into one
                  focused workflow built for modern kitchens.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button size="lg" asChild>
                      <Link to="/breakfast" className="flex items-center gap-2">
                        Explore recipes
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button variant="outline" size="lg" asChild>
                      <Link to="/supermarket" className="flex items-center gap-2">
                        Build grocery list
                        <ShoppingBag className="h-4 w-4" />
                      </Link>
                    </Button>
                  </motion.div>
                </div>

                <StaggerChildren className="grid gap-4 sm:grid-cols-3">
                  {stats.map((stat) => (
                    <StaggerItem key={stat.label}>
                      <div className="surface-panel bg-background/80 p-4">
                        <p className="text-2xl font-display text-foreground">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerChildren>
              </motion.div>

              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <div className="absolute -top-10 -left-12 h-28 w-28 rounded-full bg-primary/20 blur-3xl animate-float-slow" />
                <div className="absolute -bottom-12 -right-10 h-32 w-32 rounded-full bg-secondary/20 blur-3xl animate-float-slow" />
                <div className="surface-panel bg-panel p-6">
                  <div className="overflow-hidden rounded-2xl">
                    <img
                      src={heroImage}
                      alt="Seasonal ingredients and recipes"
                      className="h-56 w-full object-cover sm:h-64 transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Featured</p>
                        <h3 className="text-2xl font-display">{heroRecipe.name}</h3>
                        <p className="text-sm text-muted-foreground">{heroRecipe.description}</p>
                      </div>
                      <Button variant="subtle" size="sm" asChild>
                        <Link to={`/recipe/${(heroRecipe as Recipe & { slug?: string }).slug || heroRecipe.id}`}>View</Link>
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-border/60 bg-background/80 p-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {heroRecipe.cookingTime} min
                        </div>
                        <p className="text-sm font-medium text-foreground">Fast weekday prep</p>
                      </div>
                      <div className="rounded-2xl border border-border/60 bg-background/80 p-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          {heroRecipe.servings} servings
                        </div>
                        <p className="text-sm font-medium text-foreground">Scaled for sharing</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="section-tight">
          <div className="container">
            <FadeUp>
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Collections</p>
                  <h2 className="text-3xl font-display md:text-4xl">Browse by mood and moment</h2>
                </div>
                <Button variant="ghost" asChild>
                  <Link to="/breakfast">View all recipes</Link>
                </Button>
              </div>
            </FadeUp>
            <StaggerChildren className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => (
                <StaggerItem key={category.name}>
                  <Link to={category.path} className="group block">
                    <HoverLift>
                      <div className="surface-panel bg-background/80 p-6">
                        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${category.tone}`}>
                          <category.icon className="h-5 w-5" />
                        </div>
                        <div className="mt-6 space-y-2">
                          <h3 className="text-xl font-display">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        </div>
                      </div>
                    </HoverLift>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* How it works */}
        <section className="section bg-muted-gradient">
          <div className="container">
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
              <FadeUp>
                <div className="space-y-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">The Flow</p>
                  <h2 className="text-3xl font-display md:text-4xl">From inspiration to ingredients in three steps</h2>
                  <p className="text-lg text-muted-foreground">
                    Stop juggling tabs. We connect recipes, shopping lists, and delivery so every cook can
                    move from idea to plate with clarity.
                  </p>
                </div>
              </FadeUp>
              <StaggerChildren className="space-y-4" slow>
                {[
                  { title: 'Curate your plan', description: 'Save recipes, adjust servings, and build a week of meals in minutes.' },
                  { title: 'Auto-build your cart', description: 'Ingredients convert instantly into a smart grocery list with local pricing.' },
                  { title: 'Cook with confidence', description: 'Follow polished instructions with timing cues and chef tips.' }
                ].map((step, index) => (
                  <StaggerItem key={step.title}>
                    <div className="surface-panel bg-background/80 p-5">
                      <div className="flex items-start gap-4">
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-foreground font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-lg font-display">{step.title}</h3>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerChildren>
            </div>
          </div>
        </section>

        {/* Featured recipes */}
        <section className="section">
          <div className="container">
            <FadeUp>
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Featured</p>
                  <h2 className="text-3xl font-display md:text-4xl">Trending recipes right now</h2>
                </div>
                <Button variant="outline" asChild>
                  <Link to="/breakfast">Browse full library</Link>
                </Button>
              </div>
            </FadeUp>
            <StaggerChildren className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {featuredRecipes.map((recipe) => {
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
                        <CardTitle className="text-lg">{recipe.name}</CardTitle>
                        <CardDescription className="line-clamp-2">{recipe.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-0">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-2"><Clock className="h-4 w-4" />{recipe.cookingTime} min</span>
                          <span className="flex items-center gap-2"><Users className="h-4 w-4" />{recipe.servings} servings</span>
                        </div>
                        <Button size="sm" variant="outline" asChild className="w-full">
                          <Link to={`/recipe/${recipeKey}`}>View recipe</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </HoverLift>
                </StaggerItem>
                );
              })}
            </StaggerChildren>
          </div>
        </section>

        {/* CTA */}
        <section className="section-tight">
          <div className="container">
            <FadeUp>
              <Card className="overflow-hidden bg-cta-gradient text-foreground">
                <CardContent className="grid gap-8 p-10 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-4">
                    <Badge variant="secondary" className="w-fit bg-background/70 text-foreground">
                      Supermarket
                    </Badge>
                    <h2 className="text-3xl font-display md:text-4xl">Stock your pantry with intention</h2>
                    <p className="text-lg text-foreground/80">
                      Fresh produce, pantry staples, and spice blends delivered with pricing in ₹ so you
                      know exactly what to expect.
                    </p>
                  </div>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button variant="contrast" size="lg" asChild>
                        <Link to="/supermarket" className="flex items-center gap-2">
                          Visit supermarket
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        variant="outline" size="lg" asChild
                        className="border-foreground/20 bg-background/70 text-foreground hover:bg-background"
                      >
                        <Link to="/cart" className="flex items-center gap-2">
                          Review cart
                          <ShoppingBag className="h-4 w-4" />
                        </Link>
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </FadeUp>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default Index;