// pages/refund/index.js
const WXAPI = require('../../wxapi/main');
const formatData = require("../roles/formatData.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId:"",//订单id
    wlData: [{
      osbId: "",
      sendBackNum: ""
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      loadingStatus: true
    })
    let orderId = options.orderId;
    if (orderId) {
      this.setData({
        orderId
      })
      this.queryLogistics();
      this.getorderDetails(orderId);
    }
  },
  queryLogistics: function () {
    let that = this;
    let orderId = this.data.orderId;
    WXAPI.queryLogistics({
      orderId
    }).then(function (result) {
      let logisticsLists = result.params.data;
      if (logisticsLists.length>0){
        that.setData({
          wlData: logisticsLists
        })   
      }else{
        that.setData({
          wlData: [{
            osbId: "",
            sendBackNum: ""
          }]
        }) 
      }
       
    })
  },
  getorderDetails: function (orderId) {
    let that = this;
    WXAPI.getorderDetails({
      orderId
    }).then(function (result) {
      let order = result.params.order;
      order = formatData.formatOrderDetails(order)
      that.setData({
        order: order,
        selectedOrder: order,
        loadingStatus: false
      })
    }).then(function () {
      that.setData({
        loadingStatus: false
      })
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  bindSb: function () {
    //添加物流

    let wlData = this.data.wlData;
    wlData.push({
      osbId: "",
      sendBackNum: ""
    });
    this.setData({
      wlData
    })
  },
  handleDel: function (e) {
    //点击删除按钮
    let osbId = e.currentTarget.dataset.osbid;
    let index = e.currentTarget.dataset.index;
    if (osbId) {
      //如果osbId有值，说明是修改,发送请求
      this.sendWlbh({
        osbId,
        sendBackNum: ""
      })
    } else {
      let wlData = this.data.wlData;
      wlData.splice(index, 1);
      this.setData({
        wlData
      })
    }

  },
  sendWlbh: function (data) {
    let that=this;
    let orderId = this.data.orderId;
    data.orderId = orderId;

    WXAPI.sendWlbh(data).then(function (result) {
      let msg = result.params.result;
      that.queryLogistics();
      wx.showToast({
        title: msg,
        icon: "none",
        duration: 2000
      });
    })
  },
  handleInput: function (e) {
    let _val = e.detail.value;
    let index = e.currentTarget.dataset.index;
    let wlData = this.data.wlData;
    wlData[index].sendBackNum = _val;
    this.setData({
      wlData
    })
  },
  handleSubmit: function () {
    //点击提交

  },
  handleAdd:function(e){
    //点击添加
    let osbId = e.currentTarget.dataset.osbid;
    let index = e.currentTarget.dataset.index;
    let wlData = this.data.wlData;
    let sendBackNum = wlData[index].sendBackNum;
    if (sendBackNum==""){
      wx.showToast({
        title: "物流单号不能为空",
        icon: "none",
        duration: 2000
      });
      return;
    };
    if (sendBackNum.length>50) {
      wx.showToast({
        title: "物流单号填写错误",
        icon: "none",
        duration: 2000
      });
      return;
    }
    this.sendWlbh({
      osbId,
      sendBackNum
    })
  },
  scanErwm:function(e){
    //扫描二维码
    let that=this;
    let index = e.currentTarget.dataset.index;
    wx.scanCode({
      success: (res) => {
        let result = res.result;
        let wlData = that.data.wlData;
        wlData[index].sendBackNum = result;
        that.setData({
          wlData
        })
      }
    })
  }
})