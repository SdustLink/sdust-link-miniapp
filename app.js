// app.js

App({


  onLaunch() {
    var that = this;

    //请求基础数据-app.js不好封装
    if (wx.getStorageSync('islogin') == true) {
      var account = wx.getStorageSync('useraccount')
      var pwd = wx.getStorageSync('userpws');

      //客户端登录
      wx.request({
        url: 'https://jwgl.sdust.edu.cn/app.do',
        method: 'GET',
        data: {
          "method": "authUser",
          "xh": account,
          "pwd": pwd
        },
        header: {

          "Referer": "http://www.baidu.com",
          "Accept-encoding": "gzip, deflate, br",
          "Accept-language": "zh-CN,zh-TW;q=0.8,zh;q=0.6,en;q=0.4,ja;q=0.2",
          "Cache-control": "max-age=0",
          token: wx.getStorageSync('token')
        },
        success: (res) => {
          if (res.data["flag"] != "1") {
            wx.showToast({
              title: '登录失败',
              icon: "error"
            });
            wx.setStorageSync('islogin', false);
          } else {

            wx.setStorageSync('token', res.data["token"]);
            //请求时间信息
            wx.request({
              url: 'https://jwgl.sdust.edu.cn/app.do',
              method: 'get',
              data: {
                method: "getCurrentTime",
                currDate: new Date().toISOString().slice(0, 10)
              },
              header: {

                "Referer": "http://www.baidu.com",
                "Accept-encoding": "gzip, deflate, br",
                "Accept-language": "zh-CN,zh-TW;q=0.8,zh;q=0.6,en;q=0.4,ja;q=0.2",
                "Cache-control": "max-age=0",
                token: wx.getStorageSync('token')
              },
              success: (res) => {
                that.globalData.current_time = res.data

                console.log(that.globalData.current_time)
                if (that.globalData.current_time["zc"] === null &&  that.globalData.current_time["xnxqh"] === null) {
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
                  that.globalData.week_time = 1
                  res={
                    zc: 1,
                    xnxqh: `${academicYear}-${academicYear + 1}-${semester}`
                  };
                  console.log('1111111111111',res)
                } 
                else{
                  that.globalData.week_time = that.globalData.current_time["zc"]
                }
                // 请求课表数据
                wx.request({
                  url: 'https://jwgl.sdust.edu.cn/app.do',
                  method: 'GET',
                  data: {
                    method: "getKbcxAzc",
                    xnxqid: that.globalData.current_time["xnxqh"],
                    zc: that.globalData.week_time,
                    xh: account
                  },
                  header: {

                    "Referer": "http://www.baidu.com",
                    "Accept-encoding": "gzip, deflate, br",
                    "Accept-language": "zh-CN,zh-TW;q=0.8,zh;q=0.6,en;q=0.4,ja;q=0.2",
                    "Cache-control": "max-age=0",
                    token: wx.getStorageSync('token')
                  },
                  success: (res) => {

                    // 将课表传输到schedule_table
                    that.globalData.requestflag++;
                    var resjson = res.data;
                    const tableformat = require('./utils/table');
                    that.globalData.class_info = tableformat.processTableOrd(resjson);
                    that.globalData.table_ord = resjson;

                  }
                })
              }
            })
            //请求学生信息
            wx.request({
              url: "https://jwgl.sdust.edu.cn/app.do",
              method: 'GET',
              data: {
                method: "getUserInfo",
                xh: account
              },

              header: {
                "Referer": "http://www.baidu.com",
                "Accept-encoding": "gzip, deflate, br",
                "Accept-language": "zh-CN,zh-TW;q=0.8,zh;q=0.6,en;q=0.4,ja;q=0.2",
                "Cache-control": "max-age=0",
                token: wx.getStorageSync('token')
              },
              success: (res) => {
                if (res.data["token"] == "-1") {
                  wx.setStorageSync('islogin', false);
                }
                that.globalData.student_info = res.data
                that.globalData.requestflag++;
                var content = res.data




                //wx.login获取code。

                //发起网络请求
                wx.request({
                  url: that.globalData.TotalUrl + '/qz/login-info/',
                  method: 'POST',
                  //向后端发送的数据
                  data: {
                    code: "wxdb4a3a20947d7c4a",    //将code发送到后台服务器。
                    snumber: content["xh"],  //替换为实际的账号值
                    name: content["xm"],        //替换为实际的姓名值
                    classname: content["bj"], //替换为实际的班级名值
                    majorname: content["zymc"], //替换为实际的专业名值
                    collegename: content["yxmc"], //替换为实际的学院名值
                    enteryear: content["rxnf"], //替换为实际的入学年份值
                    gradenumber: content["usertype"], //替换为实际的年级号值
                  },
                  header: {
                    "Referer": "http://www.baidu.com",
                    "Accept-encoding": "gzip, deflate, br",
                    "Accept-language": "zh-CN,zh-TW;q=0.8,zh;q=0.6,en;q=0.4,ja;q=0.2",
                    "Cache-control": "max-age=0",
                  }, success: (res) => {

                    if (res.data['status'] == "success") {
                      that.globalData.todatabasesflag++;
                      wx.setStorageSync('tokentoset', res.data["token"]);
                    }
                  }
                })




              }

            })
          }
        },
        fail: (res) => {
          that.globalData.requestflag = 0
          that.globalData.todatabasesflag = 0
        }
      })




    }


  },
  onShow() {
    function isset(key) {
      //鉴别是否存在缓存
      let val = wx.getStorageSync(key)
      return val !== '' && val !== null & val !== undefined
    }




  },
  onHide() {
    const app = getApp()
    wx.setStorageSync('selected_time_event_datalist', app.globalData.selected_time_event_datalist)
    wx.setStorageSync('not_selected_time_event_datalist', app.globalData.not_selected_time_event_datalist)
    wx.setStorageSync('overtime_event_datalist', app.globalData.overtime_event_datalist)
    wx.setStorageSync('finished_event_datalist', app.globalData.finished_event_datalist)
  },


  globalData: {
    statusBarHeight: 0,//导航栏
    navBarHeight: 0,//导航栏
    userInfo: null,
    class_info: null, //课程信息
    table_ord: null,
    student_info: null, //学生信息
    current_time: null, //时间信息
    week_time: 1, //第几周
    set_all_data: {
      islogin: wx.getStorageSync('islogin'), //是否登录
    },
    sharedata: {},
    requestflag: 0,//判断QZ请求状态
    todatabasesflag: 0,//判断数据库请求状态
    examlist: [],
    scheduleResource: [
      "https://www.sxksxk.work/static/schedule/1.png",
      "https://www.sxksxk.work/static/schedule/2.png",
      "https://www.sxksxk.work/static/schedule/3.png",
      "https://www.sxksxk.work/static/schedule/4.png",
      "https://www.sxksxk.work/static/schedule/5.png",
      "https://www.sxksxk.work/static/schedule/6.png",
      "https://www.sxksxk.work/static/schedule/7.png",
      "https://www.sxksxk.work/static/schedule/8.png",
      "https://www.sxksxk.work/static/schedule/9.png",
      "https://www.sxksxk.work/static/schedule/10.png",
      "https://www.sxksxk.work/static/schedule/11.png",
      "https://www.sxksxk.work/static/schedule/12.png",
      "https://www.sxksxk.work/static/schedule/13.png",
      "https://www.sxksxk.work/static/schedule/14.png",
      "https://www.sxksxk.work/static/schedule/15.png",
      "https://www.sxksxk.work/static/schedule/16.png",
      "https://www.sxksxk.work/static/schedule/17.png",
      "https://www.sxksxk.work/static/schedule/18.png",
      "https://www.sxksxk.work/static/schedule/19.png",
      "https://www.sxksxk.work/static/schedule/20.png",
      "https://www.sxksxk.work/static/schedule/21.png",
    ],
    TotalUrl:"https://www.sxksxk.work",

    //备忘录部分全局变量声明
    //01 未设置时间的事件
    not_selected_time_event_datalist: [],
    //02 设置时间的事件
    selected_time_event_datalist: [],
    //03 超时的事件
    overtime_event_datalist: [],
    //04 完成的事件
    finished_event_datalist: [],
  }

})