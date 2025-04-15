const app = getApp()
const qzapi=require('./sdust_api')

/* -------------共享课表----------------- */

// 获取共享状态
function getsharestate() {
  return new Promise((resolve, reject) => {
    wx.request({
      url: app.globalData.TotalUrl+'/qz/share-state/',
      method: 'POST',
      data: {
        "account": wx.getStorageSync('useraccount'),
        "token" :  wx.getStorageSync('tokentoset')
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.statusCode == 200) {
          app.globalData.sharedata=res.data
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: function (res) {
        reject(res);
      }
    });
  });
}
// 发起共享请求
function postsharestate(postnum, cont,cancel) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: app.globalData.TotalUrl+'/qz/share-state/post/',
      method: 'POST',
      data: {
        "account": wx.getStorageSync('useraccount'),
        "cont":cont,
        "cancel":cancel,
        "postnum": postnum,
        "token" :  wx.getStorageSync('tokentoset')
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.statusCode == 200) {
          wx.request({
            url: app.globalData.TotalUrl+'/qz/share-state/',
            method: 'POST',
            data: {
              "account": wx.getStorageSync('useraccount'),
              "token" :  wx.getStorageSync('tokentoset')
            },
            header: {
              'content-type': 'application/json'
            },
            success: (res) => {
              if (res.statusCode == 200) {
                app.globalData.sharedata=res.data

              } 
              resolve(res)
            }
          });
          if(cancel){
          // 将请求的目标账号信息分别剔除postman本地缓存
          var postnumstring='postnum'+cont
          wx.setStorageSync(postnumstring, "");
          }
          else{
          // 将请求的目标账号信息分别存入postman本地缓存
          var postnumstring='postnum'+cont
          wx.setStorageSync(postnumstring, postnum);
          }




        } else {
          reject(res);
        }
      },
      fail: function (res) {
        reject(res);
      }
    });
  });
}
// 回复共享请求
function replysharestate(postnum, cont,reply) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: app.globalData.TotalUrl+'/qz/share-state/reply/',
      method: 'POST',
      data: {
        "account": wx.getStorageSync('useraccount'),
        "cont":cont,
        "reply":reply,
        "postnum": postnum,
        "token" :  wx.getStorageSync('tokentoset')
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.statusCode == 200) {
          wx.request({
            url: app.globalData.TotalUrl+'/qz/share-state/',
            method: 'POST',
            data: {
              "account": wx.getStorageSync('useraccount'),
              "token" :  wx.getStorageSync('tokentoset')
            },
            header: {
              'content-type': 'application/json'
            },
            success: (res) => {
              if (res.statusCode == 200) {
                app.globalData.sharedata=res.data
              } 
              resolve(res)
            }
          });
          if(!reply){
            // 将请求的目标账号信息分别剔除postman本地缓存
            var postnumstring='postnum'+cont
            wx.setStorageSync(postnumstring, "");
            }
            else{
            // 将请求的目标账号信息分别存入postman本地缓存
            var postnumstring='postnum'+cont
            wx.setStorageSync(postnumstring, postnum);
            }
        } else {
          reject(res);
        }

      },
      fail: function (res) {
        reject(res);
      }
    });
  });
}
// 获取共享信息
function getshareinfo(cont,week_number,postnum) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: app.globalData.TotalUrl+'/qz/share-info/get/',
      method: 'POST',
      data: {
        "account": wx.getStorageSync('useraccount'),
        "token" :  wx.getStorageSync('tokentoset'),
        "cont":cont,//部门/账号名称ABCD
        "week_number":week_number,//周数
        "postnum":postnum//对方账号
      },
      header: { 
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.statusCode == 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: function (res) {
        if(res.data["code"] ==4100){
          

        }
        reject(res);
      }
    });
  });
}

/* -------------部门课表-------------- */

