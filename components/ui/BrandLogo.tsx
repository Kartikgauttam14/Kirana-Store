import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Path, Rect, Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg';

interface BrandLogoProps {
  size?: number;
  style?: ViewStyle;
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * Kirana-AI Brand Logo - Hybrid (Concept 2 + 5)
 * A grain-shaped shopping bag with a dynamic pulse handle and digital pixel cutouts.
 * Represents 'Organic Intelligence' and 'Modern Grocery Efficiency'.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 120,
  style,
  primaryColor = '#FF6B00', // Kirana Orange
  secondaryColor = '#0984E3' // Tech Blue
}) => {
  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Defs>
          <LinearGradient id="hybridGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={primaryColor} stopOpacity={1} />
            <Stop offset="100%" stopColor="#FFC312" stopOpacity={1} />
          </LinearGradient>
        </Defs>
        
        {/* Grain-Shaped Bag Body */}
        <Path 
          d="M60 80 C 60 80, 50 140, 100 170 C 150 140, 140 80, 140 80 L60 80 Z" 
          fill="url(#hybridGrad)" 
        />
        
        {/* Pulse Handle (from Concept 2) */}
        <Path 
          d="M75 80 C 75 40, 125 40, 125 80" 
          fill="none" 
          stroke={secondaryColor} 
          strokeWidth="8" 
          strokeLinecap="round"
        />
        <Path 
          d="M90 50 L100 40 L110 60 L120 50" 
          fill="none" 
          stroke="white" 
          strokeWidth="3" 
          strokeLinecap="round"
        />

        {/* Pixel Cutouts (from Concept 5) */}
        <Rect x="85" y="100" width="12" height="12" fill="white" fillOpacity="0.8" />
        <Rect x="103" y="100" width="12" height="12" fill="white" fillOpacity="0.4" />
        <Rect x="85" y="118" width="12" height="12" fill="white" fillOpacity="0.4" />
        <Rect x="103" y="118" width="12" height="12" fill="white" fillOpacity="0.8" />
      </Svg>
    </View>
  );
};

export default BrandLogo;
