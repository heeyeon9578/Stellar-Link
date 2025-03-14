'use client';
import React, { useRef, useEffect, useState ,Suspense} from 'react';
import { useSession ,signIn} from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import '../../../../i18n';
import Button from '@/app/components/Button';
import DynamicText from '../../../app/components/DynamicText';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ProfileContent() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { t, i18n } = useTranslation('common');
  const [isInitialized, setIsInitialized] = useState(false);
  const [file, setFile] = useState<File | null>(null); // 업로드할 파일 객체
  const [name, setName] = useState(session?.user?.name || '');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null); // 비밀번호 에러 상태
  const [passwordConfirmError, setPasswordConfirmError] = useState<string | null>(null); // 비밀번호 에러 상태
  const [profileImage, setProfileImage] = useState(session?.user?.profileImage || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false); // 폼 유효성 상태
  const [touchedPasswd, setTouchedPasswd] = useState<boolean>(false);
  const [touchedPasswdCf, setTouchedPasswdCf] = useState<boolean>(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordConfirmVisible, setPasswordConfirmVisible] = useState(false);
  const [wantPasswordChange, setWantPasswordChange] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated"&& !redirecting) {
      alert(t('SessionCheck'));
      setRedirecting(true); // 무한 루프 방지
      router.push('/'); // 세션이 없으면 홈으로 리디렉션
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      setIsInitialized(true);
    }
  }, [status]);

  const isSocialLogin =
    session?.user?.provider && ['google', 'discord', 'github'].includes(session.user.provider);

    const validatePassword = (password: string): boolean => {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/;
      return passwordRegex.test(password);
    };
    
    const validateForm = () => {
      const isPasswordValid = validatePassword(password); // 비밀번호 규칙 검사
      const isPasswordConfirmValid = (password === passwordConfirm) && validatePassword(passwordConfirm); // 비밀번호 일치 검사
      setIsFormValid(isPasswordValid && isPasswordConfirmValid);
    };
  
    useEffect(() => {
      validateForm();
    }, [ password, passwordConfirm]);

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

  if (!session) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <DynamicText text={t('accessprofile')} />
      </div>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setProfileImage(URL.createObjectURL(selectedFile)); // 미리보기 URL 설정
    }
  };
 

  const handleSubmit = async () => {
    setIsSubmitting(true);

    let uploadedUrl = profileImage; // 기본값으로 기존 이미지 사용

    try {
      // 이미지 파일이 선택된 경우 S3 업로드 진행
      if (file) {
        const filename = encodeURIComponent(file.name);
        const res = await fetch(`/api/post/image?file=${filename}`);
   
        if (!res.ok) {
          throw new Error('이미지 업로드 URL을 가져오는 데 실패했습니다.');
        }

        const data = await res.json();
    
        const formData = new FormData();
        Object.entries({...data.fields, file}).forEach(([key, value]) => {
          formData.append(key, value as string | Blob);
        });
       
        
        const uploadResult = await fetch(data.url, {
          method: 'POST',
          body: formData,
        });
  
        if (!uploadResult.ok) {
          console.error('S3 Upload Error:', uploadResult.status, uploadResult.statusText);
          throw new Error('이미지 업로드 실패');
        }
        

        // 업로드된 이미지 URL
        uploadedUrl = `${data.url}/${filename}`;
      }

      // 프로필 업데이트 API 호출
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user?.email,
          name,
          password: password || undefined,
          profileImage: uploadedUrl,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(t('Pus'));
        
        // **세션 정보 업데이트**
        await update({
          name,
          profileImage: uploadedUrl,
        });
      } else {
        alert(t('Ftup'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(t('Aeowup'));
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleImageChangeClick = () => {
    // 파일 입력 요소가 존재하면 클릭을 트리거
    fileInputRef.current?.click();
  };
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      const maxLength = 10;
    
      // 입력된 문자열의 실제 문자 길이를 계산 (한글 포함)
      const charCount = Array.from(input).length;
    
      // 10글자를 초과하지 않도록 제한
      if (charCount <= maxLength) {
        setName(input);
      } else {
        alert(t('NameMaxLength', { maxLength })); // 10글자 초과 시 알림 (번역 메시지 사용)
      }
    };

  return (
    <Suspense>
 <div className="mx-auto md:p-8 p-4 rounded-lg h-full text-customBlue relative">

<h2 className="font-bold mb-4">
  <DynamicText text={t('Profile')} className='md:text-2xl text-sm sm:text-xl'/>
</h2>

<div className="mb-4 text-center relative  flex justify-center">
  <div className="relative">
    <img
      src={profileImage || '/SVG/default-profile.svg'}
      alt="Profile"
      className="w-28 h-28 rounded-full mx-auto object-cover"
    />
       
    <div className="absolute bg-white w-[20px] h-[20px] rounded-full flex justify-center items-center bottom-0 right-0">
      <Image
        src="/SVG/imageChange.svg"
        alt="Logo"
        width={13}
        height={13}
        priority
        className="cursor-pointer"
        onClick={handleImageChangeClick} // 클릭 시 파일 입력 클릭
      />
    </div>
  </div>

  {/* 숨겨진 파일 입력 */}
  <input
    id="fileInput" // ID를 부여하여 참조 가능
    type="file"
    accept="image/*"
    onChange={handleImageUpload}
    className="hidden" // 숨기기
    ref={fileInputRef}  // ref 연결
  />
</div>


<div className="mb-4 " lang="ko">
  <label className="block text-[10px] sm:text-sm font-bold mb-2">
    <DynamicText text={t('Name')} />
  </label>
  <input
    type="text"
    value={name}
    lang="ko"
    onChange={handleNameChange}
   className="w-full sm:h-10 h-8 text-[10px] sm:text-sm text-customPurple  border-customGray rounded-lg focus:outline-none focus:border-transparent focus:ring-2 focus:ring-customLightPurple"
  />
</div>


{!isSocialLogin &&(
 <button
 className="
 mb-8 text-xs justify-start items-start text-white
 bg-transparent text-white
 hover:decoration-customPurple
 hover:!bg-gradient-to-r hover:!from-customPurple hover:!to-customLightPurple hover:bg-clip-text  bg-clip-text hover:text-transparent
 transition-all duration-300
 "

 onClick={() =>{setWantPasswordChange(!wantPasswordChange)}}
>
 <DynamicText className='text-[10px] sm:text-sm' text={t('ChangePassword')}></DynamicText>
</button>

)}
{!isSocialLogin && wantPasswordChange && (
  <>
    <div className="mb-4 relative">
      <label className="block text-sm font-bold mb-2">
        <DynamicText className='text-[10px] sm:text-sm' text={t('Password')} />
      </label>
      <div className="relative">
        <input
          type={passwordVisible ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full text-[10px] sm:text-sm sm:h-10 h-8 border-customGray rounded-lg"
        />
        <button
          type="button"
          onClick={() => setPasswordVisible(!passwordVisible)}
          className="absolute inset-y-0 right-2 flex items-center text-customPurple text-xs md:text-sm bg-transparent hover:text-underline-offset-4"
        >
         
          {passwordVisible ?<DynamicText text={t('Hide')} className='text-[10px] sm:text-sm'/> : <DynamicText text={t('Show')} className='text-[10px] sm:text-sm'/>}
        </button>
      </div>
      {passwordError && <div className="text-[7px] sm:text-xs text-red-500 mt-1">{passwordError}</div>}
    </div>

    <div className="mb-4 relative">
      <label className="block text-sm font-bold mb-2">
        <DynamicText className='text-[10px] sm:text-sm' text={t('PasswordConfirm')} />
      </label>
      <div className="relative">
        <input
          type={passwordConfirmVisible ? 'text' : 'password'}
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          className="w-full text-[10px] sm:text-sm sm:h-10 h-8 border-customGray rounded-lg"
        />
        <button
          type="button"
          onClick={() => setPasswordConfirmVisible(!passwordConfirmVisible)}
          className="absolute inset-y-0 right-2 flex items-center text-customPurple text-xs md:text-sm bg-transparent hover:text-underline-offset-4"
        >
          {passwordConfirmVisible ?<DynamicText className='text-[10px] sm:text-sm' text={t('Hide')} /> : <DynamicText className='text-[10px] sm:text-sm' text={t('Show')} />}
        </button>
      </div>
      {passwordConfirmError && <div className="text-[7px] sm:text-xs text-red-500 mt-1">{passwordConfirmError}</div>}
    </div>
  </>
)}
<div className="absolute bottom-2 w-full left-0 ">
  <Button
    variant="primary"
    disabled={isSubmitting || (wantPasswordChange && !isFormValid)} // 모든 폼 유효성 검사에 통과해야만 활성화
    className="animate__animated animate__zoomIn w-full sm:h-10 h-8"
    onClick={handleSubmit}
  >
    <DynamicText text={t('Save')} className='text-[10px] sm:text-sm' />
  </Button>
</div>
</div>
    </Suspense>
   
  );
}
