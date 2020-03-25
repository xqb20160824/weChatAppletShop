const WXAPI = require('../../wxapi/main')
const CONFIG = require('../../config.js')
const utils = require('../../utils/utils.js')
//获取应用实例
var app = getApp()
Page({
  data: {
    num: 0,
    showpic: null,
    hidepic: null,
    setTime: null,

    autoplay: true,
    interval: 3000,
    duration: 1000,
    // swiperCurrent: 0,
    // selectCurrent: 0,
    // bannerPic: [{
    //   id: "0",
    //   href: "#",
    //   url: "../../images/banner/banner1.jpg"
    // }, {
    //   id: "1",
    //   href: "#",
    //   url: "../../images/banner/banner2.jpg"
    // }, {
    //   id: "2",
    //   href: "#",
    //   url: "../../images/banner/banner3.jpg"
    // }],
    // hotCity: [{
    //   banner: [{
    //     businessId: "137453",
    //     href: "#",
    //     picUrl: "../../images/banner/banner1.jpg"
    //   }, {
    //       businessId: "137386",
    //     href: "#",
    //     picUrl: "../../images/banner/banner2.jpg"
    //   }, {
    //       businessId: "137474",
    //     href: "#",
    //     picUrl: "../../images/banner/banner3.jpg"
    //   }],
    //   categoryId:"0",
    //   swiperCurrent: 0,
    //   selectCurrent: 0,
    //   cheapestValues: "9.9",
    //   categoryName: "日本"
    // }, {
    //   banner: [{
    //     businessId: "0",
    //     href: "#",
    //     picUrl: "../../images/banner/banner1.jpg"
    //   }, {
    //       businessId: "1",
    //     href: "#",
    //     picUrl: "../../images/banner/banner2.jpg"
    //   }, {
    //       businessId: "1",
    //     href: "#",
    //     picUrl: "../../images/banner/banner3.jpg"
    //   }],
    //     swiperCurrent: 0,
    //     categoryId: "2",
    //     selectCurrent: 0,
    //     cheapestValues: "9.9",
    //     categoryName: "日本"
    // }],

  },
  onLoad: function (e) {
    // this.bannerLunbo();
    
  },
  onShow() {
    //请求热门城市
    this.hotCityRes();
    let that = this;
    // let userInfo = wx.getStorageSync('tpuId')
    // if (!userInfo) {
    //   app.goAuthorizePage()
    // } else {
    //   that.setData({
    //     userInfo: userInfo,
    //     version: CONFIG.version,
    //     vipLevel: app.globalData.vipLevel
    //   })
    // }
  },
  // clickZf: function () {
  //   console.log('发起微信支付')
  //   let money = 0.01;
  //   WXAPI.openOrder({
  //     orderId: "011231201355100"
  //   }).then(function (result) {
  //     console.log(result)
  //     let _xml = result.params;
  //     wx.requestPayment({
  //       timeStamp: _xml.timeStamp, //时间搓
  //       nonceStr: _xml.nonceStr, //随机字符串
  //       package: _xml.package, //repay_id
  //       signType: _xml.signType, //签名算法
  //       paySign: _xml.sign, //签名
  //       success(res) {
  //         console.log(res, '微信支付成功！！！')
  //       },
  //       fail(result) {
  //         console.log("fail")
  //       }
  //     })
  //   })

  // },
  bannerLunbo: function (mediaList) {
    var _this = this;
    var num = _this.data.num;
    let bannerPicLength = _this.data.bannerPic.length;
    if (bannerPicLength > 1) {
      clearTimeout(this.data.setTime)
      var animation = wx.createAnimation({}) //创建一个动画实例
      _this.setData({
        //创建一个计时器
        setTime: setInterval(function () {
          _this.setData({
            num: num++
          })
          if (num > bannerPicLength - 1) {
            num = 0;
          }
          //淡入
          animation.opacity(1).step({
            duration: 1000
          }) //描述动画
          _this.setData({
            showpic: animation.export()
          }) //输出动画
          //淡出
          animation.opacity(0).step({ duration: 1000 })
          _this.setData({ hidepic: animation.export() })
        }, 2000)
      })
    }
  },
  hotCityRes: function () {
    //请求热门城市
    let that = this;
    WXAPI.hotCityList({}).then(function (result) {

      let categoryList = result.params.categoryList;
      for (let i = 0; i < categoryList.length; i++) {
        categoryList[i].swiperCurrent = 0;
        categoryList[i].selectCurrent = 0;
        categoryList[i].cheapestValues = utils.toFixed(categoryList[i].cheapestValues,2);
      };
      let mediaList = result.params.mediaList;
      that.setData({
        hotCity: categoryList,
        bannerPic: mediaList
      })
      that.bannerLunbo(mediaList)
    })


  },
  //事件处理函数
  swiperchange: function (e) {
    var _index = e.currentTarget.dataset.index
    var a = "hotCity[" + _index + "].swiperCurrent"
    this.setData({
      [a]: e.detail.current
    })
  },
  tapBanner: function (e) {
    //跳转到详情页面
    let categoryid = e.currentTarget.dataset.categoryid;
    // let categoryId = e.detail.categoryId;
    wx.navigateTo({
      url: "/pages/goods-details/index?categoryId=" + categoryid
    })
  },
  onShareAppMessage: function (res) {
    let webViewUrl = encodeURIComponent(res.webViewUrl);
    return {
      title: "游莺旅行",
      path: "/pages/index/index",
      success: function (res) {
       
      }
    }
  },
})