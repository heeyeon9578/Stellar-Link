import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import '../../../../i18n';
import Button from '@/app/components/Button';
import DynamicText from '../../../app/components/DynamicText';

export default function ProfileContent() {
  const { data: session, status, update } = useSession();
  const { t, i18n } = useTranslation('common');
  const [isInitialized, setIsInitialized] = useState(false);
  const [file, setFile] = useState<File | null>(null); // 업로드할 파일 객체
  const [name, setName] = useState(session?.user?.name || '');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState(session?.user?.profileImage || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSocialLogin =
    session?.user?.provider && ['google', 'discord', 'github'].includes(session.user.provider);

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
    <div className="mx-auto p-4 rounded-lg shadow-md h-full text-customBlue relative ">
      <h2 className="text-2xl font-bold mb-12">
        <DynamicText text={t('Profile')} />
      </h2>
      <div className="mb-8 text-center">
        <img
          src={profileImage || '/default-profile.png'}
          alt="Profile"
          className="w-24 h-24 rounded-full mx-auto"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mt-2 text-sm"
        />
      </div>
      <div className="mb-8" lang="ko">
        <label className="block text-sm font-bold mb-2">
          <DynamicText text={t('Name')} />
        </label>
        <input
          type="text"
          value={name}
          lang="ko"
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
      <div className="mb-8">
        <label className="block text-sm font-bold mb-2">
          <DynamicText text={t('Email')} />
        </label>
        <input
          type="email"
          value={session.user?.email || ''}
          disabled
          className="w-full px-3 py-2 border rounded-md bg-gray-100"
        />
      </div>
      {!isSocialLogin && (
        <div>
          <label className="block text-sm font-bold mb-2">
            <DynamicText text={t('Password')} />
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      )}
      <div className="absolute bottom-4 w-full left-0">
        <Button
          variant="primary"
          className="animate__animated animate__zoomIn w-full"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          <DynamicText text={t('Save')} />
        </Button>
      </div>
    </div>
  );
}
