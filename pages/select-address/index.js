const WXAPI = require('../../wxapi/main')
const app = getApp()
Page({
  data: {
    pageSize: 50,
    pageIndex: 1,
    dataList: [],
    loadBar: {
      Loading: false,
      more: true
    },
    loadingStatus: false,
  },
  onShow: function () {
    var self = this;
    this.setData({
      loadingStatus: true,
      pageIndex: 1,
    })
    try {
      self.initShippingAddress();
    } catch (e) { }
  },
  onLoad: function () {
    
  },
  selectTap: function (e) {
    debugger
    //更新地址
    var id = e.currentTarget.dataset.id;
    WXAPI.updateAddressDefaulf({
      userAddressId: id,
    }).then(function (res) {
      //返回
      wx.navigateBack({})
    });
  },
  addAddess: function () {
    //新增收货地址
    wx.navigateTo({
      url: "/pages/address-add/index"
    })
  },

  editAddess: function (e) {
    wx.navigateTo({
      url: "/pages/address-add/index?id=" + e.currentTarget.dataset.id
    })
  },
  initShippingAddress: function (callback) {
    var self = this;
    var pageSize = self.data.pageSize;
    var pageIndex = self.data.pageIndex;

    let data = {
      pageSize: pageSize,
      pageIndex: pageIndex,
    }
    var loadBar = self.data.loadBar || {};
    loadBar.Loading = true; // 加载中
    self.setData({
      loadBar: loadBar
    });

    WXAPI.queryAddress(data).then(function (res) {
      self.setData({
        loadingStatus: false
      })
      // 时间处理
      loadBar.Loading = false; // 加载完毕
      self.setData({
        loadBar: loadBar
      })
      let data = res.params;
      let rows = data.address || [];

      let isData = (pageSize >= rows.length) ? true : false;
      let records = data.count;
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
          dataList: newRows,
          loadBar: loadBar
        });

      } else {

        loadBar.more = !(records <= rows.length); // 判断是否还有数据
        self.setData({
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
   *下拉刷新
   **/
  onPullDownRefresh: function () {
    var self = this;
    self.setData({
      pageIndex: 1
    });
    self.initShippingAddress(function (isData) {
      setTimeout(() => {
        wx.stopPullDownRefresh() //停止下拉刷新
      }, 800);
    });
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
})