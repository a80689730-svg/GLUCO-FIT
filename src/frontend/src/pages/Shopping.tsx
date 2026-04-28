import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  CheckCircle,
  LogIn,
  Package,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useMyOrders, usePlaceOrder, useProducts } from "../hooks/useBackend";
import type { OrderItem, Product, ProductCategory } from "../types";

// Reliable Unsplash photo IDs for each product — bypasses broken backend imageUrl values
const PRODUCT_IMAGE_MAP: Record<string, string> = {
  "Brown Rice (1 kg)":
    "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&h=300",
  "Diabetic Digestive Biscuits (200g)":
    "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&h=300",
  "Oats (500g)":
    "https://images.unsplash.com/photo-1495214783159-3503fd1b572d?auto=format&fit=crop&w=400&h=300",
  "Quinoa (500g)":
    "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=400&h=300",
  "Sugar-Free Dark Chocolate (100g)":
    "https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=400&h=300",
  "Flaxseed Powder (250g)":
    "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&w=400&h=300",
  "Blood Glucose Monitor Kit":
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&h=300",
  "Glucometer Test Strips (50 pcs)":
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&h=300",
  "Lancets (100 pcs)":
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=400&h=300",
  "Insulin Syringes (50 pcs)":
    "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=400&h=300",
  "Diabetic Foot Cream (100ml)":
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&h=300",
  "Resistance Bands Set (5 levels)":
    "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=400&h=300",
  "Yoga Mat (6mm)":
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&h=300",
  "Adjustable Dumbbells (2 kg pair)":
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&h=300",
  "Pedometer Clip":
    "https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=400&h=300",
};

function getProductImage(product: Product): string {
  return PRODUCT_IMAGE_MAP[product.name] ?? product.imageUrl ?? "";
}

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  DiabetesFood: "Diabetes Food",
  Medicine: "Medicine",
  ExerciseEquipment: "Exercise Equipment",
};

const CATEGORY_TABS: { value: ProductCategory | "All"; label: string }[] = [
  { value: "All", label: "All" },
  { value: "DiabetesFood", label: "Diabetes Food" },
  { value: "Medicine", label: "Medicine" },
  { value: "ExerciseEquipment", label: "Equipment" },
];

interface CartItem {
  product: Product;
  quantity: number;
}

