const WXAPI = require('../../wxapi/main')
const app = getApp();
const WxParse = require('../../wxParse/wxParse.js');
const regeneratorRuntime = require('../../utils/runtime')
const utils = require('../../utils/utils.js')
Page({
  data: {
    goodsId: "", //商品的id
    autoplay: true,
    interval: 3000,
    duration: 1000,
    banners:[
    //   {
    //   url:"https://youy.yytravel.shop/image/japan/1554196481529307.jpg"
    // }
    ],

    basicInfo: {
      itemName:"标题",
      itemPrice:0,
      itemUnit:"元",
      itemDeposits:0,
    },//商品的一些基础信息
    swiperCurrent: 0,
    hasMoreSelect: false,
    selectSize: "选择：",
    // selectSizePrice: 0, //租金
    deposit: 0, //押金
    // price: '4.90', //最终的价格
    actionSheetHidden: true,
    // actionSheetItems: [{
    //   addonsName: "翻译机",
    //   values: "4.90"
    // }, {
    //     addonsName: "翻译机+高速4G不限流量",
    //     values: "14.90"
    // }, {
    //     addonsName: "翻译机+高速4G不限流量+1",
    //     values: "24.90"
    // }],
    selectedTypeIndex: -1, //选择套餐类型
    
  },
  actionSheetTap: function (e) {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    });
  },
  actionSheetChange: function (e) {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    });
  },

  //事件处理函数
  swiperchange: function(e) {
    //console.log(e.detail.current)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  async onLoad(e) {
    this.setData({
      goodsId: e.categoryId
    })
    // this.data.kjJoinUid = e.kjJoinUid
    // 获取购物车数据
    // wx.getStorage({
    //   key: 'shopCarInfo',
    //   success: function(res) {
    //     that.setData({
    //       shopCarInfo: res.data,
    //       shopNum: res.data.shopNum,
    //       curuid: wx.getStorageSync('uid')
    //     });
    //   }
    // })
    //获取商品详情
    this.getGoodsDetail()
  },
  onShow() {
  },
  getGoodsDetail:function(){
    let that=this;
    let categoryId = this.data.goodsId;
    WXAPI.getGoodsDetail({
      categoryId
    }).then(function (result) {
      //轮播图
      let roll = result.params.roll;
      //详情介绍
      let detail = result.params.detail.docsContent;
      // let detail ="<p>详情页面</p><img src='../../images/wx.png'/>"
      WxParse.wxParse('article', 'html', detail, that, 5);
      //产品规格
      let addons = result.params.addons;
      addons = that.standardAddons(addons);
      //基础信息介绍
      let basicInfo = result.params.item;
      basicInfo = that.standardPrice(basicInfo)
      that.setData({
        banners: roll,
        actionSheetItems: addons,
        basicInfo
      })
    })
  },
  standardPrice: function (basicInfo){
    //标准化价格
    basicInfo.itemDeposits = utils.toFixed(basicInfo.itemDeposits,2);
    basicInfo.itemPrice = utils.toFixed(basicInfo.itemPrice,2);
    return basicInfo;
  },
  standardAddons: function (addons){
    //标准化套餐价格
    if (addons.length>0){
      for (let i = 0; i < addons.length;i++){
        addons[i].values = utils.toFixed(addons[i].values,2);
      }
      return addons;
    }
  },
  goIndex() {
    wx.switchTab({
      url: '/pages/index/index',
    });
  },
  clickSelectSize: function(e) {
    let _price = e.currentTarget.dataset.price
    let _index = e.currentTarget.dataset.index
    this.setData({
      showTcPrice: _price,
      selectedTypeIndex: _index
    })
  },
  buyNow: function(e) {
    if (this.data.selectedTypeIndex < 0) {
      wx.showModal({
        title: '提示',
        content: '请选择套餐类型！',
        showCancel: false
      })
      return;
    };
    let formId = e.detail.formId;
    let that=this;
    //请求是否已经绑定三方
    WXAPI.checkPhone({
      formId
    }).then(function(result) {
      let flag = result.params.flag;
      if (flag=="0"){
        //说明还未绑定三方支付，需要绑定页面
        wx.showToast({
          title: result.message,
          icon: "none",
          duration: 3000,
          complete:function(){
            setTimeout(()=>{
              wx.navigateTo({
                url: "/pages/threewayBinding/index"
              })
            },1000)
          }
        })
        
      } else if (flag == "1"){
        console.log(result)
        //商品信息保存的store里面
        var buyNowInfo = that.buliduBuyNowInfo();
        wx.setStorage({
          key: "buyNowInfo",
          data: buyNowInfo
        })
        that.setData({
          actionSheetHidden: true
        });
        wx.navigateTo({
          url: "/pages/to-pay-order/index?orderType=buyNow"
        })
      }
      
    })
  },
  //组建立即购买信息
  buliduBuyNowInfo: function() {
    let buyNowInfo = {};
   
    //商品套餐类型
    buyNowInfo.selectedItem = this.data.actionSheetItems[this.data.selectedTypeIndex];
    //商品名
    buyNowInfo.basicInfo = this.data.basicInfo;
    return buyNowInfo;
  }
})