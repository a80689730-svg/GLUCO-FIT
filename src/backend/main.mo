import List "mo:core/List";
import Map "mo:core/Map";
import DietTypes "types/diet";
import AppointmentTypes "types/appointments";
import SubTypes "types/subscriptions";
import ShoppingTypes "types/shopping";
import ExerciseTypes "types/exercise";
import ChatTypes "types/chat";
import UsersLib "lib/users";
import DietApi "mixins/diet-api";
import AppointmentsApi "mixins/appointments-api";
import SubscriptionsApi "mixins/subscriptions-api";
import ShoppingApi "mixins/shopping-api";
import ExerciseApi "mixins/exercise-api";
import ChatApi "mixins/chat-api";
import AuthApi "mixins/auth-api";
import UsersApi "mixins/users-api";
import AppointmentsLib "lib/appointments";
import ShoppingLib "lib/shopping";
import ExerciseLib "lib/exercise";

actor {
  // Diet state
  let dietLogs = List.empty<DietTypes.DietLogEntry>();

  // Appointment state
  let doctors = List.empty<AppointmentTypes.Doctor>();
  let appointments = List.empty<AppointmentTypes.Appointment>();

  // Subscription state
  let subscriptions = List.empty<SubTypes.Subscription>();

  // Shopping state
  let products = List.empty<ShoppingTypes.Product>();
  let shoppingOrders = List.empty<ShoppingTypes.ShoppingOrder>();

  // Exercise state
  let exerciseSessions = List.empty<ExerciseTypes.ExerciseSession>();
  let exerciseBookings = List.empty<ExerciseTypes.ExerciseBooking>();

  // Chat state
  let chatMessages = List.empty<ChatTypes.ChatMessage>();

  // Users state (email -> User)
  let usersMap = Map.empty<Text, UsersLib.User>();

  // Seed initial data on startup
  AppointmentsLib.seedDoctors(doctors);
  ShoppingLib.seedProducts(products);
  ExerciseLib.seedSessions(exerciseSessions);

  include DietApi(dietLogs);
  include AppointmentsApi(doctors, appointments);
  include SubscriptionsApi(subscriptions);
  include ShoppingApi(products, shoppingOrders);
  include ExerciseApi(exerciseSessions, exerciseBookings);
  include ChatApi(chatMessages);
  include AuthApi();
  include UsersApi(usersMap);
};
