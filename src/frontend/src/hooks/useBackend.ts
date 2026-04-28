import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  Appointment,
  CallType,
  ChatMessage,
  DietLogEntry,
  Doctor,
  ExerciseBooking,
  ExerciseSession,
  KitStatus,
  OrderItem,
  PlanType,
  Product,
  ShoppingOrder,
  Subscription,
} from "../types";

// Re-export user auth hooks and provider from dedicated context file
export {
  UserAuthContext,
  UserAuthProvider,
  useCurrentUser,
} from "./useUserAuth";

// ─── User Registration / Login Hooks ──────────────────────────────────────────

export function useRegisterUser() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async ({
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.registerUser(name, email, password);
      return result;
    },
  });
}

export function useLoginUser() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      const result = await actor.loginUser(email, password);
      return result;
    },
  });
}

// ─── Diet Hooks ────────────────────────────────────────────────────────────────

export function useMyDietLogs() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<DietLogEntry[]>({
    queryKey: ["dietLogs", "mine"],
    queryFn: async () => {
      if (!actor) return [];
      return (await actor.getMyDietLogs()) as unknown as DietLogEntry[];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllDietLogs() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<DietLogEntry[]>({
    queryKey: ["dietLogs", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return (await actor.adminGetAllDietLogs()) as unknown as DietLogEntry[];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLogFood() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      foodName,
      quantity,
    }: {
      foodName: string;
      quantity: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.logFoodItem(foodName, quantity);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dietLogs"] });
    },
  });
}

// ─── Doctors Hooks ─────────────────────────────────────────────────────────────

export function useDoctors() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Doctor[]>({
    queryKey: ["doctors"],
    queryFn: async () => {
      if (!actor) return [];
      return (await actor.getDoctors()) as unknown as Doctor[];
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Appointments Hooks ────────────────────────────────────────────────────────

export function useMyAppointments() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Appointment[]>({
    queryKey: ["appointments", "mine"],
    queryFn: async () => {
      if (!actor) return [];
      return (await actor.getMyAppointments()) as unknown as Appointment[];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllAppointments() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Appointment[]>({
    queryKey: ["appointments", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return (await actor.adminGetAllAppointments()) as unknown as Appointment[];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBookAppointment() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      doctorId,
      slot,
      callType,
    }: {
      doctorId: bigint;
      slot: string;
      callType: CallType;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.bookAppointment(
        doctorId,
        slot,
        callType as unknown as import("../backend").CallType,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useCancelAppointment() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (appointmentId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.cancelAppointment(appointmentId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

// ─── Subscriptions Hooks ───────────────────────────────────────────────────────

export function useMySubscriptions() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Subscription[]>({
    queryKey: ["subscriptions", "mine"],
    queryFn: async () => {
      if (!actor) return [];
      return (await actor.getMySubscriptions()) as unknown as Subscription[];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllSubscriptions() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Subscription[]>({
    queryKey: ["subscriptions", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return (await actor.adminGetAllSubscriptions()) as unknown as Subscription[];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubscribe() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      planType,
      name,
      phone,
      email,
      address,
    }: {
      planType: PlanType;
      name: string;
      phone: string;
      email: string;
      address: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.subscribePlan(
        planType as unknown as import("../backend").PlanType,
        name,
        phone,
        email,
        address,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });
}

export function useMarkKitReceived() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (subscriptionId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.markKitReceived(subscriptionId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });
}

// ─── Shopping Hooks ────────────────────────────────────────────────────────────

export function useProducts() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return (await actor.getProducts()) as unknown as Product[];
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: OrderItem[]) => {
      if (!actor) throw new Error("Not connected");
      return (await actor.placeOrder(items)) as unknown as ShoppingOrder;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useMyOrders() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ShoppingOrder[]>({
    queryKey: ["orders", "mine"],
    queryFn: async () => {
      if (!actor) return [];
      return (await actor.getMyOrders()) as unknown as ShoppingOrder[];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllOrders() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ShoppingOrder[]>({
    queryKey: ["orders", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return (await actor.adminGetAllOrders()) as unknown as ShoppingOrder[];
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Exercise Hooks ────────────────────────────────────────────────────────────

export function useSessions() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ExerciseSession[]>({
    queryKey: ["sessions"],
    queryFn: async () => {
      if (!actor) return [];
      return (await actor.getSessions()) as unknown as ExerciseSession[];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBookSession() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return (await actor.bookSession(sessionId)) as unknown as ExerciseBooking;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useCancelBooking() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return await actor.cancelBooking(bookingId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useMyBookings() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ExerciseBooking[]>({
    queryKey: ["bookings", "mine"],
    queryFn: async () => {
      if (!actor) return [];
      return (await actor.getMyBookings()) as unknown as ExerciseBooking[];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllBookings() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ExerciseBooking[]>({
    queryKey: ["bookings", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return (await actor.adminGetAllBookings()) as unknown as ExerciseBooking[];
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Users Hook (Admin) ────────────────────────────────────────────────────────

export interface UserPublic {
  name: string;
  email: string;
  createdAt: bigint;
}

export function useAllUsers() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<UserPublic[]>({
    queryKey: ["users", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return (await actor.getAllUsers()) as UserPublic[];
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Chat Hooks ────────────────────────────────────────────────────────────────

export function useSendChatMessage() {
  const { actor } = useActor(createActor);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (message: string) => {
      if (!actor) throw new Error("Not connected");
      return await actor.sendChatMessage(message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chatHistory"] });
    },
  });
}

export function useMyChatHistory() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<ChatMessage[]>({
    queryKey: ["chatHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return (await actor.getMyChatHistory()) as unknown as ChatMessage[];
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Admin Hook ────────────────────────────────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return (await actor.isAdmin()) as boolean;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminLogin() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }): Promise<boolean> => {
      if (!actor) {
        // UI-level credential check — fallback when backend not available
        return email === "namratakutwade@gmail.com" && password === "Charlie";
      }
      try {
        const result = await actor.adminLogin(email, password);
        return result;
      } catch {
        // fall through to UI-level check
      }
      return email === "namratakutwade@gmail.com" && password === "Charlie";
    },
  });
}

// Re-export KitStatus for use in components
export type { KitStatus };
