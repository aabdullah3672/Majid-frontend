import {
  Laptop,
  Smartphone,
  Headphones,
  Gamepad2,
  Camera,
  Watch,
  Tv,
  Briefcase,
  Box,
  Speaker,
  Plug,
  Battery,
  Grid2x2,
  ShoppingBag,
  Wifi,
  Monitor,
  Keyboard,
  Mouse,
  Usb,
  Cable
} from "lucide-react";

/**
 * Map of icon names (from DB) to Lucide components.
 * Admin sets icon name in PascalCase when creating/editing categories.
 * Add new entries here as you add categories.
 */
const iconMap = {
  Laptop,
  Smartphone,
  Headphones,
  Gamepad2,
  Camera,
  Watch,
  Tv,
  Briefcase,
  Box,
  Speaker,
  Plug,
  Battery,
  Grid2x2,
  ShoppingBag,
  Wifi,
  Monitor,
  Keyboard,
  Mouse,
  Usb,
  Cable,
  // lowercase aliases for backward compat
  laptop: Laptop,
  smartphone: Smartphone,
  headphones: Headphones,
  gamepad: Gamepad2,
  camera: Camera,
  watch: Watch,
  tv: Tv,
  briefcase: Briefcase,
  box: Box,
  speaker: Speaker,
  charger: Plug,
  battery: Battery,
  grid: Grid2x2
};

/**
 * Renders a Lucide icon dynamically based on the category's `icon` field.
 * Falls back to Grid2x2 if not found.
 */
export default function CategoryIcon({ name, size = 20, ...props }) {
  const IconComponent = iconMap[name] || Grid2x2;
  return <IconComponent size={size} {...props} />;
}
