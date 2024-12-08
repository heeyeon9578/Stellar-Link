// i18n.js
"use client";

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend'; // 백엔드 플러그인 추가
import { i18n as i18nConfig } from './next-i18next.config';

i18n
  .use(HttpBackend) // 백엔드 플러그인 추가
  .use(initReactI18next)
  .init({
    ...i18nConfig,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false, // React는 XSS 보호가 기본 적용되므로 설정하지 않음
    },
    backend: {
      loadPath: '/locales/{{lng}}/common.json', // 번역 파일 경로 설정
    },
  });

export default i18n;
