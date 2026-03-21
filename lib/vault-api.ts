import { fetchData, postData, updateData, deleteData, publicFetch, uploadFile } from './api';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ProductCategory = 'CLOTHING' | 'ACCESSORIES' | 'LIFESTYLE' | 'BEAUTY' | 'FOOD' | 'OTHER';
export type EcomOrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type VaultPaymentMethod = 'PAYSTACK' | 'PAY_ON_DELIVERY';
export type EcomPaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface ProductVariant {
  id: string;
  name: string;
  price: number | null; // null = use product base price
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number; // kobo
  images: string[];
  category: ProductCategory;
  isAvailable: boolean;
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  category: ProductCategory;
  isAvailable: boolean;
  variants: ProductVariant[];
}

export interface CartItem {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  variant: ProductVariant & {
    product: { name: string; images: string[]; slug: string; price: number };
  };
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}

export interface DeliveryZone {
  id: string;
  state: string;
  fee: number; // kobo
}

export interface EcomOrderItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  price: number; // kobo per unit
  quantity: number;
  product: { name: string; images: string[]; slug: string };
  variant: { name: string };
}

export interface EcomOrder {
  id: string;
  userId: string;
  status: EcomOrderStatus;
  paymentMethod: VaultPaymentMethod;
  paymentStatus: EcomPaymentStatus;
  paystackRef: string | null;
  totalAmount: number;
  deliveryFee: number;
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  trackingNumber: string | null;
  note: string | null;
  items: EcomOrderItem[];
  user: { firstName: string; lastName: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProducts {
  total: number;
  page: number;
  limit: number;
  data: ProductSummary[];
}

export interface InitiateOrderResult {
  orderId: string;
  reference: string;
  accessCode: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
}

export interface PlaceOrderPayload {
  paymentMethod: VaultPaymentMethod;
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  note?: string;
}

// ── Public ────────────────────────────────────────────────────────────────────

export function getPublicProducts(query: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
} = {}): Promise<PaginatedProducts> {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.category) params.set('category', query.category);
  if (query.search) params.set('search', query.search);
  const qs = params.toString();
  return publicFetch<PaginatedProducts>(`/vault/products${qs ? `?${qs}` : ''}`);
}

export function getPublicProductBySlug(slug: string): Promise<Product> {
  return publicFetch<Product>(`/vault/products/${slug}`);
}

export function getDeliveryZones(): Promise<DeliveryZone[]> {
  return publicFetch<DeliveryZone[]>('/vault/delivery-zones');
}

// ── Cart ──────────────────────────────────────────────────────────────────────

export function getCart(): Promise<Cart> {
  return fetchData<Cart>('/vault/cart');
}

export function addToCart(variantId: string, quantity: number): Promise<Cart> {
  return postData<Cart>('/vault/cart/items', { variantId, quantity });
}

export function updateCartItem(itemId: string, quantity: number): Promise<void> {
  return updateData<void>(`/vault/cart/items/${itemId}`, { quantity });
}

export function removeCartItem(itemId: string): Promise<void> {
  return deleteData<void>(`/vault/cart/items/${itemId}`);
}

export function clearCart(): Promise<void> {
  return deleteData<void>('/vault/cart');
}

// ── Orders ────────────────────────────────────────────────────────────────────

export function initiatePaystackOrder(payload: PlaceOrderPayload): Promise<InitiateOrderResult> {
  return postData<InitiateOrderResult>('/vault/orders/initiate-paystack', payload);
}

export function verifyPaystackOrder(reference: string): Promise<EcomOrder> {
  return postData<EcomOrder>('/vault/orders/verify-paystack', { reference });
}

export function placePayOnDeliveryOrder(payload: PlaceOrderPayload): Promise<EcomOrder> {
  return postData<EcomOrder>('/vault/orders/pay-on-delivery', payload);
}

export function retryPaystackOrder(orderId: string): Promise<InitiateOrderResult> {
  return postData<InitiateOrderResult>(`/vault/orders/${orderId}/retry-payment`, {});
}

export function getUserOrders(): Promise<EcomOrder[]> {
  return fetchData<EcomOrder[]>('/vault/orders');
}

