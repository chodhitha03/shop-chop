import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  CheckCircle,
  MapPin,
  Ticket,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { sendOrderConfirmation } from '@/lib/emailService';
import { PageTransition, motion, FadeUp, StaggerChildren, StaggerItem, HoverLift } from '@/components/motion';
import { api } from '@/lib/api';
import { AddressForm, type AddressInput } from '@/components/AddressForm';

interface Address {
  _id: string;
  label?: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

interface CouponResult {
  code: string;
  type: 'percent' | 'flat';
  amount: number;
  discount: number;
}

const Cart = () => {
  const { state, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const [ordering, setOrdering] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [step, setStep] = useState(1);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponResult | null>(null);

  const [confirmChecked, setConfirmChecked] = useState(false);

  const deliveryFee = 49;
  const tax = Math.round(state.total * 0.18);
  const discount = appliedCoupon?.discount || 0;
  const grandTotal = Math.max(state.total + deliveryFee + tax - discount, 0);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  useEffect(() => {
    if (!selectedAddressId && addresses.length > 0) {
      const defaultAddress = addresses.find((addr) => addr.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddress._id);
    }
  }, [addresses, selectedAddressId]);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(api('/api/users/addresses'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (error) {
      console.error('Fetch addresses error:', error);
    }
  };

  const handleSaveAddress = async (payload: AddressInput) => {
    setAddressLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(api('/api/users/addresses'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setAddresses(data);
        setShowAddressForm(false);
        toast.success('Address added');
      } else {
        toast.error(data.message || 'Failed to add address');
      }
    } catch (error) {
      console.error('Add address error:', error);
      toast.error('Failed to add address');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Enter a coupon code');
      return;
    }

    setCouponLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(api('/api/coupons/validate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: couponCode.trim(), subtotal: state.total }),
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedCoupon(data);
        toast.success('Coupon applied');
      } else {
        setAppliedCoupon(null);
        toast.error(data.message || 'Invalid coupon');
      }
    } catch (error) {
      console.error('Coupon error:', error);
      toast.error('Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please sign in to place an order.');
      return;
    }

    if (!selectedAddressId) {
      toast.error('Select a delivery address to continue.');
      return;
    }

    setOrdering(true);

    try {
      const orderItems = state.items.map((item) => ({
        id: item.id,
        type: item.type,
        quantity: item.quantity,
        productId: item.type === 'supermarket' ? item.id : undefined,
        recipeId: item.type === 'recipe' ? item.recipeId : undefined,
        ingredientName: item.type === 'recipe' ? item.name : undefined,
      }));

      const token = localStorage.getItem('token');
      const res = await fetch(api('/api/orders'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: orderItems,
          deliveryAddressId: selectedAddressId,
          couponCode: appliedCoupon?.code,
          paymentMethod: 'Online Payment',
        }),
      });

      const order = await res.json();
      if (!res.ok) {
        toast.error(order.message || 'Failed to place order.');
        return;
      }

      const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const formatAddress = (address: Address) => {
        const line2 = address.line2 ? `, ${address.line2}` : '';
        return `${address.line1}${line2}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`;
      };

      try {
        await sendOrderConfirmation({
          customerName: user.name,
          toEmail: user.email,
          orderId: order.orderId,
          orderDate,
          paymentMethod: order.paymentMethod,
          estimatedDelivery: order.estimatedDelivery,
          deliveryAddress: formatAddress(order.deliveryAddress),
          items: order.items,
          subtotal: order.subtotal,
          deliveryFee: order.deliveryFee,
          discount: order.discount,
          total: order.total,
        });
        toast.success('Order placed! Confirmation sent to your email.');
      } catch (error) {
        console.error('Email error:', error);
        toast.success('Order placed! (Email delivery pending)');
      }

      setOrderPlaced(true);
      clearCart();
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setOrdering(false);
    }
  };

  const steps = useMemo(
    () => [
      { id: 1, label: 'Review' },
      { id: 2, label: 'Address' },
      { id: 3, label: 'Coupon' },
      { id: 4, label: 'Confirm' },
    ],
    []
  );

  const handleNext = () => {
    if (step === 2) {
      if (!selectedAddressId || addresses.length === 0) {
        toast.error('Select or add a delivery address.');
        return;
      }
    }
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const primaryAction = () => {
    if (step === 4) {
      handleCheckout();
      return;
    }
    handleNext();
  };

  const primaryLabel = step === 1
    ? 'Continue to address'
    : step === 2
      ? 'Continue to coupon'
      : step === 3
        ? 'Continue to confirm'
        : 'Place order';

  const primaryDisabled =
    ordering ||
    (step === 2 && (!selectedAddressId || addresses.length === 0)) ||
    (step === 4 && !confirmChecked);

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
                transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
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
                  <h1 className="text-3xl font-display md:text-4xl">Checkout</h1>
                </div>
                <p className="text-lg text-muted-foreground">Review, confirm, and place your order.</p>
              </div>
              <Button variant="outline" onClick={clearCart}>
                Clear cart
              </Button>
            </div>
          </FadeUp>

          <div className="mt-8 flex flex-wrap gap-2">
            {steps.map((entry) => (
              <Badge
                key={entry.id}
                variant={step === entry.id ? 'default' : 'outline'}
                className="text-xs"
              >
                {entry.id}. {entry.label}
              </Badge>
            ))}
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="space-y-6">
              {step === 1 && (
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
              )}

              {step === 2 && (
                <Card className="bg-background/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Delivery address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-muted-foreground">
                        {addresses.length} saved address{addresses.length !== 1 ? 'es' : ''}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowAddressForm((prev) => !prev)}
                      >
                        {showAddressForm ? 'Close form' : 'Add address'}
                      </Button>
                    </div>

                    {showAddressForm && (
                      <AddressForm
                        submitLabel="Save address"
                        loading={addressLoading}
                        onSubmit={handleSaveAddress}
                        onCancel={() => setShowAddressForm(false)}
                      />
                    )}

                    {addresses.length === 0 && !showAddressForm && (
                      <div className="rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
                        Add at least one delivery address to continue checkout.
                      </div>
                    )}

                    <div className="space-y-3">
                      {addresses.map((address) => (
                        <button
                          key={address._id}
                          type="button"
                          className={`w-full text-left rounded-xl border p-4 transition ${
                            selectedAddressId === address._id
                              ? 'border-primary bg-primary/5'
                              : 'border-border/60 bg-background/60'
                          }`}
                          onClick={() => setSelectedAddressId(address._id)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-foreground">
                                  {address.label || 'Delivery address'}
                                </p>
                                {address.isDefault && (
                                  <Badge variant="outline" className="text-xs">Default</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {address.name} · {address.phone}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {address.line1}{address.line2 ? `, ${address.line2}` : ''}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {address.city}, {address.state} {address.postalCode}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {address.country}
                              </p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {selectedAddressId === address._id ? 'Selected' : 'Select'}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 3 && (
                <Card className="bg-background/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Ticket className="h-5 w-5" />
                      Apply coupon
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(event) => setCouponCode(event.target.value)}
                      />
                      <Button onClick={handleApplyCoupon} disabled={couponLoading}>
                        {couponLoading ? 'Applying...' : 'Apply'}
                      </Button>
                    </div>

                    {appliedCoupon && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 text-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-foreground">Coupon {appliedCoupon.code} applied</p>
                            <p className="text-xs text-muted-foreground">
                              Discount: ₹{appliedCoupon.discount}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={handleRemoveCoupon}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {step === 4 && (
                <Card className="bg-background/80">
                  <CardHeader>
                    <CardTitle>Confirm order</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-xl border border-border/60 bg-background/60 p-4">
                      <p className="text-sm font-semibold">Delivery address</p>
                      {addresses
                        .filter((addr) => addr._id === selectedAddressId)
                        .map((addr) => (
                          <p key={addr._id} className="text-sm text-muted-foreground">
                            {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} {addr.postalCode}
                          </p>
                        ))}
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/60 p-4">
                      <p className="text-sm font-semibold">Items</p>
                      <p className="text-sm text-muted-foreground">
                        {state.items.length} item{state.items.length !== 1 ? 's' : ''} in your order
                      </p>
                    </div>
                    <label className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={confirmChecked}
                        onChange={(event) => setConfirmChecked(event.target.checked)}
                      />
                      I confirm the delivery address and order details are correct.
                    </label>
                  </CardContent>
                </Card>
              )}
            </div>

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
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>Discount</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                  <div className="border-t border-border/60 pt-4 flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>₹{grandTotal}</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={primaryAction}
                      disabled={primaryDisabled}
                    >
                      {ordering ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Placing order...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          {step === 1 && <ArrowRight className="h-4 w-4" />}
                          {step === 4 && <CheckCircle className="h-4 w-4" />}
                          {primaryLabel}
                        </span>
                      )}
                    </Button>
                    {step > 1 && (
                      <Button variant="ghost" className="w-full" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                    )}
                  </div>

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
