const app = getApp()
const CONFIG = require('../../config.js')
const WXAPI = require('../../wxapi/main')
Page({
  data: {
    balance: 0.00,
    freeze: 0,
    score: 0,
    score_sign_continuous: 0,
    listItems: [{
      text: "三方授权",
      url: "/pages/threewayBinding/index"
    }, {
      text: "关于我们",
      url: "/pages/aboutUs/index"
      }, {
        text: "联系我们",
        url: "/pages/contact/index"
      }]
  },
  onLoad() {

  },
  onShow() {
    // let that = this;
    // let userInfo = wx.getStorageSync('userInfo')
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
  relogin: function() {
    app.goAuthorizePage()
  },
})