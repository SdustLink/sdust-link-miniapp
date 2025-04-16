import { SW_HOST } from "../utils/constant";
import { RegExec, base64Encode } from "../utils/parser";
import { HTTP } from "../utils/request";

export const loginApp = (account, password, code) => {
  console.log("开始登录请求:", account, code);
  return HTTP.request({
    url: SW_HOST + "Logon.do?method=logon",
    method: "POST",
    data: {
      encoded: base64Encode(account) + "%%%" + base64Encode(password),
      RANDOMCODE: code,
    },
  })
    .then(res => {
      console.log("登录请求成功，状态码:", res.statusCode);
      if (
        res.statusCode === 302 ||
        res.data.indexOf("calender_user_schedule") > -1 ||
        res.data.indexOf("TopUserSetting") > -1
      ) {
        console.log("登录成功条件满足");
        return { status: 1, msg: "" };
      } else {
        console.log("登录失败，解析错误消息");
        console.log("返回数据:", res.data);
        const err = RegExec.exec(/<font[\s\S]*?>(.*?)<\/font>/, res.data);
        console.log("错误信息解析结果:", err);
        const msg = err && err.indexOf("!!") > -1 ? "验证码错误" : "账号或密码错误";
        return { status: 2, msg };
      }
    })
    .catch(error => {
      console.log("登录请求失败，错误:", error);
      if (error && /domain list/.test(error.errMsg)) {
        return { status: 1, msg: "" };
      }
      return { status: 2, msg: "未知错误" };
    });
};

export const requestForVerifyCode = () => {
  const timestamp = new Date().getTime();
  const rand = Math.random();
  console.log("获取验证码，时间戳:", timestamp);
  
  // 注意：这里只请求一次带参数的验证码URL
  return HTTP.request({
    url: `${SW_HOST}verifycode.servlet?t=${timestamp}&rand=${rand}`,
    responseType: "arraybuffer",
    
  }).then(res => {
    console.log("验证码请求完成，Cookie:", wx.getStorageSync('cookies'));
    return res.data;
  });
};