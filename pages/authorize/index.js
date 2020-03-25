const WXAPI = require('../../wxapi/main')
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
  bindGetUserInfo: function (e) {

    if (!e.detail.userInfo) {
      return;
    };
    if (app.globalData.isConnected) {
      //网络正常
      //缓存授权的信息
      wx.setStorageSync('userInfo', e.detail.userInfo);

      this.login();
    } else {
      wx.showToast({
        title: '当前无网络',
        icon: 'none',
      })
    }
  },
  login: function () {
    const that = this;
    wx.showLoading({
      title: '正在授权中...',
    });
    
    wx.login({
      success: function (res) {
        console.log(res)
        wx.getUserInfo({
          success: function (userData) {
            let userInfo = userData.userInfo;
            userInfo.jsCode=res.code;
            console.log(userInfo)
            WXAPI.login(userInfo).then(function (result) {

              // var customerId = result.data.customerId;
              // wx.setStorageSync('customerId', customerId);
              //生成的时候返回一个userId
              let tpuId = result.params.tpuId;
              wx.setStorageSync('tpuId',tpuId)
              wx.checkSession({
                success: function () {
                  //说明微信端登陆状态没有过期，我们就可以直接拿着userInfo用了
                  // //检查token是否失效
                  WXAPI.getToken({
                    tpuId: tpuId,//用户Id
                  }).then(function (res) {
                    wx.hideLoading();
                    wx.setStorageSync('tpuId', tpuId);
                    wx.reLaunch({
                      url: "/pages/index/index"
                    })
                  }).catch(function (err) {
                    //错误信息
                    wx.hideLoading();
                    wx.showToast({
                      title: err.message || "服务链接失败",
                      icon: "none",
                      duration: 3000
                    })
                  });

                },
                fail: function (err) {
                  wx.hideLoading();
                  //说明过期了，需要重新授权登陆
                  wx.showToast({
                    title: err.errMsg || "服务链接失败",
                    icon: "none",
                    duration: 3000
                  })
                }
              })
            }).catch(function (result) {
              wx.showToast({
                title: result.message || "登陆错误",
                icon: "none",
                duration: 3000
              })
            })
          }
        })
        
      },
      fail: function () {
        wx.hideLoading()
      }
    })

  },
})