const qzapi=require("../../../../API/sdust_api")
Page({
  data: {
    // 存放区间节次的筛选前的课表信息
    rawData:[],
    // 几组数据，校区、楼号、节次集合
    Range_List:{
      // 校区
      campus_list:['青岛校区','济南校区','泰安校区'],
      // 楼号
      building_list:{
        list1:["14号楼", "0号楼", "TY楼", "S1楼", "S3楼", "5号楼", "4号楼", "Y楼", "3号楼", "科技园", "11号楼", "S2楼", "7号楼", "8号楼", "工程实训大楼", "9号楼", "6号楼", "2号楼", "15号楼", "1号楼", "13号楼"],
        list2:["体育场（济南）", "3号教学楼（济南）", "2号教学楼（济南）", "1号教学楼（济南）", "图书馆（济南）"],
        list3:["泰安东校2号教学楼", "泰安西校3号教学楼", "泰安东校1号教学楼", "泰安东校1号实验楼", "泰安东校3号实验楼", "泰安西校1号教学楼", "泰安西校4号教学楼", "泰安东校5号教学楼", "泰安东校2号实验楼", "泰安西校5号教学楼", "泰安西校2号教学楼", "泰安东校3号教学楼", "泰安东校4号教学楼", "泰安东校田径场", "泰安西校田径场"],
      },
      // 节次
      selection_list:['8：00-9：50','10：10-12：00','14：00-15：50','16：10-18：00','19：00-20：50'],
    },
    // 几组数据的序列号
    Index_List:{
      campus_index:0,
      building_index:0,
      selection_index:[0,4],
    },
    // 几种筛选的显示状态
    select_status:{
      status1:0,
      status2:0,
      status3:0,
      status4:0
    },
    // 要显示的实际空教室列表
    empty_room:[],
    // 当前的教学楼列表，因为需要根据校区的变化进行改变，而每个校区的教学楼我直接初始化了，不再从数据中读取，默认为青岛校区的
    current_buildinglist:["14号楼", "0号楼", "TY楼", "S1楼", "S3楼", "5号楼", "4号楼", "Y楼", "3号楼", "科技园", "11号楼", "S2楼", "7号楼", "8号楼", "工程实训大楼", "9号楼", "6号楼", "2号楼", "15号楼", "1号楼", "13号楼"]
  },
  // 点击显示框，进行显示
  change_status(e){
    var id=e.currentTarget.dataset.id
    var status=e.detail.status
    this.hide_selection()
    if(id==1){
      this.setData({
        'select_status.status1':!status
      })
    }
    else if(id==2){
      this.setData({
        'select_status.status2':!status
      })
    }
    else if(id==3){
      this.setData({
        'select_status.status3':!status
      })
    }
    else if(id==4){
      this.setData({
        'select_status.status4':!status
      })
    }
    console.log(e)
  },
  // 选择时点击其他的地方，关闭选择
  hide_selection(){
    this.setData({
      'select_status.status1':0,
      'select_status.status2':0,
      'select_status.status3':0,
      'select_status.status4':0,
    })
  },
  // 选择对应值，改变index
  change_index(e){
    var index=e.detail.index
    var id=e.currentTarget.dataset.id
    if(id==1){
      this.setData({
        'Index_List.campus_index':index,
        'select_status.status1':0,
        'Index_List.building_index':0,
      })
      if(index==0)this.setData({
        current_buildinglist:this.data.Range_List.building_list.list1,
      })
      else if(index==1)this.setData({
        current_buildinglist:this.data.Range_List.building_list.list2
      })
      else if(index==2)this.setData({
        current_buildinglist:this.data.Range_List.building_list.list3
      })
      this.update_emptyroom()
    }
    else if(id==2){
      this.setData({
        'Index_List.building_index':index,
        'select_status.status2':0
      })
      this.update_emptyroom()
    }
    else if(id==3){
      var list=this.data.Index_List.selection_index
      var indexBefore=list[0]
      var _list=[index,list[1]]
      if(list[1]<index)wx.showToast({
        title: '错误的节次区间',
        icon:'error'
      })
      else {
        this.setData({
          'Index_List.selection_index':_list,
        })
        if(index!=indexBefore)this.update_rawData()
      }
      this.setData({
        'select_status.status3':0
      })
    }
    else if(id==4){
      var list=this.data.Index_List.selection_index
      var _list=[list[0],index]
      var indexBefore=list[1]
      if(list[0]>index)wx.showToast({
        title: '错误的节次区间',
        icon:'error'
      })
      else {
        this.setData({
          'Index_List.selection_index':_list,
        })
        if(index!=indexBefore)this.update_rawData()
      }
      this.setData({
        'select_status.status4':0
      })
    }

  },

  // 筛选校区、教学楼
  findMatchingRooms(arr, campus, building) {
    const targetJxl = `${campus}-${building}`;
    const matchingRooms = arr.filter(item => item.jxl === targetJxl);
    return matchingRooms.flatMap(item => item.jsList.map(js => js.jsmc));
  },
  //在非节次变化时，选择其他部分时的更新事件
  update_emptyroom(){
    var campus=this.data.Range_List.campus_list[this.data.Index_List.campus_index]
    var building=this.data.current_buildinglist[this.data.Index_List.building_index]
    var arr=this.data.rawData
    this.setData({
      empty_room:this.findMatchingRooms(arr,campus,building)
    })
  },
  // 更改节次进行数据的更换，重新读取强智信息,并将节次数据合并,赋值rawdata，同时刷新当前空教室
  async update_rawData(){
    var time=["0102","0304","0506","0708","night"]
    var index1=this.data.Index_List.selection_index[0]
    var index2=this.data.Index_List.selection_index[1]
    // 存放几个节次合并后的数据
    var list=[]
    var promises = [];
    for (var i = index1; i <= index2; i++) {
      promises.push(
        qzapi.getClassroomInfo(time[i])
          .then(list1 => {
            list = this.mergeAndIntersectArrays(list, list1);
            console.log(list)
          })
          .catch(error => {
            // 处理错误情况
            console.error(`Error fetching data for ${time[i]}:`, error);
          })
      );
    }
    // 使用 Promise.all 等待所有异步调用完成
    await Promise.all(promises);
    this.setData({
      rawData:list
    })
    this.update_emptyroom()
  },
  // 对返回的每个节次的数据进行交集处理
  mergeAndIntersectArrays(arr1, arr2) {
    function intersectJsLists(jsList1, jsList2) {
      // 使用 jsList1 中的 jsmc 属性创建一个集合
      const idSet = new Set(jsList1.map(item => item.jsmc));
      // 过滤 jsList2，只保留在 idSet 中存在的元素
      const intersectedJsList = jsList2.filter(item => idSet.has(item.jsmc));
      return intersectedJsList;
    }

    // 参数类型检查
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
      return []
    }
  
    // 存储合并后的数组
    const mergedArr = [];
  
    // 如果 arr1 为空，则直接返回 arr2 的深拷贝数组
    if (arr1.length === 0) {
      return arr2.map(item => ({ ...item }));
    }
  
    // 对 arr1 中的每个元素进行处理
    arr1.forEach(item1 => {
      // 创建元素的深拷贝
      const newItem = { ...item1 };
      // 在 arr2 中查找是否存在与 item1 具有相同 jxl 属性的元素
      const existingItem = arr2.find(item2 => item2.jxl === item1.jxl);
  
      // 如果存在匹配项，进行交集处理
      if (existingItem) {
        // 返回交集的数组并赋值给对象的数组
        newItem.jsList = intersectJsLists(item1.jsList, existingItem.jsList);
        // 添加对象到结果数组
        mergedArr.push(newItem);
      }
    });
  
    return mergedArr;
  },


  onLoad(options) {
    // 请求数据
    this.update_rawData();
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
});
