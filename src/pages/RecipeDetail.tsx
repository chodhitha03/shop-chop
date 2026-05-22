import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Clock, Users, ShoppingCart, Plus, Star,
  Heart, Share2, Printer, Bookmark, ChefHat, Timer,
  CheckCircle2, Circle, Minus, Play, Pause, RotateCcw,
  Store, Sparkles, Flame, Zap, Leaf, TrendingUp, Check
} from 'lucide-react';
import { getRecipeById, recipes } from '@/data/recipes';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { PageTransition, motion, FadeUp } from '@/components/motion';

/* ─── helpers ─────────────────────────────────────── */
const DIFF_MAP: Record<string, { label: string; color: string }> = {
  breakfast: { label: 'Easy', color: 'text-emerald-400' },
  lunch:     { label: 'Medium', color: 'text-amber-400' },
  dinner:    { label: 'Medium', color: 'text-amber-400' },
  desserts:  { label: 'Hard', color: 'text-rose-400' },
};

const NUTRITION: Record<string, { cal: number; protein: number; carbs: number; fat: number }> = {
  'fluffy-pancakes':      { cal: 380, protein: 9,  carbs: 58, fat: 12 },
  'avocado-toast':        { cal: 290, protein: 12, carbs: 28, fat: 16 },
  'chicken-caesar-salad': { cal: 420, protein: 38, carbs: 18, fat: 22 },
  'spaghetti-bolognese':  { cal: 610, protein: 34, carbs: 72, fat: 18 },
  'chocolate-brownies':   { cal: 320, protein: 5,  carbs: 42, fat: 16 },
};

