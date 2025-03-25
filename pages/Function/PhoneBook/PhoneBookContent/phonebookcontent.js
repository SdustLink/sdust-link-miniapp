// pages/function/function.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    islogin:false,
    functions:[
      
          {
            src:'/image/jishiben.jpg',
            name:'小科同好',
            detail:'遇见每一种爱好！',
            id:0,
            image:'https://www.sxksxk.work/static/function/phoneList/Blue.png',
            backgroundcolor: '#5374A5;',
            shadow:'0px 10px 20px rgba(102, 125, 159, 0.2);'
          }
      ,
          // {
          //   src:'/image/jishiben.jpg',
          //   name:'小科科创',
          //   detail:'一起创造理想！',
          //   id:1,
          //   image:'https://www.sxksxk.work/static/function/phoneList/Green.png',
          //   backgroundcolor: '#00C67E;',
          //   shadow:'0px 10px 20px rgba(36, 209, 147, 0.2);'
          // },
          // {
          //   src:'/image/jishiben.jpg',
          //   name:'部门业务',
          //   id:3,
          //   backgroundcolor: '#FF574D;',
          //   shadow:'0px 10px 20px rgba(255, 101, 91, 0.2);'
          // }

        
      
    ]
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
      wx.navigateTo({
        url: "/pages/Function/PhoneBook/LikeMinded/LikeMindedContent/LikeMindedContent"
      })

    }
    else if(e.currentTarget.dataset.tar=="1"){
      wx.showToast({
        title: '小科正在洽谈哦，敬请期待！(ᕑᗢᓫ∗)˒',
        icon:'none'
      })
    }
   




  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    
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
  weekchange(e){
    //左右跳转
    var that=this;
    var toweek=that.data.toweek
    if(e.target.dataset.change=="pre"){
      if(toweek>1){toweek--;}
      else{
        wx.showToast({
          title: '已经到了尽头咧！',
          icon:'none'
        })
        return ;}
        that.setData({
          toweek,
        })
        console.log(that.data.toweek)
        
        api.courselibdetail(that.data.toweek,that.data.course.id).then(res => {
   
          that.setData({
            coursedetildata : res
          })
        }).catch(err => {
          // 获取课程表信息失败，处理错误
          wx.showToast({
            title: '请求失败',
            icon: 'error'
          })
        });


      }
      else if(e.target.dataset.change=="next"){
        if(that.data.toweek>19){
          wx.showToast({
            title: '到达世界最高峰！',
            icon:'none'
          })
          return ;

        }
        
        
        toweek=toweek+1;
        that.setData({
          toweek,
        })
        api.courselibdetail(that.data.toweek,that.data.course.id).then(res => {
          console.log(res.data)
          that.setData({
            coursedetildata : res
            
          })

        }).catch(err => {
          // 获取课程表信息失败，处理错误
          wx.showToast({
            title: '请求失败',
            icon: 'error'
          })
        });
  
        
      }

  },
})