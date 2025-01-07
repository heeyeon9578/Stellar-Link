import { connectDB } from '@/util/database';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    console.log('API 호출 성공');

    const db = (await connectDB).db('StellarLink');
    const collection = db.collection('user_cred');

    const rawUsers = [
      {
        "_id": { "$oid": "6763b14517a87f3fc46224a3" },
        "name": "김철수",
        "email": "chulsu.kim1@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700000000000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile1.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700003600000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224a4" },
        "name": "이영희",
        "email": "younghee.lee2@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700007200000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile2.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700010800000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224a5" },
        "name": "박지민",
        "email": "jimin.park3@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700014400000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile3.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700018000000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224a6" },
        "name": "최수진",
        "email": "sujin.choi4@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700021600000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile4.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700025200000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224a7" },
        "name": "장민호",
        "email": "minho.jang5@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700028800000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile5.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700032400000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224a8" },
        "name": "김하늘",
        "email": "haneul.kim6@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700036000000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile6.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700039600000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224a9" },
        "name": "박서준",
        "email": "seojoon.park7@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700043200000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile7.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700046800000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224aa" },
        "name": "송지효",
        "email": "jihyo.song8@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700050400000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile8.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700054000000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224ab" },
        "name": "정우성",
        "email": "wooseong.jeong9@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700057600000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile9.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700061200000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224ac" },
        "name": "윤아",
        "email": "yoona.yoon10@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700064800000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile10.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700068400000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224ad" },
        "name": "홍길동",
        "email": "gildong.hong11@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700072000000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile11.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700075600000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224ae" },
        "name": "박보검",
        "email": "bogum.park12@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700079200000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile12.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700082800000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224af" },
        "name": "전지현",
        "email": "jihyun.jeon13@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700086400000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile13.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700090000000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224b0" },
        "name": "류준열",
        "email": "junyeol.ryu14@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700093600000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile14.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700097200000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224b1" },
        "name": "손예진",
        "email": "yejin.son15@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700100800000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile15.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700104400000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224b2" },
        "name": "유재석",
        "email": "jaesuk.yoo16@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700108000000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile16.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700111600000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224b3" },
        "name": "박신혜",
        "email": "shinhe.bak17@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700115200000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile17.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700118800000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224b4" },
        "name": "정해인",
        "email": "haein.jeong18@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700122400000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile18.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700126000000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224b5" },
        "name": "이민호",
        "email": "minho.lee19@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700129600000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile19.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700133200000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224b6" },
        "name": "고소영",
        "email": "soyong.go20@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700136800000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile20.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700140400000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224b7" },
        "name": "정우",
        "email": "woo.jeong21@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700144000000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile21.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700147600000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224b8" },
        "name": "이준기",
        "email": "jungi.lee22@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700151200000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile22.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700154800000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224b9" },
        "name": "손흥민",
        "email": "heungmin.son23@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700158400000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile23.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700162000000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224ba" },
        "name": "김태희",
        "email": "taehee.kim24@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700165600000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile24.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700169200000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224bb" },
        "name": "박보영",
        "email": "boyoung.park25@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700172800000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile25.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700176400000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224bc" },
        "name": "김수현",
        "email": "suhyun.kim26@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700180000000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile26.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700183600000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224bd" },
        "name": "김지원",
        "email": "jiwon.kim27@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700187200000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile27.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700190800000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224be" },
        "name": "송중기",
        "email": "joongki.song28@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700194400000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile28.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700198000000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224bf" },
        "name": "강동원",
        "email": "dongwon.kang29@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700201600000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile29.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700205200000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224c0" },
        "name": "김혜수",
        "email": "hyesu.kim30@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700208800000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile30.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700212400000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224c1" },
        "name": "송중기",
        "email": "joongki.song31@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700216000000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile31.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700219600000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224c2" },
        "name": "배수지",
        "email": "suzy.bae32@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700223200000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile32.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700226800000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224c3" },
        "name": "이동욱",
        "email": "dongwook.lee33@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700230400000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile33.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700234000000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224c4" },
        "name": "박보검",
        "email": "bogum.park34@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700237600000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile34.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700241200000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224c5" },
        "name": "김태희",
        "email": "taehee.kim35@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700244800000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile35.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700248400000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224c6" },
        "name": "윤종신",
        "email": "jongshin.yoon36@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700252000000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile36.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700255600000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224c7" },
        "name": "강하늘",
        "email": "hanul.kang37@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700259200000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile37.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700262800000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224c8" },
        "name": "송혜교",
        "email": "hyegyo.song38@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700266400000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile38.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700270000000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224c9" },
        "name": "정은지",
        "email": "eunji.jeong39@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700273600000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile39.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700277200000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224ca" },
        "name": "장동건",
        "email": "donggun.jang40@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700280800000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile40.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700284400000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224cb" },
        "name": "김희선",
        "email": "heesun.kim41@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700288000000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile41.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700291600000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224cc" },
        "name": "홍진호",
        "email": "jinho.hong42@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700295200000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile42.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700298800000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224cd" },
        "name": "이준",
        "email": "jun.lee43@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700302400000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile43.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700306000000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224ce" },
        "name": "김태현",
        "email": "taehyun.kim44@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700309600000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile44.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700313200000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224cf" },
        "name": "박서준",
        "email": "seojoon.park45@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700316800000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile45.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700320400000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224d0" },
        "name": "윤아",
        "email": "yoona.yoon46@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700324000000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile46.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700327600000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224d1" },
        "name": "홍길동",
        "email": "gildong.hong47@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700331200000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile47.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700334800000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224d2" },
        "name": "김지훈",
        "email": "jihoon.kim48@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700338400000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile48.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700342000000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224d3" },
        "name": "이지은",
        "email": "jieun.lee49@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700345600000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile49.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700349200000" } }
      },
      {
        "_id": { "$oid": "6763b14517a87f3fc46224d4" },
        "name": "김태형",
        "email": "taehyung.kim50@example.com",
        "password": "$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg",
        "createdAt": { "$date": { "$numberLong": "1700352800000" } },
        "profileImage": "https://s3.ap-northeast-2.amazonaws.com/stellarlinkprofile/profile50.jpg",
        "updatedAt": { "$date": { "$numberLong": "1700356400000" } }
      }
    ]

    const transformData = async (rawData) => {
      return Promise.all(rawData.map(async (doc) => ({
        _id: new ObjectId(doc._id.$oid),
        name: doc.name,
        email: doc.email,
        password: doc.password,
        profileImage: doc.profileImage,
        createdAt: new Date(parseInt(doc.createdAt.$date.$numberLong)),
        updatedAt: new Date(parseInt(doc.updatedAt.$date.$numberLong)),
      })));
    };

    const users = await transformData(rawUsers);

    const bulkOps = users.map(user => ({
      updateOne: {
        filter: { _id: user._id },
        update: { $set: user },
        upsert: true,
      },
    }));

    const result = await collection.bulkWrite(bulkOps);

    console.log(`${result.upsertedCount + result.modifiedCount}개의 문서가 성공적으로 삽입 또는 업데이트되었습니다.`);
    res.status(200).json({ message: `${result.upsertedCount + result.modifiedCount}개의 문서가 성공적으로 삽입 또는 업데이트되었습니다.` });
  } catch (error) {
    console.error('데이터 삽입 중 오류 발생:', error);
    res.status(500).json({
      message: '데이터 삽입 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
}
