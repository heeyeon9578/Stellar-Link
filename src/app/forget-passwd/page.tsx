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
import DynamicText from '../components/DynamicText';

export default function ForgetPasswordPage() {
  const { t, i18n } = useTranslation('common');
  const [isInitialized, setIsInitialized] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordConfirmVisible, setPasswordConfirmVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName]  = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState(false); // 폼 유효성 상태
  const [emailError, setEmailError] = useState<string | null>(null); // 이메일 에러 상태
  const [passwordError, setPasswordError] = useState<string | null>(null); // 비밀번호 에러 상태
  const [passwordConfirmError, setPasswordConfirmError] = useState<string | null>(null); // 비밀번호 에러 상태
  const [touchedEmail, setTouchedEmail] = useState<boolean>(false);
  const [touchedPasswd, setTouchedPasswd] = useState<boolean>(false);
  const [touchedPasswdCf, setTouchedPasswdCf] = useState<boolean>(false);
  const [isEmailConfirmed , setIsEmailConfirmed] = useState<boolean>(false);
  const [isCodeSend,setIsCodeSend] = useState(false);
  const [code, setCode] = useState('');
  const router = useRouter();

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 이메일 정규식
    const isEmailValid = emailRegex.test(email);
    const isPasswordValid = validatePassword(password); // 비밀번호 규칙 검사
    const isPasswordConfirmValid = (password === passwordConfirm) && validatePassword(passwordConfirm); // 비밀번호 일치 검사
    setIsFormValid(isEmailValid && isPasswordValid && isPasswordConfirmValid);
  };

  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/;
    return passwordRegex.test(password);
  };
  
  
  useEffect(() => {
    validateForm();
  }, [email, password, passwordConfirm]);

  const handleFindPw = async () => {
    setLoading(true);
    setError(null);
    setEmailError(null);
    setPasswordError(null);
    setPasswordConfirmError(null);
  
    try {
      // 서버로 사용자 데이터 전송
      const response = await fetch('/api/auth/find-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          passwordConfirm, // 비밀번호 확인 필드 추가
        }),
      });
  
      if (!response.ok) {
        // 서버에서 에러 메시지 반환 시 처리
        const data = await response.json();
        alert(t('Cpf'));
      }
  
      // 회원가입 성공 처리
      alert(t('Cps'));
      router.push('/login'); // 로그인 페이지로 이동
    } catch (err: any) {
      // 에러 처리
      console.error(err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      // 로딩 상태 종료
      setLoading(false);
    }
  };
  
  

  const handleSendAuthNum = async () => {
    setLoading(true);
    setError(null);
  
    try {
      const response = await fetch('/api/send-code-find-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
  
      if (!response.ok) {
        const data = await response.json();
        alert(t('Ftsvc') );
      }else{
        alert(t('vcs')); // Verification code sent
        setIsCodeSend(true);
      }
  
      
    } catch (err: any) {
      if (err.message === 'Email is not registered') {
        alert(t('EmailNotRegistered')); // 가입되지 않은 이메일
      } else {
        alert(t('ftsvc')); // Failed to send verification code
      }
      setIsCodeSend(false);
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    const response = await fetch('/api/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    if (response.ok) {
      setIsEmailConfirmed(true);
      alert(t('vs'));
    } else {
      alert(t('ic'));
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

  useEffect(() => {
    if (!touchedPasswd) {
      setTouchedPasswd(true);
    } else {
      if (password === '') {
        setPasswordError(t('EnterPassword')); // 번역 메시지 사용
      } else if (!validatePassword(password)) {
        setPasswordError(t('PasswordInvalid')); // 새로운 비밀번호 규칙 에러 메시지
      } else {
        setPasswordError(null);
      }
    }
  }, [password]);

  useEffect(() => {
    if (passwordConfirm !== password) {
      setPasswordConfirmError(t('PasswordNotMatch'));
    } else {
      setPasswordConfirmError(null);
    }
  }, [password, passwordConfirm]);

  useEffect(()=>{
    if(!touchedPasswdCf){
      setTouchedPasswdCf(true);
    }else{
      if (passwordConfirm === '') {
        setPasswordConfirmError(t('EnterPassword')); // 번역 메시지 사용
      } else if (!validatePassword(passwordConfirm)) {
        setPasswordConfirmError(t('PasswordInvalid')); // 새로운 비밀번호 규칙 에러 메시지
      }else {
        setPasswordConfirmError(null);
      }
    }
    
  },[passwordConfirm])

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
        className="md:w-[620px]  w-[80%]  md:rounded-[40px] rounded-[20px] bg-transparent border border-white border-2 md:border-4 opacity-100 flex flex-col"
        classNameBg="md:rounded-[40px] rounded-[30px] opacity-0"
      >

       
        <div className="flex-1 flex flex-col justify-center items-center md:m-16 m-4">
          
          <h2 className="text-2xl md:text-4xl font-bold mb-6 text-white mb-12"><DynamicText text={t('FindPassword')}/></h2>

          {/* 이메일 입력란 */} 
          <div className='w-full mb-4'>
            <div className='text-sm mb-1'><DynamicText text={t('Email')}/></div>
            
            <div className='flex space-x-4'>
            <input
              disabled={isCodeSend}
              type="email"
              placeholder=""
              value={email}
              onChange={(e) => setEmail(e.target.value)} // 상태 업데이트
              className="w-[80%] md:px-4 px-2  md:py-3 py-2 text-sm bg-white border border-gray-300 
              rounded-lg text-customPurple focusDefault
              disabled:bg-gray-300 disabled:cursor-not-allowed
              "
            />

            {/* 인증 번호 전송 */}
          <Button
            onClick={handleSendAuthNum}
            loading={loading}
            disabled={!(!emailError )|| loading} // 폼이 유효하지 않거나 로딩 중일 때 비활성화
            size='sm'
            className={`justify-center`}
          >
            {loading ? <div></div> : <div><DynamicText text={t('Send')}/></div>}
          </Button>
            </div>
            {/* 이메일 입력란 아래 에러 메시지 */}
            {emailError && <div className="text-xs text-red-500 mt-1">{emailError}</div>} 
          </div>

          

          {/* 코드 전송 후 입력 칸 */}      
          {isCodeSend &&(
            <div>
              <div className='w-full mb-4'>
                <div className='text-sm mb-1'><DynamicText text={t('Code')}/></div>

                <div className='flex space-x-4'>
                  <input
                    type="default"
                    placeholder=""
                    value={code}
                    onChange={(e) => setCode(e.target.value)} // 상태 업데이트
                    className="w-full md:px-4 px-2  md:py-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-customPurple focusDefault "
                  />

                  {/* 인증 번호 확인 */}
                  <Button
                    onClick={verifyCode}
                    loading={loading}
                    disabled={ !code || loading} // 폼이 유효하지 않거나 로딩 중일 때 비활성화
                    size='sm'
                    className={`w-full justify-center`}
                  >
                    {loading ? <div></div> : <div><DynamicText text={t('Confirm')}/></div>}
                  </Button>

                </div>
                {/* 이메일 입력란 아래 에러 메시지 */}
                {emailError && <div className="text-xs text-red-500 mt-1">{emailError}</div>} 
              </div>

              
            </div>
          )}

          {/* 이메일 인증 후 비밀번호, 비밀번호 확인 */}
          {isEmailConfirmed && (
              <>
              {/* 이름 입력란 */} 
                <div className='w-full mb-4'>
                  <div className='text-sm mb-1'><DynamicText text={t('Name')}/></div>
                  <div className='flex space-x-4'>
                  <input
                    type="default"
                    placeholder=""
                    value={name}
                    onChange={(e) => setName(e.target.value)} // 상태 업데이트
                    className="w-full md:px-4 px-2  md:py-3 py-2 text-sm bg-white border border-gray-300 
                    rounded-lg text-customPurple focusDefault
                    disabled:bg-gray-300 disabled:cursor-not-allowed
                    "
                  />
                  </div>
                </div>

                {/* 비밀번호 입력란 */}
                <div className='w-full'>
                <div className='text-sm mb-1'><DynamicText text={t('Password')}/></div>
                <div className="w-full relative mb-1">
                  <input
                    type={passwordVisible ? 'text' : 'password'}
                    placeholder=""
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} // 상태 업데이트
                    className="w-full md:px-4 px-2  md:py-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-customPurple focusDefault"
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
                    {passwordVisible ? <div><DynamicText text={t('Hide')}/></div> : <div><DynamicText text={t('Show')}/></div>}
                    
                  </button>
                    
                </div>
                  {/* 비밀번호 입력란 아래 에러 메시지 */}
                  {passwordError && <div className="text-xs text-red-500 mt-1">{passwordError}</div>}
           
                    
              </div>

               {/* 비밀번호 확인 입력란 */}
               <div className='w-full'>
                <div className='text-sm mb-1'><DynamicText text={t('PasswordConfirm')}/></div>
                <div className="w-full relative mb-1">
                  <input
                    type={passwordConfirmVisible ? 'text' : 'password'}
                    placeholder=""
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)} // 상태 업데이트
                    className="w-full md:px-4 px-2  md:py-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-customPurple focusDefault"
                  />


                  <button
                    onClick={() => setPasswordConfirmVisible(!passwordConfirmVisible)}
                    className={`absolute inset-y-0 right-4 flex items-center text-customPurple
                  text-xs md:text-sm
                  bg-transparent 
                  hover:decoration-customPurple
                  hover:text-underline-offset-4
                  hover:!bg-gradient-to-r hover:!from-customPurple hover:!to-customLightPurple hover:bg-clip-text  bg-clip-text hover:text-transparent
                  transition-all duration-300
                    
                `}
                  >
                    {passwordConfirmVisible ? <div><DynamicText text={t('Hide')}/></div> : <div><DynamicText text ={t('Show')}/></div>}
                    
                  </button>
                    
                </div>
                  {/* 비밀번호 입력란 아래 에러 메시지 */}
                  {passwordConfirmError && <div className="text-xs text-red-500 mt-1">{passwordConfirmError}</div>}
           
                    
              </div>     
                    
               {/* 로그인 버튼 */}
               <Button
                onClick={handleFindPw}
                loading={loading}
                disabled={!isFormValid || loading} // 모든 폼 유효성 검사에 통과해야만 활성화
                size='md'
                className={`w-full justify-center hidden md:flex mt-4`}
              >
                {loading ? <div></div> : <div><DynamicText text={t('Confirm')}/></div>}
              </Button>
                    
              {/* 로그인 버튼 - 모바일*/}
              <Button
                onClick={handleFindPw}
                loading={loading}
                disabled={!isFormValid || loading} // 모든 폼 유효성 검사에 통과해야만 활성화
                size='sm'
                className={`w-full justify-center md:hidden mt-2`}
              >
                {loading ? <div></div> : <div><DynamicText text={t('Confirm')}/></div>}
              </Button></>
          )}

          <div className='md:m-8 m-4  text-xs'><DynamicText text={t('orcontinuewith')}/></div>

          {/* 소셜 로그인 버튼 */}
          <div className="w-full flex flex-row space-x-4">
            <button
              className="w-full py-1.5 md:py-2.5 text-white bg-white rounded-lg text-sm font-medium flex justify-center items-center focusDefault"
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


          
        </div>
      </Rectangle>
    </div>
  );
}
