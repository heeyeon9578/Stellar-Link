## 💫 별처럼 빛나는 관계의 연결, Stellar Link (리얼타임 채팅 애플리케이션)

> 
https://stellar-link.org/

전체화면 캡쳐할 때, 일부 애니메이션 효과로 인해 중간에 잘린 화면들이 존재합니다. 실제 사이트에서 메인화면 확인 부탁드립니다. 감사합니다.

![Stellar Link 메인 페이지 사진](public/captures/screencapture-stellar-link-org-2025-03-11-16_03_14.png)

---

## 📚 목차

- [🖥 서버 구조](#-서버-구조)
- [💻 화면 설계](#-화면-설계)
- [⚙️ 기술 스택](#-기술-스택)
- [🪄 프로젝트 상세 과정](#-프로젝트-상세-과정)
- [🛠 주요 화면 소개](#-주요-화면-소개)
  > [화면 0: 메인 화면](#화면-0-메인-화면)  
  > [화면 1: 회원가입 / 로그인 / 비밀번호 찾기 / 로그아웃 / 회원탈퇴](#화면-1-회원가입--로그인--비밀번호-찾기)  
  > [화면 2: 채팅 메인 페이지](#화면-2-채팅-메인-페이지)  
  > [화면 3: 게시글 작성 / 임시저장 / 수정](#화면-3-게시글-작성--임시저장--수정)  
  > [화면 4: 게시글 상세](#화면-4-게시글-상세)  
  > [화면 5: 인기글 / 최신글 / 태그 별 게시글 전체보기](#화면-5-인기글--최신글--태그-별-게시글-전체보기)  
  > [화면 6: 팔로우 / 팔로워](#화면-6-팔로우--팔로워)  
  > [화면 7: 실시간 알림 / 헤더에 알림 5개보기 / 알림 전체보기](#화면-7-실시간-알림--헤더에-알림-5개보기--알림-전체보기)  
  > [화면 8: 프로필 설정](#화면-8-프로필-설정)  
  

---

## 🖥 서버 구조

![서버 구조](public/captures/serverArchitect.png)

---

## 💻 화면 설계

 ![Figma 디자인 미리보기](public/captures/figma.png)(https://www.figma.com/design/9l0M6L7W45mJAw1C6BejRn/Stellar-Link?node-id=0-1&t=jgyi0UeeH89CYrTy-1)


---

## ⚙ 기술 스택

<table>
  <thead>
    <tr>
      <th>분류</th>
      <th>스택</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Frontend</strong></td>
      <td>
        <img src="https://img.shields.io/badge/Next.js-000000?style=plastic&logo=next.js&logoColor=white" alt="Next.js">
        <img src="https://img.shields.io/badge/Redux%20Toolkit-764ABC?style=plastic&logo=redux&logoColor=white" alt="Redux Toolkit">
        <img src="https://img.shields.io/badge/Socket.IO--client-010101?style=plastic&logo=socket.io&logoColor=white" alt="Socket.IO-client">
        <img src="https://img.shields.io/badge/TypeScript-3178C6?style=plastic&logo=typescript&logoColor=white" alt="TypeScript">
        <img src="https://img.shields.io/badge/TailwindCSS-38B2AC?style=plastic&logo=tailwind-css&logoColor=white" alt="TailwindCSS">
        <img src="https://img.shields.io/badge/React--Three-Fiber-000000?style=plastic" alt="React-Three-Fiber">
        <img src="https://img.shields.io/badge/Animate.css-0090FF?style=plastic" alt="Animate.css">
      </td>
    </tr>
    <tr>
      <td><strong>Backend</strong></td>
      <td>
        <img src="https://img.shields.io/badge/Socket.IO-010101?style=plastic&logo=socket.io&logoColor=white" alt="Socket.IO">
        <img src="https://img.shields.io/badge/MongoDB-47A248?style=plastic&logo=mongodb&logoColor=white" alt="MongoDB">
        <img src="https://img.shields.io/badge/JWT-000000?style=plastic" alt="JWT">
        <img src="https://img.shields.io/badge/AWS%20EC2-232F3E?style=plastic&logo=amazon-ec2&logoColor=white" alt="AWS EC2">
        <img src="https://img.shields.io/badge/AWS%20S3-FF9900?style=plastic&logo=amazon-s3&logoColor=white" alt="AWS S3">
      </td>
    </tr>
  </tbody>
</table>



---

## 🪄 프로젝트 상세 과정

[Notion 으로 이동하여 프로젝트 상세 과정 보기](https://heeyeon9578.notion.site/StellarLink-24-11-29-24-02-12-14caccb87c2b80bba05bf00fa9a970f4)

---


## 🛠 주요 화면 소개

### 화면 0: 메인 화면

- **메인 페이지**: 
  <details>
    <summary>메인 페이지</summary>
    
    ![메인 페이지](public/captures/screencapture-stellar-link-org-2025-03-11-16_03_14.png)

     - 헤더, 메인, 푸터로 구성되어 있습니다.
     - 헤더에는 저에 대한 소개 페이지, 해당 웹의 기술적인 부분을 볼 수 있는 페이지, 로그인을 통해 서비스를 이용할 수 있는 버튼들이 존재합니다.
     - 메인 컨텐츠에는 서비스에 대한 소개가 담겨 있습니다.
     - 푸터에는 언어를 변경할 수 있는 버튼과 헤더와 마찬가지의 페이지들, 그리고 저작권 관련 페이지를 볼 수 있는 버튼들이 존재합니다.
       


  </details>

---

### 화면 1: 회원가입 / 로그인 / 비밀번호 찾기

- **회원가입**: 사용자가 조건에 맞는 아이디(실존하는 이메일), 인증번호, 비밀번호, 닉네임을 입력하여 회원가입하거나, 구글 아이디를 통해 회원가입합니다.

   <details>
    <summary>회원가입 페이지</summary>
     
    ![회원가입](public/captures/signup.png)

    > 회원가입 버튼을 누르면, 계정 또는 구글/깃허브/디스코드로 회원가입할 수 있는 버튼이 도출됩니다. 
 
  </details>

  <details>
    <summary>로컬 회원가입 페이지</summary>
    
    ![로컬 회원가입](public/captures/sendCode.png)
  
    > 이메일로 받은 인증번호입니다.
    
     ![로컬 회원가입](public/captures/signup_local.png)
  
    > 이메일 인증, 사용할 비밀번호, 닉네임의 조건을 모두 만족하면 회원가입 버튼이 disable -> able 상태가 되어 클릭할 수 있습니다.
 
  </details>

   <details>
    <summary>구글 회원가입 페이지</summary>
     
    ![구글 회원가입](public/captures/google.png)

    > 구글 아이디를 클릭하여 해당 서비스에 회원가입할 수 있습니다.
    
  
  </details>

  <details>
    <summary>깃허브 회원가입 페이지</summary>
     
    ![깃허브 회원가입](public/captures/github.png)

    > 깃허브 아이디를 클릭하여 해당 서비스에 회원가입할 수 있습니다.
    
  
  </details>

  <details>
    <summary>디스코드 회원가입 페이지</summary>
     
    ![디스코드 회원가입](public/captures/discord.png)

    > 디스코드 아이디를 클릭하여 해당 서비스에 회원가입할 수 있습니다.
    
  
  </details>


- **로그인**: 사용자가 회원가입할 때 사용한 아이디(이메일)과 비밀번호를 통해 로그인합니다.

  <details>
    <summary>로그인 페이지</summary>
     
    ![회원가입](public/captures/login.png)

    > 로그인 버튼을 누르면, 계정 또는 구글/깃허브/디스코드로 로그인할 수 있는 버튼이 도출됩니다. 
 
  </details>

- **비밀번호 찾기**: 사용자가 비밀번호를 잊어버렸을 경우, 가입한 이메일을 통해 새로운 비밀번호 인증코드를 받아 로그인할 수 있습니다.
  
  <details>
    <summary>비밀번호 찾기 페이지</summary>

   ![비밀번호 찾기](public/captures/find_passwd.png)

    > 비밀번호를 찾고 싶은 아이디를 입력 후 인증번호 전송버튼을 클릭합니다.

    ![비밀번호 찾기](public/captures/find_passwd_email.png)

    > 해당 이메일로 발송된 메일에 쓰여있는 임시 비밀번호를 사용하여 임시 로그인합니다.

  </details>

---

### 화면 2: 채팅 메인 페이지

- **프로필 관리**: 
  <details>
    <summary>채팅 메인 페이지</summary>
    
     ![채팅 메인 페이지](captures/blog_main.png)

    > 내 블로그 페이지로 좌측 프로필 부분은 화면을 스크롤 하더라도 같이 움직입니다.
    
  </details>

- **친구 관리**:

  <details>
    <summary>친구 추가</summary>
    
    ![게시글 관리 페이지](captures/blog_manage_post.png)

    - 내 게시글을 관리할 수 있는 페이지로, 각자 자신의 게시글만 수정 또는 삭제할 수 있습니다.
     
   </details>
   
     <details>
       
    <summary>친구 차단</summary>
    
    ![카테고리 관리 페이지](captures/blog_manage_category.png)

    - 내 카테고리를 관리할 수 있는 페이지로, 각자 자신의 카테고리만 수정 또는 삭제할 수 있습니다.
    - 카테고리는 2개의 레벨로, 하위 카테고리는 사용자의 **드래그엔 드롭**을 통해 다른 상위 카테고리로 옮길 수 있습니다.
    - 최상위 카테고리에 하위 카테고리 존재 시 삭제할 수 없습니다.
    - 하위 카테고리에는 하위 카테고리를 추가할 수 없습니다.
  
  </details>

  <details>
       
    <summary>친구 차단</summary>
    
    ![카테고리 관리 페이지](captures/blog_manage_category.png)

    - 내 카테고리를 관리할 수 있는 페이지로, 각자 자신의 카테고리만 수정 또는 삭제할 수 있습니다.
    - 카테고리는 2개의 레벨로, 하위 카테고리는 사용자의 **드래그엔 드롭**을 통해 다른 상위 카테고리로 옮길 수 있습니다.
    - 최상위 카테고리에 하위 카테고리 존재 시 삭제할 수 없습니다.
    - 하위 카테고리에는 하위 카테고리를 추가할 수 없습니다.
  
  </details>

  - **채팅**: 사용자가 서비스에서 로그아웃 버튼을 클릭하여 로그아웃합니다.
  
  <details>
    <summary>로그아웃 페이지</summary>

    ![로컬 회원 탈퇴](public/captures/user_delete.png)

    > 로그인할 때 사용한 이메일과 비밀번호 및 비밀번호 확인란을 조건에 맞게 채우면 회원 탈퇴하기 버튼이 활성화됩니다.
    
  </details>

  - **설정**: 사용자가 서비스에서 로그아웃 버튼을 클릭하여 로그아웃합니다.
  
  <details>
    <summary>로그아웃 페이지</summary>

    ![로컬 회원 탈퇴](public/captures/user_delete.png)

    > 로그인할 때 사용한 이메일과 비밀번호 및 비밀번호 확인란을 조건에 맞게 채우면 회원 탈퇴하기 버튼이 활성화됩니다.
    
  </details>

- **로그아웃**: 사용자가 서비스에서 로그아웃 버튼을 클릭하여 로그아웃합니다.
  
  <details>
    <summary>로그아웃 페이지</summary>

    ![로컬 회원 탈퇴](public/captures/user_delete.png)

    > 로그인할 때 사용한 이메일과 비밀번호 및 비밀번호 확인란을 조건에 맞게 채우면 회원 탈퇴하기 버튼이 활성화됩니다.
    
  </details>

---


