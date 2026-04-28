export type UserId = string;
export type Timestamp = bigint;
export type OrderNumber = string;

export type CallType = "NormalCall" | "VideoCall";
export type AppointmentStatus = "Pending" | "Confirmed" | "Cancelled";
export type PlanType = "ThreeMonths" | "SixMonths" | "OneYear";
export type KitStatus = "Pending" | "Shipped" | "Received";

// ─── User Auth ──────────────────────────────────────────────────────────────────

export type AppUser = { email: string; name: string };

// ─── Shopping Types ─────────────────────────────────────────────────────────────

export type ProductCategory = "DiabetesFood" | "Medicine" | "ExerciseEquipment";

export interface Product {
  id: bigint;
  name: string;
  description: string;
  price: bigint;
  category: ProductCategory;
  imageUrl?: string;
}

export interface OrderItem {
  productId: bigint;
  quantity: bigint;
  unitPrice: bigint;
}

export interface ShoppingOrder {
  id: bigint;
  userId: UserId;
  items: OrderItem[];
  totalAmount: bigint;
  orderNumber: OrderNumber;
  createdAt: Timestamp;
}

// ─── Exercise Types ─────────────────────────────────────────────────────────────

export type BookingStatus = "Booked" | "Cancelled";

export interface ExerciseSession {
  id: bigint;
  name: string;
  instructor: string;
  description: string;
  dayOfWeek: string;
  timeSlot: string;
  duration: bigint;
  youtubeUrl: string;
  youtubeThumbnail: string;
}

export interface ExerciseBooking {
  id: bigint;
  sessionId: bigint;
  userId: UserId;
  bookingDate: Timestamp;
  timeSlot: string;
  status: BookingStatus;
}

// ─── Chat Types ─────────────────────────────────────────────────────────────────

export type MessageRole = "User" | "Assistant";

export interface ChatMessage {
  id: bigint;
  userId: UserId;
  role: MessageRole;
  content: string;
  timestamp: Timestamp;
}

// ─── Existing Types ─────────────────────────────────────────────────────────────

export interface DietLogEntry {
  id: bigint;
  userId: UserId;
  timestamp: Timestamp;
  foodName: string;
  quantity: string;
  calories: bigint;
  grams: number;
}

export interface Doctor {
  id: bigint;
  name: string;
  phone: string;
  email: string;
  specialty: string;
  availableSlots: string[];
}

export interface Appointment {
  id: bigint;
  userId: UserId;
  doctorId: bigint;
  slot: string;
  callType: CallType;
  status: AppointmentStatus;
  confirmationNumber: string;
  createdAt: Timestamp;
}

export interface Subscription {
  id: bigint;
  userId: UserId;
  planType: PlanType;
  amount: bigint;
  name: string;
  phone: string;
  email: string;
  address: string;
  orderNumber: string;
  purchaseDate: Timestamp;
  kitStatus: KitStatus;
}

export interface PlanInfo {
  type: PlanType;
  label: string;
  duration: string;
  price: number;
  features: string[];
  popular?: boolean;
}

export const PLANS: PlanInfo[] = [
  {
    type: "ThreeMonths",
    label: "3 Month Plan",
    duration: "3 months",
    price: 4999,
    features: [
      "Complete Diabetes Care Kit",
      "Diet & Nutrition Tracking",
      "Doctor Consultations",
      "Progress Reports",
      "24/7 Chat Support",
    ],
  },
  {
    type: "SixMonths",
    label: "6 Month Plan",
    duration: "6 months",
    price: 8999,
    features: [
      "Complete Diabetes Care Kit",
      "Diet & Nutrition Tracking",
      "Unlimited Doctor Consultations",
      "Detailed Analytics",
      "Priority Support",
      "Exercise Session Access",
    ],
  },
  {
    type: "OneYear",
    label: "1 Year Plan",
    duration: "1 year",
    price: 14999,
    popular: true,
    features: [
      "Complete Diabetes Care Kit",
      "Diet & Nutrition Tracking",
      "Unlimited Doctor Consultations",
      "Advanced Health Analytics",
      "Priority 24/7 Support",
      "All Exercise Sessions",
      "Annual Health Review",
    ],
  },
];
