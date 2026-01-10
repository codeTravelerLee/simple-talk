import nodemailer from "nodemailer";

// 이메일 전송 설정
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 인증 코드 이메일 전송 함수
export const sendVerificationEmail = async (to, code) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: "Simple Talk - 이메일 인증 코드",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Simple Talk 이메일 인증</h2>
          <p>안녕하세요!</p>
          <p>Simple Talk 회원가입을 위해 이메일 인증이 필요합니다.</p>
          <p>아래의 인증 코드를 입력해주세요:</p>
          <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h1>
          </div>
          <p>이 코드는 10분 후에 만료됩니다.</p>
          <p>문의사항이 있으시면 support@simpletalk.com으로 연락주세요.</p>
          <p>감사합니다.<br>Simple Talk 팀</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`인증 코드 이메일 전송 완료: ${to}`);
  } catch (error) {
    console.error(`이메일 전송 실패: ${error.message}`);
    throw new Error("이메일 전송에 실패했습니다.");
  }
};
