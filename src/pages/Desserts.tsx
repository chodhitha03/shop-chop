import { Cookie } from 'lucide-react';
import RecipeCategoryPage from '@/components/RecipeCategoryPage';

const Desserts = () => (
  <RecipeCategoryPage
    title="Dessert recipes"
    description="End on a high note with indulgent desserts, elegant bakes, and sweet bites."
    category="desserts"
    icon={Cookie}
    accentClass="bg-rose-100/80 text-rose-900"
    eyebrow="Sweet finales"
  />
);

export default Desserts;