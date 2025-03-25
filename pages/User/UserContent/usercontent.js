// pages/studentinfo/studentinfo.js
const app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    account:null,
    name:null,
    academy:null,
    student_info:null,
    url:null,
    point:'block'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
     
    var that = this;
    that.setData({
      point: wx.getStorageSync('blockshow')
    })
    console.log(that.data.point)

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    const app = getApp();
    var that = this;
    that.setData({
      student_info:app.globalData.student_info,
      url:app.globalData.TotalUrl
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  turn(e) {
    var that=this
    
    if(e.target.dataset.turn=="set"){
      wx.navigateTo({
        url: '../UserSetContent/usersetcontent',
      })

    }
    else if(e.target.dataset.turn=="about"){
      wx.navigateTo({
        url: '../UserAbout/useabout',
      })

    }
    else if(e.target.dataset.turn=="blog"){
      
      
      that.setData({
        point: 'none'
      })
      wx.setStorageSync('blockshow', this.data.point);
      wx.navigateTo({
        url: '../UserBlog/userblog',
      })

    }
    else if(e.target.dataset.turn=="txc"){
      wx.openEmbeddedMiniProgram({
        appId: "wx8abaf00ee8c3202e",
        extraData :{
          // 把1368数字换成你的产品ID，否则会跳到别的产品
          id : "665611",
          // 自定义参数，具体参考文档
     
        }
      })

    }

  },
  logout(e) {
    wx.removeStorageSync("token");
    wx.removeStorageSync("useraccount");
    wx.removeStorageSync("userpws");
    wx.setStorageSync("islogin",false);


    wx.redirectTo({//重定向
      url: '../../Login/LoginContent/logincontent',
    })
  

  },
  getInfo(){
    wx.setClipboardData({
      data: '584646697',
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: 'Tecent，启动！',
              icon: 'success',
              duration: 2000
            })
          }
        })
      }
    })
  }

})