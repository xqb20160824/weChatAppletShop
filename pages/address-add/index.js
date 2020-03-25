const WXAPI = require('../../wxapi/main')
const regeneratorRuntime = require('../../utils/runtime')
//获取应用实例
var app = getApp()
Page({
  data: {
    userAddressId:"",//地址的id
    isChecked:false,
    area:[],//地区
    isAddAddressPage:true,//判断是否是新增地址的接口
    addressData:{
      userName:"",//姓名
      userProvince: "",//省
      userCity:"",//上海市
      userDistrict:"",//普陀
      userAddressDetails:"",//详细地址
      userPhone: "",//手机号码
      userAddressId:"",//地址id
      isDefault:"",
      userZipcode:""//邮政编码
    }
  },
  onLoad: function (e) {
    const that = this;
    // 初始化省市区选择器
    if (e.id) { // 修改初始化数据库数据
      //点击的是修改地址进来的
      let userAddressId = e.id;
      this.setData({
        userAddressId
      })

      WXAPI.addressDetail({
        userAddressId
      }).then(function (res) {
        let addressData = res.params.address;
        let userProvince = addressData.userProvince;
        let userCity = addressData.userCity;
        let userDistrict = addressData.userDistrict;
        let area=[];
        area.push(userProvince);
        area.push(userCity)
        area.push(userDistrict)
         if (addressData.isDefault == "1") {
          that.setData({
            isChecked: true,
            addressData,
            area
          })
        } else {
          that.setData({
            isChecked: false,
            addressData,
            area
          })
        }
      })
      
      
      this.setData({
        isAddAddressPage: false,
      })
      wx.setNavigationBarTitle({
        title: '修改地址'
      })
    }else{
      //说明是增加的
      this.setData({
        isAddAddressPage:true,
      })
      wx.setNavigationBarTitle({
        title: '新增地址'
      })
    }
  },
  bindSave: function(e) {

    var that = this;
    var userName = e.detail.value.userName;
    var userPhone = e.detail.value.userPhone;
    let area = this.data.area;

    let userProvince = area[0];
    let userCity = area[1];
    let userDistrict = area[2];

    let userZipcode = e.detail.value.userZipcode;
    let userAddressDetails = e.detail.value.userAddressDetails;
    let isDefault = this.data.isChecked?"1":"0";
    let userAddressId = this.data.userAddressId;
    if (userName == ""){
      wx.showModal({
        title: '提示',
        content: '请填写联系人姓名',
        showCancel:false
      })
      return
    }
    if (userPhone == ""){
      wx.showModal({
        title: '提示',
        content: '请填写手机号码',
        showCancel:false
      })
      return
    }
    if (area.length==0){
      wx.showModal({
        title: '提示',
        content: '请选择地区',
        showCancel:false
      })
      return
    }
    if (userAddressDetails == ""){
      wx.showModal({
        title: '提示',
        content: '请填写详细地址',
        showCancel:false
      })
      return
    }
    if (userZipcode == ""){
      wx.showModal({
        title: '提示',
        content: '请填写邮编',
        showCancel:false
      })
      return
    }
    let apiResult
    if (userAddressId) {
      //说明是修改地址
      apiResult = WXAPI.updateAddress({
        userAddressId,
        userName,//姓名
        userCity,//上海市
        userProvince,//省
        userDistrict,//普陀区
        userAddressDetails,//详细地址
        userPhone,//手机号码
        isDefault,
        userZipcode//邮政编码
      }).then(function (res) {
        wx.showToast({
          title: res.message,
          icon: 'none',
          complete: function () {
            setTimeout(() => {
              wx.navigateBack({})
            }, 500)
          }
        })
      })
    } else {
      //说明是添加地址
      apiResult = WXAPI.addAddress({
        userName,//姓名
        userCity,//上海市
        userProvince,//省
        userDistrict,//普陀区
        userAddressDetails,//详细地址
        userPhone,//手机号码
        isDefault,
        userZipcode//邮政编码
      }).then(function(res){
        wx.showToast({
          title: res.message,
          icon: 'none',
          complete:function(){
            setTimeout(()=>{
              wx.navigateBack({})
            },500)
          }
        })
      })
    }
  },
  
  deleteAddress: function (e) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定要删除该收货地址吗？',
      success: function (res) {
        if (res.confirm) {
          let userAddressId = that.data.userAddressId;
          WXAPI.deleteAddress({
            userAddressId
          }).then(function () {
            wx.navigateBack({})
          })
        } else {
          console.log('用户点击取消')
        }
      }
    })
  },
  bindRegionChange:function(e){
    console.log('picker发送选择改变，携带值为', e.detail.value)
    let _area = e.detail.value;

    this.setData({
      area:_area,
      // region: _area[0] + "," + _area[1] + "," + _area[2],
    })
  },
  switchChange:function(e){
    let a = e.detail.value;
    
    this.setData({
      isChecked:a
    })
  }
})
