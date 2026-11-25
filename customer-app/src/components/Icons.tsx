import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const WalletIcon: React.FC<IconProps> = ({ size = 22, color = '#000000', strokeWidth = 1.8 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="2"
      y="5"
      width="20"
      height="14"
      rx="3"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <Path
      d="M16 12H19"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Path
      d="M2 9H22"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

export const RewardsIcon: React.FC<IconProps> = ({ size = 22, color = '#000000', strokeWidth = 1.8 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 12V20H4V12"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2 7H22V12H2V7Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 20V7"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Path
      d="M12 7H7.5C6.11929 7 5 5.88071 5 4.5C5 3.11929 6.11929 2 7.5 2C9.5 2 12 7 12 7Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 7H16.5C17.8807 7 19 5.88071 19 4.5C19 3.11929 17.8807 2 16.5 2C14.5 2 12 7 12 7Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ScanIcon: React.FC<IconProps> = ({ size = 22, color = '#000000', strokeWidth = 1.8 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 8V5C4 4.44772 4.44772 4 5 4H8"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Path
      d="M16 4H19C19.5523 4 20 4.44772 20 5V8"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Path
      d="M20 16V19C20 19.5523 19.5523 20 19 20H16"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Path
      d="M8 20H5C4.44772 20 4 19.5523 4 19V16"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Path
      d="M4 12H20"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

export const VenuesIcon: React.FC<IconProps> = ({ size = 22, color = '#000000', strokeWidth = 1.8 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="12"
      cy="12"
      r="9"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <Path
      d="M15.5 8.5L13.5 13.5L8.5 15.5L10.5 10.5L15.5 8.5Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ProfileIcon: React.FC<IconProps> = ({ size = 22, color = '#000000', strokeWidth = 1.8 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="12"
      cy="8"
      r="4"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <Path
      d="M5 20C5 16.6863 8.13401 14 12 14C15.866 14 19 16.6863 19 20"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size = 18, color = '#000000', strokeWidth = 1.8 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="11"
      cy="11"
      r="7"
      stroke={color}
      strokeWidth={strokeWidth}
    />
    <Path
      d="M16.5 16.5L21 21"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size = 16, color = '#000000', strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 13L9.5 17.5L19 7"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CloseIcon: React.FC<IconProps> = ({ size = 18, color = '#000000', strokeWidth = 1.8 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

export const PiggyBankSketchIcon: React.FC<IconProps> = ({ size = 64, color = '#64748B', strokeWidth = 1.8 }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {/* Body */}
    <Path
      d="M48 34C48 24.0589 39.9411 16 30 16C20.0589 16 12 24.0589 12 34C12 43.9411 20.0589 52 30 52C34.5 52 38.5 50.3 41.5 47.5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Snout */}
    <Path
      d="M48 28H52C54.2 28 56 29.8 56 32V36C56 38.2 54.2 40 52 40H48"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    {/* Snout Nostril */}
    <Circle cx="52" cy="34" r="1.5" fill={color} />
    {/* Eye */}
    <Circle cx="38" cy="27" r="2" fill={color} />
    {/* Ear */}
    <Path
      d="M32 16L35 9C35.5 8 37 8 38 9.5L41 18"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Coin slot */}
    <Path
      d="M26 13H34"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    {/* Coin dropping in */}
    <Circle cx="30" cy="7" r="4" stroke={color} strokeWidth={strokeWidth} />
    {/* Legs */}
    <Path
      d="M19 50V56C19 57.1 19.9 58 21 58H23C24.1 58 25 57.1 25 56V51"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Path
      d="M36 51V56C36 57.1 36.9 58 38 58H40C41.1 58 42 57.1 42 56V47"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    {/* Curly Tail */}
    <Path
      d="M12 34C9 34 8 30 10 28C12 26 13 29 10 31"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    {/* Happy Smile Arc */}
    <Path
      d="M34 38C35.5 40 38.5 40 40 38"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

export const SmileSketchIcon: React.FC<IconProps> = ({ size = 64, color = '#64748B', strokeWidth = 1.8 }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Circle cx="32" cy="32" r="26" stroke={color} strokeWidth={strokeWidth} />
    <Circle cx="23" cy="26" r="2.5" fill={color} />
    <Circle cx="41" cy="26" r="2.5" fill={color} />
    <Path
      d="M20 37C24 45 40 45 44 37"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M17 35C18 38 20 40 22 40"
      stroke={color}
      strokeWidth={strokeWidth * 0.8}
      strokeLinecap="round"
    />
    <Path
      d="M47 35C46 38 44 40 42 40"
      stroke={color}
      strokeWidth={strokeWidth * 0.8}
      strokeLinecap="round"
    />
  </Svg>
);
