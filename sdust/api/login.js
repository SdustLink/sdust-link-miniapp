import { SW_HOST } from "../utils/constant";
import { RegExec, base64Encode } from "../utils/parser";
import { HTTP } from "../utils/request";

export const loginApp = (account, password, code) => {
  return HTTP.request({
    url: SW_HOST + "xk/LoginToXk",
    method: "POST",
    throttle: true,
    data: {
      encoded: base64Encode(account) + "%%%" + base64Encode(password),
      RANDOMCODE: code,
    },
  })
    .then(res => {
      if (
        res.statusCode === 302 ||
        res.data.indexOf("calender_user_schedule") > -1 ||
        res.data.indexOf("TopUserSetting") > -1
      ) {
        return { status: 1, msg: "" };
      } else {
        const err = RegExec.exec(/<font[\s\S]*?>(.*?)<\/font>/, res.data);
        const msg = err.indexOf("!!") > -1 ? "验证码错误" : "账号或密码错误";
        return { status: 2, msg };
      }
    })
    .catch(error => {
      if (error && /domain list/.test(error.errMsg)) {
        return { status: 1, msg: "" };
      }
      return { status: 2, msg: "未知错误" };
    });
};

export const requestForVerifyCode = () => {
  return HTTP.request({
    url: SW_HOST + "verifycode.servlet",
    responseType: "arraybuffer",
  }).then(res => res.data);
}; 