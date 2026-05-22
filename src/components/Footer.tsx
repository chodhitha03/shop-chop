import { Link } from 'react-router-dom';
import { ChefHat, Github, Twitter, Instagram, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    recipes: [
      { label: 'Breakfast', path: '/breakfast' },
      { label: 'Lunch', path: '/lunch' },
      { label: 'Dinner', path: '/dinner' },
      { label: 'Desserts', path: '/desserts' },
    ],
    shop: [
      { label: 'Supermarket', path: '/supermarket' },
      { label: 'Cart', path: '/cart' },
      { label: 'My Orders', path: '/my-orders' },
    ],
    company: [
      { label: 'About', path: '/about' },
      { label: 'Sign In', path: '/sign-in' },
      { label: 'Sign Up', path: '/sign-up' },
    ],
  };

  return (
    <footer className="border-t border-border/40 bg-background/60 backdrop-blur-sm hidden lg:block">
      <div className="container py-12 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background">
                <ChefHat className="h-5 w-5" />
              </div>
              <div>
                <span className="text-lg font-display">Shop & Chop</span>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Culinary Studio</p>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Curated recipes, intelligent planning, and grocery delivery — all in one focused workflow for modern kitchens.
            </p>
            <div className="flex items-center gap-3">
              {[Github, Twitter, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/80 text-muted-foreground transition-all duration-200 hover:bg-foreground hover:text-background hover:border-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Recipes */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Recipes</h4>
            <ul className="space-y-2.5">
              {links.recipes.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Shop</h4>
            <ul className="space-y-2.5">
              {links.shop.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2.5">
              {links.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {currentYear} Shop & Chop. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            Made with <Heart className="h-3 w-3 text-primary fill-primary" /> for food lovers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
