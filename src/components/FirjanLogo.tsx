import React from 'react';

interface FirjanLogoProps {
  className?: string;
  classNameText?: string;
  showSubText?: boolean;
}

export const FirjanLogo: React.FC<FirjanLogoProps> = ({
  className = "h-12 w-auto",
  classNameText = "text-white",
  showSubText = true
}) => {
  return (
    <svg 
      viewBox="0 0 320 120" 
      className={`${className} ${classNameText}`} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      id="firjan_vector_logo"
    >
      {/* "Firjan" Wordmark */}
      <text 
        x="10" 
        y="55" 
        className="font-sans font-extrabold select-none" 
        fontSize="54" 
        letterSpacing="-2" 
        fill="currentColor"
        id="firjan_text_wordmark"
      >
        Firjan
      </text>

      {/* Parallel wave stripes mimicking the official Firjan waving ribbon */}
      <path 
        d="M 90,72 C 115,66 140,78 165,72 C 190,66 198,68 206,70" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinecap="round" 
        fill="none"
        id="firjan_wave_stripe_1"
      />
      <path 
        d="M 90,88 C 115,82 140,94 165,88 C 190,82 198,84 206,86" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinecap="round" 
        fill="none"
        id="firjan_wave_stripe_2"
      />
      <path 
        d="M 90,104 C 115,98 140,110 165,104 C 190,98 198,100 206,102" 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinecap="round" 
        fill="none"
        id="firjan_wave_stripe_3"
      />

      {/* Corporate entities stacked on the right side */}
      {showSubText && (
        <g className="font-sans font-black select-none" fontSize="16" letterSpacing="0.5" fill="currentColor" id="firjan_subtext_entities">
          <text x="215" y="47">SENAI</text>
          <text x="215" y="67">SESI</text>
          <text x="215" y="87">IEL</text>
          <text x="215" y="107">CIRJ</text>
        </g>
      )}
    </svg>
  );
};
