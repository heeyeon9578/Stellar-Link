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

export default function LoginPage() {
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
    className="h-screen flex items-center justify-center animate__animated animate__fadeIn"
    style={{ animationDuration: '2s' }}
    >
      <Rectangle 
        className="md:w-[690px] md:h-[85%] w-[80%] h-[70vh] md:rounded-[40px] rounded-[20px] bg-transparent border border-white border-2 md:border-4 opacity-100 flex flex-col"
        classNameBg="md:rounded-[40px] rounded-[30px] opacity-0"
      >

       
        <div className="flex-1 flex flex-col justify-center items-center md:m-16 m-4">
          
          <h2 className="text-2xl md:text-4xl font-bold mb-6 text-white mb-12">{t('Login')}</h2>

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
          
          {/* 비밀번호 입력란 */}
          <div className='w-full'>
            <div className='text-sm mb-1'>{t('Password')}</div>
            <div className="w-full relative mb-1">
              <input
                type={passwordVisible ? 'text' : 'password'}
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)} // 상태 업데이트
                className="w-full md:px-4 px-2  md:py-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-customPurple focus:outline-none focus:ring-2 focus:ring-customLightPurple"
              />
             

              <button
                onClick={() => setPasswordVisible(!passwordVisible)}
                className={`absolute inset-y-0 right-4 flex items-center text-customPurple
              text-xs md:text-sm
              bg-transparent 
              hover:decoration-customPurple
              hover:text-underline-offset-4
              hover:!bg-gradient-to-r hover:!from-customPurple hover:!to-customLightPurple hover:bg-clip-text  bg-clip-text hover:text-transparent
              transition-all duration-300
              
            `}
              >
                {passwordVisible ? <div>{t('Hide')}</div> : <div>{t('Show')}</div>}

              </button>
               
            </div>
              {/* 비밀번호 입력란 아래 에러 메시지 */}
              {passwordError && <div className="text-xs text-red-500 mt-1">{passwordError}</div>}
              {/* 비밀번호를 잃어버렸나요 버튼 */}
            <button
              className="
              mb-8 text-xs justify-start items-start text-white
              bg-transparent text-white
              hover:decoration-customPurple
              hover:!bg-gradient-to-r hover:!from-customPurple hover:!to-customLightPurple hover:bg-clip-text  bg-clip-text hover:text-transparent
              transition-all duration-300
              "
            
              onClick={() => alert('Password recovery process')}
            >
              {t('ForgetPassword')}
            </button>
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

          <div className='md:m-8 m-4  text-xs'>{t('orcontinuewith')}</div>

          {/* 소셜 로그인 버튼 */}
          <div className="w-full flex flex-row space-x-4">
            <button
              className="w-full py-1.5 md:py-2.5 text-white bg-white rounded-lg text-sm font-medium flex justify-center items-center focus:outline-none focus:ring-2 focus:ring-customLightPurple"
              onClick={() => signIn('google', { callbackUrl: '/chat' })}
            >
             <Image
                src="/SVG/google.svg"
                alt="Logo"
                width={24}
                height={24}
                priority
                className="cursor-pointer"
              />

            </button>
            <button
              className="w-full py-1.5 md:py-2.5 text-white bg-white rounded-lg text-sm font-medium flex justify-center items-center focus:outline-none focus:ring-2 focus:ring-customLightPurple"
              onClick={() => signIn('github', { callbackUrl: '/chat' })}
            >
              <Image
                src="/SVG/github.svg"
                alt="Logo"
                width={24}
                height={24}
                priority
                className="cursor-pointer"
              />
            </button>
            <button
              className="w-full py-1.5 md:py-2.5 text-white bg-white rounded-lg text-sm font-medium flex justify-center items-center focus:outline-none focus:ring-2 focus:ring-customLightPurple"
              onClick={() => signIn('discord', { callbackUrl: '/chat' })}
            >
              <div className='w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center'>
                <Image
                  src="/SVG/DiscordMark.svg"
                  alt="Logo"
                  width={16}
                  height={16}
                  priority
                  className="cursor-pointer"
                />
              </div>
            </button>
          </div>


          <div className='md:m-8 m-4 text-xs flex items-center justify-center flex-wrap'>
            <div>{t('Donthaveanaccountyet')}</div>

            <div className='cursor-pointer font-bold ml-2 text-xs text-white
              bg-transparent text-white
              hover:decoration-customPurple
              hover:!bg-gradient-to-r hover:!from-customPurple hover:!to-customLightPurple hover:bg-clip-text  bg-clip-text hover:text-transparent
              transition-all duration-300'
             onClick={()=>{// 로그인 성공 시 리디렉트
              router.push('/signup');
            }}
              >{t('Registerforfree')}</div>
          </div>
        </div>
      </Rectangle>
    </div>
  );
}
