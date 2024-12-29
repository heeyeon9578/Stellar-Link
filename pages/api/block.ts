// /pages/api/block.ts (또는 /app/api/block/route.ts in app router)

import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/util/database';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]'; // 인증 옵션 경로

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // DB 연결
  const client = await connectDB;
  const db = client.db('StellarLink');

  // 세션 검사
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // 요청자 정보
  const requesterEmail = session.user?.email;
  const requester = await db.collection('user_cred').findOne({ email: requesterEmail });
  if (!requester) {
    return res.status(404).json({ message: 'Requester not found.' });
  }
  const requesterId = new ObjectId(requester._id);

  switch (req.method) {
    /**
     * 차단하기:
     *  - 요청 body 예시: { "targetEmail": "blockme@example.com" }
     */
    case 'POST': {
      try {
        const { targetEmail } = req.body;
        if (!targetEmail) {
          return res.status(400).json({ message: 'targetEmail is required.' });
        }

        // 차단 당할 사람 조회
        const targetUser = await db.collection('user_cred').findOne({ email: targetEmail });
        if (!targetUser) {
          return res.status(404).json({ message: 'Target user not found.' });
        }
        const targetUserId = new ObjectId(targetUser._id);

        // 이미 차단했는지 확인
        const alreadyBlocked = await db.collection('blocked_users').findOne({
          userId: requesterId,
          blockedUserId: targetUserId
        });
        if (alreadyBlocked) {
          return res.status(400).json({ message: 'User is already blocked.' });
        }

        // 차단 레코드 추가
        await db.collection('blocked_users').insertOne({
          userId: requesterId,
          blockedUserId: targetUserId,
          createdAt: new Date()
        });

        return res.status(200).json({ message: 'User blocked successfully.' });
      } catch (error) {
        console.error('Error in POST /api/block:', error);
        return res.status(500).json({ message: 'Error blocking user.', error });
      }
    }

    /**
     * 차단 해제:
     *  - 요청 body 예시: { "targetEmail": "blockme@example.com" }
     */
    case 'DELETE': {
      try {
        const { targetEmail } = req.body;
        if (!targetEmail) {
          return res.status(400).json({ message: 'targetEmail is required for unblocking.' });
        }

        // 차단 해제 대상 찾기
        const targetUser = await db.collection('user_cred').findOne({ email: targetEmail });
        if (!targetUser) {
          return res.status(404).json({ message: 'Target user not found.' });
        }
        const targetUserId = new ObjectId(targetUser._id);

        // 차단 문서 제거
        const result = await db.collection('blocked_users').deleteOne({
          userId: requesterId,
          blockedUserId: targetUserId
        });
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'No block record found to delete.' });
        }

        return res.status(200).json({ message: 'User unblocked successfully.' });
      } catch (error) {
        console.error('Error in DELETE /api/block:', error);
        return res.status(500).json({ message: 'Error unblocking user.', error });
      }
    }
    case 'GET': {
        try {
          // 차단 목록 가져오기
          const blockedList = await db.collection('blocked_users')
            .find({ userId: requesterId })
            .toArray();
      
          return res.status(200).json(blockedList);
        } catch (error) {
          console.error('Error in GET /api/block:', error);
          return res.status(500).json({ message: 'Error fetching blocked users.', error });
        }
      }
    default: {
      res.setHeader('Allow', ['POST', 'DELETE']);
      return res.status(405).json({ message: `Method ${req.method} not allowed.` });
    }
  }
}