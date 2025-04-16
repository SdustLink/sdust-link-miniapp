import { login as sdustLogin, requestForVerifyCode } from '../sdust/api/login';
import { requestRemoteTimeTable } from '../sdust/api/timetable';
import { requestForGrade } from '../sdust/api/grade';
import { requestForExam } from '../sdust/api/exam';
import { SW_HOST } from '../sdust/utils/constant';
import { HTTP } from '../sdust/utils/request';
import { base64Encode } from '../sdust/utils/parser';

const app = getApp();

// 获取验证码
async function getVerificationCode() {
  try {
    console.log("开始获取验证码...", SW_HOST + "verifycode.servlet");
    
    // 使用直接的wx.request
    const verifyCodeData = await new Promise((resolve, reject) => {
      wx.request({
        url: SW_HOST + "verifycode.servlet",
        method: "GET",
        responseType: "arraybuffer",
        enableHttp2: true,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(new Error(`服务器返回错误状态码: ${res.statusCode}`));
          }
        },
        fail: (err) => {
          console.error("验证码请求失败:", err);
          
          // 针对ERR_CONNECTION_CLOSED错误给出更明确的提示
          if (err.errMsg && err.errMsg.includes("CONNECTION_CLOSED")) {
            const errMsg = "连接被关闭，请确认jwgl.sdust.edu.cn已添加到小程序管理后台的request合法域名中";
            reject(new Error(errMsg));
          } else {
            reject(err);
          }
        }
      });
    });
    
    const timestamp = new Date().getTime();
    return {
      url: `${SW_HOST}verifycode.servlet?t=${timestamp}`,
      timestamp: timestamp,
      data: verifyCodeData
    };
  } catch (error) {
    console.error("获取验证码失败:", error);
    throw new Error(error.message || "获取验证码失败");
  }
}

