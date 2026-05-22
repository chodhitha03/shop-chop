import { Moon } from 'lucide-react';
import RecipeCategoryPage from '@/components/RecipeCategoryPage';

const Dinner = () => (
  <RecipeCategoryPage
    title="Dinner recipes"
    description="Wind down with hearty, cozy dinners designed for shared tables and slower nights."
    category="dinner"
    icon={Moon}
    accentClass="bg-slate-200/80 text-slate-900"
    eyebrow="Evening comfort"
  />
);

export default Dinner;