import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/util/database';
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]"; // 인증 옵션 경로 조정

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, email,password, profileImage } = req.body;
  
 

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const db = (await connectDB).db('StellarLink');
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const updates: any = {};
    if (name) updates.name = name;
    if (profileImage) updates.profileImage = profileImage;
    if (password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          message:
            'Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.',
        });
      }
      updates.password = await bcrypt.hash(password, 10);
    }

    const result = await db.collection('user_cred').updateOne(
      { email },
      { $set: updates }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: 'No changes made to the profile.' });
    }

    res.status(200).json({ message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export default handler;
