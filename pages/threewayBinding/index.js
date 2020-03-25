// pages/register/index.js
const app = getApp()
const WXAPI = require('../../wxapi/main')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showTopTips: false,
    errorText: "错误提示",
    captchaBtnIsDisabled: false, //验证码是否可点击
    countDown: 60, //倒计时时间
    captchaText: "获取验证码"
  },
  timeObj: null,
  TimeOut1: null,
  showTopTips: function() {
    var that = this;
    this.setData({
      showTopTips: true
    });
    clearTimeout(that.timeObj)
    that.timeObj = setTimeout(function() {
      that.setData({
        showTopTips: false
      });
    }, 3000);
  },
  onLoad: function() {
    // this.captchaRegister();
  },
  captchaSuccess: function(result) {
    //极验提供的onSuccess获取验证结果，准备二次验证
    console.log("captcha-Success!");
    this.setData({
      result: result.detail
    })
  },
  toCaptcha: function() {
    const that = this;
    this.TimeOut1 = setInterval(() => {
      if (that.data.countDown == 0) {
        clearInterval(that.TimeOut1);
        that.setData({
          captchaBtnIsDisabled: false,
          captchaText: "重新发送",
          countDown: "60"
        })
      } else {
        that.setData({
          countDown: that.data.countDown - 1
        })
      }
    }, 1000)
  },
  clickSubmitBtn: function(e) {
    const targetEle = e.detail.target.dataset.name;
    const mobilePhone = e.detail.value.mobilePhone;
    if (!mobilePhone) {
      this.setData({
        errorText: "请填写手机号码",
      });
      this.showTopTips();
      return
    };
    var myreg = /^[1][0-9]{10}$/
    if (!myreg.test(mobilePhone)) {
      this.setData({
        errorText: "手机号码填写错误",
      });
      this.showTopTips();
      return
    };
    if (targetEle == 'getCaptcha') {
      //说明是点击的获取验证码
      this.clickcaptcha(e);
    } else {
      //说明点的是提交按钮
      this.toRegister(e);
    }
  },
  clickcaptcha: function(e) {
    //点击的是获取验证码
    const name = e.detail.value.name;
    const mobilePhone = e.detail.value.mobilePhone;
    const that = this;
    let userId = wx.getStorageSync('userId');
    WXAPI.getVerificationCode({
      phone: mobilePhone,
    }).then(function(res) {
      wx.showToast({
        title: res.message,
        icon: "none"
      });
      that.setData({
        captchaBtnIsDisabled: true,
      });
      that.toCaptcha();
    }).catch(function(result) {
      wx.showToast({
        title: result.message || "错误",
        icon: "none",
        duration: 3000
      })
    })
  },
  toRegister: function(e) {
    // //注册
    // var that = this;
    // var data = that.data.result;
    // if (typeof data !== 'object') {
    //   console.log("请先完成验证！")
    //   return
    // }
    // wx.request({
    //   url: "API2接口（详见服务端部署）",
    //   method: 'POST',
    //   dataType: 'json',
    //   data: {
    //     geetest_challenge: data.geetest_challenge,
    //     geetest_validate: data.geetest_validate,
    //     geetest_seccode: data.geetest_seccode
    //   },
    //   success: function (res) {
    //     wx.showToast({
    //       title: res.data.status
    //     })
    //   },
    //   fail: function () {
    //     console.log('error')
    //   }
    // })
    
    //点击的是提交
    console.log(e)
    const mobilePhone = e.detail.value.mobilePhone;
    const verCode = e.detail.value.verCode;
    // const address = e.detail.value.address;
    if (!verCode) {
      this.setData({
        errorText: "请填写验证码",
      });
      this.showTopTips();
      return
    };
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    let that = this;
    //首先是调用验证码校验
    this.verifyCode(e);

    // 下面开始调用注册接口
    // let userId = wx.getStorageSync('userId');
    // WXAPI.register({
    //   userId,
    //   mobilePhone,
    //   verCode: verCode,
    //   name: name,
    // }).then(function(res) {
    //   //注册成功后应该返回用户的lv
    //   wx.hideLoading();

    //   wx.showToast({
    //     title: res.message,
    //   });
    //   //跳转到首页
    //   wx.navigateBack()
    //   // app.goIndexPage();
    // }).catch(function(result) {
    //   wx.showToast({
    //     title: result.message || "错误",
    //     icon: "none",
    //     duration: 3000
    //   })
    // })
  },
  verifyCode:function(e){
    const phone = e.detail.value.mobilePhone;
    const userCode = e.detail.value.verCode;
    let formId = e.detail.formId;
    const that=this;
    WXAPI.verifyCode({
      phone,
      userCode,
      formId
    }).then(function (res) {
      that.addPhone(e);
      
    }).catch(function (result) {
      wx.hideLoading();
      wx.showToast({
        title: result.message || "错误",
        icon: "none",
        duration: 3000
      })
    })
  },
  addPhone:function(e){
    const phone = e.detail.value.mobilePhone;
    WXAPI.addPhone({
      phone
    }).then(function (res) {
      //注册成功后应该返回用户的lv
      wx.showToast({
        title: res.message,
        icon: "none",
        duration: 3000,
        complete: function () {
          setTimeout(() => {
            wx.navigateBack();
          }, 1000)
        }
      });
      // app.goIndexPage();
    }).catch(function (result) {
      wx.showToast({
        title: result.message || "错误",
        icon: "none",
        duration: 3000
      })
    })
  }


})