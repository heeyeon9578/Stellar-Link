import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        customPurple: '#7158E2', // 원하는 색상 추가
        customLightPurple: '#CD84F1', // 추가 색상
      },
      borderRadius: {
        'custom': '20px', // 20px의 사용자 정의 라운드 값
      },
      boxShadow: {
        custom: '0px 4px 4px rgba(0, 0, 0, 0.25)', // 사용자 정의 그림자
      },
      fontFamily: {
        sans: ['Kaisei Decol', 'sans-serif'], // 기본 Sans-serif 폰트 설정
      },
      keyframes: {
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
  ],
} satisfies Config;
