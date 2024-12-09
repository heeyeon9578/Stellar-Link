import { MongoClient } from 'mongodb';

const url = process.env.DATABASE_KEY as string;

if (!url) {
  throw new Error('Please define the DATABASE_KEY environment variable in .env');
}

// TypeScript에서 글로벌 객체 정의
declare global {
  // 글로벌 변수 `_mongo`가 Node.js 전역에 존재하지 않는다면 선언
  // Node.js 환경에만 존재하도록 정의
  var _mongo: Promise<MongoClient> | undefined;
}

let connectDB: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // 개발 환경에서 전역 객체를 재사용
  if (!global._mongo) {
    global._mongo = new MongoClient(url).connect();
  }
  connectDB = global._mongo;
} else {
  // 프로덕션 환경에서는 새로 연결
  connectDB = new MongoClient(url).connect();
}

export { connectDB };
