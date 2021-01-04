
//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js');

Page({
  data: {
    userInfo: {},
    videoUrl: 'https://v.douyin.com/JxHkvPT/',
  },

  onLoad: function () {
  
  },

  onShow() {
    // 如果剪切板内有内容则尝试自动填充
    wx.getClipboardData({ success: res => {
      var str = res.data.trim()
      if (this.regUrl(str)) {
        wx.showModal({
          title: '检测到剪切板有视频地址，是否自动填入？',
          success: res => {
            if (res.confirm) {
              this.setData({
                videoUrl: str
              })
            }
          }
        })
      }
    } })
  },

  // 清空输入框
  inputClear: function () {
    this.setData({
      videoUrl: ''
    })
  },

  // 视频地址匹配是否合法
  regUrl: function (t) {
    return /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/.test(t)
  },

  submit: function() {
    var num;
    var today = util.formatDate(new Date(), '');
    var lastParseDate = wx.getStorageSync('lastParseDate');
    if (lastParseDate != today) {
      wx.setStorageSync('lastParseDate', today);
      wx.setStorageSync('dailyFreeParseNum', app.globalData.defaultDailyFreeParseNum);
      num = app.globalData.defaultDailyFreeParseNum;
    } else {
      num = wx.getStorageSync('dailyFreeParseNum');
    }
    if (num > 0) {
      this.parseVideo();
    } else {
      wx.showToast({
        title: '免费解析次数已用完！',
        icon: 'none'
      })
      // // 超免费次数需要观看激励广告
      // wx.showModal({
      //   title: "解析视频",
      //   content: "免费解析次数已用完，需观看完广告才可继续解析！",
      //   confirmColor: "#00B269",
      //   cancelColor: "#858585",
      //   success: (res) => {
      //     if (res.confirm) {
      //       videoAd.show().catch(() => {
      //         // 失败重试
      //         videoAd.load()
      //           .then(() => videoAd.show())
      //           .catch(err => {
      //             console.log('激励视频 广告显示失败')
      //           })
      //       })
      //     } else if (res.cancel) {
      //       wx.showToast({
      //         title: '广告观看完才可继续解析！',
      //         icon: 'none'
      //       })
      //     }
      //   }
      // })
    }
  },

  // 视频解析
  parseVideo: function () {
    app.apiRequest({
      url: '/video-parse',
      method: 'POST',
      data: {
        url: this.data.videoUrl
      },
      success: res => {
        var noWaterUrl = encodeURIComponent(res.data.url);
        var imageUrl = encodeURIComponent(res.data.image);
        var preview = res.data.preview;
        wx.setStorageSync('dailyFreeParseNum',  wx.getStorageSync('dailyFreeParseNum') - 1);
        wx.navigateTo({
          url: "../video/video?url=" + noWaterUrl + '&image=' + imageUrl + '&preview=' + preview,
        })
      }
    })
  }
})
