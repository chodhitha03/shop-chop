import { Link, useLocation } from 'react-router-dom';
import { Home, UtensilsCrossed, Store, ShoppingCart, User, LogIn } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from '@/components/motion';

const MobileBottomNav = () => {
  const location = useLocation();
  const { state } = useCart();
  const { user } = useAuth();
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);

  const tabs = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/breakfast', label: 'Recipes', icon: UtensilsCrossed },
    { path: '/supermarket', label: 'Shop', icon: Store },
    { path: '/cart', label: 'Cart', icon: ShoppingCart, badge: totalItems },
    { path: user ? '/account' : '/sign-in', label: user ? 'Account' : 'Login', icon: user ? User : LogIn },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/breakfast') return ['/breakfast', '/lunch', '/dinner', '/desserts'].includes(location.pathname);
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/80 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around px-2 h-16">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className="relative flex flex-col items-center justify-center gap-0.5 w-16 h-full"
              aria-current={active ? 'page' : undefined}
            >
              {active && (
                <motion.div
                  layoutId="mobileNavIndicator"
                  className="absolute -top-px left-3 right-3 h-0.5 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <div className="relative">
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  transition={{ duration: 0.1 }}
                >
                  <tab.icon
                    className={`h-5 w-5 transition-colors duration-200 ${
                      active ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                </motion.div>
                {/* Cart badge */}
                <AnimatePresence>
                  {tab.badge && tab.badge > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="absolute -top-1.5 -right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
                    >
                      {tab.badge > 9 ? '9+' : tab.badge}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <span
                className={`text-[10px] font-medium transition-colors duration-200 ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
