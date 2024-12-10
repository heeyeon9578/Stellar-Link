import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/util/database';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password, passwordConfirm } = req.body;

  // 필드 검증
  if (!email || !password || !passwordConfirm) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (password !== passwordConfirm) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  // 비밀번호 강도 확인
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.',
    });
  }

  try {
    const db = (await connectDB).db('StellarLink');
    const userCollection = db.collection('user_cred');

    // 사용자가 DB에 존재하는지 확인
    const user = await userCollection.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 비밀번호 업데이트
    await userCollection.updateOne(
      { email },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export default handler;
