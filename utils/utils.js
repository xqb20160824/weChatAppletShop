function toFixed(val,fractionDigits){
  if (null == fractionDigits) {
    fractionDigits = 0;
  }
  var nv = (Math.round(val * Math.pow(10, fractionDigits)) / Math.pow(10,
    fractionDigits)).toString(), sp = nv.split(".");
  if (fractionDigits == 0) {
    return nv;
  }
  if (sp.length == 1) {
    nv += "." + Array(fractionDigits + 1).join("0")
  } else if (sp[1] && sp[1].length < fractionDigits) {
    nv += Array(fractionDigits - sp[1].length + 1).join("0")
  }
  return nv;
}
function showLoading(message) {
  if (wx.showLoading) {
    // 基础库 1.1.0 微信6.5.6版本开始支持，低版本需做兼容处理
    wx.showLoading({
      title: message,
      mask: true
    });
  } else {
    // 低版本采用Toast兼容处理并将时间设为20秒以免自动消失
    wx.showToast({
      title: message,
      icon: 'loading',
      mask: true,
      duration: 20000
    });
  }
}

function hideLoading() {
  if (wx.hideLoading) {
    // 基础库 1.1.0 微信6.5.6版本开始支持，低版本需做兼容处理
    wx.hideLoading();
  } else {
    wx.hideToast();
  }
}

module.exports = {
  toFixed,
  showLoading,
  hideLoading
}