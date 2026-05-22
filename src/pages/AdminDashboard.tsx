import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageTransition, FadeUp } from "@/components/motion";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface AdminStats {
  users: number;
  orders: number;
  products: number;
  recipes: number;
  coupons: number;
  totalSales: number;
}

interface AdminOrder {
  _id: string;
  orderId: string;
  total: number;
  status: string;
  createdAt: string;
  user?: { name: string; email: string };
}

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  isBlocked: boolean;
  createdAt: string;
}

interface AdminProduct {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
  stock: number;
  unit?: string;
  onSale?: boolean;
  originalPrice?: number;
  active?: boolean;
}

interface AdminRecipe {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  category: string;
  cookingTime: number;
  servings: number;
  ingredients: { name: string; quantity: string; price: number }[];
  instructions: string[];
  active?: boolean;
}

interface AdminCoupon {
  _id: string;
  code: string;
  type: "percent" | "flat";
  amount: number;
  minSubtotal: number;
  expiresAt?: string;
  active: boolean;
  usageLimit: number;
  usedCount: number;
}

const emptyProduct: AdminProduct = {
  _id: "",
  slug: "",
  name: "",
  description: "",
  price: 0,
  image: "",
  category: "",
  stock: 0,
  unit: "",
  onSale: false,
  originalPrice: 0,
  active: true,
};

const emptyRecipe: AdminRecipe = {
  _id: "",
  slug: "",
  name: "",
  description: "",
  image: "",
  category: "breakfast",
  cookingTime: 20,
  servings: 2,
  ingredients: [],
  instructions: [],
  active: true,
};

