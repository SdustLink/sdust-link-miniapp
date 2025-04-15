// pages/login/login.js
/*
关于建立请求的两种方式：
1.后端撰写相关cookie，然后前端向后端登录请求后获取cookie，然后cookie用于登录。
  -技术力不够
  -现在无法测试
2.前端存储账号密码，然后发送请求的时候使用账号密码去进行请求。✔
  -可以实现
  -不是主流方案?但是我不是数据库，我是爬虫。
  -有点麻烦，每次后端都要与强智建立链接，效率低
3.先别管，反正就一个后端，后期有后端开发再搞。
  -傻宝
4.后端登录后把session发到前端，然后前端请求数据带一个sesson，然后我做的就是一个转接，去把请求发到强智上。
  -正确的，中肯的
  -要写一个在session失效的时候要进行续约。
  -？session有问题，session在python是建立契约的方式，一个python程序只能带一个session。
     session不是cookie，但session中好像携带看看能不能实现。
5.session一下把所有数据都拿来，不如2。

血的教训
请求失败是前端请求失败！就算我返回404他也是属于请求成功的。
  */

// 导入新的强智API
const qzapi = require('../../../API/qzapi_new');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    useraccount: '', //用户账户
    userpws: '', //用户密码
    verifyCode: '', // 验证码
    verifyCodeUrl: '', // 验证码图片URL
    isshow: false, //是否显示密码
    _src: '/static/image/hidepws.png/', //隐藏的图片，初始均为不可见
    islogin: true, //是否登录
    isAgreement: false,
    isShowAgreement: false,
    isLoading: false // 是否正在加载中
  },

  // 刷新验证码
  refreshVerifyCode() {
    const that = this;
    qzapi.getVerificationCode().then(result => {
      that.setData({
        verifyCodeUrl: result.url + '&rand=' + Math.random(), // 添加随机参数防止缓存
        verifyCode: '' // 清空验证码输入
      });
      // 保存时间戳以便后续使用
      wx.setStorageSync('verifyCodeTimestamp', result.timestamp);
    }).catch(error => {
      console.error('获取验证码失败:', error);
      wx.showToast({
        title: '获取验证码失败',
        icon: 'error'
      });
    });
  },

  checkAgreement() {
    var that = this;
    var isShowAgreement_ = that.data.isShowAgreement
    that.setData({
      isShowAgreement: !isShowAgreement_
    })
  },

  changeAgreement() {
    var that = this;
    var isAgreement_ = that.data.isAgreement;
    that.setData({
      isAgreement: !isAgreement_
    });
    console.log(isAgreement_, that.data.isAgreement)
    wx.setStorageSync('isAgreement', that.data.isAgreement)
  },


  //进行登录的设置
  async loginTo() {
    const app = getApp();
    app.globalData.todatabasesflag = 0;
    app.globalData.requestflag = 0;
    var that = this;
    let {
      useraccount,
      userpws,
      verifyCode,
      isAgreement,
      isLoading
    } = that.data;

    // 如果正在加载中，不执行任何操作
    if (isLoading) {
      return;
    }

    // 设置为加载中状态
    that.setData({
      isLoading: true
    });

    // 前端验证
    if (!isAgreement) {
      wx.showToast({
        title: '请同意用户协议',
        icon: 'error'
      });
      that.setData({ isLoading: false });
      return;
    }

    if (!useraccount) {
      wx.showToast({
        title: '学号不能为空',
        icon: 'error'
      });
      that.setData({ isLoading: false });
      return;
    }

    let phoneReg = /^\d{12}$/;
    if (!phoneReg.test(useraccount)) {
      wx.showToast({
        title: '学号格式错误',
        icon: 'error'
      });
      that.setData({ isLoading: false });
      return;
    }

    if (!userpws) {
      wx.showToast({
        title: '密码不能为空',
        icon: 'error'
      });
      that.setData({ isLoading: false });
      return;
    }

    if (!verifyCode) {
      wx.showToast({
        title: '验证码不能为空',
        icon: 'error'
      });
      that.setData({ isLoading: false });
      return;
    }

    try {
      wx.showLoading({
        title: '登录中...',
        mask: true
      });

      // 保存验证码到缓存
      wx.setStorageSync('verifyCode', verifyCode);
      
      // 使用新API登录
      const loginResult = await qzapi.login(useraccount, userpws, verifyCode);
      
      if (loginResult.success) {
        wx.setStorageSync('islogin', true);
        wx.showToast({
          title: '登录成功',
          icon: "success"
        });
        that.setData({
          islogin: true
        });
        wx.setStorageSync('useraccount', that.data.useraccount);
        wx.setStorageSync('userpws', that.data.userpws);

        // 初始化数据
        try {
          await qzapi.only_data();
          wx.reLaunch({
            url: '../../Home/HomeContent/homecontent',
          });
        } catch (error) {
          console.error("数据初始化失败:", error);
          wx.showToast({
            title: '数据加载失败',
            icon: 'error'
          });
        }
      } else {
        wx.setStorageSync('islogin', false);
        wx.showToast({
          title: loginResult.message || '登录失败',
          icon: "error"
        });
        // 刷新验证码
        that.refreshVerifyCode();
      }
    } catch (error) {
      console.error("登录过程中出错:", error);
      wx.showToast({
        title: '网络请求失败',
        icon: 'error'
      });
      // 刷新验证码
      that.refreshVerifyCode();
    } finally {
      wx.hideLoading();
      that.setData({
        isLoading: false
      });
    }
  },

  // 改变密码状态
  changeshow() {
    var that = this;
    if (that.data.isshow) {
      that.setData({
        _src: '/static/image/hidepws.png',
        isshow: false
      })
    } else {
      that.setData({
        _src: '/static/image/showpws.png',
        isshow: true
      })
    }
  },
  //获取账号名
  getaccount(e) {
    var that = this
    that.setData({
      useraccount: e.detail.value
    })
  },
  //获取密码
  getpassword(e) {
    var that = this
    that.setData({
      userpws: e.detail.value
    })
  },
  // 获取验证码
  getVerifyCode(e) {
    var that = this
    that.setData({
      verifyCode: e.detail.value
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    //页面加载时，从微信缓存读取账号密码
    var that = this;

    that.setData({
      useraccount: wx.getStorageSync('useraccount'),
      userpws: wx.getStorageSync('userpws'),
      islogin: wx.getStorageSync('islogin')
    })
    try {
      var isAgreement = wx.getStorageSync('isAgreement');
      if (isAgreement !== null) {
        // 这里设置 isAgreement 到 data 使得页面正确显示状态
        that.setData({
          isAgreement: isAgreement
        });
      }
    } catch (e) {
      console.log('Failed to retrieve data from storage: ', e);
    }

    // 加载验证码
    that.refreshVerifyCode();
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
    // 每次页面显示时刷新验证码
    this.refreshVerifyCode();
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

  }
})