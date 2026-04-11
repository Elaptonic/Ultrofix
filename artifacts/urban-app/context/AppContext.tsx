import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { BOOKINGS, Booking } from "@/constants/data";

interface AppContextType {
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  cancelBooking: (id: string) => void;
  rateBooking: (id: string, rating: number) => void;
  savedServices: string[];
  toggleSavedService: (serviceId: string) => void;
  selectedAddress: string;
  setSelectedAddress: (address: string) => void;
  userName: string;
  userEmail: string;
  userPhone: string;
  updateProfile: (name: string, email: string, phone: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(BOOKINGS);
  const [savedServices, setSavedServices] = useState<string[]>(["s1", "s7"]);
  const [selectedAddress, setSelectedAddress] = useState<string>(
    "123 MG Road, Bangalore 560001"
  );
  const [userName, setUserName] = useState("Arjun Mehta");
  const [userEmail, setUserEmail] = useState("arjun.mehta@gmail.com");
  const [userPhone, setUserPhone] = useState("+91 98765 43210");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [savedServicesData, addressData, profileData] = await Promise.all([
        AsyncStorage.getItem("savedServices"),
        AsyncStorage.getItem("selectedAddress"),
        AsyncStorage.getItem("userProfile"),
      ]);
      if (savedServicesData) setSavedServices(JSON.parse(savedServicesData));
      if (addressData) setSelectedAddress(addressData);
      if (profileData) {
        const profile = JSON.parse(profileData);
        setUserName(profile.name);
        setUserEmail(profile.email);
        setUserPhone(profile.phone);
      }
    } catch {
      // ignore
    }
  };

  const addBooking = useCallback((booking: Booking) => {
    setBookings((prev) => [booking, ...prev]);
  }, []);

  const cancelBooking = useCallback((id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "cancelled" as const } : b))
    );
  }, []);

  const rateBooking = useCallback((id: string, rating: number) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, rating } : b))
    );
  }, []);

  const toggleSavedService = useCallback(
    async (serviceId: string) => {
      const newSaved = savedServices.includes(serviceId)
        ? savedServices.filter((id) => id !== serviceId)
        : [...savedServices, serviceId];
      setSavedServices(newSaved);
      await AsyncStorage.setItem("savedServices", JSON.stringify(newSaved));
    },
    [savedServices]
  );

  const updateProfile = useCallback(
    async (name: string, email: string, phone: string) => {
      setUserName(name);
      setUserEmail(email);
      setUserPhone(phone);
      await AsyncStorage.setItem(
        "userProfile",
        JSON.stringify({ name, email, phone })
      );
    },
    []
  );

  return (
    <AppContext.Provider
      value={{
        bookings,
        addBooking,
        cancelBooking,
        rateBooking,
        savedServices,
        toggleSavedService,
        selectedAddress,
        setSelectedAddress,
        userName,
        userEmail,
        userPhone,
        updateProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
