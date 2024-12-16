import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    './src/styles/tailwind-utilities.css', // 스타일 파일
    './src/**/*.{js,ts,jsx,tsx}', // 컴포넌트 경로
    './public/index.html', // HTML 파일 경로
  ],
  theme: {
    extend: {
      screens: {
        'between-lg-md': { min: '720px', max: '1444px' },
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        customPurple: '#7158E2', // 원하는 색상 추가
        customLightPurple: '#CD84F1', // 추가 색상
        customRectangle:"#F4F4F7",
        customGray:"#BEBFD3"
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
      backdropFilter: {
        none: 'none',
        blur: 'blur(12.5px)', // 블러 값 추가
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
