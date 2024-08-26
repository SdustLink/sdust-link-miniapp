const shareapi = require('../API/shareapi');
const apiUrl = "https://jwgl.sdust.edu.cn/app.do";
const app = getApp();

// Helper function for making API requests
async function makeRequest(url, method, data, headers = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method,
      data,
      header: {
        "Referer": "http://www.baidu.com",
        "Accept-encoding": "gzip, deflate, br",
        "Accept-language": "zh-CN,zh-TW;q=0.8,zh;q=0.6,en;q=0.4,ja;q=0.2",
        "Cache-control": "max-age=0",
        ...headers
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(new Error(`Request failed with status ${res.statusCode}`));
        }
      },
      fail: reject
    });
  });
}

// Login function
async function login(account, password) {
  const data = {
    method: "authUser",
    xh: account,
    pwd: password
  };
  const response = await makeRequest(apiUrl, "GET", data);
  if (response.flag === "1") {
    return response.token;
  } else {
    throw new Error("Login failed");
  }
}

// Get student info
async function getStudentInfo(account) {
  const data = {
    method: "getUserInfo",
    xh: account
  };
  return makeRequest(apiUrl, "GET", data, { token: wx.getStorageSync('token') });
}

// Get current time
async function getCurrentTime() {
  const params = {
    method: "getCurrentTime",
    currDate: new Date().toISOString().slice(0, 10)
  };
  try {
    const res = await makeRequest(apiUrl, "GET", params, { token: wx.getStorageSync('token') });
    if (res.zc === null && res.s_time === null && res.xnxqh === null) {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      let academicYear, semester;
      
      if (currentMonth >= 8 || currentMonth <= 1) {
        academicYear = currentMonth >= 8 ? currentYear : currentYear - 1;
        semester = 1;
      } else {
        academicYear = currentYear - 1;
        semester = 2;
      }
      return {
        zc: 1,
        xnxqh: `${academicYear}-${academicYear + 1}-${semester}`
      };
    } else {
      return res;
    }
  } catch (error) {
    console.error("Error getting current time:", error);
    throw error;
  }
}

// Get class info
async function getClassInfo(account, xnxqh, zc = 1) {
  const data = {
    method: "getKbcxAzc",
    xnxqid: xnxqh,
    zc: zc,
    xh: account
  };
  return makeRequest(apiUrl, "GET", data, { token: wx.getStorageSync('token') });
}

// Get classroom info
async function getClassroomInfo(idleTime) {
  const data = {
    method: "getKxJscx",
    time: new Date().toISOString().slice(0, 10),
    idleTime: idleTime
  };
  return makeRequest(apiUrl, "GET", data, { token: wx.getStorageSync('token') });
}

// Get grade info
async function getGradeInfo(account, sy = "") {
  const data = {
    method: "getCjcx",
    xh: account,
    xnxqid: sy
  };
  return makeRequest(apiUrl, "GET", data, { token: wx.getStorageSync('token') });
}

// Get exam info
async function getExamInfo(account) {
  const data = {
    method: "getKscx",
    xh: account
  };
  return makeRequest(apiUrl, "GET", data, { token: wx.getStorageSync('token') });
}

// Initialize data
async function init_data(account, pwd) {
  if (wx.getStorageSync('islogin') === true) {
    app.globalData.todatabasesflag = 0;
    app.globalData.requestflag = 0;
    account = wx.getStorageSync('useraccount');
    pwd = wx.getStorageSync('userpws');

    try {
      const loginResponse = await login(account, pwd);
      wx.setStorageSync('token', loginResponse);
      await only_data(account);
    } catch (error) {
      console.error("Login failed:", error);
      wx.showToast({
        title: '登录失败',
        icon: "error"
      });
      wx.setStorageSync('islogin', false);
    }
  } else {
    wx.navigateTo({
      url: "../pages/Login/LoginContent/logincontent"
    });
  }
}

// Get and process data
async function only_data(account) {
  try {
    const timeInfo = await getCurrentTime();
    app.globalData.current_time = timeInfo;
    app.globalData.week_time = timeInfo.zc || 20;

    const classInfo = await getClassInfo(account, timeInfo.xnxqh, app.globalData.week_time);
    app.globalData.requestflag++;
    const tableformat = require('../utils/table');
    app.globalData.class_info = tableformat.processTableOrd(classInfo);
    app.globalData.table_ord = classInfo;

    const studentInfo = await getStudentInfo(account);
    if (studentInfo.token === "-1") {
      wx.setStorageSync('islogin', false);
      throw new Error("Invalid student info");
    }
    app.globalData.student_info = studentInfo;
    app.globalData.requestflag++;

    const loginResponse = await makeRequest(
      `${app.globalData.TotalUrl}/qz/login-info/`,
      'POST',
      {
        code: "wxdb4a3a20947d7c4a",
        snumber: studentInfo.xh,
        name: studentInfo.xm,
        classname: studentInfo.bj,
        majorname: studentInfo.zymc,
        collegename: studentInfo.yxmc,
        enteryear: studentInfo.rxnf,
        gradenumber: studentInfo.usertype,
      }
    );

    if (loginResponse.status === "success") {
      app.globalData.todatabasesflag++;
      wx.setStorageSync('tokentoset', loginResponse.token);
    }
  } catch (error) {
    console.error("Error in only_data:", error);
    // Handle the error appropriately
  }
}

// Post class info to backend
async function postclass(week_ordinal = app.globalData.week_time, table_ord = app.globalData.table_ord) {
  if (!table_ord) {
    wx.showToast({
      title: '强智未返回课表',
      icon: "error"
    });
    return;
  }

  try {
    const response = await makeRequest(
      `${app.globalData.TotalUrl}/qz/class-info/`,
      'POST',
      {
        table_ord: table_ord,
        token: wx.getStorageSync('tokentoset'),
        snumber: wx.getStorageSync('useraccount'),
        week: week_ordinal
      }
    );

    if (response.status === "success") {
      app.globalData.todatabasesflag++;
    }
  } catch (error) {
    console.error("Error posting class info:", error);
    // Handle the error appropriately
  }
}

// Get and post class info for a specific week
async function getpostclass(week_ordinal) {
  try {
    const classInfo = await getClassInfo(
      wx.getStorageSync('useraccount'),
      app.globalData.current_time.xnxqh,
      week_ordinal
    );

    await postclass(week_ordinal, classInfo);
  } catch (error) {
    console.error("Error in getpostclass:", error);
    // Handle the error appropriately
  }
}

// Get exam info
async function getexam() {
  return getExamInfo(wx.getStorageSync('useraccount'));
}

module.exports = {
  login,
  getStudentInfo,
  getCurrentTime,
  getClassInfo,
  getClassroomInfo,
  getGradeInfo,
  getExamInfo,
  init_data,
  only_data,
  postclass,
  getpostclass,
  getexam
};