function fmtTime(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

/* ─── skeleton ─────────────────────────────────────── */
const Shimmer = () => (
  <div className="min-h-screen animate-pulse">
    <div className="h-[55vh] bg-gradient-to-b from-zinc-800 to-zinc-900" />
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
      <div className="h-8 w-2/3 rounded-xl bg-zinc-800" />
      <div className="h-4 w-1/2 rounded-xl bg-zinc-800" />
      <div className="grid md:grid-cols-3 gap-6">
        {[1,2,3].map(i => <div key={i} className="h-36 rounded-2xl bg-zinc-800" />)}
      </div>
    </div>
  </div>
);

/* ─── main component ───────────────────────────────── */
const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();

  const [loading, setLoading]         = useState(true);
  const [liked, setLiked]             = useState(false);
  const [saved, setSaved]             = useState(false);
  const [rating, setRating]           = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [servings, setServings]       = useState(0);
  const [completedSteps, setCompleted]= useState<Set<number>>(new Set());
  const [cookMode, setCookMode]       = useState(false);
  const [activeStep, setActiveStep]   = useState(0);
  const [timerSec, setTimerSec]       = useState(0);
  const [timerRunning, setTimerRun]   = useState(false);
  const [addedAll, setAddedAll]       = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const recipe = id ? getRecipeById(id) : null;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (recipe) setServings(recipe.servings);
  }, [recipe]);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimerSec(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  if (loading) return <Shimmer />;

  if (!recipe) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="text-8xl">🍽️</div>
      <h1 className="text-3xl font-bold text-foreground">Recipe Not Found</h1>
      <p className="text-muted-foreground max-w-sm">This recipe seems to have wandered off the menu. Let's get you back on track.</p>
      <Link to="/">
        <Button size="lg" className="rounded-full px-8">← Back to Home</Button>
      </Link>
    </div>
  );

  const diff       = DIFF_MAP[recipe.category] ?? { label: 'Medium', color: 'text-amber-400' };
  const nutrition  = NUTRITION[recipe.id];
  const ratio      = servings / recipe.servings;
  const totalCost  = recipe.ingredients.reduce((s, i) => s + i.price, 0);
  const related    = recipes.filter(r => r.category === recipe.category && r.id !== recipe.id).slice(0, 3);

  const toggleStep = (i: number) => {
    setCompleted(prev => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  };

  const addIngredient = (ing: typeof recipe.ingredients[0]) => {
    addItem({ id: `${recipe.id}-${ing.name}`, name: ing.name, price: ing.price, type: 'recipe', recipeId: recipe.id });
    toast.success(`${ing.name} added to cart`);
  };

  const addAll = () => {
    recipe.ingredients.forEach(ing =>
      addItem({ id: `${recipe.id}-${ing.name}`, name: ing.name, price: ing.price, type: 'recipe', recipeId: recipe.id })
    );
    setAddedAll(true);
    toast.success(`All ${recipe.ingredients.length} ingredients added!`);
    setTimeout(() => setAddedAll(false), 2500);
  };

  const share = async () => {
    try {
      await navigator.share({ title: recipe.name, url: window.location.href });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const progressPct = recipe.instructions.length
    ? Math.round((completedSteps.size / recipe.instructions.length) * 100)
    : 0;

  return (
    <PageTransition>
    <div className="min-h-screen bg-background">
      {/* ── HERO ─────────────────────────────────────── */}
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <motion.img
          src={recipe.image}
          alt={recipe.name}
          className="absolute inset-0 h-full w-full object-cover scale-105"
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1.05, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

        {/* Back btn */}
        <div className="absolute top-4 left-4 z-10">
          <Link to={`/${recipe.category}`}>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
              {recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1)}
            </Button>
          </Link>
        </div>

        {/* Floating action bar */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          {[
            { icon: <Heart className={`h-4 w-4 ${liked ? 'fill-rose-400 text-rose-400' : ''}`} />, action: () => { setLiked(l => !l); toast.success(liked ? 'Removed from likes' : 'Added to likes!'); }, title: 'Like' },
            { icon: <Bookmark className={`h-4 w-4 ${saved ? 'fill-amber-400 text-amber-400' : ''}`} />, action: () => { setSaved(s => !s); toast.success(saved ? 'Unsaved' : 'Recipe saved!'); }, title: 'Save' },
            { icon: <Share2 className="h-4 w-4" />, action: share, title: 'Share' },
            { icon: <Printer className="h-4 w-4" />, action: () => window.print(), title: 'Print' },
          ].map(({ icon, action, title }) => (
            <button
              key={title}
              onClick={action}
              title={title}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/25"
            >
              {icon}
            </button>
          ))}
        </div>

        {/* Hero text */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className="rounded-full bg-primary/80 text-primary-foreground capitalize backdrop-blur-sm">
                {recipe.category}
              </Badge>
              <Badge className={`rounded-full bg-black/40 backdrop-blur-sm border-0 ${diff.color}`}>
                {diff.label}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-white md:text-5xl leading-tight drop-shadow-lg">
              {recipe.name}
            </h1>
            <p className="mt-2 text-white/75 max-w-xl text-base md:text-lg">{recipe.description}</p>

            {/* Quick stats */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/80">
              {[
                { icon: <Clock className="h-4 w-4" />, val: `${recipe.cookingTime} min` },
                { icon: <Users className="h-4 w-4" />, val: `${recipe.servings} servings` },
                { icon: <Flame className="h-4 w-4" />, val: nutrition ? `${nutrition.cal} kcal` : 'N/A' },
                { icon: <ChefHat className="h-4 w-4" />, val: diff.label },
              ].map(({ icon, val }) => (
                <div key={val} className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
                  {icon}<span>{val}</span>
                </div>
              ))}
            </div>

            {/* Rating */}
            <div className="mt-3 flex items-center gap-1">
              {[1,2,3,4,5].map(s => (
                <button
                  key={s}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => { setRating(s); toast.success(`Rated ${s} stars!`); }}
                  className="transition-transform hover:scale-125"
                >
                  <Star className={`h-5 w-5 ${s <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'text-white/40'}`} />
                </button>
              ))}
              <span className="ml-2 text-xs text-white/60">{rating ? `You rated ${rating}/5` : 'Rate this recipe'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">

          {/* LEFT COLUMN */}
          <div className="space-y-8">

            {/* Cook Mode Banner */}
            {cookMode && (
              <div className="rounded-2xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30 p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">🍳 Cooking Mode Active</p>
                  <p className="text-sm text-muted-foreground">Step {activeStep + 1} of {recipe.instructions.length} — {progressPct}% complete</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => { setCookMode(false); setActiveStep(0); }}>
                  Exit
                </Button>
              </div>
            )}

            {/* Progress Bar */}
            {completedSteps.size > 0 && (
              <div className="rounded-2xl border bg-card p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Cooking Progress</span>
                  <span className="text-primary font-semibold">{progressPct}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {completedSteps.size} of {recipe.instructions.length} steps done
                </p>
              </div>
            )}

            {/* Timer Widget */}
            <div className="rounded-2xl border bg-card p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Timer className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Cooking Timer</p>
                  <p className="text-2xl font-mono font-bold text-primary tracking-wider">{fmtTime(timerSec)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" className="rounded-xl" onClick={() => setTimerRun(r => !r)}>
                  {timerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button size="icon" variant="ghost" className="rounded-xl" onClick={() => { setTimerSec(0); setTimerRun(false); }}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Instructions */}
            <div className="rounded-2xl border bg-card overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b">
                <div>
                  <h2 className="text-lg font-bold">Step-by-Step Instructions</h2>
                  <p className="text-sm text-muted-foreground">Click each step to mark as done</p>
                </div>
                <Button
                  size="sm"
                  variant={cookMode ? 'default' : 'outline'}
                  className="rounded-full gap-1.5"
                  onClick={() => setCookMode(c => !c)}
                >
                  <ChefHat className="h-4 w-4" />
                  {cookMode ? 'Exit Mode' : 'Cook Mode'}
                </Button>
              </div>

              <ol className="divide-y">
                {recipe.instructions.map((step, i) => {
                  const done = completedSteps.has(i);
                  const active = cookMode && i === activeStep;
                  return (
                    <li
                      key={i}
                      onClick={() => {
                        toggleStep(i);
                        if (cookMode && i === activeStep && i < recipe.instructions.length - 1) setActiveStep(i + 1);
                      }}
                      className={`flex gap-4 p-5 cursor-pointer transition-colors select-none
                        ${done ? 'bg-emerald-500/5' : active ? 'bg-primary/5' : 'hover:bg-muted/40'}`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {done
                          ? <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                          : active
                            ? <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold animate-pulse">{i + 1}</div>
                            : <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center text-muted-foreground text-xs font-bold">{i + 1}</div>
                        }
                      </div>
                      <p className={`text-base leading-relaxed ${done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {step}
                      </p>
                    </li>
                  );
                })}
              </ol>

              {cookMode && (
                <div className="p-4 border-t flex gap-2 justify-end">
                  <Button variant="outline" size="sm" className="rounded-full" disabled={activeStep === 0} onClick={() => setActiveStep(s => s - 1)}>← Prev</Button>
                  <Button size="sm" className="rounded-full" disabled={activeStep >= recipe.instructions.length - 1} onClick={() => setActiveStep(s => s + 1)}>Next →</Button>
                </div>
              )}
            </div>

            {/* Nutrition */}
            {nutrition && (
              <div className="rounded-2xl border bg-card p-5">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-emerald-500" /> Nutrition per Serving
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: 'Calories', val: `${Math.round(nutrition.cal * ratio)}`, unit: 'kcal', color: 'from-rose-500/20 to-rose-500/5', icon: <Flame className="h-4 w-4 text-rose-400" /> },
                    { label: 'Protein',  val: `${Math.round(nutrition.protein * ratio)}`, unit: 'g', color: 'from-blue-500/20 to-blue-500/5', icon: <Zap className="h-4 w-4 text-blue-400" /> },
                    { label: 'Carbs',    val: `${Math.round(nutrition.carbs * ratio)}`, unit: 'g', color: 'from-amber-500/20 to-amber-500/5', icon: <TrendingUp className="h-4 w-4 text-amber-400" /> },
                    { label: 'Fat',      val: `${Math.round(nutrition.fat * ratio)}`, unit: 'g', color: 'from-purple-500/20 to-purple-500/5', icon: <Sparkles className="h-4 w-4 text-purple-400" /> },
                  ].map(n => (
                    <div key={n.label} className={`rounded-xl bg-gradient-to-b ${n.color} border border-border/50 p-3 text-center`}>
                      <div className="flex justify-center mb-1">{n.icon}</div>
                      <p className="text-xl font-bold">{n.val}<span className="text-xs font-normal text-muted-foreground ml-0.5">{n.unit}</span></p>
                      <p className="text-xs text-muted-foreground">{n.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chef Notes */}
            <div className="rounded-2xl border bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-5">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" /> Chef's Notes
              </h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  'Prep all ingredients before heating any pans for a smoother cooking flow.',
                  'Taste as you go and adjust seasoning near the end of cooking.',
                  'Let the dish rest for a minute before serving to lock in flavour and texture.',
                ].map((note, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-amber-400 mt-0.5">✦</span>{note}
                  </li>
                ))}
              </ul>
            </div>

            {/* Related Recipes */}
            {related.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-4">More {recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1)} Recipes</h2>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {related.map(r => (
                    <Link key={r.id} to={`/recipe/${r.id}`} className="group rounded-2xl border bg-card overflow-hidden transition hover:shadow-lg hover:-translate-y-1">
                      <div className="h-36 overflow-hidden">
                        <img src={r.image} alt={r.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-sm line-clamp-1">{r.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Clock className="h-3 w-3" />{r.cookingTime} min
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN (sticky) */}
          <div className="space-y-5">
            <div className="lg:sticky lg:top-24 space-y-5">

              {/* Serving Adjuster */}
              <div className="rounded-2xl border bg-card p-4 flex items-center justify-between">
                <span className="text-sm font-medium">Servings</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setServings(s => Math.max(1, s - 1))}
                    className="h-8 w-8 rounded-full border flex items-center justify-center hover:bg-muted transition"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center font-bold text-lg">{servings}</span>
                  <button
                    onClick={() => setServings(s => s + 1)}
                    className="h-8 w-8 rounded-full border flex items-center justify-center hover:bg-muted transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Ingredients Card */}
              <div className="rounded-2xl border bg-card overflow-hidden">
                <div className="p-4 border-b flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-base">Ingredients</h2>
                    <p className="text-xs text-muted-foreground">{recipe.ingredients.length} items needed</p>
                  </div>
                  <span className="text-sm font-bold text-primary">₹{Math.round(totalCost * ratio)}</span>
                </div>

                <ul className="divide-y">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-center justify-between p-3 hover:bg-muted/30 transition group">
                      <div>
                        <p className="text-sm font-medium">{ing.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {ratio !== 1
                            ? `~${(parseFloat(ing.quantity) * ratio).toFixed(1).replace(/\.0$/, '')} ${ing.quantity.replace(/[\d.]+\s*/, '')}`
                            : ing.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">₹{Math.round(ing.price * ratio)}</span>
                        <button
                          onClick={() => addIngredient(ing)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition hover:bg-primary hover:text-primary-foreground"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="p-4">
                  <Button
                    className="w-full rounded-xl gap-2 h-11 text-sm font-semibold transition-all"
                    onClick={addAll}
                    disabled={addedAll}
                  >
                    {addedAll
                      ? <><Check className="h-4 w-4" /> All Added!</>
                      : <><ShoppingCart className="h-4 w-4" /> Add All Ingredients</>}
                  </Button>
                </div>
              </div>

              {/* Supermarket CTA */}
              <div className="rounded-2xl border bg-card p-4 text-center space-y-3">
                <div className="flex justify-center">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Store className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-sm">Need pantry staples?</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Browse our supermarket for kitchen essentials.</p>
                </div>
                <Link to="/supermarket">
                  <Button variant="outline" className="w-full rounded-xl text-sm">Browse Supermarket</Button>
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default RecipeDetail;