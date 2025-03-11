import { NextApiRequest, NextApiResponse } from 'next';
import {connectDB} from '@/util/database';
import { sendVerificationEmail } from '@/util/sendEmail';
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]"; // 인증 옵션 경로 조정

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required' });

    const code = Math.random().toString().slice(2, 8); // 랜덤 6자리 숫자 생성
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10분 유효

    try {
      const client = await connectDB;
      const db = client.db('StellarLink');
      const collection = db.collection('verificationCodes');
      const user = await db.collection('user_cred').findOne({ email });

  
      if (user) {
        return res.status(404).json({ message: 'Email is already registered.' });
      }
      // 기존 인증번호 삭제 후 새로 저장
      await collection.deleteOne({ email });
      await collection.insertOne({ email, code, expiresAt });

      // 인증번호 이메일로 전송
      await sendVerificationEmail(email, code);
      res.status(200).json({ message: 'Verification code sent' });
    } catch (error) {
      console.error('Error sending code:', error);
      res.status(500).json({ message: 'Failed to send verification code' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
