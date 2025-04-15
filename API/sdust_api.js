import { login as sdustLogin, requestForVerifyCode } from '../sdust/api/login';
import { requestRemoteTimeTable } from '../sdust/api/timetable';
import { requestForGrade } from '../sdust/api/grade';
import { requestForExam } from '../sdust/api/exam';
import { SW_HOST } from '../sdust/utils/constant';
import { HTTP } from '../sdust/utils/request';

const app = getApp();

// 获取验证码
async function getVerificationCode() {
  try {
    const verifyCodeData = await requestForVerifyCode();
    return {
      data: verifyCodeData,
      timestamp: new Date().getTime()
    };
  } catch (error) {
    console.error("获取验证码失败:", error);
    throw new Error("获取验证码失败");
  }
}

// 登录系统
async function login(username, password, verifyCode) {
  try {
    const loginResult = await sdustLogin.loginApp(username, password, verifyCode);
    
    if (loginResult.status === 1) {
      return { 
        success: true, 
        message: "登录成功",
        cookies: wx.getStorageSync('cookies') // sdust api应该已经处理了cookie
      };
    } else {
      return { 
        success: false, 
        message: loginResult.msg || "登录失败，请检查账号、密码或验证码" 
      };
    }
  } catch (error) {
    console.error("登录过程中出错:", error);
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
    const response = await HTTP.request({
      url: SW_HOST + "framework/xsMain.jsp",
      method: "GET"
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

module.exports = {
  getVerificationCode,
  login,
  getStudentInfo,
  getClassInfo,
  getGradeInfo,
  getExamInfo,
  parseStudentInfo,
  init_data,
  only_data
};
