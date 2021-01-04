// pages/history/history.js
var app = getApp();

// 在页面中定义插屏广告
let interstitialAd = null;
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    list: [],
    page: 1,
    loading: false, // loading标识，防止多次请求
    preview: 0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad: function() {
    
    },
    onShow: function() {
      this.history();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
      this.setData({
        page: this.data.page + 1
      })
      this.history();
    },

    /**
     * 历史解析记录
     */
    history: function() {
      this.setData({
        loading: true
      })
      wx.showLoading({
        title: '加载中...',
      });
      app.apiRequest({
        url: '/records',
        data: {
          page: this.data.page,
        },
        success: res => {
          console.log(res);
          this.setData({
            list: this.data.list.concat(res.data.data),
            preview: res.data.preview
          })
        },
        complete: (res) => {
          this.setData({
            loading: false
          })
          wx.hideLoading();
        }
      })
    },
    videoPlay: function(e) {
      var t = e.currentTarget.dataset.idx,
        a = this.data.downloadIndex;
      if (a) {
        var n = wx.createVideoContext("download" + a);
        n.seek(0), n.pause(), this.setData({
          downloadIndex: t
        }), wx.createVideoContext("download" + a).play();
      } else this.setData({
        downloadIndex: t
      }), wx.createVideoContext("download" + t).play();
    },

    /**
     * 重新下载 
     * 复制原始链接跳转首页重新让用户解析
     * @param e 
     */
    Download: function(e) {
      console.log(e)
      wx.setClipboardData({
        data: e.currentTarget.dataset.link,
      })
      wx.reLaunch({
        url: "/pages/index/index"
      })
    },
    DEL: function(e) {
      var id = e.currentTarget.dataset.id;
      var key = e.currentTarget.dataset.key;
      wx.showModal({
        title: '提示',
        content: '你确定要删除吗？',
        success: res => {
          if (res.confirm) {
            app.apiRequest({
              url: '/records/' + id,
              method: 'DELETE',
              success: res => {
                this.data.list.splice(key, 1);
                this.setData({
                  list: this.data.list
                })
              }
            })
          } else if (res.cancel) {}
        }
      })
    },
    //复制视频详情内容
    Copy_video_info: function(t) {
      wx.setClipboardData({
        data: t.currentTarget.dataset.content,
        success: function(a) {
          wx.showToast({
            title: t.currentTarget.dataset.tip,
            duration: 1200
          });
        }
      });
    },
    onShareAppMessage: function(e) {
      if ("button" === e.from) {
        var i = e.target.dataset.content;
        return {
          title: i.title,
          imageUrl: i.cover,
          path: "/pages/index/index?history=" + i.url
        };
      }
      return {
        title: this.data.config_data_list.share_title,
        path: '/pages/index/index',
        imageUrl: this.data.config_data_list.share_imageUrl,
        success: function(e) {
          wx.showToast({
            title: "分享成功",
            icon: "success",
            duration: 2e3
          });
        },
        fail: function(e) {
          wx.showToast({
            title: "分享失败",
            icon: "none",
            duration: 2e3
          });
        }
      }
    }
  }
})