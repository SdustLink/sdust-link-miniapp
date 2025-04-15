// import Taro from "@tarojs/taro";

export const request = (requestInfo) => {
  return new Promise((resolve, reject) => {
    requestInfo.success = res => resolve(res);
    requestInfo.fail = res => reject(res);
    xhr(requestInfo);
  });
};

const headers = {
  "cookie": "",
  "content-type": "application/x-www-form-urlencoded",
};

const xhr = (requestInfo) => {
  const defaultOptions = {
    title: "",
    load: 1,
    url: "",
    method: "GET",
    data: {},
    cookie: true,
    debounce: false,
    throttle: false,
    headers: headers,
    success: () => void 0,
    fail: function () {
      this.completeLoad = () => console.error("请求失败");
    },
    complete: () => void 0,
    completeLoad: () => void 0,
  };

  const options = { ...defaultOptions, ...requestInfo };

  wx.request({
    url: options.url,
    data: options.data,
    method: options.method,
    header: headers,
    responseType: options.responseType,
    success: function (res) {
      if (res.statusCode < 400) {
        try {
          options.success?.(res);
        } catch (error) {
          options.fail?.({ ...res, errMsg: "Execute Fail" });
          console.error(error);
        }
      } else {
        options.fail?.({ ...res, errMsg: "Response No Status" });
      }
    },
    fail: function (res) {
      options.fail?.(res);
    },
    complete: function (res) {
      options.complete?.(res);
      options.completeLoad?.(res);
    },
  });
};

export const HTTP = { request }; 