// pages/orderDetails/index.js
const WXAPI = require('../../wxapi/main');
const formatData=require("../roles/formatData.js")
const moment = require('../../utils/moment.js')
const utils = require("../../utils/utils.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadingStatus: false,
    actionSheetHidden: true,
    selectedOrder:{
    }, 
    rePaidButtonShow: { //续购按钮是否显示
      25: true,
      30: true,
      40: true
    },
    toBeReturned: { //待还件是否显示
      40: true
    },
      // orderDetails:{
      //   orderStatusName:"",//订单状态
      //   addonsName: "",//套餐类型
      //   address:"",//取件地址
      //   startDate:"",//租用日期
      //   endDate:"",//租用日期
      //   itemAmount:"",//租用件数
      //   itemPrice:"",//单价
      //   itemUnit:"",//单位
      //   itemDeposits:"",//押金每台
      //   remarks:"",//备注
      //   userName:"",//联系人
      //   userPhone:"",//电话
      //   orderValues:"",//总额
      //   orderDeposits:""//押金总额
      // }
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      loadingStatus:true
    })
    let orderId = options.orderId;
    if (orderId){
      this.getorderDetails(orderId);
    }
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
  getorderDetails: function (orderId){
    let that=this;
    WXAPI.getorderDetails({
      orderId
    }).then(function (result) {
      let order = result.params.order;
      order=formatData.formatOrderDetails(order)
      that.setData({
        order: order,
        selectedOrder: order,
        loadingStatus: false
      })
    }).then(function(){
      that.setData({
        loadingStatus: false
      })
    })
  },
  handleRePay: function () {
    //点击续购
    let selectedOrder = this.data.selectedOrder;
    //上一个订单的结束时间变成开始时间
    let lastEndDate = selectedOrder.endDate;
    selectedOrder.startDate = lastEndDate;
    //orderValues=0
    selectedOrder.orderValues = 0;
    selectedOrder.orderDays = "";
    // let _dateE = moment(lastEndDate);
    // let day = _dateE.differ(beginDate, 'day') + 1;

    this.setData({
      selectedOrder,
      actionSheetHidden: !this.data.actionSheetHidden,
    })
  },
  actionSheetChange: function () {
    //点击的时候
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    });
  },
  handleInput: function (e) {
    let orderDaysValue = e.detail.value;
    let selectedOrder = this.data.selectedOrder;
    if (orderDaysValue && orderDaysValue > 0) {
      selectedOrder.orderDays = orderDaysValue;
      //计算订单续期的结束时间
      let startDate = selectedOrder.startDate
      orderDaysValue = parseInt(orderDaysValue)
      let endDate = moment(startDate).add(orderDaysValue, "day").format("YYYY-MM-DD");

      console.log(endDate)
      selectedOrder.endDate = endDate;
      //计算需要支付的价格
      let orderValues = selectedOrder.itemPrice * selectedOrder.itemAmount * parseInt(orderDaysValue);
      orderValues = utils.toFixed(orderValues, 2);
      selectedOrder.orderValues = orderValues;
    } else {
      //小于0或者清空
      selectedOrder.orderDays = "";
      selectedOrder.endDate = selectedOrder.startDate;
      selectedOrder.orderValues = 0;
    };


    this.setData({
      selectedOrder
    })
  },
  toOrder: function (e) {
    let formId = e.detail.formId;
    let selectedOrder = this.data.selectedOrder;
    let orderId = selectedOrder.orderId;
    let orderDays = selectedOrder.orderDays;
    if (orderDays == "" || orderDays == "0") {
      wx.showToast({
        title: "请填写续购天数",
        icon: "none",
        duration: 3000,
      });
      return false;
    };
    let that = this;
    //去下单
    WXAPI.orderRePay({
      formId,
      orderId,
      orderDays
    }).then(function (result) {
      let orderDetailsId = result.params.orderDetailsId;
      wx.showModal({
        title: '下单',
        content: '确认下单？',
        success(res) {
          that.actionSheetHidden = true;
          that.setData({
            actionSheetHidden: !that.data.actionSheetHidden
          });
          if (res.confirm) {
            console.log('用户点击确定')
            that.toRePaid(orderDetailsId, 1);
          } else if (res.cancel) {
            console.log('用户点击取消');
            that.toRePaid(orderDetailsId, 0);
          }
        }
      })
    })
  },
  toRePaid: function (orderDetailsId, userFlag) {
    let that = this;
    WXAPI.orderSurePay({
      orderDetailsId,
      userFlag
    }).then(function (result) {
      if (userFlag == 0) {
        //说明是取消付款
        return;
      }
      let _xml = result.params;
      wx.requestPayment({
        timeStamp: _xml.timeStamp, //时间搓
        nonceStr: _xml.nonceStr, //随机字符串
        package: _xml.package, //repay_id
        signType: _xml.signType, //签名算法
        paySign: _xml.sign, //签名
        success(res) {
          console.log(res, '微信支付成功！！！')
          that.tailIsPaid(orderDetailsId, 1, "orderDetailsId");

          // //跳到我的订单页面
          // wx.switchTab({
          //   url: "/pages/order-list/index",
          // });
        },
        fail(result) {
          console.log("fail");
          that.tailIsPaid(orderDetailsId, 0, "orderDetailsId");
          //跳到我的订单页面
          // wx.switchTab({
          //   url: "/pages/order-list/index",
          // });
        }
      })
    })
  },
  tailIsPaid: function (orderId, isPaid, name) {
    //isPaid==0未完成支付，1表示已完成支付
    let that = this;
    let selectedOrder = this.data.selectedOrder;
    let __orderId = selectedOrder.orderId;
    WXAPI.tailIsPaid({
      [name]: orderId,
      isPaid
    }).then(function (result) {
      that.getorderDetails(__orderId);
    })
  },
  handlePay: function (e) {
    //点击付款
    let that = this;
    let formId = e.detail.formId;
    let selectedOrder = this.data.selectedOrder;
    let orderId = selectedOrder.orderId;
    WXAPI.orderPaid({
      formId,
      orderId
    }).then(function (result) {
      //取消订单后，重新查询
      let _xml = result.params;
      wx.requestPayment({
        timeStamp: _xml.timeStamp, //时间搓
        nonceStr: _xml.nonceStr, //随机字符串
        package: _xml.package, //repay_id
        signType: _xml.signType, //签名算法
        paySign: _xml.sign, //签名
        success(res) {
          console.log(res, '微信支付成功！！！')
          that.tailIsPaid(orderId, 1, "orderId");
        },
        fail(result) {
          console.log(result);
          that.tailIsPaid(orderId, 0, "orderId");
        }
      })
    })
  },
  
  bindSb: function (e) {
    //绑定设备
    let selectedOrder = this.data.selectedOrder;
    let orderId = selectedOrder.orderId;
    wx.navigateTo({
      url: "/pages/equipmentList/index?orderId=" + orderId,
    });

    
  },
  toBeReturned:function(){
    //点击退款
    let selectedOrder = this.data.selectedOrder;
    let orderId = selectedOrder.orderId;
    wx.navigateTo({
      url: "/pages/refund/index?orderId=" + orderId,
    });
  },
  /**
   *自定义 下拉刷新
   **/
  onPullDownRefresh: function () {
    let selectedOrder = this.data.selectedOrder;
    let orderId = selectedOrder.orderId;
    this.getorderDetails(orderId);
  },
})