const app = getApp();
const api = require('../../../../API/qzapi');
const shareapi = require('../../../../API/shareapi');
const utils = require('../../../../utils/util');
const tableformat = require('../../../../utils/table');

Page({
  data: {
    nowtimes: {
      month: new Date().getMonth() < 10 ? '0' + (new Date().getMonth() + 1) : new Date().getMonth() + 1,
      day: new Date().getDate() < 10 ? '0' + new Date().getDate() : new Date().getDate(),
      hour: new Date().getHours() < 10 ? '0' + new Date().getHours() : new Date().getHours(),
      minutes: new Date().getMinutes() < 10 ? '0' + new Date().getMinutes() : new Date().getMinutes()
    },
    week_ordinal: 1,
    shareflag: false,
    weekday: [],
    checked_value: false,
    table1: [],
    table2: [],
    set_schedule: {},
    chanceshare: null,
    chancenumber: null,
    scheduleResource: [],
  },

  onLoad(options) {
  },

  onReady() {
    this.initializeData();
  },

  onShow() {
    this.fetchShareState();
  },

  initializeData() {
    try {
      const count_weekdaywhat = utils.count_weekday(0);
      const { set_all_data, class_info, week_time, scheduleResource } = app.globalData;
      const custom_schedule = wx.getStorageSync('newschedule');
      
      // 深拷贝 class_info，确保其为可变对象
      const table_schedule = this.deepCopyTable(class_info);
      const updated_table_schedule = this.updateCustomSchedule(table_schedule, custom_schedule);

      this.setData({
        weekday: count_weekdaywhat,
        set_schedule: set_all_data,
        table1: updated_table_schedule,
        week_ordinal: week_time,
        chanceshare: wx.getStorageSync("chanceshare"),
        scheduleResource: scheduleResource,
      });
    } catch (error) {
      console.error('初始化数据失败', error);
    }
  },
  deepCopyTable(table) {
    return table.map(row => row.map(cell => JSON.parse(JSON.stringify(cell))));
  },
  fetchShareState() {
    const that = this;
    shareapi.getsharestate().then(res => {
      app.globalData.sharedata = res;
      that.setData({
        chanceshare: wx.getStorageSync("chanceshare"),
      });
    }).catch(err => {
      wx.showToast({
        title: '共享状态失败',
        icon: 'error'
      });
    });
  },
  updateCustomSchedule(table_schedule, custom_schedule) {
    const { week_ordinal } = this.data;
    console.log(table_schedule,table_schedule.length,custom_schedule)
    if(table_schedule.length==0){
      table_schedule=custom_schedule
    }
    else{
      for (let i = 0; i < custom_schedule.length; i++) {
        for (let j = 0; j < custom_schedule[i].length; j++) {
          if (table_schedule[i][j][0].length == 0 && custom_schedule[i][j].length > 0) {
            if (week_ordinal >= custom_schedule[i][j][4] && week_ordinal <= custom_schedule[i][j][5]) {
              table_schedule[i][j] = custom_schedule[i][j];
            }
          }
        }
      }
    }

    return table_schedule;
  },

  switchShare(e) {
    const that = this;
    const { checked_value, shareflag, week_ordinal, chanceshare } = that.data;
    const newshareflag = !shareflag;
    const value = !checked_value;
    const bindshareflag = that.getBindShareFlag(chanceshare);

    that.setData({
      checked_value: value,
      shareflag: newshareflag
    });

    if (bindshareflag !== 3 && value === true) {
      that.setData({
        checked_value: false,
        shareflag: false
      });
      wx.navigateTo({ url: '../BindSchedule/bindschedule' });
      return;
    }

    if (bindshareflag == 3 && newshareflag) {
      const chancenumber = that.getChanceNumber(chanceshare);
      that.setData({ chancenumber });
      that.fetchSharedSchedule(chanceshare, week_ordinal, chancenumber);
      
    } else {
      that.setData({ shareflag: newshareflag });
    }
  },

  getBindShareFlag(shareType) {
    const shareDataMap = {
      "A": 'CBindAState',
      "B": 'CBindBState',
      "C": 'CBindCState',
      "D": 'CBindDState',
      "E": 'CBindEState'
    };
    return app.globalData.sharedata[shareDataMap[shareType]] || null;
  },

  getChanceNumber(shareType) {
    const postnumMap = {
      "A": 'postnumA',
      "B": 'postnumB',
      "C": 'postnumC',
      "D": 'postnumD',
      "E": 'postnumE'
    };
    return wx.getStorageSync(postnumMap[shareType]) || null;
  },

  fetchSharedSchedule(chanceshare, week_ordinal, chancenumber) {
    const that = this;
    shareapi.getshareinfo(chanceshare, week_ordinal, chancenumber).then(res => {
      that.setData({
        table2: res,
        shareflag: true
      });
    }).catch(err => {
      wx.showToast({
        title: err,
        icon: 'error',
        duration: 2000,
        mask: true
      });
      that.setData({
        shareflag: false,
        checked_value: false,
      });
    });
  },

  weekchange(e, pn = 0) {
    const that = this;
    let { week_ordinal } = that.data;

    if (pn != 0) {
      week_ordinal = pn === 1 ? (week_ordinal > 1 ? week_ordinal - 1 : week_ordinal) : (week_ordinal < 20 ? week_ordinal + 1 : week_ordinal);
    } else {
      week_ordinal = e.target.dataset.change === "pre" ? (week_ordinal > 1 ? week_ordinal - 1 : week_ordinal) : (week_ordinal < 20 ? week_ordinal + 1 : week_ordinal);
    }

    const count_weekdaywhat = utils.count_weekday(week_ordinal - app.globalData.week_time);
    this.setData({
      weekday: count_weekdaywhat,
      week_ordinal: week_ordinal
    });

    this.updateSchedule();
  },

  updateSchedule() {
    const that = this;
    const { week_ordinal, checked_value } = that.data;
    const useraccount = wx.getStorageSync('useraccount');
    const xnxqh = app.globalData.current_time['xnxqh'];

    api.getClassInfo(useraccount, xnxqh, week_ordinal).then(res => {
      let new_table1 = res.length === 1 ? [] : tableformat.processTableOrd(res);
      const custom_schedule = wx.getStorageSync('newschedule');

      if (!checked_value) {
        new_table1=that.updateCustomSchedule(new_table1, custom_schedule);
      } else {
        new_table1=that.updateCustomSchedule(new_table1, custom_schedule);
        that.fetchSharedSchedule(that.data.chanceshare, week_ordinal, that.data.chancenumber);
      }

      that.setData({
        table1: new_table1
      });
      app.globalData.todatabasesflag--;
      api.postclass(week_ordinal, res);
    }).catch(() => {
      wx.showToast({
        title: '请求失败2',
        icon: 'error'
      });
    });
  },

  buttonadd() {
    wx.navigateTo({
      url: '../AddSchedule/addshedule',
    });
  },

  rechange() {
    this.updateSchedule();
  },

  touchStart(e) {
    this.startX = e.touches[0].pageX;
    this.moveFlag = true;
  },

  touchMove(e) {
    const endX = e.touches[0].pageX;
    if (this.moveFlag) {
      if (endX - this.startX > 200) {
        this.weekchange(0, 1);
        this.moveFlag = false;
      } else if (this.startX - endX > 200) {
        this.weekchange(0, 2);
        this.moveFlag = false;
      }
    }
  },

  touchEnd() {
    this.moveFlag = true;
  },

  turnshareset() {
    wx.navigateTo({
      url: '../BindSchedule/bindschedule',
    });
  }

});
