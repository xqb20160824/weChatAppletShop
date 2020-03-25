const app = getApp()
const WXAPI = require('../../wxapi/main')
const moment = require('../../utils/moment.js')
const utils = require('../../utils/utils.js')

Page({
  data: {
    itemId: "", //商品Id
    iaoId: "", //套餐Id
    maxDates: "", //最大日期
    minDates: "", //最小日期
    deliverType: "0", // 配送方式 1,0 分别表示快递/到店自取
    totalScoreToPay: 0, //商品的总价
    perDeposit: null, //每台的押金
    // deposit: 800,//包含的押金
    // perPrice:"29",
    beginDate: "2019-06-14",
    endDate: "",
    totalDays: "0", //天数
    isAgree: false, //服务协议
    goodsList: {}, //商品的信息
    userAddressId: "", //邮寄地址的id
    hasCheckedPhone: "", //已验证的手机
    faId: "",
    selectedAddressDetails:"",
    // pickUpAddress:[{ 
    //   "city": "上海",
    //   "airports": [{
    //     "faId": "17d734218cf411e9a6e640b07607f863",
    //     "airport": "虹桥机场"
    //   }, {
    //     "faId": "17de3cfd8cf411e9a6e640b07607f863",
    //     "airport": "浦东机场"
    //   }]
    // }],
    pickUpAddressSelected: 0,
    startDate: "",
    payPopUp: {
      submited: {
        pay_number: 1,
      },
      addBtn: false,
      minusBtn: true,
    },
  },

  onShow: function() {
    

  },
  onLoad: function(e) {
    let _data = {}
    if (e.orderType) {
      _data.orderType = e.orderType
    }
    this.setData(_data);
    const that = this;
    let shopList = {};
    //立即购买下单，获取商品的一些信息
    var buyNowInfoMem = wx.getStorageSync('buyNowInfo');

    if (buyNowInfoMem) {
      shopList = buyNowInfoMem;
      let basicInfo = buyNowInfoMem.basicInfo;
      //套餐信息
      let selectedItem = buyNowInfoMem.selectedItem;
      this.setData({
        itemId: basicInfo.itemId,
        iaoId: selectedItem.iaoId,
        maxDates: selectedItem.maxDates,
        minDates: selectedItem.minDates,
        deposit: basicInfo.itemDeposits,
        perDeposit: basicInfo.itemDeposits,
        perPrice: selectedItem.values,
        itemUnit: basicInfo.itemUnit
      })
    }
    that.setData({
      goodsList: shopList,
    });
    //请求默认邮寄地址
    this.initShippingAddress();

    //请求默认自取的地址

    this.initZqAddress();

    //请求取件开始日期
    this.initGetBeginDate();


    //计算价格
    this.count_price();
  },
  /**
   * 计算总价
   */
  count_price() {
    // 租的天数
    let totalDays = this.data.totalDays;

    //组的件数
    let pay_number = this.data.payPopUp.submited.pay_number;

    //单价，每天租赁的费用
    let perPrice = this.data.perPrice;
    //押金
    let perDeposit = this.data.perDeposit;
    //商品的总价
    let perTotalPrice = parseInt(totalDays) * parseFloat(perPrice) + parseFloat(perDeposit);
    let totalScoreToPay = utils.toFixed((perTotalPrice * parseInt(pay_number)),2);

    // 最后赋值到data中渲染到页面
    this.setData({
      totalScoreToPay
    });
  },
  bindBeginDateChange: function(e) {
    //开始时间
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      beginDate: e.detail.value
    });
    this.compareDate();
  },
  bindEndDateChange: function(e) {
    //结束时间
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      endDate: e.detail.value
    });
    this.compareDate();
  },
  compareDate: function() {
    let beginDate = this.data.beginDate;
    let endDate = this.data.endDate;
    if (beginDate != "" && endDate != "") {
      let _dateE = moment(endDate);
      let day = _dateE.differ(beginDate, 'day') + 1;
      this.setData({
        totalDays: day
      });
      //计算价格
      this.count_price();
    }
  },
  radioChange(e) {
    this.setData({
      deliverType: e.detail.value,
    })
  },
  initShippingAddress: function() {
    let that = this;
    //请求地址
    WXAPI.initShippingAddress({

    }).then(function(result) {
      let curAddressData = result.params.address || {};
      let phone = result.params.phone;
      that.setData({
        curAddressData: curAddressData,
        hasCheckedPhone: phone
      })
    })
    //请求地址
  },
  initZqAddress: function() {
    let that = this;
    //请求自取的地址
    WXAPI.initZqAddress({

    }).then(function(result) {
      let pickUpAddress = result.params.address || {};
      that.setData({
        pickUpAddress: pickUpAddress,
        faId: pickUpAddress[0].airports[0].faId,
        selectedAddressDetails: pickUpAddress[0].airports[0].addressDetails
      })
    })
  },
  initGetBeginDate:function(){
    //请求取件的开始日期
    let that = this;
    let itemId = this.data.itemId;
    //请求自取的地址
    WXAPI.getBeginDate({
      itemId
    }).then(function (result) {
      let dates = result.params.dates;
      //获取当前时间
      // var nowDate = moment().format("YYYY-MM-DD"); //当前时间
      var beginDate = moment().add(dates, "day").format("YYYY-MM-DD");
      that.setData({
        beginDate: beginDate
      })
    })

  },
  addAddress: function() {
    //选择配送地址
    wx.navigateTo({
      url: "/pages/select-address/index"
    })
  },
  selectAddress: function() {
    //选择地址
    wx.navigateTo({
      url: "/pages/select-address/index"
    })
  },
  handleSelectedAddress: function(e) {
    let airportIndex = e.currentTarget.dataset.index;
    let faId = e.currentTarget.dataset.faid;
    let selectedAddressDetails = e.currentTarget.dataset.addressdetails;
    this.setData({
      pickUpAddressSelected: airportIndex,
      faId: faId,
      selectedAddressDetails
    })
  },
  // 增加
  addCount: function() {
    let pay_number = this.data.payPopUp.submited.pay_number;
    // if (pay_number != 3) {
    this.setData({
      ['payPopUp.submited.pay_number']: ++pay_number,
      ['payPopUp.minusBtn']: false
    });
    let _deposit = pay_number * this.data.perDeposit;
    _deposit = utils.toFixed(_deposit,2);
    this.setData({
      deposit: _deposit
    })
    //计算价格
    this.count_price();
    // if (pay_number == 3) {
    //   this.setData({
    //     ['payPopUp.addBtn']: true
    //   })
    // }
    // }
  },

  // 减少
  minusCount: function() {
    let pay_number = this.data.payPopUp.submited.pay_number;
    if (pay_number != 1) {
      this.setData({
        ['payPopUp.submited.pay_number']: --pay_number,
        ['payPopUp.addBtn']: false
      })
      if (pay_number == 1) {
        this.setData({
          ['payPopUp.minusBtn']: true
        })
      };
      let _deposit = pay_number * this.data.perDeposit;
      _deposit = utils.toFixed(_deposit, 2);
      this.setData({
        deposit: _deposit
      })
      //计算价格
      this.count_price();
    }
  },
  bindAgreeChange: function(e) {
    this.setData({
      isAgree: !this.data.isAgree
    });
  },
  createOrder: function(e) {
    let that = this;
    let isCanTj = this.judgeOrder(e);
    if (!isCanTj) {
      return false;
    };
    //点击去支付
    let formId = e.detail.formId;


    //取件方式
    let deliverType = this.data.deliverType;
    //开始时间
    let beginDate = this.data.beginDate;
    //结束时间
    let endDate = this.data.endDate;

    //备注信息
    let remarks = e.detail.value.remarks;
    let faId = this.data.faId;
    //地址
    let address = "";
    //用户名
    let userName = "";
    //手机号
    let userPhone = "";
    if (deliverType == "1") {
      //邮寄的话 
      let curAddressData = this.data.curAddressData;
      userName = curAddressData.userName;
      userPhone = curAddressData.userPhone;
      //地址di==============
      address = curAddressData.userAddressId;
    } else {
      //自取
      //用户名
      userName = e.detail.value.userName;
      //手机号
      userPhone = e.detail.value.userPhone;
      //==========================
      console.log('=======================')
      address = faId
    }
    let orderValues = this.data.totalScoreToPay;
    let orderDeposits = this.data.deposit;

    let itemId = this.data.itemId;
    let iaoId = this.data.iaoId;
    let itemAmount = this.data.payPopUp.submited.pay_number;
    let timeDates = this.data.totalDays;
    let sendData = {
      formId,
      userName,
      itemId,
      iaoId,
      itemAmount, //商品数量
      timeDates, //选择的天数
      userPhone, //手机号
      orderValues, //订单总金额
      beginDate: beginDate, //日期的开始时间，
      endDate: endDate, //日期的开始时间
      orderDeposits, //订单押金金额
      address, //地址
      deliverType, //取件方式
      remarks, //备注
      // beginDate,//开始日期
      // endDate//结束日期
    };
    console.log(sendData)

    WXAPI.createOrder(sendData).then(function(result) {
      console.log(result)
      let _xml = result.params;
      let orderId = _xml.orderId;
      wx.requestPayment({
        timeStamp: _xml.timeStamp, //时间搓
        nonceStr: _xml.nonceStr, //随机字符串
        package: _xml.package, //repay_id
        signType: _xml.signType, //签名算法
        paySign: _xml.sign, //签名
        success(res) {
          console.log(res, '微信支付成功！！！')
          that.tailIsPaid(orderId, 1);
          // //跳到我的订单页面
          // wx.switchTab({
          //   url: "/pages/order-list/index",
          // });
        },
        fail(result) {
          console.log("fail");
          that.tailIsPaid(orderId, 0);
          //跳到我的订单页面
          // wx.switchTab({
          //   url: "/pages/order-list/index",
          // });
        }
      })
    })
  },
  tailIsPaid: function(orderId, isPaid) {
    //isPaid==0未完成支付，1表示已完成支付
    WXAPI.tailIsPaid({
      orderId,
      isPaid
    }).then(function(result) {
      wx.switchTab({
        url: "/pages/order-list/index",
      });
    })
  },
  judgeOrder: function(e) {
    //判断
    //开始时间
    let beginDate = this.data.beginDate;
    if (!beginDate) {
      this.showTs("请选择开始时间");
      return false;
    };
    //结束时间
    let endDate = this.data.endDate;
    if (!beginDate) {
      this.showTs("请选择开始时间")
      return false;
    };
    //取件方式
    let deliverType = this.data.deliverType;
    if (deliverType == "0") {
      //自取，姓名和电话必须填上
      //用户名
      let userName = e.detail.value.userName;
      //手机号
      let userPhone = e.detail.value.userPhone;
      if (!userName) {
        this.showTs("请添加联系人姓名")
        return false;
      };
      if (!userPhone) {
        this.showTs("请选择联系人手机")
        return false;
      };
    };
    let isAgree = this.data.isAgree
    if (!isAgree) {
      //说明没有同意
      this.showTs("请先阅读并同意《服务协议》")
      return false;
    };
    let remarks = this.data.remarks;
    if (remarks && remarks.length > 200) {
      //说明没有同意
      this.showTs("备注信息不能超过200个字")
      return false;
    };
    //日期时间
    let totalDays = this.data.totalDays;
    let maxDates = this.data.maxDates;
    let minDates = this.data.minDates;
    if (maxDates < totalDays) {
      //说明没有同意
      this.showTs("最大出租天数" + maxDates + "天")
      return false;
    };
    if (minDates > totalDays) {
      //说明没有同意
      this.showTs("起租天数为" + minDates + "天")
      return false;
    };

    return true;
  },

  showTs: function(msg) {
    wx.showToast({
      title: msg,
      icon: "none",
      duration: 2000
    });
  }

})