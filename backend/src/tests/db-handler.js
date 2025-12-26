//테스팅을 위한 가상DB(mongodb-memory-server) 설정 파일

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoTestDB;

//테스트 수행전 가상 DB연결
export const connect = async () => {
  mongoTestDB = await MongoMemoryServer.create();
  const uri = mongoTestDB.getUri();

  await mongoose.connect(uri);
};

//개별기능 테스트 후 DB데이터만 삭제, 스키마는 유지
export const clearDb = async () => {
  if (mongoTestDB) {
    const collections = mongoose.connection.collections;

    //key는 각 컬렉션(테이블)의 이름
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  }
};

//테스트 전체 종료후 가상 DB연결 해제
export const disConnect = async () => {
  if (mongoTestDB) {
    await mongoose.connection.dropDatabase(); //생성한 DB삭제
    await mongoose.connection.close(); //mongoose와 테스트DB연결 해제
    await mongoTestDB.stop(); //테스트DB프로세스 kill
  }
};
