const apiUrl = "https://jwgl.sdust.edu.cn";
const app = getApp();

// 获取加密数据
async function getEncryptionData() {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${apiUrl}/Logon.do?method=logon&flag=sess`,
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          resolve(res.data);
        } else {
          reject(new Error('获取加密数据失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

// 加密凭证
function encryptCredentials(username, password, dataStr) {
  if (dataStr === "no" || !dataStr.includes("#")) {
    console.error("错误：获取到无效的加密数据");
    return null;
  }

  const scode = dataStr.split("#")[0];
  const sxh = dataStr.split("#")[1];
  const code = username + "%%%" + password;
  
  let encoded = "";
  let scodeCopy = scode;

  for (let i = 0; i < code.length; i++) {
    if (i < 20) {
      const sxhValue = parseInt(sxh[i], 10);
      encoded = encoded + code[i] + scodeCopy.substring(0, sxhValue);
      scodeCopy = scodeCopy.substring(sxhValue);
    } else {
      encoded = encoded + code.substring(i);
      break;
    }
  }
  return encoded;
}

// 获取验证码
function getVerificationCode() {
  return new Promise((resolve) => {
    const timestamp = new Date().getTime();
    const verifyCodeUrl = `${apiUrl}/verifycode.servlet?t=${timestamp}`;
    
    resolve({
      url: verifyCodeUrl,
      timestamp: timestamp
    });
  });
}

// 登录系统
async function login(username, password, verifyCode) {
  try {
    // 获取加密数据
    const dataStr = await getEncryptionData();
    
    // 加密凭证
    const encoded = encryptCredentials(username, password, dataStr);
    if (!encoded) {
      return { success: false, message: "凭证加密失败" };
    }
    
    // 准备登录数据
    const loginData = {
      userAccount: username,
      userPassword: password,
      RANDOMCODE: verifyCode,
      encoded: encoded,
      useDogCode: "",
      view: "0"
    };
    
    // 发送登录请求
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${apiUrl}/Logon.do?method=logon`,
        method: 'POST',
        data: loginData,
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        success: (res) => {
          if (res.statusCode === 200) {
            if (res.data.includes("错误") || res.data.toLowerCase().includes("failed")) {
              resolve({ success: false, message: "登录失败，请检查账号、密码或验证码" });
            } else {
              // 使用cookie保存会话信息
              const cookies = res.header['Set-Cookie'] || res.header['set-cookie'];
              
              if (cookies) {
                wx.setStorageSync('cookies', cookies);
                resolve({ success: true, message: "登录成功", cookies: cookies });
              } else {
                resolve({ success: false, message: "登录成功但未获取到会话信息" });
              }
            }
          } else {
            reject(new Error(`请求失败，状态码：${res.statusCode}`));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  } catch (error) {
    console.error("登录过程中出错:", error);
    return { success: false, message: error.message || "登录过程中出错" };
  }
}

// 使用Cookie进行请求的通用方法
function makeAuthenticatedRequest(url, method, data = {}, additionalHeaders = {}) {
  return new Promise((resolve, reject) => {
    const cookies = wx.getStorageSync('cookies');
    if (!cookies) {
      reject(new Error("未登录或会话已过期"));
      return;
    }

    wx.request({
      url,
      method,
      data,
      header: {
        'Cookie': cookies,
        ...additionalHeaders
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(new Error(`请求失败，状态码：${res.statusCode}`));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

// 获取学生信息
function getStudentInfo() {
  // 此处实现获取学生信息的接口
  // 示例：return makeAuthenticatedRequest(`${apiUrl}/xsxxxck.do?method=comeIntoXsxx`, 'GET');
  return makeAuthenticatedRequest(`${apiUrl}/jsxsd/framework/xsMain.jsp`, 'GET');
}

// 获取课表信息
function getClassInfo(xnxqh, zc) {
  return makeAuthenticatedRequest(`${apiUrl}/jsxsd/xskb/xskb_list.do`, 'POST', {
    xnxq01id: xnxqh,
    zc: zc
  });
}

// 获取成绩信息
function getGradeInfo() {
  return makeAuthenticatedRequest(`${apiUrl}/jsxsd/kscj/cjcx_list`, 'GET');
}

// 获取考试信息
function getExamInfo() {
  return makeAuthenticatedRequest(`${apiUrl}/jsxsd/xsks/xsksap_list`, 'GET');
}

// 解析学生信息
function parseStudentInfo(htmlContent) {
  // 从HTML内容中提取学生信息
  const info = {};
  
  // 这里需要根据实际HTML结构编写解析代码
  // 例如，可以使用正则表达式提取关键信息
  
  return info;
}

// 解析课表信息
function parseClassInfo(htmlContent) {
  // 从HTML内容中提取课表信息
  const classes = [];
  
  // 这里需要根据实际HTML结构编写解析代码
  
  return classes;
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
    const studentInfoHtml = await getStudentInfo();
    const studentInfo = parseStudentInfo(studentInfoHtml);
    app.globalData.student_info = studentInfo;
    
    // 获取当前学期和周次
    // 这里可能需要从页面中解析或者使用其他方式获取
    const currentTime = {
      xnxqh: wx.getStorageSync('currentXnxqh') || "",
      zc: wx.getStorageSync('currentZc') || 1
    };
    app.globalData.current_time = currentTime;
    app.globalData.week_time = currentTime.zc;
    
    // 获取课表
    const classInfoHtml = await getClassInfo(currentTime.xnxqh, currentTime.zc);
    const classInfo = parseClassInfo(classInfoHtml);
    app.globalData.class_info = classInfo;
    
    // 同步数据到服务器
    if (app.globalData.TotalUrl) {
      try {
        const loginResponse = await new Promise((resolve, reject) => {
          wx.request({
            url: `${app.globalData.TotalUrl}/qz/login-info/`,
            method: 'POST',
            data: {
              code: "wxdb4a3a20947d7c4a",
              snumber: studentInfo.xh,
              name: studentInfo.xm,
              classname: studentInfo.bj,
              majorname: studentInfo.zymc,
              collegename: studentInfo.yxmc,
              enteryear: studentInfo.rxnf,
              gradenumber: studentInfo.usertype,
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
  getEncryptionData,
  encryptCredentials,
  getVerificationCode,
  login,
  getStudentInfo,
  getClassInfo,
  getGradeInfo,
  getExamInfo,
  parseStudentInfo,
  parseClassInfo,
  init_data,
  only_data
}; 