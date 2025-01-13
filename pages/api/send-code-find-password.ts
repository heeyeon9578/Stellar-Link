import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/util/database';
import { sendVerificationEmail } from '@/util/sendEmail';
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]"; // 인증 옵션 경로 조정

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const db = (await connectDB).db('StellarLink');
    const user = await db.collection('user_cred').findOne({ email });
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!user) {
      return res.status(404).json({ message: 'Email is not registered' });
    }else{
    // 이메일로 인증 코드 보내는 로직 추가
    // 예: 이메일 발송 서비스 사용 (nodemailer, etc.)
    // 기존 인증번호 삭제 후 새로 저장
    const collection = db.collection('verificationCodes');
    const code = Math.random().toString().slice(2, 8); // 랜덤 6자리 숫자 생성
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10분 유효
    await collection.deleteOne({ email });
    await collection.insertOne({ email, code, expiresAt });
    
    // 인증번호 이메일로 전송
    await sendVerificationEmail(email, code);
    res.status(200).json({ message: 'Verification code sent' });
    }

    
  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default handler;
