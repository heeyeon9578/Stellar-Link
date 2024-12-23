import React, { useEffect, useState } from 'react';
import { useSession ,signIn} from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import '../../../../i18n';
import Button from '@/app/components/Button';
import DynamicText from '../../../app/components/DynamicText';
import Image from 'next/image';


export default function ProfileContent() {
  const { data: session, status, update } = useSession();
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

  useEffect(() => {
    console.log(`
       session?.user?.name: ${session?.user?.name}
       session?.user?.profileImage: ${session?.user?.profileImage}
      `, session);
  }, [session]);

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
        console.log(`


          /api/post/image?file=${filename}
          
          
          `,res)
        if (!res.ok) {
          throw new Error('이미지 업로드 URL을 가져오는 데 실패했습니다.');
        }

        const data = await res.json();
        console.log(`


          data
          
          `,data)
        const formData = new FormData();
        Object.entries({...data.fields, file}).forEach(([key, value]) => {
          formData.append(key, value as string | Blob);
        });
       
        
        const uploadResult = await fetch(data.url, {
          method: 'POST',
          body: formData,
        });
        console.log(`


          uploadResult
          
          `,uploadResult)
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
        alert(t('Profile updated successfully'));
        
        // **세션 정보 업데이트**
        await update({
          name,
          profileImage: uploadedUrl,
        });
      } else {
        alert(result.message || t('Failed to update profile'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(t('An error occurred while updating profile.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto p-4 rounded-lg h-full text-customBlue relative ">

      <h2 className="text-2xl font-bold mb-4">
        <DynamicText text={t('Profile')} />
      </h2>

      <div className="mb-4 text-center relative">
        <div className='relative'>
          <img
            src={profileImage || '/default-profile.png'}
            alt="Profile"
            className="w-28 h-28 rounded-full mx-auto"
          />

          <div className='absolute bg-white w-[20px] h-[20px] rounded-full flex justify-center items-center bottom-0 right-48'>
            <Image
              src="/SVG/imageChange.svg"
              alt="Logo"
              width={13}
              height={13}
              priority
              onClick={() => alert('')} // 로고 클릭 시 홈으로 이동
              className="cursor-pointer"
            />
          </div>  
        </div>
     
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mt-2 text-sm"
        />
        

      </div>

      <div className="mb-4" lang="ko">
        <label className="block text-sm font-bold mb-2">
          <DynamicText text={t('Name')} />
        </label>
        <input
          type="text"
          value={name}
          lang="ko"
          onChange={(e) => setName(e.target.value)}
         className="w-full px-3 py-2 border-customGray rounded-lg"
        />
      </div>

      {/* <div className="mb-4">
        <label className="block text-sm font-bold mb-2">
          <DynamicText text={t('Email')} />
        </label>
        <input
          type="email"
          value={session.user?.email || ''}
          disabled
          className="w-full px-3 py-2 border-customGray rounded-lg bg-customGray"
        />
      </div> */}

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
              <DynamicText text={t('ChangePassword')}></DynamicText>
            </button>
      {!isSocialLogin && wantPasswordChange && (
        <>
          <div className="mb-4 relative">
            <label className="block text-sm font-bold mb-2">
              <DynamicText text={t('Password')} />
            </label>
            <div className="relative">
              <input
                type={passwordVisible ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border-customGray rounded-lg"
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute inset-y-0 right-2 flex items-center text-customPurple text-xs md:text-sm bg-transparent hover:text-underline-offset-4"
              >
                {passwordVisible ? t('Hide') : t('Show')}
              </button>
            </div>
            {passwordError && <div className="text-xs text-red-500 mt-1">{passwordError}</div>}
          </div>

          <div className="mb-4 relative">
            <label className="block text-sm font-bold mb-2">
              <DynamicText text={t('PasswordConfirm')} />
            </label>
            <div className="relative">
              <input
                type={passwordConfirmVisible ? 'text' : 'password'}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full px-3 py-2 border-customGray rounded-lg"
              />
              <button
                type="button"
                onClick={() => setPasswordConfirmVisible(!passwordConfirmVisible)}
                className="absolute inset-y-0 right-2 flex items-center text-customPurple text-xs md:text-sm bg-transparent hover:text-underline-offset-4"
              >
                {passwordConfirmVisible ? t('Hide') : t('Show')}
              </button>
            </div>
            {passwordConfirmError && <div className="text-xs text-red-500 mt-1">{passwordConfirmError}</div>}
          </div>
        </>
      )}
      <div className="absolute bottom-2 w-full left-0">
        <Button
          variant="primary"
          disabled={isSubmitting || (wantPasswordChange && !isFormValid)} // 모든 폼 유효성 검사에 통과해야만 활성화
          className="animate__animated animate__zoomIn w-full"
          onClick={handleSubmit}
        >
          <DynamicText text={t('Save')} />
        </Button>
      </div>
    </div>
  );
}
