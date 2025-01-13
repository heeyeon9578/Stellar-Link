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
        customGray:"#BEBFD3",
        customBlue:"#030391",
        blue200: "#BFDBFE", // 동적으로 사용될 색상 추가
        green200: "#C6F6D5", // 예시로 추가된 색상
        yellow200: "#FEF9C3",
        pink200: "#FBCFE8",
        purple200: "#D8B4FE",
        blue500:"#3B82F6",
        green500:"#10B981",
        yellow500:"#F59E0B",
        pink500:"#EC4899",
        themePink:"#91034F",
        themeYellow: "#9F7000",
        themeGreen: "#4E5B02",
        themeBlue:"#030391",
        themeDarkBlue:"#02025B",
        themeBlack:"#01012B"

      },
      safelist: [
        {
          pattern: /(bg|border)-(customRectangle|blue200|green200|yellow200|pink200|purple200)/,
        },
      ],
      borderRadius: {
        'custom': '20px', // 20px의 사용자 정의 라운드 값
        'custom-myChat': '16px 0 16px 16px', // 커스텀 border-radius,
        'custom-otherChat': '0  16px 16px 16px', // 커스텀 border-radius
      },
      boxShadow: {
        custom: '0px 4px 4px rgba(0, 0, 0, 0.25)', // 사용자 정의 그림자
      },
      fontFamily: {
        english: ['Kaisei Decol', 'sans-serif'], // 기본 영어 폰트 설정
        korean: ['Gyeonggi_Batang_Regular', 'Malgun Gothic', 'sans-serif'], // 한글 폰트 설정
        spanish: ['Kaisei Decol', 'sans-serif'],
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
