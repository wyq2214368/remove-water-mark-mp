//获取应用实例
var app = getApp(), n = ''
Page({
    data: {
        dataUrl: '',
        dataImage: '',
        preview: 0,
    },
    onLoad: function (options) {
        this.setData({
            dataUrl: decodeURIComponent(options.url),
            dataImage: decodeURIComponent(options.image),
            preview: options.preview
        })
    },
   
    onUnload: function () {
        n && n.abort()
    },
    goBack: function () {
        wx.switchTab({
          url: '/pages/index/index',
        });
    },
    copyUrl: function() {
        wx.setClipboardData({
            data: this.data.dataUrl,
            success: function(a) {
              wx.showToast({
                title: '复制成功',
                duration: 1200
              });
            }
          });
    },

    download: function () {
        var t = this, e = app.globalData.downloadPrefix + t.data.dataUrl; // 无法直接下载资源域下的资源，需要通过nginx中转一层
        wx.showLoading({
            title: '保存中 0%'
        }), (n = wx.downloadFile({
            url: e,
            success: function (o) {
                wx.hideLoading(), wx.saveVideoToPhotosAlbum({
                    filePath: o.tempFilePath,
                    success: function (o) {
                        t.showToast('保存成功', 'success'), setTimeout(function () {
                            wx.setClipboardData({
                              data: '',
                            })
                            t.goBack()
                        }, 1e3)
                    },
                    fail: function (o) {
                        t.showToast('保存失败')
                    }
                })
            },
            fail: function (o) {
                n = null, wx.hideLoading(), t.showToast('下载失败')
            }
        })).onProgressUpdate(function (o) {
            100 === o.progress ? '' : wx.showLoading({
                title: '保存中 ' + o.progress + '%'
            })
        })
    },
    postSave: function (o) {
        var t = this
        wx.getSetting({
            success: function (o) {
                o.authSetting['scope.writePhotosAlbum'] ? t.download() : wx.authorize({
                    scope: 'scope.writePhotosAlbum',
                    success: function () {
                        t.download()
                    },
                    fail: function (o) {
                        wx.showModal({
                            title: '提示',
                            content: '视频保存到相册需获取相册权限请允许开启权限',
                            confirmText: '确认',
                            cancelText: '取消',
                            success: function (o) {
                                o.confirm ? (wx.openSetting({
                                    success: function (o) { }
                                })) : ''
                            }
                        })
                    }
                })
            }
        })
    },
    showToast: function (o) {
        var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 'none', n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 1500
        wx.showToast({
            title: o,
            icon: t,
            duration: n
        })
    }
})