export function getUserOrderById(id: string): Promise<EcomOrder> {
  return fetchData<EcomOrder>(`/vault/orders/${id}`);
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export function getAdminProducts(query: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
} = {}): Promise<{ total: number; page: number; limit: number; data: Product[] }> {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.category) params.set('category', query.category);
  if (query.search) params.set('search', query.search);
  const qs = params.toString();
  return fetchData(`/a/vault/products${qs ? `?${qs}` : ''}`);
}

export function getAdminProductById(id: string): Promise<Product> {
  return fetchData<Product>(`/a/vault/products/${id}`);
}

export function createProduct(dto: {
  name: string; description: string; price: number;
  images?: string[]; category?: ProductCategory; isAvailable?: boolean;
  variants: { name: string; price?: number; stock: number }[];
}): Promise<Product> {
  return postData<Product>('/a/vault/products', dto);
}

export function updateProduct(id: string, dto: Partial<{
  name: string; description: string; price: number;
  images: string[]; category: ProductCategory; isAvailable: boolean;
}>): Promise<Product> {
  return updateData<Product>(`/a/vault/products/${id}`, dto);
}

export function deleteProduct(id: string): Promise<void> {
  return deleteData<void>(`/a/vault/products/${id}`);
}

export function addVariant(productId: string, dto: { name: string; price?: number; stock: number }): Promise<ProductVariant> {
  return postData<ProductVariant>(`/a/vault/products/${productId}/variants`, dto);
}

export function updateVariant(variantId: string, dto: Partial<{ name: string; price: number | null; stock: number }>): Promise<ProductVariant> {
  return updateData<ProductVariant>(`/a/vault/variants/${variantId}`, dto);
}

export function deleteVariant(variantId: string): Promise<void> {
  return deleteData<void>(`/a/vault/variants/${variantId}`);
}

export function getAdminOrders(query: {
  page?: number; limit?: number; status?: EcomOrderStatus; search?: string;
} = {}): Promise<{ total: number; page: number; limit: number; data: EcomOrder[] }> {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.status) params.set('status', query.status);
  if (query.search) params.set('search', query.search);
  const qs = params.toString();
  return fetchData(`/a/vault/orders${qs ? `?${qs}` : ''}`);
}

export function getAdminOrderById(id: string): Promise<EcomOrder> {
  return fetchData<EcomOrder>(`/a/vault/orders/${id}`);
}

export function updateOrderStatus(id: string, dto: {
  status: EcomOrderStatus; trackingNumber?: string; note?: string;
}): Promise<EcomOrder> {
  return updateData<EcomOrder>(`/a/vault/orders/${id}/status`, dto);
}

export function upsertDeliveryZones(zones: { state: string; fee: number }[]): Promise<DeliveryZone[]> {
  return fetchData<DeliveryZone[]>('/a/vault/delivery-zones'); // PUT handled below
}

export async function saveDeliveryZones(zones: { state: string; fee: number }[]): Promise<DeliveryZone[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/a/vault/delivery-zones`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(zones),
  });
  if (!res.ok) throw new Error('Failed to save delivery zones');
  return res.json();
}

export async function uploadProductImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await uploadFile<{ url: string }>('/upload/event-cover', formData);
  return res.url;
}

export const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'CLOTHING', label: 'Clothing' },
  { value: 'ACCESSORIES', label: 'Accessories' },
  { value: 'LIFESTYLE', label: 'Lifestyle' },
  { value: 'BEAUTY', label: 'Beauty' },
  { value: 'FOOD', label: 'Food' },
  { value: 'OTHER', label: 'Other' },
];

export const ORDER_STATUS_LABELS: Record<EcomOrderStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const ORDER_STATUS_COLORS: Record<EcomOrderStatus, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-500',
  CONFIRMED: 'bg-blue-500/10 text-blue-500',
  PROCESSING: 'bg-purple-500/10 text-purple-500',
  SHIPPED: 'bg-orange-500/10 text-orange-500',
  DELIVERED: 'bg-green-500/10 text-green-500',
  CANCELLED: 'bg-red-500/10 text-red-500',
};

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'Abuja (FCT)', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
  'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
  'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];
