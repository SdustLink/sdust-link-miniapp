// 这是一个空的taro模块，将使用wx原生API替代Taro
const Taro = {
  // 网络请求
  request: wx.request,
  
  // 其他可能需要的API
  getStorage: wx.getStorage,
  setStorage: wx.setStorage,
  getStorageSync: wx.getStorageSync,
  setStorageSync: wx.setStorageSync,
  showToast: wx.showToast,
  showLoading: wx.showLoading,
  hideLoading: wx.hideLoading,
  navigateTo: wx.navigateTo,
  redirectTo: wx.redirectTo,
  switchTab: wx.switchTab,
  reLaunch: wx.reLaunch,
  navigateBack: wx.navigateBack,
};

export default Taro; 