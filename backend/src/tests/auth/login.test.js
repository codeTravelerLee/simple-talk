import request from "supertest";
import bcrypt from "bcryptjs";

import redis from "../../configs/redis.js";
import { clearDb, connect, disConncet } from "../db-handler.js";
import app from "../app.js";
import User from "../../models/user.model.js";

beforeAll(async () => await connect());
afterEach(async () => await clearDb());
afterAll(async () => {
  await disConncet();
  await redis.quit();
});

describe("Auth API테스트(로그인)", () => {
  it("로그인 성공시 상태코드 200을 반환한다.", async () => {
    //Arrange
    const hashedPassword = await bcrypt.hash("password123!", 10);

    await User.create({
      email: "test@gmail.com",
      password: hashedPassword,
      fullName: "tester",
    });

    //Act
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "test@gmail.com", password: "password123!" });

    //Assert
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");

    const loggedInUser = await User.findOne({ email: "test@gmail.com" });
    expect(loggedInUser.passwordWrongCount).toBe(0); //로그인 성공시 비밀번호 틀린 횟수 0으로 잘 초기화 되었는지 확인
  });

  it("로그인 폼에서 모든 값이 입력되지 않으면 상태코드 400을 반환한다.", async () => {
    //Arrange
    const hashedPassword = await bcrypt.hash("password123!", 10);

    await User.create({
      email: "test@gmail.com",
      password: hashedPassword,
      fullName: "tester",
    });

    //Act
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ password: "password123!" });

    //Assert
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "모든 정보를 입력해 주세요!");
  });

  it("해당 이메일로 가입된 유저 정보가 없으면 상태코드 400을 반환한다.", async () => {
    //Arrange
    const hashedPassword = await bcrypt.hash("password123!", 10);

    await User.create({
      email: "test@gmail.com",
      password: hashedPassword,
      fullName: "tester",
    });

    //Act
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "surprise@gmail.com", password: "password123!" });

    //Assert
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      "error",
      "이메일 또는 비밀번호를 확인해주세요."
    );
  });

  it("계정이 잠겼다면 상태코드 403을 반환한다.", async () => {
    //Arrange
    const hashedPassword = await bcrypt.hash("password123!", 10);

    await User.create({
      email: "test@gmail.com",
      password: hashedPassword,
      fullName: "tester",
      isAccountLocked: true,
      lockedUntil: new Date(Date.now() + 5 * 60 * 1000),
    });

    //Act
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "test@gmail.com", password: "password123!" });

    //Assert
    expect(res.statusCode).toBe(403);
  });

  it("비밀번호를 틀리면 상태코드 400을 반환하고 틀린횟수를 1증가시킨다.", async () => {
    //Arrange
    const hashedPassword = await bcrypt.hash("password123!", 10);

    await User.create({
      email: "test@gmail.com",
      password: hashedPassword,
      fullName: "tester",
    });

    //Act
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "test@gmail.com", password: "wrongpw12!" });

    //Assert
    expect(res.statusCode).toBe(400);

    const loggedInUser = await User.findOne({ email: "test@gmail.com" });
    expect(loggedInUser.passwordWrongCount).toBe(1);
  });

  it("비밀번호를 4회 틀리면 상태코드 400을 반환하고 경고메시지를 보낸다", async () => {
    //Arrange
    const hashedPassword = await bcrypt.hash("password123!", 10);

    await User.create({
      email: "test@gmail.com",
      password: hashedPassword,
      fullName: "tester",
      passwordWrongCount: 3,
    });

    //Act
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "test@gmail.com", password: "wrongpw12!" });

    //Assert
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      "error",
      "비밀번호를 4회 틀리셨습니다. 1회 더 틀리면 계정이 20분간 잠깁니다."
    );

    const loggedInUser = await User.findOne({ email: "test@gmail.com" });
    expect(loggedInUser.passwordWrongCount).toBe(4);
  });

  it("비밀번호를 5회 틀리면 계정이 잠긴다", async () => {
    //Arrange
    const hashedPassword = await bcrypt.hash("password123!", 10);

    await User.create({
      email: "test@gmail.com",
      password: hashedPassword,
      fullName: "tester",
      passwordWrongCount: 4,
    });

    //Act
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "test@gmail.com", password: "wrongpw12!" });

    //Assert
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      "error",
      "비밀번호를 5회 틀려 20분간 계정이 잠깁니다. 20분 후에 다시 시도해주세요."
    );

    const loggedInUser = await User.findOne({ email: "test@gmail.com" });

    expect(loggedInUser.passwordWrongCount).toBe(5);
    expect(loggedInUser.isAccountLocked).toBe(true);
  });

  it("로그인을 성공하면 쿠키가 저장된다", async () => {
    //Arrange
    const hashedPassword = await bcrypt.hash("password123!", 10);

    await User.create({
      email: "test@gmail.com",
      password: hashedPassword,
      fullName: "tester",
    });

    //Act
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "test@gmail.com", password: "password123!" });

    //Assert
    const cookies = res.get("Set-Cookie");
    expect(cookies).toBeDefined(); //비어있지 않은지 확인

    const hasJwtCookie = cookies.some((cookie) =>
      cookie.includes("access_token")
    );
    expect(hasJwtCookie).toBe(true); //access_token이라는 이름의 쿠키가 잘 저장되었는지 확인
  });
});
