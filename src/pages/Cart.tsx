import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Plus, Minus, Trash2, ShoppingBag, CheckCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { sendOrderConfirmation } from '@/lib/emailService';
import { PageTransition, motion, FadeUp, StaggerChildren, StaggerItem, HoverLift } from '@/components/motion';
import { api } from '@/lib/api';

const Cart = () => {
  const { state, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const [ordering, setOrdering] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const deliveryFee = 49;
  const tax = Math.round(state.total * 0.18);
  const grandTotal = state.total + deliveryFee + tax;

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please sign in to place an order.");
      return;
    }

    setOrdering(true);

    try {
      const orderId = `SC-${Date.now().toString(36).toUpperCase()}`;
      const now = new Date();
      const deliveryDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
      const orderDate = now.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
      const estDelivery = deliveryDate.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) + " — between 5:00 PM – 7:00 PM";

      const orderItems = state.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price * item.quantity,
        image: item.image,
      }));

      // 1. Save order to database
      const token = localStorage.getItem("token");
      await fetch(api("/api/orders"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          items: orderItems,
          subtotal: state.total,
          deliveryFee,
          tax,
          discount: 0,
          total: grandTotal,
          paymentMethod: "Online Payment",
          deliveryAddress: "Your saved delivery address",
          estimatedDelivery: estDelivery,
        }),
      });

      // 2. Send confirmation email via EmailJS
      try {
        await sendOrderConfirmation({
          customerName: user.name,
          toEmail: user.email,
          orderId,
          orderDate,
          paymentMethod: "Online Payment",
          estimatedDelivery: estDelivery,
          deliveryAddress: "Your saved delivery address",
          items: orderItems,
          subtotal: state.total,
          deliveryFee,
          discount: 0,
          total: grandTotal,
        });
        toast.success("Order placed! Confirmation sent to your email.");
      } catch {
        toast.success("Order placed! (Email delivery pending)");
      }

      setOrderPlaced(true);
      clearCart();
    } catch (error) {
      console.error("Order error:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setOrdering(false);
    }
  };

  /* ── Order Success ── */
  if (orderPlaced) {
    return (
      <PageTransition>
        <div className="min-h-screen pb-24">
          <div className="container section-tight">
            <motion.div
              className="surface-panel bg-background/80 p-10 text-center max-w-lg mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
              >
                <CheckCircle className="mx-auto mb-6 h-20 w-20 text-emerald-500" />
              </motion.div>
              <h1 className="mb-3 text-3xl font-display">Order Placed!</h1>
              <p className="mb-2 text-lg text-muted-foreground">
                Your order has been confirmed successfully.
              </p>
              <p className="mb-8 text-sm text-muted-foreground">
                A confirmation email has been sent to <strong>{user?.email}</strong>
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" asChild>
                    <Link to="/">Back to Home</Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/breakfast">Browse Recipes</Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </PageTransition>
    );
  }

  /* ── Empty Cart ── */
  if (state.items.length === 0) {
    return (
      <PageTransition>
        <div className="min-h-screen pb-24">
          <div className="container section-tight">
            <motion.div
              className="surface-panel bg-background/80 p-10 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <ShoppingCart className="mx-auto mb-6 h-16 w-16 text-muted-foreground" />
              <h1 className="mb-4 text-3xl font-display">Your cart is empty</h1>
              <p className="mb-8 text-lg text-muted-foreground">
                Save a recipe or add supermarket essentials to get started.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button size="lg" asChild>
                  <Link to="/breakfast">Browse recipes</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/supermarket" className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Shop supermarket
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </PageTransition>
    );
  }

  /* ── Cart with items ── */
  return (
    <PageTransition>
      <div className="min-h-screen pb-24">
        <div className="container section-tight">
          <FadeUp>
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <h1 className="text-3xl font-display md:text-4xl">Your cart</h1>
                </div>
                <p className="text-lg text-muted-foreground">Review items and finalize your grocery plan.</p>
              </div>
              <Button variant="outline" onClick={clearCart}>
                Clear cart
              </Button>
            </div>
          </FadeUp>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
            <StaggerChildren className="space-y-4">
              {state.items.map((item) => (
                <StaggerItem key={item.id}>
                  <HoverLift>
                    <Card className="bg-background/80">
                      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-muted">
                          <img
                            src={item.image || '/placeholder.svg'}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                            {item.type === 'recipe' ? 'Recipe ingredient' : 'Supermarket'}
                          </p>
                          <h3 className="text-lg font-semibold truncate" title={item.name}>
                            {item.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">₹{item.price} each</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center rounded-full border border-border/60 bg-background/80">
                            <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                            <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button variant="outline" size="icon" onClick={() => removeItem(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-right text-lg font-semibold">
                          ₹{item.price * item.quantity}
                        </div>
                      </div>
                    </Card>
                  </HoverLift>
                </StaggerItem>
              ))}
              <p className="text-sm text-muted-foreground">
                {state.items.length} item{state.items.length !== 1 ? 's' : ''} in your cart.
              </p>
            </StaggerChildren>

            <FadeUp delay={0.2}>
              <Card className="lg:sticky lg:top-24 lg:self-start bg-background/80">
                <CardHeader>
                  <CardTitle>Order summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{state.total}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Delivery</span>
                    <span>₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Tax (18%)</span>
                    <span>₹{tax}</span>
                  </div>
                  <div className="border-t border-border/60 pt-4 flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>₹{grandTotal}</span>
                  </div>
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={handleCheckout}
                      disabled={ordering}
                    >
                      {ordering ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Placing order...
                        </span>
                      ) : (
                        "Place Order & Send Invoice"
                      )}
                    </Button>
                  </motion.div>
                  <Button variant="ghost" asChild className="w-full">
                    <Link to="/supermarket">Continue shopping</Link>
                  </Button>
                </CardContent>
              </Card>
            </FadeUp>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Cart;