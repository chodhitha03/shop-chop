import { Coffee } from 'lucide-react';
import RecipeCategoryPage from '@/components/RecipeCategoryPage';

const Breakfast = () => (
  <RecipeCategoryPage
    title="Breakfast recipes"
    description="Start the day with energizing recipes designed for busy mornings and slow weekends."
    category="breakfast"
    icon={Coffee}
    accentClass="bg-amber-100/80 text-amber-900"
    eyebrow="Morning lineup"
  />
);

export default Breakfast;