'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // 라우팅용
import { useTranslation } from 'react-i18next';
import '../../../i18n';
import 'animate.css';
import Rectangle from '../components/Rectangle';
import { signIn } from 'next-auth/react'; // next-auth signIn 함수
import Button from '../components/Button';

export default function ForgetPasswordPage() {
  const { t, i18n } = useTranslation('common');
  const [isInitialized, setIsInitialized] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState(false); // 폼 유효성 상태
  const [emailError, setEmailError] = useState<string | null>(null); // 이메일 에러 상태
  const [passwordError, setPasswordError] = useState<string | null>(null); // 비밀번호 에러 상태
  const [touchedEmail, setTouchedEmail] = useState<boolean>(false);
  const [touchedPasswd, setTouchedPasswd] = useState<boolean>(false);
  const router = useRouter();

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 이메일 정규식
    const isEmailValid = emailRegex.test(email);
    const isPasswordValid = password.length >= 6; // 비밀번호 최소 6자리
    setIsFormValid(isEmailValid && isPasswordValid);
  };

  useEffect(() => {
    validateForm();
  }, [email, password]);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    setEmailError(null);
    setPasswordError(null);
  
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
  
      if (!result?.ok) {
        alert(t('InvalidEmailOrPassword')); // 에러 메시지 알림으로 표시

        return;
      }
  
      // 성공 시 페이지 이동
      router.push('/chat');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  useEffect(()=>{
    if(!touchedEmail ){
      setTouchedEmail(true)
    }else{
      if (email === '') {
        setEmailError(t('EnterEmail')); // 번역 메시지 사용
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setEmailError(t('InvalidEmail'));
      }else {
        setEmailError(null);
      }
    }
   
  },[email])

  useEffect(()=>{
    if(!touchedPasswd){
      setTouchedPasswd(true);
    }else{
      if (password === '') {
        setPasswordError(t('EnterPassword')); // 번역 메시지 사용
      } else if (password.length < 6) {
        setPasswordError(t('PasswordTooShort'));
      }else {
        setPasswordError(null);
      }
    }
    
  },[password])

  useEffect(() => {
    if (i18n.isInitialized) {
      setIsInitialized(true);
    } else {
      const handleInitialized = () => setIsInitialized(true);
      i18n.on('initialized', handleInitialized);
      return () => {
        i18n.off('initialized', handleInitialized);
      };
    }
  }, [i18n]);

  if (!isInitialized) return null;

  return (
    <div 
    className="h-screen flex items-center justify-center animate__animated animate__fadeInUp"
    style={{ animationDuration: '2s' }}
    >
      <Rectangle 
        className="md:w-[620px]  w-[80%]  md:rounded-[40px] rounded-[20px] bg-transparent border border-white border-2 md:border-4 opacity-100 flex flex-col"
        classNameBg="md:rounded-[40px] rounded-[30px] opacity-0"
      >

       
        <div className="flex-1 flex flex-col justify-center items-center md:m-16 m-4">
          
          <h2 className="text-2xl md:text-4xl font-bold mb-6 text-white mb-12">{t('FindPassword')}</h2>

          {/* 이메일 입력란 */}
          <div className='w-full mb-4'>
            <div className='text-sm mb-1'>{t('Email')}</div>
            
            <input
              type="email"
              placeholder=""
              value={email}
              onChange={(e) => setEmail(e.target.value)} // 상태 업데이트
              className="w-full md:px-4 px-2  md:py-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-customPurple focus:outline-none focus:ring-2 focus:ring-customLightPurple "
            />
            {/* 이메일 입력란 아래 에러 메시지 */}
            {emailError && <div className="text-xs text-red-500 mt-1">{emailError}</div>} 
          </div>
          
         
           {/* 로그인 버튼 */}
           <Button
            onClick={handleLogin}
            loading={loading}
            disabled={!isFormValid || loading} // 폼이 유효하지 않거나 로딩 중일 때 비활성화
            size='md'
            className={`w-full justify-center hidden md:flex`}
          >
            {loading ? <div>{t('Signin')}</div> : <div>{t('Signin')}</div>}
          </Button>

          {/* 로그인 버튼 - 모바일*/}
          <Button
            onClick={handleLogin}
            loading={loading}
            disabled={!isFormValid || loading} // 폼이 유효하지 않거나 로딩 중일 때 비활성화
            size='sm'
            className={`w-full justify-center md:hidden`}
          >
            {loading ? <div>{t('Signin')}</div> : <div>{t('Signin')}</div>}
          </Button>

        </div>
      </Rectangle>
    </div>
  );
}
