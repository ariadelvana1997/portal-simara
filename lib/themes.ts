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
  }
};