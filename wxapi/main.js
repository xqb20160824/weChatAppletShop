// 小程序开发api接口工具包，https://github.com/gooking/wxapi
const CONFIG = require('./config.js');
var appConfig = getApp();
// const API_BASE_URL = 'http://192.168.0.108:8080'
const utils = require('../utils/utils.js')
const API_BASE_URL = 'https://youy.yytravel.shop'
var allThat = null;
const request = (url, needSubDomain, method, data, flag, loadingState = { isLoading:true}) => {
  var allThat = this;
  let _url = API_BASE_URL + (needSubDomain ? '/' + CONFIG.subDomain : '') + url
  return new Promise((resolve, reject) => {
    //获取存储的tokenData
    var tpuId = wx.getStorageSync('tpuId');
    var header = {
      'Content-Type': 'application/json'
    };
    if (flag != "isLogin") {
      var auth = wx.getStorageSync('authorization');
      if (auth) {
        header["Authorization"] = auth;
      };
      if (tpuId) {
        data.tpuId = tpuId;
      }
    }
    if (loadingState && loadingState.isLoading){
      utils.showLoading('加载中...');
    }
    wx.request({
      url: _url,
      method: method,
      data: data,
      header: header,
      success(respones) {
        utils.hideLoading();
        var result = respones.data;
        if (result.code == "401" || result.code == "403"){
          wx.setStorageSync('authorization',"");
          wx.navigateTo({
            url: "/pages/authorize/index"
          })
          return false;
        }
        if (result.status == "403" || result.status == "401"){
          //重新授权
          wx.setStorageSync('authorization', "");
          wx.navigateTo({
            url: "/pages/authorize/index"
          })
          return false;
        }
        if (result.code == "200") {
          if (result.status == "1") {
            if (reject) {
              reject(result);
            }
          } else if (result.status == "0") {
            //获取头部信息
            let authorization = respones.header.Authorization;
            if (authorization) {
              //本地存储
              wx.setStorageSync('authorization', authorization)
            }
            resolve(result)
          }
        } else {
          wx.showToast({
            title: result.message || "服务链接失败",
            icon: "none",
            duration: 3000
            // image: '../../images/fail.png', //icon路径，不写不显示
          })
        }
      },
      fail(error) {
        utils.hideLoading();
        if (error.errMsg) {
          wx.showToast({
            title: error.errMsg || "服务链接失败",
            icon: "none",
            duration: 3000
            // image: '../../images/fail.png', //icon路径，不写不显示
          })
        }
        reject && reject(error);

      },
      complete(aaa) {
        // 加载完成
      }
    })
  })
}

/**
 * 小程序的promise没有finally方法，自己扩展下
 */
Promise.prototype.finally = function (callback) {
  var Promise = this.constructor;
  return this.then(
    function (value) {
      Promise.resolve(callback()).then(
        function () {
          return value;
        }
      );
    },
    function (reason) {
      Promise.resolve(callback()).then(
        function () {
          throw reason;
        }
      );
    }
  );
}

