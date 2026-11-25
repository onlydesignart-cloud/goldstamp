// GoldStamp Mobile Customer App - Design Tokens & Theme

export const Colors = {
  // Brand Gold
  primary: '#F59E0B',        // Amber 500
  primaryLight: '#FBBF24',   // Amber 400
  primaryDark: '#D97706',    // Amber 600
  primarySubtle: '#FEF3C7',  // Amber 100
  primarySoft: '#FFFBEB',    // Amber 50

  // Sleek Obsidian & Neutrals
  obsidian: '#020617',       // Slate 950
  obsidianCard: '#0F172A',   // Slate 900
  obsidianMuted: '#1E293B',  // Slate 800
  
  // Surfaces & Backgrounds
  background: '#F8FAFC',     // Slate 50
  surface: '#FFFFFF',
  border: '#E2E8F0',         // Slate 200
  borderDark: '#334155',     // Slate 700

  // Typography
  textPrimary: '#0F172A',    // Slate 900
  textSecondary: '#64748B',  // Slate 500
  textMuted: '#94A3B8',      // Slate 400
  textInverse: '#FFFFFF',
  textGold: '#F59E0B',

  // Status & Feedback
  success: '#10B981',        // Emerald 500
  successBg: '#ECFDF5',
  error: '#EF4444',          // Red 500
  errorBg: '#FEF2F2',
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  goldGlow: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
};