// 登录系统
async function login(username, password, verifyCode) {
  try {
    console.log("sdust_api.js: 开始调用登录函数", { username,password, verifyCode });
    
    // 使用wx.request替代HTTP.request
    const loginResult = await new Promise((resolve, reject) => {
      wx.request({
        url: SW_HOST + "xk/LoginToXk",
        method: "POST",
        data: {
          encoded: base64Encode(username) + "%%%" + base64Encode(password),
          RANDOMCODE: verifyCode,
        },
        success: (res) => {
          resolve(res);
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
    
    console.log("sdust_api.js: 登录请求响应", loginResult);
    
    if (
      loginResult.statusCode === 302 ||
      loginResult.data.indexOf("calender_user_schedule") > -1 ||
      loginResult.data.indexOf("TopUserSetting") > -1
    ) {
      console.log("sdust_api.js: 登录成功");
      // 保存cookies
      if (loginResult.header && (loginResult.header['Set-Cookie'] || loginResult.header['set-cookie'])) {
        const cookies = loginResult.header['Set-Cookie'] || loginResult.header['set-cookie'];
        wx.setStorageSync('cookies', cookies);
      }
      
      return { 
        success: true, 
        message: "登录成功",
        cookies: wx.getStorageSync('cookies')
      };
    } else {
      console.log("sdust_api.js: 登录失败");
      // 尝试解析错误消息
      let errorMsg = "登录失败，请检查账号、密码或验证码";
      try {
        const errMatch = /<font[\s\S]*?>(.*?)<\/font>/.exec(loginResult.data);
        if (errMatch && errMatch[1]) {
          errorMsg = errMatch[1].indexOf("!!") > -1 ? "验证码错误" : "账号或密码错误";
        }
      } catch (e) {
        console.error("解析错误消息失败", e);
      }
      
      return { 
        success: false, 
        message: errorMsg
      };
    }
  } catch (error) {
    console.error("sdust_api.js: 登录过程中出错:", error);
    return { success: false, message: error.message || "登录过程中出错" };
  }
}

// 获取课表信息
async function getClassInfo(xnxqh, zc) {
  try {
    const timetableData = await requestRemoteTimeTable(xnxqh, zc);
    return timetableData;
  } catch (error) {
    console.error("获取课表失败:", error);
    throw new Error("获取课表失败");
  }
}

// 获取成绩信息
async function getGradeInfo(term = "") {
  try {
    const gradeData = await requestForGrade(term);
    return gradeData;
  } catch (error) {
    console.error("获取成绩失败:", error);
    throw new Error("获取成绩失败");
  }
}

// 获取考试信息
async function getExamInfo(term = "") {
  try {
    const examData = await requestForExam(term);
    return examData;
  } catch (error) {
    console.error("获取考试信息失败:", error);
    throw new Error("获取考试信息失败");
  }
}

// 获取学生信息 (需要从HTML解析)
async function getStudentInfo() {
  try {
    const response = await new Promise((resolve, reject) => {
      wx.request({
        url: SW_HOST + "framework/xsMain.jsp",
        method: "GET",
        success: (res) => {
          resolve(res);
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
    
    // 这里需要实现从HTML解析学生信息的逻辑
    // 由于sdust api中没有现成的方法，需要自行实现
    const studentInfo = parseStudentInfo(response.data);
    return studentInfo;
  } catch (error) {
    console.error("获取学生信息失败:", error);
    throw new Error("获取学生信息失败");
  }
}

// 从HTML解析学生信息
function parseStudentInfo(html) {
  // 这里需要实现解析学生信息的逻辑
  // 可以参考qzapi_new.js和qzapi.js中的相关实现
  // 这里简单返回一个空对象，实际应用中需要完善
  return {};
}

// 初始化数据
async function init_data(account, pwd) {
  if (wx.getStorageSync('islogin') === true) {
    try {
      const verifyCodeInfo = await getVerificationCode();
      // 这里需要先展示验证码给用户看，让用户输入验证码
      // 简化处理，这里假设已经获取了用户输入的验证码
      const verifyCode = wx.getStorageSync('verifyCode') || "";
      
      const loginResult = await login(account, pwd, verifyCode);
      
      if (loginResult.success) {
        // 登录成功后获取学生信息等数据
        await only_data();
      } else {
        wx.showToast({
          title: loginResult.message || '登录失败',
          icon: "error"
        });
        wx.setStorageSync('islogin', false);
      }
    } catch (error) {
      console.error("初始化数据失败:", error);
      wx.showToast({
        title: '登录失败',
        icon: "error"
      });
      wx.setStorageSync('islogin', false);
    }
  }
}

// 获取并处理数据
async function only_data() {
  try {
    const studentInfoData = await getStudentInfo();
    app.globalData.student_info = studentInfoData;
    
    // 获取当前学期和周次
    // 这里可能需要从页面中解析或者使用其他方式获取
    const currentTime = {
      xnxqh: wx.getStorageSync('currentXnxqh') || "",
      zc: wx.getStorageSync('currentZc') || 1
    };
    app.globalData.current_time = currentTime;
    app.globalData.week_time = currentTime.zc;
    
    // 获取课表
    const classInfoData = await getClassInfo(currentTime.xnxqh, currentTime.zc);
    app.globalData.class_info = classInfoData;
    
    // 同步数据到服务器
    if (app.globalData.TotalUrl) {
      try {
        const loginResponse = await new Promise((resolve, reject) => {
          wx.request({
            url: `${app.globalData.TotalUrl}/qz/login-info/`,
            method: 'POST',
            data: {
              code: "wxdb4a3a20947d7c4a",
              snumber: studentInfoData.xh,
              name: studentInfoData.xm,
              classname: studentInfoData.bj,
              majorname: studentInfoData.zymc,
              collegename: studentInfoData.yxmc,
              enteryear: studentInfoData.rxnf,
              gradenumber: studentInfoData.usertype,
            },
            success: (res) => resolve(res.data),
            fail: reject
          });
        });

        if (loginResponse.status === "success") {
          app.globalData.todatabasesflag++;
          wx.setStorageSync('tokentoset', loginResponse.token);
        }
      } catch (error) {
        console.error("同步数据到服务器失败:", error);
      }
    }
  } catch (error) {
    console.error("获取数据失败:", error);
  }
}

// 通用网络请求方法
async function request(options) {
  return new Promise((resolve, reject) => {
    // 默认添加cookie
    const header = options.header || {};
    const cookies = wx.getStorageSync('cookies');
    if (cookies) {
      header.Cookie = cookies;
    }

    wx.request({
      url: options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: header,
      success: (res) => {
        // 处理可能存在的新cookie
        if (res.header && (res.header['Set-Cookie'] || res.header['set-cookie'])) {
          const newCookies = res.header['Set-Cookie'] || res.header['set-cookie'];
          wx.setStorageSync('cookies', newCookies);
        }
        resolve(res);
      },
      fail: (err) => {
        console.error("网络请求失败:", err);
        reject(err);
      }
    });
  });
}

// 直接使用wx.request示例函数
async function directRequestExample(url, method = 'GET', data = {}, header = {}) {
  // 获取存储的cookie
  const cookies = wx.getStorageSync('cookies');
  if (cookies) {
    header.Cookie = cookies;
  }
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: url.startsWith('http') ? url : SW_HOST + url,
      method: method,
      data: data,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        ...header
      },
      success: (res) => {
        // 处理cookie
        if (res.header && (res.header['Set-Cookie'] || res.header['set-cookie'])) {
          const newCookies = res.header['Set-Cookie'] || res.header['set-cookie'];
          wx.setStorageSync('cookies', newCookies);
        }
        
        resolve(res);
      },
      fail: (err) => {
        console.error('请求失败:', err);
        reject(err);
      }
    });
  });
}

// 直接使用wx.request获取课表
async function getTimeTableDirect(term, week) {
  try {
    const result = await directRequestExample(
      "xskb/xskb_list.do", 
      "GET", 
      { week, term }
    );
    
    // 使用parser.js中的解析函数处理返回的HTML
    const { RegExec } = require('../sdust/utils/parser');
    
    // 解析课表逻辑（复用timetable.js中的解析函数）
    const timeTable = [];
    const classes = RegExec.match(/<div[\s\S]*?class="kbcontent"[\s]?>(.*?)<\/div>/g, result.data);

    classes.forEach((item, index) => {
      const repeat = item.split(/-{10,}/g);
      const day = index % 7;
      const serial = Math.floor(index / 7);

      for (const value of repeat) {
        if (value.startsWith("&nbsp;")) continue;
        const nameGroup = value.split(/(<\/br>)|(<br\/>)/g);
        const name = RegExec.get(nameGroup, 0).replace("<br>", "").replace(/[（]/g, "(").replace("）", ")");
        const teacher = RegExec.exec(/<font[\s\S]*?title='老师'[\s\S]*?>(.*?)<\/font>/g, value);
        const weekStr = RegExec.exec(/<font[\s\S]*?title='周次\(节次\)'[\s\S]*?>(.*?)<\/font>/g, value)
          .replace(/[,=\\]/g, ",")
          .replace(/[（]/g, "(")
          .replace("）", ")");
        const classroom = RegExec.exec(/<font[\s\S]*?title='教室'[\s\S]*?>(.*?)<\/font>/g, value);

        timeTable.push({
          weekDay: day,
          serial,
          className: name,
          classRoom: classroom,
          teacher,
          ext: weekStr.replace(/[()]/g, ""),
        });
      }
    });

    return timeTable;
  } catch (error) {
    console.error("获取课表失败:", error);
    throw new Error("获取课表失败");
  }
}

module.exports = {
  getVerificationCode,
  login,
  getStudentInfo,
  getClassInfo,
  getGradeInfo,
  getExamInfo,
  parseStudentInfo,
  init_data,
  only_data,
  request,
  directRequestExample,
  getTimeTableDirect
};
