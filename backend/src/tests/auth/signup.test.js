import request from "supertest";

import app from "../app.js";
import { connect, disConncet, clearDb } from "../db-handler.js";
import redis from "../../configs/redis.js";

import User from "../../models/user.model.js";

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
      passwordConfirm: "password123!",
      fullName: "tester1",
    });

    //Assert
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message");

    const user = await User.findOne({ email: "test@gmail.com" });

    expect(user).toBeTruthy();
    expect(user.fullName).toBe("tester1");
  });

  it("회원가입 폼에서 모든 필드가 제공되지 않았다면 상태코드 400을 반환한다.", async () => {
    //Act
    const res = await request(app).post("/api/v1/auth/signup").send({
      password: "password123!",
      passwordConfirm: "password123!",
      fullName: "tester2",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "모든 정보를 입력해주세요.");
  });

  it("입력한 이메일 주소가 유효하지 않다면 상태코드 400을 반환한다.", async () => {
    //Act
    const res = await request(app).post("/api/v1/auth/signup").send({
      email: "invalid@0000",
      password: "password123!",
      passwordConfirm: "password123!",
      fullName: "tester2",
    });

    expect(res.statusCode).toBe(400);
  });

  it("입력한 이메일로 가입된 계정이 이미 존재한다면 상태코드 400을 반환한다.", async () => {
    //개별테스트 후 데이터를 삭제하기 때문에, 테스트를 위해 동일 데이터를 미리 생성
    //Arrange
    await User.create({
      email: "test@gmail.com",
      password: "password123!",
      fullName: "tester1",
    });

    //Act
    const res = await request(app).post("/api/v1/auth/signup").send({
      email: "test@gmail.com",
      password: "password123!",
      passwordConfirm: "password123!",
      fullName: "tester1",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "이미 가입된 이메일 주소입니다.");
  });

  it("비밀번호의 길이가 8미만이면 상태코드 400을 반환한다.", async () => {
    //Act
    const res = await request(app).post("/api/v1/auth/signup").send({
      email: "test3@gmail.com",
      password: "p123!",
      passwordConfirm: "p123!",
      fullName: "tester1",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      "error",
      "비밀번호는 8글자 이상이어야 합니다."
    );
  });

  it("비밀번호 형식이 올바르지 않으면 상태코드 400을 반환한다.", async () => {
    //Act
    const res = await request(app).post("/api/v1/auth/signup").send({
      email: "test4@gmail.com",
      password: "password123",
      passwordConfirm: "password123",
      fullName: "tester4",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      "error",
      "비밀번호는 영문, 특수문자, 숫자를 각각 하나 이상 포함하여 최소 8글자 이상이어야 합니다"
    );
  });

  it("비밀번호와 비밀번호 확인 칸에 입력된 값이 같지 않으면 상태코드 400을 반환한다.", async () => {
    //Act
    const res = await request(app).post("/api/v1/auth/signup").send({
      email: "test5@gmail.com",
      password: "password123!",
      passwordConfirm: "password321!",
      fullName: "tester5",
    });

    //Assert
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      "error",
      "두 비밀번호가 일치하지 않습니다."
    );
  });
});
