import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Clock, ShoppingBag, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PageTransition, FadeUp, StaggerChildren, StaggerItem, HoverLift, motion, AnimatePresence } from '@/components/motion';
import { api } from '@/lib/api';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  _id: string;
  orderId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  deliveryAddress: string;
  estimatedDelivery: string;
  status: string;
  createdAt: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  confirmed:  { bg: 'bg-blue-100',    text: 'text-blue-700',    label: 'Confirmed' },
  preparing:  { bg: 'bg-amber-100',   text: 'text-amber-700',   label: 'Preparing' },
  shipped:    { bg: 'bg-purple-100',  text: 'text-purple-700',  label: 'Shipped' },
  delivered:  { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Delivered' },
  cancelled:  { bg: 'bg-red-100',     text: 'text-red-700',     label: 'Cancelled' },
};

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(api('/api/orders'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedOrder(prev => prev === id ? null : id);
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen pb-24">
          <div className="container section-tight">
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="surface-panel bg-background/80 p-6 animate-pulse">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-muted" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 w-1/3 rounded bg-muted" />
                      <div className="h-3 w-1/2 rounded bg-muted" />
                    </div>
                    <div className="h-6 w-20 rounded-full bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  /* ── Empty ── */
  if (orders.length === 0) {
    return (
      <PageTransition>
        <div className="min-h-screen pb-24">
          <div className="container section-tight">
            <motion.div
              className="surface-panel bg-background/80 p-10 text-center max-w-lg mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Package className="mx-auto mb-6 h-16 w-16 text-muted-foreground" />
              <h1 className="mb-4 text-3xl font-display">No orders yet</h1>
              <p className="mb-8 text-lg text-muted-foreground">
                Explore recipes and build your first grocery order!
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button size="lg" asChild>
                  <Link to="/breakfast">Browse Recipes</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/supermarket" className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Shop Supermarket
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </PageTransition>
    );
  }

  /* ── Orders List ── */
  return (
    <PageTransition>
      <div className="min-h-screen pb-24">
        <div className="container section-tight">
          <FadeUp>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background">
                    <Package className="h-5 w-5" />
                  </div>
                  <h1 className="text-3xl font-display md:text-4xl">My Orders</h1>
                </div>
                <p className="text-lg text-muted-foreground">
                  Track your past and current orders.
                </p>
              </div>
              <Badge variant="outline" className="w-fit text-sm">
                {orders.length} order{orders.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </FadeUp>

          <StaggerChildren className="space-y-4">
            {orders.map((order) => {
              const status = STATUS_STYLES[order.status] || STATUS_STYLES.confirmed;
              const isExpanded = expandedOrder === order._id;
              const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'long', day: 'numeric',
              });

              return (
                <StaggerItem key={order._id}>
                  <HoverLift>
                    <Card className="bg-background/80 overflow-hidden">
                      {/* Order header — always visible */}
                      <button
                        onClick={() => toggleExpand(order._id)}
                        className="w-full text-left p-5 flex flex-col gap-4 sm:flex-row sm:items-center cursor-pointer hover:bg-accent/20 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Package className="h-6 w-6" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">
                              Order #{order.orderId}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              {date}
                              <span className="hidden sm:inline">·</span>
                              <span className="hidden sm:inline">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge className={`${status.bg} ${status.text} border-0 font-medium`}>
                            {status.label}
                          </Badge>
                          <span className="text-lg font-bold text-foreground">
                            ₹{order.total}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </button>

                      {/* Expanded details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-border/60 p-5 space-y-5">
                              {/* Delivery info */}
                              {order.estimatedDelivery && (
                                <div className="flex items-start gap-3 rounded-2xl bg-primary/5 border border-primary/10 p-4">
                                  <span className="text-xl">🚚</span>
                                  <div>
                                    <p className="text-sm font-semibold text-foreground">Estimated Delivery</p>
                                    <p className="text-sm text-primary font-medium">{order.estimatedDelivery}</p>
                                    {order.deliveryAddress && (
                                      <p className="text-xs text-muted-foreground mt-1">📍 {order.deliveryAddress}</p>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Items */}
                              <div>
                                <p className="text-sm font-semibold text-foreground mb-3">Items</p>
                                <div className="space-y-2">
                                  {order.items.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                                      <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium">{item.name}</span>
                                        <span className="text-xs text-muted-foreground">× {item.quantity}</span>
                                      </div>
                                      <span className="text-sm font-semibold">₹{item.price}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Totals */}
                              <div className="rounded-2xl bg-muted/50 p-4 space-y-2">
                                <div className="flex justify-between text-sm text-muted-foreground">
                                  <span>Subtotal</span>
                                  <span>₹{order.subtotal}</span>
                                </div>
                                <div className="flex justify-between text-sm text-muted-foreground">
                                  <span>Delivery</span>
                                  <span>{order.deliveryFee > 0 ? `₹${order.deliveryFee}` : 'FREE'}</span>
                                </div>
                                {order.tax > 0 && (
                                  <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Tax</span>
                                    <span>₹{order.tax}</span>
                                  </div>
                                )}
                                {order.discount > 0 && (
                                  <div className="flex justify-between text-sm text-emerald-600">
                                    <span>Discount</span>
                                    <span>-₹{order.discount}</span>
                                  </div>
                                )}
                                <div className="border-t border-border/60 pt-2 flex justify-between text-base font-bold">
                                  <span>Total</span>
                                  <span>₹{order.total}</span>
                                </div>
                              </div>

                              <p className="text-xs text-muted-foreground">
                                Payment: {order.paymentMethod}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </HoverLift>
                </StaggerItem>
              );
            })}
          </StaggerChildren>
        </div>
      </div>
    </PageTransition>
  );
};

export default MyOrders;
