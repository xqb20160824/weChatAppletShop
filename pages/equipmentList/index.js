const WXAPI = require('../../wxapi/main')
const app = getApp()
var onLoadNumber = 1;
Page({
  data: {
    pageIndex: 1,
    pageSize: 20,
    dataList: [
      // {
      //   deviceId:"",
      //   deviceStatus:""
      // }
    ],
    loadBar: {
      Loading: false,
      more: true
    },
    dataNumber:{
      inUsered:0,
      totalAmount:0
    },
    loadingStatus: false,
    orderId: ""//订单id
  },
  onLoad: function (options) {
    var self = this;
    this.setData({
      loadingStatus: true,
      pageIndex: 1,
      orderId: options.orderId,
    })
    try {
      self.dataLayer();
    } catch (e) {

    }


  },
  onShow: function () {

  },
  /**
   *下拉刷新
   **/
  onPullDownRefresh: function () {
    var self = this;
    self.setData({
      pageIndex: 1
    });
    self.dataLayer(function (isData) {
      setTimeout(() => {
        wx.stopPullDownRefresh() //停止下拉刷新
      }, 800);
    });
  },
  dataLayer: function (callback) {

    var self = this;
    var pageSize = self.data.pageSize;
    var pageIndex = self.data.pageIndex;
    var orderId = self.data.orderId;
    let data = {
      pageSize: pageSize,
      pageIndex: pageIndex,
      orderId: orderId
    }


    var loadBar = self.data.loadBar || {};
    loadBar.Loading = true; // 加载中
    self.setData({
      loadBar: loadBar
    });

    WXAPI.getEquipmentList(data).then(function (res) {
      self.setData({
        loadingStatus: false
      })
      loadBar.Loading = false; // 加载完毕
      self.setData({
        loadBar: loadBar
      })
      let data = res.params;
      let rows = data.devices || [];

      let isData = (pageSize >= rows.length) ? true : false;
      let records = data.totalResults;
      //使用中的数量
      let inUsed = data.inUsed;
      let totalAmount = data.totalAmount;
      let dataNumber={
        inUsered: inUsed,
        totalAmount: totalAmount
      }

      if (!rows.length) {
        if (pageIndex > 1) {
          isData = false;
        }
      }
      if (!!callback) {
        callback(isData);
      }
      // for (var i = 0; i < rows.length; i++) {
      //   let date = rows[i].createDateTime.substr(0, 10);
      //   let time = rows[i].createDateTime.substr(11, 8);
      //   rows[i].createDateTime = date + " " + time
      // }
      if (pageIndex > 1) {
        let dataList = self.data.dataList;
        let newRows = dataList.concat(rows);
        loadBar.more = !(records <= newRows.length); // 判断是否还有数据
        self.setData({
          dataNumber,
          dataList: newRows,
          loadBar: loadBar
        });

      } else {

        loadBar.more = !(records <= rows.length); // 判断是否还有数据
        self.setData({
          dataNumber,
          dataList: rows,
          loadBar: loadBar
        });
      }
    }).catch(function (result) {
      self.setData({
        loadingStatus: false
      })
      wx.showToast({
        title: result.message || "错误",
        icon: "none",
        duration: 3000
      })
    })
  },
  /**
  上拉加载
 
  **/
  onReachBottom: function () {

    var self = this;

    var pageIndex = self.data.pageIndex;
    self.setData({
      pageIndex: ++pageIndex
    })

    let pageSize = self.data.pageSize;
    let dataList = self.data.dataList;
    if (dataList.length < pageSize) {
      console.log("数量太小，不需要上拉")
      return false;
    }

    self.dataLayer(function (isData) {
      if (!isData) {
        // 没有数据应减回去
        self.setData({
          pageIndex: --pageIndex
        })
      }
    });
  },
  getEquipment: function (e) {
    let formId = e.detail.formId;
    let orderId = this.data.orderId;
    let that = this;
    //点击领设备,先检查是否可以领
    WXAPI.checkEquipmentNumber({
      orderId,
    }).then(function (res) {
      that.bindEquipment(formId, orderId);
    }).catch(function (result) {
      wx.showModal({
        title: result.message || "错误",
        icon: "none",
        duration: 3000
      })
    })
  },
  bindEquipment: function (formId, orderId) {
    //绑定设备
    let that=this;
    wx.scanCode({
      success: (res) => {
        let result = res.result;
        WXAPI.getEquipment({
          formId,
          orderId,
          number: result
        }).then(function (_res) {
          that.setData({
            loadingStatus: true,
            pageIndex: 1
          });
          that.dataLayer();
          //扫码绑定设备
          wx.showModal({
            title: _res.message,
            icon: "none",
            duration: 3000
          })
        }).catch(function (result) {
          wx.showModal({
            title: result.message || "错误",
            icon: "none",
            duration: 5000
          })
        })

      }
    })
  }
});