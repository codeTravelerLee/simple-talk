import request from "supertest";

import app from "./app.js";
import { connect, disConncet, clearDb } from "./db-handler.js";
import redis from "../configs/redis.js";

import User from "../models/user.model.js";

//테스트 전후처리
beforeAll(async () => await connect()); //테스트 전 가상 DB연결
afterEach(async () => await clearDb()); //개별기능 테스트 후 스키마는 유지한채 가상DB에 쌓인 데이터만 삭제
afterAll(async () => {
  await disConncet();
  await redis.quit();
}); //모든 테스트 종료후 가상DB삭제 및 연결해제

//회원가입 테스팅
describe("Auth API테스트(회원가입)", () => {
  it("올바른 정보로 회원가입 성공시 상태코드 201을 반환한다.", async () => {
    //Act
    const res = await request(app).post("/api/v1/auth/signup").send({
      email: "test@gmail.com",
      password: "password123!",
      fullName: "tester1",
    });

    //Assert
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message");

    const user = await User.findOne({ email: "test@gmail.com" });
    expect(user).toBeTruthy();
    expect(user.fullName).toBe("tester1");
  });

  it("실패: 입력한 이메일 주소가 유효하지 않다면 상태코드 400을 반환한다.", async () => {
    //Act
    const res = await request(app).post("/api/v1/auth/signup").send({
      email: "invalid@0000",
      password: "password123!",
      fullName: "tester2",
    });

    expect(res.statusCode).toBe(400);
  });
});
