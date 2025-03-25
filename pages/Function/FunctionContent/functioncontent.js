// pages/function/function.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url:null,
    islogin:false,
    functions:[
      [
          {
            src:'/image/jishiben.jpg',
            name:'小科课表',
            id:0,
            backgroundcolor: '#FFA31A;',
            shadow:'0px 10px 20px rgba(255, 163, 25, 0.2);'
          },
          {
            src:'/image/jishiben.jpg',
            name:'小科食物库',
            id:1,
            backgroundcolor: '#03A4FF;',
            shadow:'0px 10px 20px rgba(3, 164, 255, 0.2);'
          }
        
        ]
      ,
      [
          {
            src:'/image/jishiben.jpg',
            name:'小科备忘录',
            id:2,
            backgroundcolor: '#00C67E;',
            shadow:'0px 10px 20px rgba(36, 209, 147, 0.2);'
          },
          {
            src:'/image/jishiben.jpg',
            name:'合作业务',
            id:3,
            backgroundcolor: '#FF574D;',
            shadow:'0px 10px 20px rgba(255, 101, 91, 0.2);'
          }
      ],
      [
        {
          src:'/image/jishiben.jpg',
          name:'小科经验包',
          id:4,
          backgroundcolor: '#D458FF;',
          shadow:'0px 10px 20px rgba(212, 88, 255, 0.2);'
        },
        {
          src:'/image/jishiben.jpg',
          name:'小科通讯录',
          id:5,
          backgroundcolor: '#5374A5;',
          shadow:'0px 10px 20px rgba(102, 125, 159, 0.2);'
        }
    ],
    [
      {
        src:'/image/jishiben.jpg',
        name:'小科空教室',
        id:6,
        backgroundcolor: '#192DDD;',
        shadow:'0px 10px 20px rgba(93, 107, 239, 0.2);'
      },
      {
        src:'/image/jishiben.jpg',
        name:'小科成绩单',
        id:7,
        backgroundcolor: '#6667AB;',
        shadow:'0px 10px 20px rgba(139, 140, 210, 0.2);'
      }
  ],
  [
    {
      src:'/image/jishiben.jpg',
      name:'小科考试',
      id:8,
      backgroundcolor: '#192DDD;',
      shadow:'0px 10px 20px rgba(93, 107, 239, 0.2);'
    },
    {
      src:'/image/jishiben.jpg',
      name:'小科课程库',
      id:9,
      backgroundcolor: '#6667AB;',
      shadow:'0px 10px 20px rgba(139, 140, 210, 0.2);'
    }
],
[
  {
    src:'/image/jishiben.jpg',
    name:'部门课表',
    id:10,
    backgroundcolor: '#192DDD;',
    shadow:'0px 10px 20px rgba(93, 107, 239, 0.2);'
  },
  {
    src:'/image/jishiben.jpg',
    name:'小科课程库',
    id:11,
    backgroundcolor: '#6667AB;',
    shadow:'0px 10px 20px rgba(139, 140, 210, 0.2);'
  }
],
    
    ]
  },
  turnNull(){
    wx.showToast({
      title: '◔◔小科正在努力开发中哦',
      icon:'none'
    })

  },
  turnpage(e){
    var that=this;
    if(e.currentTarget.dataset.tar=="none"){
      wx.showToast({
        title: '前面的道路以后再来探索吧！',
        icon:'none'
      })

    }
    else if(e.currentTarget.dataset.tar=="0"){
      that.setData({
        islogin:wx.getStorageSync('islogin')
      })
      console.log(that.data.islogin)
      if(that.data.islogin){
        wx.navigateTo({
          url: "/pages/Function/Schedule/ScheduleContent/schedulecontent"
        })
      }
      else {
        wx.navigateTo({
          url: "/pages/Login/LoginContent/logincontent"
        })
      }
    }
    else if(e.currentTarget.dataset.tar=="1"){
      wx.navigateTo({
        url: "/pages/Function/EmptyERooms/EmptyERoomsContent/emptyeroomscontent"
      })
    }
    else if(e.currentTarget.dataset.tar=="2"){
      wx.navigateTo({
        url: "/pages/Function/ExamList/ExamListContent/examlistcontent"
      })
    }
    else if(e.currentTarget.dataset.tar=="3"){
      wx.navigateTo({
        url: "/pages/Function/GradeFind/GradeFindContent/gradefindcontent"
      })
    }
    else if(e.currentTarget.dataset.tar=="4"){
      wx.navigateTo({
        url: "/pages/Function/PhoneBook/PhoneBookContent/phonebookcontent"
      })
    }
    else if(e.currentTarget.dataset.tar=="5"){
      wx.navigateTo({
        url: "/pages/Function/NotePad/NotePadContent/notepadcontent"
      })
    }
    else if(e.currentTarget.dataset.tar=="6"){
      wx.navigateTo({
        url: "/pages/Function/CourseLib/CourseLibContent/courselibcontent"
      })
    }
    else if(e.currentTarget.dataset.tar=="7"){
      wx.navigateTo({
        url: "/pages/Function/DeptClass/DeptClassContent/DeptClassContent"
      })
    }
    else if(e.currentTarget.dataset.tar=="8"){
      wx.navigateTo({
        url: "/pages/Function/DepartmentWork/DepartmentWorkContent/departmentworkcontent"
      })
    }
    else if(e.currentTarget.dataset.tar=="9"){
      wx.navigateTo({
        url: "/pages/Function/PhoneBook/PhoneBookContent/phonebookcontent"
      })
    }
    else if(e.currentTarget.dataset.tar=="10"){
      wx.navigateTo({
        url: "/pages/Function/ExperiencePack/ExperiencePackCon/experienceparkcon"
      })
    }
    else if(e.currentTarget.dataset.tar=="11"){
      wx.navigateTo({
        url: "/pages/Function/FoodLib/FoodLibContent/foodlibcontent"
      })
    }
    else if(e.currentTarget.dataset.tar=="12"){
      wx.navigateTo({
        url: "/pages/User/UserBlog/userblog"
      })
    }
  },

 


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const app = getApp();
    var that = this;
    that.setData({
      url:app.globalData.TotalUrl
    })
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