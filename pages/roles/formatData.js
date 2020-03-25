const utils = require("../../utils/utils.js");

function formatOrderList(data) {
  //格式化orderList数据
  let formatData = [];
  if (data.length > 0) {
    for (let i = 0; i < data.length; i++) {
      let dataList = data[i]
      formatData.push({
        orderId: dataList.orderId, //订单号，
        orderDate: dataList.orderDate, //开始时间
        orderStatus: dataList.orderStatus, //订单状态
        orderType: dataList.orderType,//订单类型（=1小程序下单，=2旅行社，=3第三方）
        orderStatusName: dataList.orderStatusName, //订单状态
        url: dataList.media.url, //订单图片的url
        itemName: dataList.orderDetails[0].item.itemName, //订单名称 
        itemPrice: utils.toFixed(dataList.orderDetails[0].iao.values, 2), //订单单价
        itemUnit: dataList.orderDetails[0].item.itemUnit, //单位
        startDate: dataList.startDate, //租用日期
        endDate: dataList.endDate, //租用日期
        addonsName: dataList.orderDetails[0].iao.addonsName, //套餐类型
        itemAmount: dataList.orderDetails[0].itemAmount, //台数
        orderValues: utils.toFixed(dataList.orderValues, 2), //合计
        orderDeposits: utils.toFixed(dataList.orderDeposits, 2) //包含的押金
      })
    }
  }
  return formatData;
}

function formatOrderDetails(order) {
  //格式化orderList数据
  let orderDetails = {
    orderStatus:order.orderStatus,
    orderStatusName: order.orderStatusName, //订单状态
    addonsName: order.orderDetails[0].iao.addonsName, //套餐类型
    categoryName: order.categoryName,
    orderId: order.orderId,
    orderType: order.orderType,//订单类型（=1小程序下单，=2旅行社，=3第三方）
    address: order.address, //取件地址
    addressDetails: order.addressDetails,
    startDate: order.startDate, //租用日期
    endDate: order.endDate, //租用日期
    itemAmount: order.orderDetails[0].itemAmount, //租用件数
    itemPrice: utils.toFixed(order.orderDetails[0].iao.values,2), //单价
    // itemUnit: order.orderDetails[0].item.itemUnit, //单位
    itemUnit:"元/台/天",
    itemDeposits: utils.toFixed(order.orderDetails[0].item.itemDeposits,2), //押金每台
    remarks: order.remarks, //备注
    userName: order.userName, //联系人
    userPhone: order.userPhone, //电话
    orderValues: utils.toFixed(order.orderValues,2), //总额
    orderDeposits: utils.toFixed(order.orderDeposits,2) //押金总额
  }
  return orderDetails;
}
module.exports = {
  formatOrderList: formatOrderList,
  formatOrderDetails: formatOrderDetails
}