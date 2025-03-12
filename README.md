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

- **회원가입**: 사용자가 조건에 맞는 아이디(실존하는 이메일), 인증번호, 비밀번호, 닉네임을 입력하여 회원가입하거나, 구글/깃허브/디스코드 아이디를 통해 회원가입합니다.

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

- **프로필 관리**: 나의 프로필 이미지, 닉네임(이름), 비밀번호를 재설정할 수 있습니다.

  <details>
    <summary>프로필 관리</summary>
    
     ![프로필 관리 페이지](public/captures/profile.png)

    > 로컬 로그인일 경우, 프로필 이미지, 닉네임(이름), 비밀번호를 재설정할 수 있습니다.
    > 소셜 로그인일 경우, 프로필 이미지, 닉네임(이름)만 재설정할 수 있습니다.
    
  </details>

- **친구 관리**: 친구를 추가, 삭제, 차단할 수 있으며 친구목록을 전체, 받은 요청, 전송한 요청, 차단한 친구로 분류하여 볼 수 있습니다.

  <details>
    <summary>친구 추가</summary>
    
    ![친구 추가 페이지](public/captures/friend_request.png)

    - 친구의 이메일을 작성한 후 '+' 버튼을 통해 친구요청을 전송합니다.
    - 친구요청한 내역은 'Request' 탭에 들어갑니다.
     
   </details>

   <details>
    <summary>친구 전체목록</summary>
    
    ![친구 전체목록](public/captures/all.png)

    - '친구 요청(친구 추가)'후, '상대방이 수락'하면 친구 전체목록에 나타납니다.
    - 친구를 클릭하면, 채팅방으로 바로 넘어가며 채팅방 목록에 생성됩니다.
     
   </details>

   <details>
    <summary>친구 요청한 목록</summary>
    
    ![친구 요청한 목록](public/captures/request.png)

    - 사용자가 '친구 추가하기'를 통해 요청한 목록을 보여줍니다.
    - 상대방이 '수락/거절'하면 목록에서 사라집니다.
     
   </details>

   <details>
    <summary>친구 요청받은 목록</summary>
    
    ![친구 요청받은 목록 페이지](public/captures/pending.png)

    - 친구 요청을 받은 목록으로, 수락/거절할 수 있습니다.
    - 수락할 경우, 친구목록으로 이동합니다.
    - 거절할 경우, 사라집니다.
      
   </details>

   <details>
    <summary>친구 차단한 목록</summary>
    
    ![친구 차단하기](public/captures/friend_block.png)

    ![친구 차단한 목록](public/captures/block.png)

    - 전체 목록에서 친구 차단하면, 차단한 목록에 나타납니다.
    - 차단해제를 통해 원상복구 혹은 친구 삭제를 통해 아예 삭제할 수 있습니다.
     
   </details>

- **채팅**: 채팅방 생성, 개인채팅 목록 보기, 단체채팅 목록 보기, 채팅방 입장하기 등을 할 수 있습니다.
  
  <details>
    <summary>채팅방 생성하기</summary>

    ![채팅방 생성하기](public/captures/chat_empty.png)

    > 상단의 '+' 버튼을 클릭합니다.

    ![채팅방 생성하기](public/captures/chat_add.png)

    > 채팅방에 함께할 참여자들을 선택(한 명 이상이면 가능)합니다.
    > 채팅방 생성하기 버튼을 클릭합니다.

    ![채팅방 생성하기](public/captures/chat_add_success.png)

    > 채팅방 생성이 완료되면 목록에 생성되며, 바로 채팅방에 입장합니다.
    
  </details>

  <details>
    <summary>채팅하기</summary>

    ![채팅하기](public/captures/chat_chatting.png)

    > 하단의 입력창에 입력 후, 엔터 혹은 보내기 버튼을 클릭하면 채팅이 전송됩니다.
    > 첨부 파일도 전송 가능합니다.

    ![채팅하기](public/captures/chat_chatting2.png)

    > 실시간 양방향 통신으로, 참여자가 읽을때마다 읽지 않은 참여자 수가 실시간으로 검사됩니다.
    > 채팅방에 입장하지 않았을 경우, 채팅방 목록에 읽지 않은 메세지 수가 카운팅됩니다.

    ![채팅하기](public/captures/chat_change.png)

    > 자신의 말풍선 색상 및 이름 색상을 채팅방 마다 다르게 설정할 수 있으며, 설정하자마자 다른 사용자들에게도 실시간으로 변경됩니다.
    > 서버에 저장되므로, 다시 채팅방에 입장해도 해당 컬러가 적용됩니다.
    
  </details>

  <details>
    <summary>채팅방 목록 보기</summary>

    ![채팅방 생성하기](public/captures/chat_all.png)

    > 전체채팅 목록입니다.

    ![채팅방 생성하기](public/captures/chat_personal.png)

    > 개인채팅 목록입니다.

    ![채팅방 생성하기](public/captures/chat_teams.png)

    > 단체채팅 목록입니다.
    
  </details>

- **설정**: 사용자가 서비스에서 로그아웃 버튼을 클릭하여 로그아웃합니다.
  
  <details>
    <summary>언어 설정하기</summary>

    ![언어 설정하기](public/captures/setting_lang.png)

    > 영어, 한국어, 스페인어 중에 선택하여 설정할 수 있습니다.
    
  </details>

  <details>
    <summary>테마 설정하기</summary>

    ![테마 설정하기](public/captures/setting_theme.png)

    > 상단, 중간, 하단 색상을 자유롭게 선택하여 그라데이션을 구성할 수 있습니다.
    
  </details>

- **로그아웃**: 사용자가 서비스에서 로그아웃 버튼을 클릭하여 로그아웃합니다.
  
  <details>
    <summary>로그아웃 페이지</summary>

    ![로컬 회원 탈퇴](public/captures/logout.png)

    > 로그아웃 후, 메인화면으로 돌아갑니다.
    
  </details>

---


