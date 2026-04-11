export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  startingPrice: number;
  rating: number;
  reviewCount: number;
  duration: string;
  image: string;
  popular: boolean;
}

export interface Provider {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  jobsCompleted: number;
  specializations: string[];
  experience: string;
  verified: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  serviceCount: number;
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  providerName: string;
  providerAvatar: string;
  date: string;
  time: string;
  status: "upcoming" | "completed" | "cancelled";
  price: number;
  address: string;
  rating?: number;
}

export const CATEGORIES: Category[] = [
  {
    id: "cleaning",
    name: "Cleaning",
    icon: "wind",
    color: "#3b82f6",
    bgColor: "#dbeafe",
    serviceCount: 12,
  },
  {
    id: "plumbing",
    name: "Plumbing",
    icon: "droplet",
    color: "#06b6d4",
    bgColor: "#cffafe",
    serviceCount: 8,
  },
  {
    id: "electrical",
    name: "Electrical",
    icon: "zap",
    color: "#f59e0b",
    bgColor: "#fef3c7",
    serviceCount: 10,
  },
  {
    id: "salon",
    name: "Salon",
    icon: "scissors",
    color: "#ec4899",
    bgColor: "#fce7f3",
    serviceCount: 15,
  },
  {
    id: "painting",
    name: "Painting",
    icon: "edit-3",
    color: "#8b5cf6",
    bgColor: "#ede9fe",
    serviceCount: 6,
  },
  {
    id: "pest",
    name: "Pest Control",
    icon: "shield",
    color: "#10b981",
    bgColor: "#d1fae5",
    serviceCount: 5,
  },
  {
    id: "carpentry",
    name: "Carpentry",
    icon: "tool",
    color: "#d97706",
    bgColor: "#fde68a",
    serviceCount: 9,
  },
  {
    id: "appliances",
    name: "Appliances",
    icon: "cpu",
    color: "#6366f1",
    bgColor: "#e0e7ff",
    serviceCount: 14,
  },
];

export const SERVICES: Service[] = [
  {
    id: "s1",
    name: "Home Deep Cleaning",
    category: "cleaning",
    description:
      "Complete deep cleaning of your home including kitchen, bathrooms, bedrooms and living areas. Our trained professionals use eco-friendly products.",
    startingPrice: 999,
    rating: 4.8,
    reviewCount: 2847,
    duration: "3-4 hours",
    image: "cleaning",
    popular: true,
  },
  {
    id: "s2",
    name: "Bathroom Cleaning",
    category: "cleaning",
    description:
      "Deep cleaning and sanitization of bathrooms. Includes scrubbing tiles, cleaning fixtures and sanitizing all surfaces.",
    startingPrice: 299,
    rating: 4.7,
    reviewCount: 1923,
    duration: "1-2 hours",
    image: "cleaning",
    popular: false,
  },
  {
    id: "s3",
    name: "Pipe Leak Repair",
    category: "plumbing",
    description:
      "Expert diagnosis and repair of pipe leaks. We fix dripping taps, leaking pipes and damaged fittings.",
    startingPrice: 399,
    rating: 4.9,
    reviewCount: 1245,
    duration: "1-2 hours",
    image: "plumbing",
    popular: true,
  },
  {
    id: "s4",
    name: "Blocked Drain Cleaning",
    category: "plumbing",
    description:
      "Professional unblocking of kitchen, bathroom or outdoor drains using advanced equipment.",
    startingPrice: 499,
    rating: 4.6,
    reviewCount: 876,
    duration: "1-3 hours",
    image: "plumbing",
    popular: false,
  },
  {
    id: "s5",
    name: "Electrical Wiring",
    category: "electrical",
    description:
      "Safe and certified electrical wiring for new rooms, renovations or replacement of faulty wiring.",
    startingPrice: 799,
    rating: 4.8,
    reviewCount: 543,
    duration: "2-4 hours",
    image: "electrical",
    popular: false,
  },
  {
    id: "s6",
    name: "Fan Installation",
    category: "electrical",
    description:
      "Professional installation of ceiling fans, wall fans and exhaust fans with proper wiring.",
    startingPrice: 299,
    rating: 4.9,
    reviewCount: 3201,
    duration: "30-60 min",
    image: "electrical",
    popular: true,
  },
  {
    id: "s7",
    name: "Women's Haircut",
    category: "salon",
    description:
      "Professional haircut and styling by certified beauticians at your home. Includes wash and blow dry.",
    startingPrice: 449,
    rating: 4.8,
    reviewCount: 4532,
    duration: "1-2 hours",
    image: "salon",
    popular: true,
  },
  {
    id: "s8",
    name: "Manicure & Pedicure",
    category: "salon",
    description:
      "Complete nail care service including filing, cuticle care, buffing and nail polish application.",
    startingPrice: 599,
    rating: 4.7,
    reviewCount: 2198,
    duration: "1.5 hours",
    image: "salon",
    popular: false,
  },
  {
    id: "s9",
    name: "Wall Painting",
    category: "painting",
    description:
      "Professional interior wall painting with quality paints. Includes surface preparation and two coats.",
    startingPrice: 1499,
    rating: 4.6,
    reviewCount: 891,
    duration: "1-2 days",
    image: "painting",
    popular: false,
  },
  {
    id: "s10",
    name: "Cockroach Control",
    category: "pest",
    description:
      "Safe and effective cockroach extermination treatment. Child and pet safe gel-based treatment.",
    startingPrice: 699,
    rating: 4.7,
    reviewCount: 1567,
    duration: "1-2 hours",
    image: "pest",
    popular: true,
  },
];

