Page({
  data: {
    inputValue: '',
    images: [],
    selectedImage: '',
    currentIndex: 0
  },
  onInputChange(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },
  generateImages() {
    const prompt = this.data.inputValue;
    // 调用文生图 API
    this.callImageGenerationAPI(prompt);
  },
  callImageGenerationAPI(prompt) {
    const apiKey = 'sk-pcurpjyqpuypppqrscjmpewwqlkugbinzoucbvmypebrljld'; // 替换为你自己的 SiliconFlow API Key
    const url = 'https://api.siliconflow.cn/v1/images/generations';

    // 组合新的提示词，添加涂色卡片风格的描述
    const newPrompt = `${prompt}, white background, black line art, coloring page style`;

    const requestData = {
        model: "Kwai-Kolors/Kolors",
        prompt: newPrompt,
        negative_prompt: "bad photo, low quality, blurry",
        image_size: "1024x1024",
        batch_size: 3, // 生成 3 张图片
        seed: Math.floor(Math.random() * 1000000000),
        num_inference_steps: 20,
        guidance_scale: 7.5,
        // image: "data:image/webp;base64, XXX" // 如果不需要额外的图像输入，可以保持这个占位符或者删除该字段
      };

    wx.request({
      url: url,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      data: JSON.stringify(requestData),
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.data) {
          const images = res.data.data.map(item => item.url);
          this.setData({
            images: images,
            selectedImage: images[0] // 默认选中第一张图片
          }, () => {
            this.adjustImageSize(); // 调用调整图片尺寸的方法
          });
        } else {
          console.error('图片生成失败，响应信息：', res);
          wx.showToast({
            title: '图片生成失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('调用文生图 API 失败', err);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
      }
    });
  },
  // 新增调整图片尺寸的方法
  adjustImageSize() {
    const query = wx.createSelectorQuery().in(this);
    query.select('.full-screen-image').boundingClientRect((res) => {
      if (!res) {
        console.error('未能获取到 .full-screen-image 元素');
        return;
      }
      const containerHeight = wx.getSystemInfoSync().windowHeight * 0.5; // 屏幕下半部分的高度
      const img = new Image();
      img.src = this.data.selectedImage;
      img.onload = () => {
        if (img.height === 0) {
          console.error('图片高度为 0，无法计算缩放比例');
          return;
        }
        const scale = containerHeight / img.height;
        this.setData({
          imageStyle: `width: ${img.width * scale}px; height: ${containerHeight}px;`
        });
      };
      img.onerror = () => {
        console.error('图片加载失败');
      };
    }).exec();
  },  
  switchImage(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      currentIndex: index
    });
  },
  selectImage(e) {
    const index = e.currentTarget.dataset.index;
    const selectedImage = this.data.images[index];
    this.setData({
      selectedImage
    });
  },
  printImage() {
    // 调用微信的分享或保存图片功能，方便用户打印
    wx.downloadFile({
      url: this.data.selectedImage,
      success: function (res) {
        if (res.statusCode === 200) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: function () {
              wx.showToast({
                title: '图片已保存到相册，可打印',
                icon: 'success'
              });
            },
            fail: function (err) {
              console.error('保存图片失败', err);
            }
          });
        }
      },
      fail: function (err) {
        console.error('下载图片失败', err);
      }
    });
  }
})
