import { NextApiRequest, NextApiResponse } from 'next';
import {connectDB} from '@/util/database';
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]"; // 인증 옵션 경로 조정

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }

    try {
      const client = await connectDB;
      const db = client.db('StellarLink');
      const collection = db.collection('verificationCodes');

  
      // 이메일로 인증번호 찾기
      const record = await collection.findOne({ email });

      if (!record) {
        return res.status(404).json({ message: 'Verification code not found' });
      }

      const now = new Date();
      if (record.code === code && record.expiresAt > now) {
        // 인증 성공: 인증번호 삭제
        await collection.deleteOne({ email });
        return res.status(200).json({ message: 'Verification successful' });
      } else {
        return res.status(400).json({ message: 'Invalid or expired code' });
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