module.exports = {
  request,
  //获取banner
  hotCityList: (data) => {
    return request('item/type/list', true, 'post', data)
  },
  //获取getGoodsDetail
  getGoodsDetail: (data) => {
    return request('item/type/details', true, 'post', data)
  },
  //登录
  login: (data) => {
    return request('user/weChat/addUser', true, 'post', data, "isLogin")
  },
  //支付
  openOrder: (data) => {
    return request('order/weChat/test/openOrder', true, 'post', data)
  },

  //获取token
  getToken: (data) => {
    return request('user/login/weChat', true, 'post', data,"getToken",false)
  },
  //获取验证码
  getVerificationCode: (data) => {
    return request('verify/getCode', true, 'post', data)
  },
  //检验验证码
  verifyCode: (data) => {
    return request('verify/verifyCode', true, 'post', data)
  },
  //检验验证码
  addPhone: (data) => {
    return request('user/thirdParty/weChat/addPhone', true, 'post', data)
  },
  //校验是否已经绑定三方
  checkPhone: (data) => {
    return request('user/thirdParty/weChat/checkPhone', true, 'post', data)
  },
  //待付款订单中获取用户的默认地址信息等
  initShippingAddress: (data) => {
    return request('address/list/user/default', true, 'post', data)
  },
  //待付款订单中获取自取地址信息等
  initZqAddress: (data) => {
    return request('address/list/comp/selfservice', true, 'post', data)
  },
  //查询地址
  queryAddress: (data) => {
    return request('address/list/user', true, 'post', data)
  },
  //更新地址
  updateAddress: (data) => {
    return request('address/update/user', true, 'post', data)
  },
  //根据userAddressId更新默认地址
  updateAddressDefaulf: (data) => {
    return request('address/update/user/default', true, 'post', data)
  },

  //删除收获地址
  deleteAddress: (data) => {
    return request('address/delete/user', true, 'post', data)
  },
  //添加地址
  addAddress: (data) => {
    return request('address/create/user', true, 'post', data)
  },
  //根据addressDetail查询地址详情
  addressDetail: (data) => {
    return request('address/details/user', true, 'post', data)
  },
  //查询订单列表orderList
  orderList:(data,loadingState) => {
    return request('order/weChat/list/byStatus', true, 'post', data,'orderList', loadingState)
  },
  //付款过后告诉服务器是否完成了
  tailIsPaid: (data) => {
    return request('order/weChat/advice/xcx', true, 'post', data)
  },
  //查询订单详情根据orderId
  getorderDetails: (data) => {
    return request('order/weChat/orderDetails', true, 'post', data)
  },
//取消订单
  cancleOrder: (data) => {
    return request('order/weChat/delete', true, 'post', data)
},
  //订单付款
  orderPaid: (data) => {
    return request('order/weChat/payOrder', true, 'post', data)
  },
  //订单续购
  orderRePay: (data) => {
    return request('order/weChat/appendOrder', true, 'post', data)
  },
  //订单确定
  orderSurePay: (data) => {
    return request('order/weChat/appendOrder/pay', true, 'post', data)
  },


  //创建菜单
  createOrder: (data) => {
    return request('order/weChat/openOrder', true, 'post', data)
  },
  //获取下单的开始时间
  getBeginDate: (data) => {
    return request('item/valid/date', true, 'post', data)
  },
  //获取协议的内容
  geUserXy: (data) => {
    return request('docs/agreement', true, 'post', data)
  },
  //请求退款的金额
  requestRefund: (data) => {
    return request('order/weChat/delete/check', true, 'post', data)
  },
  //扫码领设备
  getEquipment: (data) => {
    return request('order/scan/device/attach', true, 'post', data)
  },
  //检查是否可领取设备
  checkEquipmentNumber: (data) => {
    return request('order/device/check', true, 'post', data)
  },
  //检查是否可领取设备
  checkEquipmentNumber: (data) => {
    return request('order/device/check', true, 'post', data)
  },
  //获取关于我们的接口
  getAboutUs: (data) => {
    return request('docs/introduction', true, 'post', data)
  },
  //获取领取的设备列表
  getEquipmentList: (data) => {
    //获取设备列表
    return request('order/device/list', true, 'post', data)
  },
  //查询物流编号
  queryLogistics: (data) => {
    //获取设备列表
    return request('order/device/sendback/list', true, 'post', data)
  },
  //添加修改物流编号
  sendWlbh: (data) => {
    //获取设备列表
    return request('order/device/sendback', true, 'post', data)
  },
  //联系我们
  contactUs: (data) => {
    return request('docs/contact', true, 'post', data)
  },
  

    //检查token是否有效
    checkToken: (token) => {
      //Customer/getone user/check-token
      return request('/user/check-token', true, 'post', {
        token
      })
    },

      //注销
      logOut: () => {
        return request('/users/clear', true, 'post', {})
      },

        //查询个人信息,
        queryUserMsg: (data) => {
          return request('/users/getUserInfo', true, 'post', data)
        },

          // //获取token
          // getToken: (data) => {
          //   return request('/token/gettoken', true, 'post', data)
          // },

          //注册
          register: (data) => {
            // code: 用户code,
            // telNumber: 手机号码,
            // captcha: 验证码
            return request('/users/registerUserInfo', true, 'post', data)
          },

            //编辑个人信息
            editPersonMsg: (data, id) => {
              switch (id) {
                case "name":
                  return request('/users/updateUserName', true, 'post', data)
                  break;
                case "mobilePhone":
                  return request('/users/updateUserMobile', true, 'post', data)
                  break;
                case "address":
                  return request('/users/updateUserAddress', true, 'post', data)
                  break;
              }
            },

              //扫一扫查询垃圾袋的信息
              sendInfoByBagQRCode: (data) => {
                return request('/putGarbageRecord/getInfoByBagQRCode', true, 'post', data)
              },
                //提交报错的信息
                submitError: (data) => {
                  return request('/putGarbageException/add', true, 'post', data)
                },
                  //获取投放记录的列表
                  getUserRecordList: (data) => {
                    return request('/putGarbageRecord/getUserRecordList', true, 'post', data)
                  },
                    //获取投错记录的列表
                    getUserExceptionRecord: (data) => {
                      return request('/putGarbageException/getUserExcList', true, 'post', data)
                    },
                      //获取纠错记录的列表
                      getOfficerExcList: (data) => {
                        return request('/putGarbageException/getOfficerExcList', true, 'post', data)
                      },
                        //获取积分记录的列表
                        getPointsRecordList: (data) => {
                          return request('/userPointsRecord/getList', true, 'post', data)
                        },
                          //获取积分记录的列表
                          getDustbinsList: (data) => {
                            return request('/dustbin/GetDustbinsList', true, 'post', data)
                          },
                            //获取积分记录的列表
                            dustbinClear: (data) => {
                              return request('/dustbin/DustbinClear', true, 'post', data)
                            },
                              //扫码领袋
                              smld: (data) => {
                                return request('/userBags/userGetBags', true, 'post', data)
                              },
                                //用户领袋记录
                                getUserCollarBagRecord: (data) => {
                                  return request('/userBags/userBagsList', true, 'post', data)
                                },
                                  //扫码绑定区域
                                  bindArea: (data) => {
                                    return request('/Users/UserBindCustomer', true, 'post', data)
                                  },
                                    //修改地址
                                    editAddress: (data) => {
                                      return request('/Users/UpdateUserCustomerAddress', true, 'post', data)
                                    }
}