import request from "supertest";
import bcrypt from "bcryptjs";

import app from "../app.js";
import User from "../../models/user.model.js";
import { clearDb, connect, disConnect } from "../db-handler.js";

//테스트 전후처리
beforeAll(async () => await connect());
afterEach(async () => await clearDb());
afterAll(async () => await disConnect());

describe("Auth API테스트(로그아웃)", () => {
  it("로그아웃에 성공하면 상태코드 204를 반환한다", async () => {
    //Arrange: 유저생성/ 로그인
    const hashedPassword = await bcrypt.hash("password123!", 10);

    await User.create({
      email: "test@gmail.com",
      password: hashedPassword,
      fullName: "tester",
    });

    const loginResponse = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "test@gmail.com", password: "password123!" });

    // 응답 헤더에서 쿠키 가져오기
    const authCookie = loginResponse.get("set-cookie"); //set Set대소문자 구분X

    //Act
    const res = await request(app)
      .post("/api/v1/auth/logout")
      .set("cookie", authCookie); //컨틀롤러에서 res.clearCookie를 수행하기 위해 res에 쿠키를 넣어줌

    console.log(res);
    expect(res.statusCode).toBe(204);

    //쿠키가 지워졌는지 확인하는 함수 정의
    const setCookieHeader = res.get("set-cookie");

    const isCookieCleared = (cookieName) => {
      const cookie = setCookieHeader.find((c) => c.includes(cookieName));
      if (!cookie) return false; //존재해야함. 값이 비워져있고 유효기간이 1970년으로 변경되는 것.

      //컨트롤러에서 사용한 clearCookie는 쿠키의 값을 비우고 만료기간을 1970년으로 설정함.
      // 값이 비어있거나(token=;), 만료시간이 과거(Max-Age=0 또는 1970년)인지 확인
      const isValueEmpty =
        cookie.includes(`${cookieName}=;`) ||
        cookie.match(new RegExp(`${cookieName}=($|;)`));

      const isExpired = cookie.includes("Max-Age=0") || cookie.includes("1970");

      return isValueEmpty && isExpired;
    };

    // Assert: 서버가 브라우저에게 쿠키를 지우라고 명령했는가?
    expect(isCookieCleared("access_token")).toBe(true);
    expect(isCookieCleared("refresh_token")).toBe(true);
  });
});
