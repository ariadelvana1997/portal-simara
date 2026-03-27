// @/lib/themes.ts
export const themes: any = {
  default: {
    name: "Classic Blue",
    primary: "#3C50E0",
    modes: {
      light: { bg: "bg-gray-50", sidebar: "bg-white", header: "bg-white", text: "text-gray-900", textMuted: "text-gray-500", border: "border-gray-200", hover: "hover:bg-gray-100", card: "bg-white", input: "bg-gray-500/5", radius: "rounded-xl" },
      dark: { bg: "bg-[#0a0a0a]", sidebar: "bg-[#161616]", header: "bg-[#161616]", text: "text-gray-100", textMuted: "text-gray-500", border: "border-[#262626]", hover: "hover:bg-white/5", card: "bg-[#161616]", input: "bg-white/5", radius: "rounded-xl" },
      read: { bg: "bg-[#F4ECD8]", sidebar: "bg-[#EFE5CD]", header: "bg-[#EFE5CD]", text: "text-[#5B4636]", textMuted: "text-[#8C7662]", border: "border-[#E2D1B3]", hover: "hover:bg-[#E8D9B5]", card: "bg-[#F9F3E5]", input: "bg-[#5B4636]/5", radius: "rounded-xl" }
    }
  },
  emerald: {
    name: "Emerald Forest",
    primary: "#10b981",
    modes: {
      light: { bg: "bg-[#f0f9f4]", sidebar: "bg-white", header: "bg-white", text: "text-[#064e3b]", textMuted: "text-emerald-600/60", border: "border-emerald-100", hover: "hover:bg-emerald-50", card: "bg-white", input: "bg-emerald-50", radius: "rounded-[2rem]" },
      dark: { bg: "bg-[#022c22]", sidebar: "bg-[#064e3b]", header: "bg-[#064e3b]", text: "text-emerald-50", textMuted: "text-emerald-400/50", border: "border-emerald-800", hover: "hover:bg-emerald-800/40", card: "bg-[#064e3b]", input: "bg-[#022c22]", radius: "rounded-[2rem]" },
      read: { bg: "bg-[#f1f5f1]", sidebar: "bg-[#e2ede2]", header: "bg-[#e2ede2]", text: "text-[#2d3a2d]", textMuted: "text-emerald-800/40", border: "border-[#d1dfd1]", hover: "hover:bg-[#d9e6d9]", card: "bg-[#f8faf8]", input: "bg-[#f1f5f1]", radius: "rounded-[2rem]" }
    }
  },

  // --- TEMA BARU: COKLAT ---
  espresso: {
    name: "Espresso Royale",
    primary: "#795548",
    modes: {
      light: { bg: "bg-[#FDFBFA]", sidebar: "bg-white", header: "bg-white", text: "text-[#3E2723]", textMuted: "text-[#8D6E63]", border: "border-[#D7CCC8]", hover: "hover:bg-[#EFEBE9]", card: "bg-white", input: "bg-[#795548]/5", radius: "rounded-[2rem]" },
      dark: { bg: "bg-[#1B1412]", sidebar: "bg-[#2D221F]", header: "bg-[#2D221F]", text: "text-[#D7CCC8]", textMuted: "text-[#8D6E63]", border: "border-[#4E342E]", hover: "hover:bg-[#3E2723]", card: "bg-[#2D221F]", input: "bg-[#1B1412]", radius: "rounded-[2rem]" },
      read: { bg: "bg-[#EFEBE9]", sidebar: "bg-[#D7CCC8]", header: "bg-[#D7CCC8]", text: "text-[#3E2723]", textMuted: "text-[#5D4037]", border: "border-[#BCAAA4]", hover: "hover:bg-[#D7CCC8]", card: "bg-[#F5F5F5]", input: "bg-[#3E2723]/5", radius: "rounded-[2rem]" }
    }
  },

  // --- TEMA BARU: PINK ---
  sakura: {
    name: "Sakura Dream",
    primary: "#EC4899",
    modes: {
      light: { bg: "bg-[#FFF5F8]", sidebar: "bg-white", header: "bg-white", text: "text-[#500724]", textMuted: "text-[#9D174D]", border: "border-[#FCE7F3]", hover: "hover:bg-[#FDF2F8]", card: "bg-white", input: "bg-[#EC4899]/5", radius: "rounded-[2rem]" },
      dark: { bg: "bg-[#1A0610]", sidebar: "bg-[#2D0C1D]", header: "bg-[#2D0C1D]", text: "text-[#FCE7F3]", textMuted: "text-[#701A41]", border: "border-[#701A41]", hover: "hover:bg-[#500724]", card: "bg-[#2D0C1D]", input: "bg-[#1A0610]", radius: "rounded-[2rem]" },
      read: { bg: "bg-[#FFF1F2]", sidebar: "bg-[#FFE4E6]", header: "bg-[#FFE4E6]", text: "text-[#881337]", textMuted: "text-[#BE123C]", border: "border-[#FECDD3]", hover: "hover:bg-[#FFE4E6]", card: "bg-[#FFFBFB]", input: "bg-[#881337]/5", radius: "rounded-[2rem]" }
    }
  },

  // --- TEMA BARU: UNGU ---
  amethyst: {
    name: "Midnight Amethyst",
    primary: "#8B5CF6",
    modes: {
      light: { bg: "bg-[#F5F3FF]", sidebar: "bg-white", header: "bg-white", text: "text-[#2E1065]", textMuted: "text-[#6D28D9]", border: "border-[#EDE9FE]", hover: "hover:bg-[#F3E8FF]", card: "bg-white", input: "bg-[#8B5CF6]/5", radius: "rounded-[2rem]" },
      dark: { bg: "bg-[#0F071B]", sidebar: "bg-[#1E1135]", header: "bg-[#1E1135]", text: "text-[#EDE9FE]", textMuted: "text-[#4C1D95]", border: "border-[#4C1D95]", hover: "hover:bg-[#2E1065]", card: "bg-[#1E1135]", input: "bg-[#0F071B]", radius: "rounded-[2rem]" },
      read: { bg: "bg-[#F3F1FF]", sidebar: "bg-[#E0E7FF]", header: "bg-[#E0E7FF]", text: "text-[#312E81]", textMuted: "text-[#4338CA]", border: "border-[#C7D2FE]", hover: "hover:bg-[#E0E7FF]", card: "bg-[#F9F9FF]", input: "bg-[#312E81]/5", radius: "rounded-[2rem]" }
    }
  }
};