function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart: (p: Product) => void;
}) {
  const imgSrc = getProductImage(product);
  return (
    <Card
      className="flex flex-col overflow-hidden hover:shadow-md transition-smooth"
      data-ocid={`shopping.product_card.${product.id}`}
    >
      <div className="bg-muted/40 h-40 flex items-center justify-center overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget;
              target.onerror = null;
              target.src = `https://placehold.co/400x300/e2e8f0/64748b?text=${encodeURIComponent(product.name)}`;
            }}
          />
        ) : (
          <Package className="w-12 h-12 text-muted-foreground/40" />
        )}
      </div>
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm leading-tight line-clamp-2">
            {product.name}
          </CardTitle>
          <Badge variant="secondary" className="text-xs shrink-0">
            {CATEGORY_LABELS[product.category as ProductCategory] ??
              product.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 flex-1">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <span className="font-display font-bold text-lg text-foreground">
            ₹{Number(product.price).toLocaleString("en-IN")}
          </span>
          <Button
            size="sm"
            onClick={() => onAddToCart(product)}
            data-ocid={`shopping.add_to_cart_button.${product.id}`}
          >
            <ShoppingCart className="w-3.5 h-3.5 mr-1" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CartPanel({
  cart,
  onRemove,
  onCheckout,
  isOrdering,
}: {
  cart: CartItem[];
  onRemove: (productId: bigint) => void;
  onCheckout: () => void;
  isOrdering: boolean;
}) {
  const total = cart.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  return (
    <Card className="sticky top-20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" />
          Cart ({cart.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {cart.length === 0 ? (
          <div
            className="text-center py-8"
            data-ocid="shopping.cart.empty_state"
          >
            <ShoppingBag className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {cart.map((item, i) => (
                <div
                  key={String(item.product.id)}
                  className="flex items-center justify-between gap-2 py-2 border-b border-border last:border-0"
                  data-ocid={`shopping.cart.item.${i + 1}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ₹{Number(item.product.price).toLocaleString("en-IN")} ×{" "}
                      {item.quantity}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 text-destructive hover:text-destructive"
                    onClick={() => onRemove(item.product.id)}
                    data-ocid={`shopping.cart.remove_button.${i + 1}`}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-border">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium">Total</span>
                <span className="font-display font-bold text-primary">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>
              <Button
                className="w-full"
                onClick={onCheckout}
                disabled={isOrdering}
                data-ocid="shopping.checkout_button"
              >
                {isOrdering ? "Placing Order…" : "Place Order"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function Shopping() {
  const { isAuthenticated, login } = useInternetIdentity();
  const { data: products, isLoading } = useProducts();
  const { data: myOrders } = useMyOrders();
  const placeOrder = usePlaceOrder();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<ProductCategory | "All">(
    "All",
  );

  const filteredProducts =
    activeCategory === "All"
      ? (products ?? [])
      : (products ?? []).filter((p) => p.category === activeCategory);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart`);
  }

  function removeFromCart(productId: bigint) {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }

  async function handleCheckout() {
    if (!isAuthenticated) {
      login();
      return;
    }
    if (cart.length === 0) return;

    const items: OrderItem[] = cart.map((item) => ({
      productId: item.product.id,
      quantity: BigInt(item.quantity),
      unitPrice: item.product.price,
    }));

    try {
      const order = await placeOrder.mutateAsync(items);
      toast.success(`Order placed! Order #${order.orderNumber}`);
      setCart([]);
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div
          className="text-center space-y-4"
          data-ocid="shopping.auth_required"
        >
          <ShoppingBag className="w-12 h-12 text-primary/40 mx-auto" />
          <h2 className="text-xl font-display font-bold">Browse Our Shop</h2>
          <p className="text-muted-foreground">
            Login to shop for diabetes foods, medicines & equipment
          </p>
          <Button onClick={() => login()} data-ocid="shopping.login_button">
            <LogIn className="w-4 h-4 mr-2" />
            Login to Shop
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" data-ocid="shopping.page">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-foreground mb-1">
          Shop
        </h1>
        <p className="text-muted-foreground text-sm">
          Diabetes foods, medicines & exercise equipment
        </p>
      </div>

      <Tabs defaultValue="shop" className="w-full">
        <TabsList className="mb-6" data-ocid="shopping.tabs">
          <TabsTrigger value="shop" data-ocid="shopping.shop_tab">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Products
          </TabsTrigger>
          <TabsTrigger value="orders" data-ocid="shopping.orders_tab">
            <Package className="w-4 h-4 mr-2" />
            My Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shop">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Products */}
            <div className="flex-1">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                {CATEGORY_TABS.map((cat) => (
                  <Button
                    key={cat.value}
                    variant={
                      activeCategory === cat.value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setActiveCategory(cat.value)}
                    data-ocid={`shopping.filter.${cat.value.toLowerCase()}`}
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {["a", "b", "c", "d", "e", "f"].map((k) => (
                    <Skeleton key={k} className="h-64 rounded-lg" />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div
                  className="text-center py-12"
                  data-ocid="shopping.products.empty_state"
                >
                  <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No products available</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={String(product.id)}
                      product={product}
                      onAddToCart={addToCart}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Cart Sidebar */}
            <div className="w-full lg:w-72 shrink-0">
              <CartPanel
                cart={cart}
                onRemove={removeFromCart}
                onCheckout={handleCheckout}
                isOrdering={placeOrder.isPending}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          {!myOrders || myOrders.length === 0 ? (
            <div
              className="text-center py-16"
              data-ocid="shopping.orders.empty_state"
            >
              <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No orders yet</p>
              <p className="text-sm text-muted-foreground">
                Your purchase history will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myOrders.map((order, i) => (
                <Card
                  key={String(order.id)}
                  data-ocid={`shopping.order.item.${i + 1}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-mono">
                          #{order.orderNumber}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(
                            Number(order.createdAt) / 1_000_000,
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="font-display font-bold text-foreground">
                          ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Trash indicator for cart items */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCart([])}
            className="gap-2 shadow-md"
            data-ocid="shopping.clear_cart_button"
          >
            <Trash2 className="w-4 h-4 text-destructive" />
            Clear Cart
          </Button>
        </div>
      )}
    </div>
  );
}