const emptyCoupon: AdminCoupon = {
  _id: "",
  code: "",
  type: "percent",
  amount: 0,
  minSubtotal: 0,
  expiresAt: "",
  active: true,
  usageLimit: 0,
  usedCount: 0,
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const token = localStorage.getItem("token") || "";

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [recipes, setRecipes] = useState<AdminRecipe[]>([]);
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);

  const [loading, setLoading] = useState(true);

  const [productForm, setProductForm] = useState<AdminProduct>(emptyProduct);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [recipeForm, setRecipeForm] = useState<AdminRecipe>(emptyRecipe);
  const [ingredientText, setIngredientText] = useState("");
  const [instructionText, setInstructionText] = useState("");
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);

  const [couponForm, setCouponForm] = useState<AdminCoupon>(emptyCoupon);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" }),
    [token]
  );

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, usersRes, productsRes, recipesRes, couponsRes] = await Promise.all([
        fetch(api("/api/admin/stats"), { headers: authHeaders }),
        fetch(api("/api/admin/orders"), { headers: authHeaders }),
        fetch(api("/api/admin/users"), { headers: authHeaders }),
        fetch(api("/api/admin/products"), { headers: authHeaders }),
        fetch(api("/api/admin/recipes"), { headers: authHeaders }),
        fetch(api("/api/admin/coupons"), { headers: authHeaders }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());
      if (recipesRes.ok) setRecipes(await recipesRes.json());
      if (couponsRes.ok) setCoupons(await couponsRes.json());
    } catch (error) {
      console.error("Admin load error:", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      const res = await fetch(api(`/api/admin/orders/${orderId}/status`), {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((order) => (order._id === updated._id ? updated : order)));
        toast.success("Order status updated");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Order status error:", error);
      toast.error("Failed to update status");
    }
  };

  const handleUserBlock = async (userId: string, isBlocked: boolean) => {
    try {
      const res = await fetch(api(`/api/admin/users/${userId}/block`), {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ isBlocked }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers((prev) => prev.map((usr) => (usr._id === updated._id ? updated : usr)));
      }
    } catch (error) {
      console.error("User block error:", error);
    }
  };

  const handleProductSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const payload = { ...productForm };
      const path = editingProductId ? `/api/admin/products/${editingProductId}` : "/api/admin/products";
      const method = editingProductId ? "PUT" : "POST";
      const res = await fetch(api(path), {
        method,
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (editingProductId) {
          setProducts((prev) => prev.map((product) => (product._id === data._id ? data : product)));
        } else {
          setProducts((prev) => [data, ...prev]);
        }
        setProductForm(emptyProduct);
        setEditingProductId(null);
        toast.success("Product saved");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to save product");
      }
    } catch (error) {
      console.error("Product save error:", error);
      toast.error("Failed to save product");
    }
  };

  const handleProductEdit = (product: AdminProduct) => {
    setProductForm(product);
    setEditingProductId(product._id);
  };

  const handleProductDisable = async (productId: string) => {
    try {
      const res = await fetch(api(`/api/admin/products/${productId}`), {
        method: "DELETE",
        headers: authHeaders,
      });
      if (res.ok) {
        setProducts((prev) => prev.map((product) => (product._id === productId ? { ...product, active: false } : product)));
        toast.success("Product disabled");
      }
    } catch (error) {
      console.error("Product disable error:", error);
    }
  };

  const parseIngredients = (text: string) => {
    if (!text.trim()) return [];
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, quantity, price] = line.split("|").map((part) => part.trim());
        return { name, quantity, price: Number(price) };
      })
      .filter((item) => item.name && item.quantity && !Number.isNaN(item.price));
  };

  const parseInstructions = (text: string) => {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  };

  const handleRecipeSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      ...recipeForm,
      ingredients: parseIngredients(ingredientText),
      instructions: parseInstructions(instructionText),
    };

    try {
      const path = editingRecipeId ? `/api/admin/recipes/${editingRecipeId}` : "/api/admin/recipes";
      const method = editingRecipeId ? "PUT" : "POST";
      const res = await fetch(api(path), {
        method,
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (editingRecipeId) {
          setRecipes((prev) => prev.map((recipe) => (recipe._id === data._id ? data : recipe)));
        } else {
          setRecipes((prev) => [data, ...prev]);
        }
        setRecipeForm(emptyRecipe);
        setIngredientText("");
        setInstructionText("");
        setEditingRecipeId(null);
        toast.success("Recipe saved");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to save recipe");
      }
    } catch (error) {
      console.error("Recipe save error:", error);
      toast.error("Failed to save recipe");
    }
  };

  const handleRecipeEdit = (recipe: AdminRecipe) => {
    setRecipeForm(recipe);
    setIngredientText(recipe.ingredients.map((ing) => `${ing.name} | ${ing.quantity} | ${ing.price}`).join("\n"));
    setInstructionText(recipe.instructions.join("\n"));
    setEditingRecipeId(recipe._id);
  };

  const handleRecipeDisable = async (recipeId: string) => {
    try {
      const res = await fetch(api(`/api/admin/recipes/${recipeId}`), {
        method: "DELETE",
        headers: authHeaders,
      });
      if (res.ok) {
        setRecipes((prev) => prev.map((recipe) => (recipe._id === recipeId ? { ...recipe, active: false } : recipe)));
        toast.success("Recipe disabled");
      }
    } catch (error) {
      console.error("Recipe disable error:", error);
    }
  };

  const handleCouponSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const payload = { ...couponForm };
      const path = editingCouponId ? `/api/admin/coupons/${editingCouponId}` : "/api/admin/coupons";
      const method = editingCouponId ? "PUT" : "POST";
      const res = await fetch(api(path), {
        method,
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (editingCouponId) {
          setCoupons((prev) => prev.map((coupon) => (coupon._id === data._id ? data : coupon)));
        } else {
          setCoupons((prev) => [data, ...prev]);
        }
        setCouponForm(emptyCoupon);
        setEditingCouponId(null);
        toast.success("Coupon saved");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to save coupon");
      }
    } catch (error) {
      console.error("Coupon save error:", error);
      toast.error("Failed to save coupon");
    }
  };

  const handleCouponEdit = (coupon: AdminCoupon) => {
    setCouponForm({ ...coupon, expiresAt: coupon.expiresAt || "" });
    setEditingCouponId(coupon._id);
  };

  const handleCouponDisable = async (couponId: string) => {
    try {
      const res = await fetch(api(`/api/admin/coupons/${couponId}`), {
        method: "DELETE",
        headers: authHeaders,
      });
      if (res.ok) {
        setCoupons((prev) => prev.map((coupon) => (coupon._id === couponId ? { ...coupon, active: false } : coupon)));
        toast.success("Coupon disabled");
      }
    } catch (error) {
      console.error("Coupon disable error:", error);
    }
  };

  if (!user) return null;

  return (
    <PageTransition>
      <div className="min-h-screen pb-24">
        <div className="container section-tight">
          <FadeUp>
            <div className="space-y-2">
              <h1 className="text-3xl font-display">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage store data and fulfillment.</p>
            </div>
          </FadeUp>

          {loading && (
            <div className="mt-6 text-sm text-muted-foreground">Loading admin data...</div>
          )}

          {!loading && (
            <Tabs defaultValue="overview" className="mt-8">
              <TabsList className="flex flex-wrap">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="recipes">Recipes</TabsTrigger>
                <TabsTrigger value="coupons">Coupons</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid gap-4 md:grid-cols-3">
                  {stats && (
                    <>
                      <Card>
                        <CardHeader>
                          <CardTitle>Total Sales</CardTitle>
                          <CardDescription>All-time revenue</CardDescription>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">₹{Math.round(stats.totalSales)}</CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Orders</CardTitle>
                          <CardDescription>Total orders</CardDescription>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">{stats.orders}</CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Users</CardTitle>
                          <CardDescription>Registered users</CardDescription>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">{stats.users}</CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Products</CardTitle>
                          <CardDescription>Active catalog size</CardDescription>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">{stats.products}</CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Recipes</CardTitle>
                          <CardDescription>Recipe library</CardDescription>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">{stats.recipes}</CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Coupons</CardTitle>
                          <CardDescription>Active coupons</CardDescription>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">{stats.coupons}</CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle>Orders</CardTitle>
                    <CardDescription>Update fulfillment status.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order._id}>
                            <TableCell>#{order.orderId}</TableCell>
                            <TableCell>
                              <div className="text-sm font-medium">{order.user?.name || "Unknown"}</div>
                              <div className="text-xs text-muted-foreground">{order.user?.email}</div>
                            </TableCell>
                            <TableCell>₹{order.total}</TableCell>
                            <TableCell>
                              <select
                                className="h-8 rounded-md border border-border bg-background px-2 text-sm"
                                value={order.status}
                                onChange={(event) => handleStatusUpdate(order._id, event.target.value)}
                              >
                                {[
                                  "confirmed",
                                  "preparing",
                                  "shipped",
                                  "delivered",
                                  "cancelled",
                                ].map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="products">
                <Card>
                  <CardHeader>
                    <CardTitle>{editingProductId ? "Edit product" : "Add product"}</CardTitle>
                    <CardDescription>Manage supermarket catalog items.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProductSubmit} className="grid gap-3 md:grid-cols-2">
                      <Input
                        placeholder="Slug"
                        value={productForm.slug}
                        onChange={(event) => setProductForm({ ...productForm, slug: event.target.value })}
                        required
                      />
                      <Input
                        placeholder="Name"
                        value={productForm.name}
                        onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
                        required
                      />
                      <Input
                        placeholder="Category"
                        value={productForm.category}
                        onChange={(event) => setProductForm({ ...productForm, category: event.target.value })}
                        required
                      />
                      <Input
                        placeholder="Price"
                        type="number"
                        value={productForm.price}
                        onChange={(event) => setProductForm({ ...productForm, price: Number(event.target.value) })}
                        required
                      />
                      <Input
                        placeholder="Stock"
                        type="number"
                        value={productForm.stock}
                        onChange={(event) => setProductForm({ ...productForm, stock: Number(event.target.value) })}
                      />
                      <Input
                        placeholder="Unit"
                        value={productForm.unit || ""}
                        onChange={(event) => setProductForm({ ...productForm, unit: event.target.value })}
                      />
                      <Input
                        placeholder="Image URL"
                        value={productForm.image || ""}
                        onChange={(event) => setProductForm({ ...productForm, image: event.target.value })}
                      />
                      <Input
                        placeholder="Description"
                        value={productForm.description || ""}
                        onChange={(event) => setProductForm({ ...productForm, description: event.target.value })}
                      />
                      <div className="flex gap-2">
                        <Button type="submit">{editingProductId ? "Update" : "Create"}</Button>
                        {editingProductId && (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setProductForm(emptyProduct);
                              setEditingProductId(null);
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product._id}>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell>₹{product.price}</TableCell>
                            <TableCell>
                              <Badge variant={product.active ? "default" : "outline"}>
                                {product.active ? "Active" : "Disabled"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleProductEdit(product)}>
                                  Edit
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleProductDisable(product._id)}>
                                  Disable
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recipes">
                <Card>
                  <CardHeader>
                    <CardTitle>{editingRecipeId ? "Edit recipe" : "Add recipe"}</CardTitle>
                    <CardDescription>Use the format name | quantity | price per line for ingredients.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRecipeSubmit} className="grid gap-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <Input
                          placeholder="Slug"
                          value={recipeForm.slug}
                          onChange={(event) => setRecipeForm({ ...recipeForm, slug: event.target.value })}
                          required
                        />
                        <Input
                          placeholder="Name"
                          value={recipeForm.name}
                          onChange={(event) => setRecipeForm({ ...recipeForm, name: event.target.value })}
                          required
                        />
                        <Input
                          placeholder="Category"
                          value={recipeForm.category}
                          onChange={(event) => setRecipeForm({ ...recipeForm, category: event.target.value })}
                          required
                        />
                        <Input
                          placeholder="Cooking time (min)"
                          type="number"
                          value={recipeForm.cookingTime}
                          onChange={(event) => setRecipeForm({ ...recipeForm, cookingTime: Number(event.target.value) })}
                          required
                        />
                        <Input
                          placeholder="Servings"
                          type="number"
                          value={recipeForm.servings}
                          onChange={(event) => setRecipeForm({ ...recipeForm, servings: Number(event.target.value) })}
                          required
                        />
                        <Input
                          placeholder="Image URL"
                          value={recipeForm.image || ""}
                          onChange={(event) => setRecipeForm({ ...recipeForm, image: event.target.value })}
                        />
                      </div>
                      <Input
                        placeholder="Description"
                        value={recipeForm.description || ""}
                        onChange={(event) => setRecipeForm({ ...recipeForm, description: event.target.value })}
                      />
                      <Textarea
                        placeholder="Ingredients, one per line: name | quantity | price"
                        value={ingredientText}
                        onChange={(event) => setIngredientText(event.target.value)}
                      />
                      <Textarea
                        placeholder="Instructions, one per line"
                        value={instructionText}
                        onChange={(event) => setInstructionText(event.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button type="submit">{editingRecipeId ? "Update" : "Create"}</Button>
                        {editingRecipeId && (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setRecipeForm(emptyRecipe);
                              setIngredientText("");
                              setInstructionText("");
                              setEditingRecipeId(null);
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Recipes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Servings</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recipes.map((recipe) => (
                          <TableRow key={recipe._id}>
                            <TableCell>{recipe.name}</TableCell>
                            <TableCell>{recipe.category}</TableCell>
                            <TableCell>{recipe.servings}</TableCell>
                            <TableCell>
                              <Badge variant={recipe.active ? "default" : "outline"}>
                                {recipe.active ? "Active" : "Disabled"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleRecipeEdit(recipe)}>
                                  Edit
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleRecipeDisable(recipe._id)}>
                                  Disable
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="coupons">
                <Card>
                  <CardHeader>
                    <CardTitle>{editingCouponId ? "Edit coupon" : "Add coupon"}</CardTitle>
                    <CardDescription>Use percent or flat discount types.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCouponSubmit} className="grid gap-3 md:grid-cols-2">
                      <Input
                        placeholder="Code"
                        value={couponForm.code}
                        onChange={(event) => setCouponForm({ ...couponForm, code: event.target.value })}
                        required
                      />
                      <Input
                        placeholder="Type (percent or flat)"
                        value={couponForm.type}
                        onChange={(event) => setCouponForm({ ...couponForm, type: event.target.value as "percent" | "flat" })}
                        required
                      />
                      <Input
                        placeholder="Amount"
                        type="number"
                        value={couponForm.amount}
                        onChange={(event) => setCouponForm({ ...couponForm, amount: Number(event.target.value) })}
                        required
                      />
                      <Input
                        placeholder="Min subtotal"
                        type="number"
                        value={couponForm.minSubtotal}
                        onChange={(event) => setCouponForm({ ...couponForm, minSubtotal: Number(event.target.value) })}
                      />
                      <Input
                        placeholder="Usage limit (0 for unlimited)"
                        type="number"
                        value={couponForm.usageLimit}
                        onChange={(event) => setCouponForm({ ...couponForm, usageLimit: Number(event.target.value) })}
                      />
                      <Input
                        placeholder="Expiry date (YYYY-MM-DD)"
                        value={couponForm.expiresAt || ""}
                        onChange={(event) => setCouponForm({ ...couponForm, expiresAt: event.target.value })}
                      />
                      <div className="flex gap-2">
                        <Button type="submit">{editingCouponId ? "Update" : "Create"}</Button>
                        {editingCouponId && (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setCouponForm(emptyCoupon);
                              setEditingCouponId(null);
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Coupons</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Usage</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {coupons.map((coupon) => (
                          <TableRow key={coupon._id}>
                            <TableCell>{coupon.code}</TableCell>
                            <TableCell>{coupon.type}</TableCell>
                            <TableCell>{coupon.amount}</TableCell>
                            <TableCell>
                              <Badge variant={coupon.active ? "default" : "outline"}>
                                {coupon.active ? "Active" : "Disabled"}
                              </Badge>
                            </TableCell>
                            <TableCell>{coupon.usedCount}/{coupon.usageLimit || "unlimited"}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleCouponEdit(coupon)}>
                                  Edit
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleCouponDisable(coupon._id)}>
                                  Disable
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>Block or unblock accounts.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((usr) => (
                          <TableRow key={usr._id}>
                            <TableCell>{usr.name}</TableCell>
                            <TableCell>{usr.email}</TableCell>
                            <TableCell>
                              <Badge variant={usr.isBlocked ? "outline" : "default"}>
                                {usr.isBlocked ? "Blocked" : "Active"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUserBlock(usr._id, !usr.isBlocked)}
                              >
                                {usr.isBlocked ? "Unblock" : "Block"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;
