import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Store, Search, Plus, Check } from 'lucide-react';
import { supermarketProducts, categories, type SupermarketProduct } from '@/data/supermarket';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import {
  PageTransition, FadeUp, StaggerChildren, StaggerItem,
  HoverLift, motion, AnimatePresence
} from '@/components/motion';
import { api } from '@/lib/api';

const Supermarket = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [products, setProducts] = useState<SupermarketProduct[]>(supermarketProducts);
  const { addItem } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(api('/api/products'));
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Fetch products error:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: SupermarketProduct & { slug?: string }) => {
    const productKey = product.slug || product.id;
    addItem({
      id: productKey,
      name: product.name,
      price: product.price,
      image: product.image,
      type: 'supermarket'
    });

    // Flash the checkmark
    setAddedIds(prev => new Set(prev).add(productKey));
    setTimeout(() => {
      setAddedIds(prev => {
        const next = new Set(prev);
        next.delete(productKey);
        return next;
      });
    }, 1200);

    toast.success(`${product.name} added to cart`);
  };

  return (
    <PageTransition>
      <div className="min-h-screen">
        <section className="section-tight">
          <div className="container">
            <FadeUp>
              <div className="surface-panel bg-background/80 p-6 sm:p-8 md:p-10">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div className="space-y-4">
                    <div className="pill w-fit">
                      <Store className="h-4 w-4 text-ember" />
                      Fresh supermarket
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-display md:text-5xl">Stock your kitchen with care</h1>
                    <p className="max-w-2xl text-base sm:text-lg text-muted-foreground">
                      Premium pantry items, produce, and essentials delivered with clear pricing in ₹.
                    </p>
                  </div>
                  <div className="w-full max-w-md">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search for products or ingredients"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className="pl-11 h-12 rounded-2xl transition-shadow focus:shadow-md"
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Try searching for pantry staples, produce, or beverages.
                    </p>
                  </div>
                </div>

                {/* Category pills — horizontal scroll on mobile */}
                <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-2 px-2">
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedCategory('all')}
                      className="rounded-full whitespace-nowrap"
                    >
                      All products
                    </Button>
                  </motion.div>
                  {categories.map((category) => (
                    <motion.div key={category.id} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant={selectedCategory === category.id ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                        className="flex items-center gap-2 rounded-full whitespace-nowrap"
                      >
                        <span>{category.icon}</span>
                        {category.name}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </FadeUp>

            {/* Product grid */}
            <StaggerChildren className="mt-8 sm:mt-10 grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => {
                const productKey = (product as SupermarketProduct & { slug?: string }).slug || product.id;
                return (
                <StaggerItem key={productKey}>
                  <HoverLift>
                    <Card className="group overflow-hidden bg-card/90 h-full flex flex-col">
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        {product.onSale && (
                          <Badge className="absolute right-2 top-2 bg-primary text-primary-foreground text-[10px] sm:text-xs">
                            Sale
                          </Badge>
                        )}
                        {product.stock < 10 && (
                          <Badge variant="secondary" className="absolute left-2 top-2 text-[10px] sm:text-xs">
                            Low stock
                          </Badge>
                        )}
                      </div>
                      <CardHeader className="p-3 sm:p-4 pb-0 sm:pb-0">
                        <CardTitle className="text-sm sm:text-lg line-clamp-1">{product.name}</CardTitle>
                        <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                          {product.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 sm:p-4 pt-2 sm:pt-3 mt-auto space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base sm:text-xl font-semibold text-foreground">₹{product.price}</span>
                            {product.onSale && product.originalPrice && (
                              <span className="text-[10px] sm:text-xs text-muted-foreground line-through">
                                ₹{product.originalPrice}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] sm:text-xs text-muted-foreground">{product.unit}</span>
                        </div>
                        <motion.div whileTap={{ scale: 0.96 }}>
                          <Button
                            className="w-full rounded-xl h-10 text-xs sm:text-sm"
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock === 0}
                          >
                            <AnimatePresence mode="wait">
                              {addedIds.has(productKey) ? (
                                <motion.span
                                  key="added"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  className="flex items-center gap-1.5"
                                >
                                  <Check className="h-4 w-4" /> Added
                                </motion.span>
                              ) : (
                                <motion.span
                                  key="add"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  className="flex items-center gap-1.5"
                                >
                                  <Plus className="h-4 w-4" />
                                  {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </Button>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </HoverLift>
                </StaggerItem>
                );
              })}
            </StaggerChildren>

            {filteredProducts.length === 0 && (
              <FadeUp>
                <div className="mt-12 text-center">
                  <p className="text-4xl mb-4">🔍</p>
                  <p className="text-lg font-medium text-foreground">No products found</p>
                  <p className="text-sm text-muted-foreground">Try a different search or category.</p>
                </div>
              </FadeUp>
            )}
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default Supermarket;