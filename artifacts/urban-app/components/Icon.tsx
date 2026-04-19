import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Award,
  Bell,
  BellOff,
  Briefcase,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  CreditCard,
  Crosshair,
  DollarSign,
  Hash,
  Heart,
  Home,
  Inbox,
  Info,
  LayoutGrid,
  LogOut,
  MapPin,
  Navigation,
  Pencil,
  Radio,
  Search,
  Shield,
  Star,
  Tag,
  TrendingUp,
  User,
  Users,
  WifiOff,
  Wrench,
  X,
  Zap,
} from "lucide-react-native";
import React from "react";

const iconMap = {
  "alert-circle": AlertCircle,
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  "arrow-up-right": ArrowUpRight,
  award: Award,
  bell: Bell,
  "bell-off": BellOff,
  briefcase: Briefcase,
  calendar: Calendar,
  check: Check,
  "check-circle": CheckCircle,
  "chevron-down": ChevronDown,
  "chevron-right": ChevronRight,
  clock: Clock,
  "credit-card": CreditCard,
  crosshair: Crosshair,
  "dollar-sign": DollarSign,
  "edit-2": Pencil,
  grid: LayoutGrid,
  hash: Hash,
  heart: Heart,
  home: Home,
  inbox: Inbox,
  info: Info,
  "log-out": LogOut,
  "map-pin": MapPin,
  navigation: Navigation,
  radio: Radio,
  search: Search,
  shield: Shield,
  star: Star,
  tag: Tag,
  tool: Wrench,
  "trending-up": TrendingUp,
  user: User,
  users: Users,
  "wifi-off": WifiOff,
  x: X,
  zap: Zap,
} as const;

type IconName = keyof typeof iconMap;

export type IconProps = {
  name: IconName | string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: object;
};

export function Icon({ name, size = 24, color = "#000", strokeWidth = 2 }: IconProps) {
  const LucideIcon = iconMap[name as IconName];
  if (!LucideIcon) return null;
  return <LucideIcon size={size} color={color} strokeWidth={strokeWidth} />;
}
