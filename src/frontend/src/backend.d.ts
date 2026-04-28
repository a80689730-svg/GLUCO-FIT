import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Timestamp = bigint;
export interface ExerciseSession {
    id: bigint;
    duration: bigint;
    instructor: string;
    dayOfWeek: string;
    name: string;
    youtubeThumbnail: string;
    description: string;
    youtubeUrl: string;
    timeSlot: string;
}
export interface OrderItem {
    productId: bigint;
    quantity: bigint;
    unitPrice: bigint;
}
export interface Subscription {
    id: bigint;
    purchaseDate: Timestamp;
    userId: UserId;
    name: string;
    email: string;
    address: string;
    kitStatus: KitStatus;
    phone: string;
    orderNumber: OrderNumber;
    amount: bigint;
    planType: PlanType;
}
export type UserId = Principal;
export interface ExerciseBooking {
    id: bigint;
    status: BookingStatus;
    userId: UserId;
    bookingDate: Timestamp;
    sessionId: bigint;
    timeSlot: string;
}
export interface DietLogEntry {
    id: bigint;
    userId: UserId;
    calories: bigint;
    grams: number;
    timestamp: Timestamp;
    quantity: string;
    foodName: string;
}
export interface Doctor {
    id: bigint;
    name: string;
    email: string;
    specialty: string;
    availableSlots: Array<string>;
    phone: string;
}
export type OrderNumber = string;
export interface ChatMessage {
    id: bigint;
    content: string;
    userId: UserId;
    role: MessageRole;
    timestamp: Timestamp;
}
export interface ShoppingOrder {
    id: bigint;
    userId: UserId;
    createdAt: Timestamp;
    totalAmount: bigint;
    items: Array<OrderItem>;
    orderNumber: OrderNumber;
}
export interface Product {
    id: bigint;
    name: string;
    description: string;
    imageUrl?: string;
    category: ProductCategory;
    price: bigint;
}
export interface Appointment {
    id: bigint;
    status: AppointmentStatus;
    doctorId: bigint;
    userId: UserId;
    createdAt: Timestamp;
    slot: string;
    callType: CallType;
    confirmationNumber: string;
}
export enum AppointmentStatus {
    Confirmed = "Confirmed",
    Cancelled = "Cancelled"
}
export enum BookingStatus {
    Booked = "Booked",
    Cancelled = "Cancelled"
}
export enum CallType {
    VideoCall = "VideoCall",
    NormalCall = "NormalCall"
}
export enum KitStatus {
    Received = "Received",
    Pending = "Pending"
}
export enum MessageRole {
    User = "User",
    Assistant = "Assistant"
}
export enum PlanType {
    OneYear = "OneYear",
    SixMonth = "SixMonth",
    ThreeMonth = "ThreeMonth"
}
export enum ProductCategory {
    DiabetesFood = "DiabetesFood",
    Medicine = "Medicine",
    ExerciseEquipment = "ExerciseEquipment"
}
export interface backendInterface {
    adminGetAllAppointments(): Promise<Array<Appointment>>;
    adminGetAllBookings(): Promise<Array<ExerciseBooking>>;
    adminGetAllDietLogs(): Promise<Array<DietLogEntry>>;
    adminGetAllOrders(): Promise<Array<ShoppingOrder>>;
    adminGetAllSubscriptions(): Promise<Array<Subscription>>;
    adminLogin(email: string, password: string): Promise<boolean>;
    bookAppointment(doctorId: bigint, slot: string, callType: CallType): Promise<Appointment>;
    bookSession(sessionId: bigint): Promise<ExerciseBooking>;
    cancelAppointment(appointmentId: bigint): Promise<boolean>;
    cancelBooking(bookingId: bigint): Promise<boolean>;
    deleteDietLog(entryId: bigint): Promise<boolean>;
    getAllUsers(): Promise<Array<{
        name: string;
        createdAt: bigint;
        email: string;
    }>>;
    getCallerPrincipal(): Promise<Principal>;
    getDoctors(): Promise<Array<Doctor>>;
    getMyAppointments(): Promise<Array<Appointment>>;
    getMyBookings(): Promise<Array<ExerciseBooking>>;
    getMyChatHistory(): Promise<Array<ChatMessage>>;
    getMyDietLogs(): Promise<Array<DietLogEntry>>;
    getMyOrders(): Promise<Array<ShoppingOrder>>;
    getMySubscriptions(): Promise<Array<Subscription>>;
    getProducts(): Promise<Array<Product>>;
    getSessions(): Promise<Array<ExerciseSession>>;
    getUserCount(): Promise<bigint>;
    isAdmin(): Promise<boolean>;
    logFoodItem(foodName: string, quantity: string): Promise<DietLogEntry>;
    loginUser(email: string, password: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    markKitReceived(subscriptionId: bigint): Promise<boolean>;
    placeOrder(items: Array<OrderItem>): Promise<ShoppingOrder>;
    registerUser(name: string, email: string, password: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    sendChatMessage(userMessage: string): Promise<string>;
    subscribePlan(planType: PlanType, name: string, phone: string, email: string, address: string): Promise<Subscription>;
}
