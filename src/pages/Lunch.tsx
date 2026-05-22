import { Sun } from 'lucide-react';
import RecipeCategoryPage from '@/components/RecipeCategoryPage';

const Lunch = () => (
  <RecipeCategoryPage
    title="Lunch recipes"
    description="Fuel your afternoon with balanced bowls, salads, and warm plates that keep you focused."
    category="lunch"
    icon={Sun}
    accentClass="bg-orange-100/80 text-orange-900"
    eyebrow="Midday energizers"
  />
);

export default Lunch;