export const PROVIDERS: Provider[] = [
  {
    id: "p1",
    name: "Rahul Sharma",
    avatar: "RS",
    rating: 4.9,
    reviewCount: 342,
    jobsCompleted: 1256,
    specializations: ["Deep Cleaning", "Office Cleaning", "Move-in Cleaning"],
    experience: "5 years",
    verified: true,
  },
  {
    id: "p2",
    name: "Priya Patel",
    avatar: "PP",
    rating: 4.8,
    reviewCount: 289,
    jobsCompleted: 987,
    specializations: ["Haircut", "Facial", "Manicure"],
    experience: "4 years",
    verified: true,
  },
  {
    id: "p3",
    name: "Amit Kumar",
    avatar: "AK",
    rating: 4.9,
    reviewCount: 412,
    jobsCompleted: 1589,
    specializations: ["Pipe Repair", "Drain Cleaning", "Bathroom Fitting"],
    experience: "7 years",
    verified: true,
  },
  {
    id: "p4",
    name: "Sunita Devi",
    avatar: "SD",
    rating: 4.7,
    reviewCount: 178,
    jobsCompleted: 634,
    specializations: ["Home Cleaning", "Kitchen Deep Clean"],
    experience: "3 years",
    verified: true,
  },
  {
    id: "p5",
    name: "Vikram Singh",
    avatar: "VS",
    rating: 4.8,
    reviewCount: 267,
    jobsCompleted: 892,
    specializations: ["Wiring", "Fan Installation", "Switch Repair"],
    experience: "6 years",
    verified: true,
  },
];

export const BOOKINGS: Booking[] = [
  {
    id: "b1",
    serviceId: "s1",
    serviceName: "Home Deep Cleaning",
    providerName: "Rahul Sharma",
    providerAvatar: "RS",
    date: "2026-04-15",
    time: "10:00 AM",
    status: "upcoming",
    price: 999,
    address: "123 MG Road, Bangalore 560001",
  },
  {
    id: "b2",
    serviceId: "s7",
    serviceName: "Women's Haircut",
    providerName: "Priya Patel",
    providerAvatar: "PP",
    date: "2026-04-12",
    time: "2:00 PM",
    status: "upcoming",
    price: 449,
    address: "45 Koramangala, Bangalore 560034",
  },
  {
    id: "b3",
    serviceId: "s3",
    serviceName: "Pipe Leak Repair",
    providerName: "Amit Kumar",
    providerAvatar: "AK",
    date: "2026-04-01",
    time: "11:00 AM",
    status: "completed",
    price: 399,
    address: "78 Indiranagar, Bangalore 560038",
    rating: 5,
  },
  {
    id: "b4",
    serviceId: "s6",
    serviceName: "Fan Installation",
    providerName: "Vikram Singh",
    providerAvatar: "VS",
    date: "2026-03-28",
    time: "9:00 AM",
    status: "completed",
    price: 299,
    address: "123 MG Road, Bangalore 560001",
    rating: 4,
  },
];
