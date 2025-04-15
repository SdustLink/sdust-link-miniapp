// pages/Function/GradeFind/GradeFindContent/gradefindcontent.js
const app = getApp();
const qzapi = require('../../../../API/sdust_api');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    termList:[],
    term_index:[7,7],
    is_open_status:false,
    score:{
      CR:0,
      GPA:0,
      W_GPA:0,
    },
    grade_list:[
    ],
    current_list:[],
  },
  //用于获取成绩信息，放于Onready函数中，加载前读取，直接显示
  getgrades(){
    let that=this;
    qzapi.getGradeInfo(wx.getStorageSync('useraccount'),)
    .then(res => {
      that.setData({
        grade_list:res
      })
      this.update_msg()
    }).catch(err => {
      // 获取课程表信息失败，处理错误
      wx.showToast({
        title: '请求失败',
        icon: 'error'
      })
    });
  },
  //刷新成绩和学分
  update_msg(){
    var that=this
    var index1=that.data.term_index[0]
    var index2=that.data.term_index[1]
    var _list=that.data.termList
    var list=[]
    for(var i=index1;i<=index2;i++){
      list=[...list,...this.filterElementsByTerm(_list[i],this.data.grade_list)]
    }
    that.setData({
      current_list:list
    })
    that.setData({
      'score.CR':this.calculateGPA(this.data.current_list)[0],
      'score.GPA':this.calculateGPA(this.data.current_list)[1],
      'score.W_GPA':this.calculateGPA(this.data.current_list)[2],
    })
  },
  // 获取当前的学期，及学期列表
  getCurrentSemester() {
    // 获取当前日期
    const currentDate = new Date();
  
    // 获取当前学年和学期
    let currentYear = currentDate.getFullYear();
    let currentMonth = currentDate.getMonth() + 1;
    let currentSemester = (currentMonth >= 9 || currentMonth <= 2) ? 1 : 2;
  
    // 计算前7个学期和后7个学期
    let semesters = [];
    let startYear = currentYear - 4; // 当前学年向前推3年
    let endYear = currentYear + 2;   // 当前学年向后推3年
  
    for (let year = startYear; year <= endYear; year++) {
      for (let semester = 1; semester <= 2; semester++) {
        let semesterLabel = `${year}-${year + 1}-${semester}`;
        semesters.push(semesterLabel);
  
        if (year === currentYear && semester === currentSemester) {
          break; // 如果已经加入当前学期，停止继续添加
        }
      }
    }
  
    return semesters;
  },
  // 学期选择的确定事件
  onTermConfirm(e){
    var list=this.data.term_index
    var flag=this.data.is_open_status
    var is_error=false
    if(!flag){
      list=[e.detail.value,e.detail.value]
    }
    else{
      var id=e.currentTarget.dataset.id
      if(id==1){
        if(list[1]<e.detail.value){
          wx.showToast({
            title: '错误的学期区间',
            icon:'error'
          })
          is_error=true
        }
        else list[0]=e.detail.value
      }
      else {
        if(list[0]>e.detail.value){
          wx.showToast({
            title: '错误的学期区间',
            icon:'error'
          })
          is_error=true
        }
        else list[1]=e.detail.value
      }
    }
    if(!is_error){
      this.setData({
        term_index:list
      })
      this.update_msg()
    }
  },
  // 筛选课程

  filterElementsByTerm(term, arr) {
    // 检查 arr 是否为数组以及是否为空，防止调用 filter 方法时出错
    if (!Array.isArray(arr) || arr.length === 0) {
      return []; // 如果 arr 不是数组或为空，返回空数组
    }
  
    // 使用 filter 方法进行过滤，同时增加安全检查确保每个元素都有 xqmc 属性
    const filteredElements = arr.filter((element) => element && element.xqmc === term);
    return filteredElements;
  },
  
  // 计算对应的学分、绩点、加权绩点
  calculateGPA(arr) {
    let totalCredits = 0;
    let totalGradePoints = 0;
    let totalWeightedGradePoints = 0;
  
    for (const element of arr) {
      const kclbmc = element.kclbmc;
      const xf = parseFloat(element.xf);
      const zcj = element.zcj;
  
      if (kclbmc === "公选") {
        continue; // 不参与统计
      }
  
      let gradePoint;
      let _gradePoint;
      if (isNaN(zcj)) {
        if (zcj === "优") {
          gradePoint = 4.5;
        } else if (zcj === "良") {
          gradePoint = 3.5;
        } else if (zcj === "中") {
          gradePoint = 2.5;
        } else if (zcj === "合格") {
          gradePoint = 1.5;
        } else {
          gradePoint = 0; // 非数字且非特殊等级，则为0绩点
        }
      } else {
        gradePoint = zcj >= 60 ? (zcj - 50) / 10 : 0;
      }
      if(zcj<60)_gradePoint=0;
      else if(zcj<70)_gradePoint=1;
      else if(zcj<80)_gradePoint=2;
      else if(zcj<90)_gradePoint=3;
      else _gradePoint=4;
  
      totalCredits += xf;
      totalGradePoints += _gradePoint*xf;
      totalWeightedGradePoints += xf * gradePoint;
    }
  
    const GPA = totalGradePoints === 0 ? 0 : (totalGradePoints / totalCredits).toFixed(2);
    const W_GPA = totalWeightedGradePoints === 0 ? 0 : (totalWeightedGradePoints / totalCredits).toFixed(2);
    const Total_CR = totalCredits % 1 === 0 ? totalCredits.toFixed(0) : totalCredits.toFixed(1);
    return [Total_CR, GPA, W_GPA];
  },
  // 生涯绩点查询按钮切换
  onSwitchChange(){
    var flag=this.data.is_open_status
    var list=this.data.term_index
    this.setData({
      term_index:[list[0],list[0]]
    })
    this.update_msg()
    this.setData({
      is_open_status:!flag
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    var that=this
    setTimeout(() => {
      that.setData({
        islogin:wx.getStorageSync('islogin'),
      })
    }, 10);
    
    // 读取设置
    var set_schedule=app.globalData.set_all_data;
    that.setData({
      set_schedule,
    })
    that.getgrades();
    that.setData({
      termList:this.getCurrentSemester()
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

  },


  // 彩蛋
  Eggs(){
    wx.showToast({
      title: '祝你门门满分！',
      icon:'none'
    })

  }


})