// 获取部门课表信息
function getdepartmentinfo(departmentflag,week_number) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: app.globalData.TotalUrl+'/qz/share-dept/get/',
      method: 'POST',
      data: {
        "account": wx.getStorageSync('useraccount'),
        "token" :  wx.getStorageSync('tokentoset'),
        "cont":departmentflag,
        "week_number":week_number
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.statusCode == 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: function (res) {
        reject(res);

      }
    });
  });
}
// 创建部门
function createdepartment(departmentflag,name) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: app.globalData.TotalUrl+'/qz/share-dept/create/',
      method: 'POST',
      data: {
        "account": wx.getStorageSync('useraccount'),
        "token" :  wx.getStorageSync('tokentoset'),
        "cont":departmentflag,
        "name":name,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.statusCode == 200 ) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: function (res) {
        reject(res);
      }
    });
  });
}
// 解散部门
function deletedepartment(code) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: app.globalData.TotalUrl+'/qz/share-dept/dis/',
      method: 'POST',
      data: {
        "account": wx.getStorageSync('useraccount'),
        "token" :  wx.getStorageSync('tokentoset'),
        "code":code,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.statusCode == 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: function (res) {
        reject(res);
      }
    });
  });
}
// 退出部门
function exitdepartment(cont)  {
  return new Promise((resolve, reject) => {
    wx.request({
      url: app.globalData.TotalUrl+'/qz/share-dept/quit/',
      method: 'POST',
      data: {
        "account": wx.getStorageSync('useraccount'),
        "token" :  wx.getStorageSync('tokentoset'),
        "cont":cont,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.statusCode == 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: function (res) {
        reject(res);
      }
    });
  });
}
// 加入部门
function joindepartment(code,cont)  {
  return new Promise((resolve, reject) => {
    wx.request({
      url: app.globalData.TotalUrl+'/qz/share-dept/join/',
      method: 'POST',
      data: {
        "account": wx.getStorageSync('useraccount'),
        "token" :  wx.getStorageSync('tokentoset'),
        "cont":cont,
        "code":code,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.statusCode == 200 ) {
          
          resolve(res.data);
        } else {
          
          reject(res);
        }
      },
      fail: function (res) {
        reject(res);
      }
    });
  });
}
// 踢出部门
function kickdepartment(code,cont)  {
  return new Promise((resolve, reject) => {
    wx.request({
      url: app.globalData.TotalUrl+'/qz/share-dept/kick/',
      method: 'POST',
      data: {
        "account": wx.getStorageSync('useraccount'),
        "token" :  wx.getStorageSync('tokentoset'),
        "cont":cont,
        "code":code,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.statusCode == 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: function (res) {
        reject(res);
      }
    });
  });

}

//获取部门中成员列表
//cont为部门号，如A
function getdepartmentmsg(cont){
  return new Promise((resolve, reject) => {
    wx.request({
      url: app.globalData.TotalUrl+'/qz/share-dept/get-member/',
      method: 'POST',
      data: {
        "account": wx.getStorageSync('useraccount'),
        "token" :  wx.getStorageSync('tokentoset'),
        "cont":cont,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.statusCode == 200 && res.data["code"] == 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: function (res) {
        reject(res);
      }
    });
  });
}

/* -------------课程同步-------------- */

// 获取共享课程状态
function getsharecoursestate()  {
  return new Promise((resolve, reject) => {
    wx.request({
      url: app.globalData.TotalUrl+'/qz/share-week/state/',
      method: 'POST',
      data: {
        "account": wx.getStorageSync('useraccount'),
        "token" :  wx.getStorageSync('tokentoset'),
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.statusCode == 200 ) {
          resolve(res.data);
          // res.data是一个数组  "weeks_not_exist": [1,2,3,4]把这个数组里的数据去存放到qzapi.getpostclass(weeks_not_exist[0])里请求
          console.log(res.data["weeks_not_exist"])
          // 如果res.data返回不是一个空数组执行下面
          if(res.data["weeks_not_exist"].length!=0){
            // 用for循环遍历数组
            const qzapi=require('../API/sdust_api')
            for(var i=0;i<res.data["weeks_not_exist"].length;i++){
              qzapi.getpostclass(res.data["weeks_not_exist"][i])
            }
        }
        else {
          console.log("同步成功")
        }
          
        } else {
          reject(res);
        }
      },
      fail: function (res) {
        reject(res);
      }
    });
  });
}



          

module.exports = {
  postsharestate,
  replysharestate,
  getshareinfo,
  getsharestate,
  getdepartmentinfo,
  createdepartment,
  deletedepartment,
  exitdepartment,
  joindepartment,
  kickdepartment,
  getdepartmentmsg,
  getsharecoursestate,
};
