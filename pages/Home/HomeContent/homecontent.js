const app = getApp()
const qzapi = require('../../../API/qzapi');
const shareapi = require('../../../API/shareapi');
const staticapi = require('../../../API/static');
Page({
  /**
   * BUG
   * 1.显示字体格式大小不规范
   */
  /**
   * 页面的初始数据
   */
  
  data: {
    nowtimes: {
      month: '',
      day: '',
      hour: '',
      minutes: ''
    },
    weekwhat: '',
    week_ordinal: 0,
    courseflag: false,
    now_course: {},
    courseover_onesencontent: "(//▽//)",
    coursetimei: 2,
    requestflag: 0,
    timeTable: [
      { timebegin: "08:00", timeend: "09:50" },
      { timebegin: "10:10", timeend: "12:00" },
      { timebegin: "14:00", timeend: "15:50" },
      { timebegin: "16:10", timeend: "18:00" },
      { timebegin: "19:00", timeend: "21:00" }
    ],
    schedule: {},
    selected_time_event_datalist:[],//选择时间的待办,三个参数：1、时间；2、事件内容；3、是否被选中
    overtime_event_datalist:[],//超时的事项
    finished_event_datalist:[],//已完成事项
    not_selected_time_event_datalist:[],//未设置时间的
    nowtime:[],//当前时间，重复函数，结构为[年、月、日、时、分、秒]
    event_num:0,//今天的事项数
  },


  //01 获取当前时间
  getnowtime(){
    var myDate=new Date()
    var list=[
      myDate.getFullYear(),
      (myDate.getMonth()+1),
      myDate.getDate(),
      myDate.getHours(),
      myDate.getMinutes(),
      myDate.getSeconds(),
    ]
    this.setData({
      nowtime:list,
    })

  },
  //03 监听待办事项自动超时
  check_selected_time_event_datalist(){
    //调取方法获取当前时间，用于比较是否过期了

    this.getnowtime()
    //存放获取的信息
    var list1=this.data.selected_time_event_datalist
    var list2=this.data.nowtime
    var list5=this.data.overtime_event_datalist
    //用于存放超时的部分
    var list3=[]
    //用于存放未完成部分，已超时的id，用于去除
    var list4=[]
    //用于存放处理后的未完成数组,这个之后要进行去除过期数据的步骤
    var _list1=this.data.selected_time_event_datalist
    //用于存放处理后的过期数组
    var _list2=[]

    //防止list1为空时，length函数报错
    var len=0
    var flag
    if(list1!=[])len=list1.length
    for(var i=0;i<len;i++){
      flag=!this.list_compare(list2,list1[i][0])//当前时间，设置的时间
      //如果超时
      if(flag){
        //存放刚过期的数据
        list3=[list1[i],...list3]
        //存放刚过期的数据在未完成中的id
        list4=[...list4,i]
      }
    }
    //如果有过期的
    var l=list3.length
    if(l!=0){
      // 合并过期的数据
      _list2=[...list3,...list5]
      // 去除未完成中已过期的部分,考虑splice函数的特点，进行id倒叙进行
      var len1=0
      if(list4!=[])len1=list4.length
      for(var i=len1-1;i>=0;i--){
        _list1.splice(list4[i],1)
      }
      //赋值给未完成和已过期的数组
      this.setData({
        selected_time_event_datalist:_list1,
        overtime_event_datalist:_list2,
      })
      // console.log("超时了")
      // console.log(_list1)
      // console.log(_list2)
      const app=getApp()
      app.globalData.selected_time_event_datalist=this.data.selected_time_event_datalist
      app.globalData.overtime_event_datalist=this.data.overtime_event_datalist
    }
    

  },
  //04 点击事项跳转
  navigator_to_notpad(){
    wx.navigateTo({
      url: '/pages/Function/NotePad/NotePadContent/notepadcontent',
    })
    const app=getApp()
    app.globalData.selected_time_event_datalist=this.data.selected_time_event_datalist,
    app.globalData.overtime_event_datalist=this.data.overtime_event_datalist,
    this.setStorageSyncdata()
  },
  //05 点击事件前的单选框，将事件更改为完成
  transfer_to_finished(e){
      //当处于非删除状态时
      //哪一个分类
      var id=e.detail.id
      //分类中的第几个
      var num=e.detail.num
      //设置时间的
      if(id==1){
        var list1=this.data.selected_time_event_datalist
        var data=list1[num]
        list1.splice(num,1)
        this.setData({
          selected_time_event_datalist:list1,
          finished_event_datalist:[data,...this.data.finished_event_datalist]
        })
        
      }
      //未设置时间的
      else if(id==2){
        var list=this.data.not_selected_time_event_datalist
        var data=list[num]
        list.splice(num,1)
        this.setData({
          not_selected_time_event_datalist:list,
          finished_event_datalist:[data,...this.data.not_selected_time_event_datalist]
        })
      }
      else{
        var list=this.data.overtime_event_datalist
        var data=list[num]
        list.splice(num,1)
        this.setData({
          overtime_event_datalist:list,
          finished_event_datalist:[data,...this.data.finished_event_datalist]
        })
      }
      const app=getApp()
      app.globalData.selected_time_event_datalist=this.data.selected_time_event_datalist
      app.globalData.overtime_event_datalist=this.data.overtime_event_datalist
  },
  //06 比较两个数组的大小
  list_compare(list1,list2){
    //默认list1小于list2
    var flag=true
    for(var i=0;i<list2.length;i++){
      if(list1[i]>list2[i]){
        flag=false;
        break;
      }
      else if(list1[i]<list2[i]){
        flag=true;
        break;
      }
    }
    return flag
  },

  //09 
  init_datalist(){
    const app=getApp()
    var list1=app.globalData.selected_time_event_datalist
    var list2=app.globalData.overtime_event_datalist
    var list3=app.globalData.finished_event_datalist
    var list4=app.globalData.not_selected_time_event_datalist
    this.setData({
      selected_time_event_datalist:list1,
      overtime_event_datalist:list2,
      finished_event_datalist:list3,
      not_selected_time_event_datalist:list4,
    })
    // console.log("das")
    // console.log(list1)
  },
  //10 存储微信缓存
  setStorageSyncdata(){
    var user=wx.getStorageSync('useraccount')
    var Storage1=user+"_not_selected_time_event_datalist"
    var Storage2=user+"_selected_time_event_datalist"
    var Storage3=user+"_overtime_event_datalist"
    var Storage4=user+"_finished_event_datalist"
    wx.setStorageSync(Storage2,this.data.selected_time_event_datalist)
    wx.setStorageSync(Storage3,this.data.overtime_event_datalist)
    wx.setStorageSync(Storage4, this.data.finished_event_datalist)
    wx.setStorageSync(Storage1, this.data.not_selected_time_event_datalist)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onReady() {
    const app=getApp()
    var user=wx.getStorageSync('useraccount')
    var Storage1=user+"_not_selected_time_event_datalist"
    var Storage2=user+"_selected_time_event_datalist"
    var Storage3=user+"_overtime_event_datalist"
    var Storage4=user+"_finished_event_datalist"
    app.globalData.selected_time_event_datalist=wx.getStorageSync(Storage2)
    app.globalData.overtime_event_datalist=wx.getStorageSync(Storage3)
    app.globalData.not_selected_time_event_datalist=wx.getStorageSync(Storage1)
    app.globalData.finished_event_datalist=wx.getStorageSync(Storage4)
    this.init_datalist()
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onLoad(options) {


    var that = this;
    //计划表的读取
    //如果全局变量其
    //渲染星期
    var weekArray = new Array("日", "一", "二", "三", "四", "五", "六")
    var weeknumber = new Date().getDay();
    var week = weekArray[weeknumber] //判断今天周几
    var set_schedule = app.globalData.set_all_data;
    
    if (weeknumber == 0) {
      weeknumber = 7
    }
    weeknumber--;
    that.setData({
      weekwhat: week,
      nowtimes: {
        month: new Date().getMonth() + 1 < 10 ? '0' + (new Date().getMonth() + 1) : new Date().getMonth() + 1,
        day: new Date().getDate() < 10 ? '0' + new Date().getDate() : new Date().getDate(),
        hour: new Date().getHours() < 10 ? '0' + new Date().getHours() : new Date().getHours(),
        minutes: new Date().getMinutes() < 10 ? '0' + new Date().getMinutes() : new Date().getMinutes(),
      },
      set_schedule
    })

    var coursetime_i = 0; //显示的时间点
    var nowhour = parseInt(that.data.nowtimes.hour);
    var nowminutes = parseInt(that.data.nowtimes.minutes); //数字后时间
    var course = {}; //显示的课程
// --------------------------计时器函数--------------------------
    //Once_Couse即进行couse赋值，显示下节课的课程
    let Once_Couse = () => {
      if ((nowhour < 9 || (nowhour == 9 && nowminutes < 50))) {
        coursetime_i = 0;

      } else if (((nowhour == 9 && nowminutes >= 50) || (nowhour > 9 && nowhour < 12))) {
        coursetime_i = 1;
      } else if (((nowhour == 15 && nowminutes < 50) || (nowhour > 12 && nowhour < 15))) {
        coursetime_i = 2;

      } else if (((nowhour == 15 && nowminutes >= 50) || (nowhour > 15 && nowhour < 18))) {
        coursetime_i = 3;

      } else if (((nowhour == 21 && nowminutes < 50) || (nowhour >= 18 && nowhour < 21))) {
        coursetime_i = 4;
      }
      if (nowhour > 21) {
        coursetime_i = 5;
        //结束今天课
      }
      if(that.data.requestflag==2){
        // 如果课表返回的是[null]那就会执行[0]==null，如果返回的是一个多重数组其不会执行，因为其[0]！=null。
        // 然后这个放到这里面执行的原因是，需要等他从app中请求数据完毕后才能执行。
        if(that.data.table_schedule!=null){
          if(that.data.table_schedule[0]==null){
            if (that.data.courseflag==true){
            that.setData({
              courseflag: false
            });}
          }
          else{
            while (1) {
              if (coursetime_i == 5) {
                that.setData({
                  courseflag: false
                });
                break;
              }
              if (that.data.table_schedule[weeknumber][coursetime_i][0].length!=0) {
                course = that.data.table_schedule[weeknumber][coursetime_i]
                that.setData({
                  courseflag: true
                });
                break;
              } else if (coursetime_i <= 5){ coursetime_i++;
              
              }
            }
          }
        }

   }

      that.setData({
        nowtimes: {
          month: new Date().getMonth() + 1 < 10 ? '0' + (new Date().getMonth() + 1) : new Date().getMonth() + 1,
          day: new Date().getDate() < 10 ? '0' + new Date().getDate() : new Date().getDate(),
          hour: new Date().getHours() < 10 ? '0' + new Date().getHours() : new Date().getHours(),
          minutes: new Date().getMinutes() < 10 ? '0' + new Date().getMinutes() : new Date().getMinutes(),
        },
        coursetimei: coursetime_i,
        now_course: course,


      });

    }
// --------------------------计时器函数--------------------------
    Once_Couse()
    //等课表读取成功后再进行ONCE_COUSE函数。 
    var num=0
    if(that.data.table_schedule==undefined){
      setInterval(function(){
        Once_Couse()
        num++
        if(num==100){
          that.check_selected_time_event_datalist()
          num=0
        }
      }, 10);
    }
    else setInterval(function(){
      var that=this
      Once_Couse()
      that.check_selected_time_event_datalist()
    }, 1000);


  },
  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.init_datalist()

    var that=this;
    var islogin=wx.getStorageSync('islogin');
    if(islogin != that.data.set_schedule[islogin]){
      app.globalData.set_all_data.islogin=islogin;
      that.setData({
        ['set_schedule.islogin']:islogin
      })
    }
    var postclassflag=false
    //TODO 计时器，检测是否请求成功；
    var read=setInterval(function(){
      if(app.globalData.requestflag==2&&app.globalData.todatabasesflag==2){
        shareapi.getsharecoursestate();
        var table_schedule = app.globalData.class_info;
        var week_ordinal = app.globalData.week_time;
        var requestflag=app.globalData.requestflag;
          that.setData({
            week_ordinal,
            table_schedule,
            requestflag
          })
          clearTimeout(read);
      }
      if(app.globalData.requestflag==2&&app.globalData.todatabasesflag==1&&postclassflag==false){
        
        qzapi.postclass()
        postclassflag=true
      }
    }, 100);
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    //存入微信缓存
    const app=getApp()
    app.globalData.selected_time_event_datalist=this.data.selected_time_event_datalist
    app.globalData.overtime_event_datalist=this.data.overtime_event_datalist
    app.globalData.finished_event_datalist=this.data.finished_event_datalist
    this.setStorageSyncdata()
  },
  onTabItemTap: function (item) {
    this.init_datalist()
  },  

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    //存入微信缓存
    const app=getApp()
    app.globalData.selected_time_event_datalist=this.data.selected_time_event_datalist
    app.globalData.overtime_event_datalist=this.data.overtime_event_datalist
    this.setStorageSyncdata()
  },
// TODO
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    
    var that=this
    // 下拉刷新请求,带请i去判断
    if (wx.getStorageSync('islogin') == true) {
      if(app.globalData.requestflag>0&&app.globalData.requestflag<2){
        qzapi.only_data(wx.getStorageSync('useraccount'))
      }
      else if(app.globalData.requestflag==0){     
        qzapi.init_data(wx.getStorageSync('useraccount'),wx.getStorageSync('userpws'))
    }
    var postclassflag=false
    //TODO 计时器，检测是否请求成功；
    var read=setInterval(function(){
      if(app.globalData.requestflag==2&&app.globalData.todatabasesflag==2){
        var table_schedule = app.globalData.class_info;
        var week_ordinal = app.globalData.week_time;
        var requestflag=app.globalData.requestflag;
          that.setData({
            week_ordinal,
            table_schedule,
            requestflag
          })
          
        shareapi.getsharecoursestate();
          clearTimeout(read);
      }
      if(app.globalData.requestflag==2&&app.globalData.todatabasesflag==1&&postclassflag==false){
        qzapi.postclass()
        postclassflag=true
      }
    }, 100);
     
    
    }
    else{
      wx.navigateTo({
        url: "../../Login/LoginContent/logincontent"
        //登录
      })
    }
  },
  turn_content(){
    const url = encodeURIComponent('https://mp.weixin.qq.com/s?__biz=Mzk0OTYzMTgwNw==&mid=2247483837&idx=1&sn=477e1267c247ec50190ee59693b86130&chksm=c3542fedf423a6fbbc860f23e2d49ea721c9adc7bd985ff4b7f4186a234f842ede6a4176b042&token=958824979&lang=zh_CN#rd');
    wx.navigateTo({
      url: `/pages/WechatPage/wechatpage?src=${url}`
    });
   
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
  /**
   * 点击函数
   */
  turn_crouselist(e) {


    wx.navigateTo({
      url: "../../Function/Schedule/ScheduleContent/schedulecontent"
    })

  },
  turn_bind(e) {
    wx.navigateTo({
      url: "../../Login/LoginContent/logincontent"
      //登录
    })
  },




})