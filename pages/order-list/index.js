const app = getApp()
const WXAPI = require('../../wxapi/main');
const formatData = require("../roles/formatData");
const moment = require('../../utils/moment.js')
const utils = require("../../utils/utils.js");
Page({
  data: {
    actionSheetHidden: true,
    loadingStatus: false,
    pageIndex: 1,
    pageSize: 20,
    loadBar: {
      Loading: false,
      more: true
    },
    // cancelButtonShow:false,//取消的按钮是否显示
    // paidButtonShow:false,//付款按钮
    // rePaidButtonShow:false,//续购按钮是否显示
    statusType: [{
      txt: "全部",
      orderStatus: "0",
    }, {
      txt: "待付款",
      orderStatus: "10",
    }, {
      txt: "待取货",
      orderStatus: "30",
    }],


    //   txt: "待发货",
    //   orderStatus: "20",
    // }, {
    //   txt: "待取货",
    //   orderStatus: "30",
    // }],
    statusType1: [{
      txt: "待还件",
      orderStatus: "40",
    }, {
      //   txt: "待收货",
      //   orderStatus: "25",
      // }, {
      //   txt: "未还件",
      //   orderStatus: "40",
      // }, {
      txt: "结算中",
      orderStatus: "50",
    }, {
      txt: "已完成",
      orderStatus: "60",
      // }, {
      //   txt: "已超时",
      //   orderStatus: "70",
      // }, {
      //   txt: "已取消",
      //   orderStatus: "80",
    }],
    statusType2: [
      // {
      //   txt: "已超时",
      //   orderStatus: "70",
      // }, {
      //   txt: "已取消",
      //   orderStatus: "80",
      // }
    ],
    currentType: 0,
    tabClass: ["", "", "", "", ""],
    cancelButtonShow: { //取消的按钮是否显示
      "10": true,
      "20": true,
      "30": true,
    },
    paidButtonShow: { //付款按钮是否显示
      "10": true,
    },
    rePaidButtonShow: { //续购按钮是否显示
      "25": true,
      "30": true,
      "40": true
    },
    // xgOrderDays: "", //续购时间
    xgBeginData: "", //续购开始时间

    selectedOrder: {
      orderId: "", //订单号，
      orderDate: "", //开始时间
      orderStatus: "", //订单状态
      orderStatusName: "", //订单状态
      url: "", //订单图片的url
      itemName: "", //订单名称 
      itemPrice: "", //订单单价
      itemUnit: "", //单位
      startDate: "", //租用日期
      endDate: "", //租用日期
      addonsName: "", //套餐类型
      itemAmount: "", //台数
      orderValues: "", //合计
      orderDeposits: "" //包含的押金
    }, //选择的订单
    orderList: [] //数据列表
  },
  onShow: function() {

    // 获取订单列表
    this.setData({
      pageIndex: 1,
      // loadingStatus: true,
    });

    var self = this;
    try {
      //检测有木有绑定手机号

      self.checkIsbindPhone();

    } catch (e) {}
  },
  checkIsbindPhone(callback) {
    let that = this;
    //请求是否已经绑定三方
    WXAPI.checkPhone({}).then(function(result) {

      let flag = result.params.flag;
      if (flag == "0") {
        //说明还未绑定三方支付，需要绑定页面
        callback();
        that.setData({
          orderList: []
        });
        wx.showModal({
          title: '提示',
          content: '暂未绑定手机号，现在去绑定？',
          icon: "none",
          success(res) {
            if (res.confirm) {
              wx.navigateTo({
                url: "/pages/threewayBinding/index"
              })
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }

        })
      } else if (flag == "1") {
        that.dataLayer(callback);
      }
    })
  },

  dataLayer: function(callback) {
    var self = this;
    var pageSize = self.data.pageSize;
    var pageIndex = self.data.pageIndex;
    let statusType = self.data.statusType;
    let statusType1 = self.data.statusType1;
    let statusTypeAll = statusType.concat(statusType1);

    let currentType = self.data.currentType;
    let postData = {
      pageSize: pageSize,
      pageIndex: pageIndex,
      orderStatus: statusTypeAll[currentType].orderStatus
    }
    var loadBar = self.data.loadBar || {};
    loadBar.Loading = true; // 加载中
    self.setData({
      loadBar: loadBar
    });
    // this.getOrderStatistics();
    WXAPI.orderList(postData,{isLoading:false}).then(function(res) {
      loadBar.Loading = false; // 加载完毕
      self.setData({
        loadBar: loadBar,
        loadingStatus: false
      })
      //如果没有绑定手机
      let data = res.params;
      // if (data.flag=="1") {
      //   wx.showToast({
      //     title: data.invalid,
      //     icon: "none",
      //     duration: 3000,
      //   })
      // }
      let rows = data.orderList || [];
      rows = formatData.formatOrderList(rows);
      let isData = (pageSize >= rows.length) ? true : false;
      //数量
      let records = data.count || 10;
      if (!rows.length) {
        if (pageIndex > 1) {
          isData = false;
        }
      }
      if (!!callback) {
        callback(isData);
      }
      if (pageIndex > 1) {
        let dataList = self.data.orderList;

        let newRows = dataList.concat(rows);
        loadBar.more = !(records <= newRows.length); // 判断是否还有数据
        self.setData({
          loadBar: loadBar,
          orderList: newRows,
          logisticsMap: res.data.logisticsMap,
          goodsMap: res.data.goodsMap
        });
      } else {
        loadBar.more = !(records <= rows.length); // 判断是否还有数据
        self.setData({
          orderList: rows,
          loadBar: loadBar
        });
      }
      // that.setData({
      //   orderList: res.data.orderList,
      //   logisticsMap: res.data.logisticsMap,
      //   goodsMap: res.data.goodsMap
      // });

    }).catch(function() {
      self.setData({
        loadingStatus: false
      })
    })
  },
  statusTap: function(e) {
    const curType = e.currentTarget.dataset.index;
    // let orderStatus = e.currentTarget.dataset.orderStatus;
    // this.data.currentType = curType;
    this.setData({
      currentType: curType
    });
    this.onShow();
  },
  /**
   *自定义 下拉刷新
   **/
  onPullDownRefresh: function() {

    var self = this;
    self.setData({
      pageIndex: 1
    });
    self.checkIsbindPhone(function(isData) {
      setTimeout(() => {
        wx.stopPullDownRefresh() //停止下拉刷新
      }, 800);
    });
  },
  /**
  上拉加载
 
  **/
  onReachBottom: function() {
    var self = this;

    var pageIndex = self.data.pageIndex;
    self.setData({
      pageIndex: ++pageIndex
    })

    let pageSize = self.data.pageSize;
    let dataList = self.data.orderList;
    if (dataList.length < pageSize) {
      console.log("数量太小，不需要上拉")
      return false;
    }

    self.checkIsbindPhone(function(isData) {
      if (!isData) {
        // 没有数据应减回去
        self.setData({
          pageIndex: --pageIndex
        })
      }
    });


  },
  orderDetail: function(e) {
    var orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/order-details/index?id=" + orderId
    })
  },
  cancelOrderTap: function(e) {
    var that = this;
    var orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确定要取消该订单吗？',
      content: '',
      success: function(res) {
        if (res.confirm) {
          WXAPI.orderClose(orderId, wx.getStorageSync('token')).then(function(res) {
            if (res.code == 0) {
              that.onShow();
            }
          })
        }
      }
    })
  },

  onLoad: function(options) {
    if (options && options.type) {
      this.setData({
        currentType: options.type
      });
    }
  },
  handleCancleOrder: function(e) {
    let that = this;
    let formId = e.detail.formId;
    let orderId = e.detail.value.orderId;
    //判断当前状态
    let orderStatus = e.detail.value.orderStatus;
    if (orderStatus == "10") {
      //说明待付款
      wx.showModal({
        title: '提示',
        content: '确定要取消该订单吗？',
        success: function(res) {
          if (res.confirm) {
            //取消订单
            that.sureCancleOrder(orderId);
          } else {
            console.log('用户点击取消')
          }
        }
      })
      return false;
    }
    //请求退款金额
    WXAPI.requestRefund({
      formId,
      orderId
    }).then(function(result) {
      let extraFee = result.params.extraFee;
      //extraFee==0说明没有超时，==1说明已经超时，查看fees超时扣的金额

      let msg = '确定要取消该订单吗？'
      if (extraFee == "1") {
        let desc = result.params.desc;
        msg = desc;
      };
      wx.showModal({
        title: '提示',
        content: msg,
        success: function(res) {
          if (res.confirm) {
            //取消订单
            that.sureCancleOrder(orderId);
          } else {
            console.log('用户点击取消')
          }
        }
      })
    })
  },
  sureCancleOrder: function(orderId) {
    //取消订单
    let that = this;
    WXAPI.cancleOrder({
      orderId
    }).then(function(result) {
      //取消订单后，重新查询
      wx.showToast({
        title: result.message,
        icon: "none",
        duration: 3000,
        complete: function() {
          setTimeout(() => {
            that.onShow();
          }, 500)
        }
      })

    })
  },
  handlePay: function(e) {
    //点击付款
    let that = this;
    let formId = e.detail.formId;
    let orderId = e.detail.value.orderId;
    WXAPI.orderPaid({
      formId,
      orderId
    }).then(function(result) {
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
          // wx.showToast({
          //   title: result.err_desc,
          //   icon: "none",
          //   duration: 3000,
          //   complete: function () {
          //     setTimeout(() => {
          //       that.tailIsPaid(orderId, 0, "orderId");
          //     }, 500)
          //   }
          // })
          that.tailIsPaid(orderId, 0, "orderId");
        }
      })
    })
  },
  tailIsPaid: function(orderId, isPaid, name) {
    //isPaid==0未完成支付，1表示已完成支付
    let that = this;
    WXAPI.tailIsPaid({
      [name]: orderId,
      isPaid
    }).then(function(result) {
      that.onShow();
    })
  },
  handleRePay: function(e) {
    //点击续购
    let selectedOrder = e.currentTarget.dataset.item;
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

      // xgOrderDays:""
    })
  },
  actionSheetChange: function() {
    //点击的时候
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    });
  },
  handleInput: function(e) {
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

  toOrder: function(e) {
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
    }).then(function(result) {
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
  toRePaid: function(orderDetailsId, userFlag) {
    let that = this;
    WXAPI.orderSurePay({
      orderDetailsId,
      userFlag
    }).then(function(result) {
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
  bindSb: function(e) {
    //绑定设备
    let orderId = e.currentTarget.dataset.orderid;
    wx.navigateTo({
      url: "/pages/equipmentList/index?orderId=" + orderId,
    });
  },
})