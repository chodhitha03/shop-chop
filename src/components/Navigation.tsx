import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShoppingCart, Home, Coffee, Sun, Moon, Cookie,
  Store, Info, ChefHat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import AuthButton from './AuthButton';
import ThemeToggle from './ThemeToggle';
import { motion, AnimatePresence } from '@/components/motion';

const Navigation = () => {
  const location = useLocation();
  const { state } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/breakfast', label: 'Breakfast', icon: Coffee },
    { path: '/lunch', label: 'Lunch', icon: Sun },
    { path: '/dinner', label: 'Dinner', icon: Moon },
    { path: '/desserts', label: 'Desserts', icon: Cookie },
    { path: '/supermarket', label: 'Shop', icon: Store },
    { path: '/about', label: 'About', icon: Info },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.header
      className={`sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl transition-all duration-300 ${
        scrolled ? 'border-border/60 shadow-soft' : 'border-transparent'
      }`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="container flex h-16 sm:h-20 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 transition-smooth hover:opacity-90">
          <motion.div
            className="inline-flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-foreground text-background shadow-soft"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChefHat className="h-5 w-5 sm:h-6 sm:w-6" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-display leading-tight">Shop & Chop</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hidden sm:block">Culinary Studio</span>
          </div>
        </Link>

        {/* Desktop Nav Pills */}
        <nav
          className="hidden lg:flex items-center gap-0.5 rounded-full border border-border/60 bg-background/80 px-1 py-1 shadow-soft"
          aria-label="Primary"
        >
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              aria-current={isActive(item.path) ? "page" : undefined}
              className="relative px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {isActive(item.path) && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 rounded-full bg-foreground shadow-soft"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className={`relative z-10 ${
                isActive(item.path)
                  ? "text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <ThemeToggle />

          {/* Cart — desktop only, mobile uses bottom nav */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden sm:block">
            <Button variant="outline" size="sm" asChild className="relative">
              <Link to="/cart" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span className="font-medium">Cart</span>
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      className="absolute -top-2.5 -right-2.5"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shadow-sm">
                        {totalItems > 9 ? '9+' : totalItems}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>
            </Button>
          </motion.div>

          <AuthButton />
        </div>
      </div>
    </motion.header>
  );
};

export default Navigation;