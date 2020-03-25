//login.js
//获取应用实例
var app = getApp();
const WXAPI = require('../../wxapi/main');
const CONFIG = require('../../config.js')
Page({
  data: {
    remind: '',
    angle: 0
  },
  goToIndex: function(e) {
    if (app.globalData.isConnected) {
      wx.setStorage({
        key: 'app_show_pic_version',
        data: CONFIG.version
      })
      wx.switchTab({
        url: '/pages/index/index',
      });
    } else {
      wx.showToast({
        title: '当前无网络',
        icon: 'none',
      })
    }
  },
  onLoad: function() {
    var that = this;
    that.setData({
      background_color: app.globalData.globalBGColor,
      bgRed: app.globalData.bgRed,
      bgGreen: app.globalData.bgGreen,
      bgBlue: app.globalData.bgBlue
    });
  },
  onShow: function() {
    let tpuId = wx.getStorageSync('tpuId')
    if (tpuId) {
      wx.checkSession({
        success: function() {
          //说明微信端登陆状态没有过期，我们就可以直接拿着tpuId用了
          // //检查token是否失效

          WXAPI.getToken({
            tpuId: tpuId,//用户Id
          }).then(function(res) {
            wx.hideLoading();
            wx.setStorageSync('tpuId', tpuId);
            setTimeout(function () {
            wx.reLaunch({
              url: "/pages/index/index"
            })
            }, 1000)
          }).catch(function() {
            setTimeout(function() {
              wx.navigateTo({
                url: "/pages/authorize/index"
              })
            }, 1000)
          })
        },
        fail: function() {
          //说明过期了，需要重新授权登陆
          setTimeout(function() {
            wx.navigateTo({
              url: "/pages/authorize/index"
            })
          }, 1000)
        }
      })

    } else {
      setTimeout(function () {
        wx.navigateTo({
          url: "/pages/authorize/index"
        })
      }, 1000)
    }
  },

});