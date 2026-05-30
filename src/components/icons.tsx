"use client";

import {
  Check, ChevronRight, Bell, Plus, Moon, MoonStar, Flame, Dumbbell,
  AlertTriangle, Clock, Calendar, Sunrise, Utensils, PenLine,
  ArrowUp, ArrowDown, Heart, Drama, Store, Sun, Code, BookText,
  HeartPulse, Folders, LayoutGrid, Target, Zap, Home, Scale,
  Wind, MessageSquare, Settings, type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  check: Check,
  chevron: ChevronRight,
  bell: Bell,
  plus: Plus,
  moon: Moon,
  prayer: MoonStar,
  flame: Flame,
  dumbbell: Dumbbell,
  alert: AlertTriangle,
  clock: Clock,
  calendar: Calendar,
  sunrise: Sunrise,
  utensils: Utensils,
  pen: PenLine,
  arrowUp: ArrowUp,
  arrowDown: ArrowDown,
  heart: Heart,
  drama: Drama,
  store: Store,
  sun: Sun,
  code: Code,
  book: BookText,
  health: HeartPulse,
  projects: Folders,
  today: LayoutGrid,
  target: Target,
  energy: Zap,
  home: Home,
  scale: Scale,
  wind: Wind,
  message: MessageSquare,
  settings: Settings,
};

export function Icon({
  name, size = 18, stroke = 1.6, style,
}: { name: string; size?: number; stroke?: number; style?: React.CSSProperties }) {
  const Cmp = MAP[name] ?? Heart;
  return <Cmp size={size} strokeWidth={stroke} style={style} />;
}

export const projectIconMap: Record<string, LucideIcon> = { Heart, Drama, Store };
