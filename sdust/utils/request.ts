// 改用微信原生API，删除Taro依赖
// import Taro from "@tarojs/taro";

// 定义微信请求响应类型
type WxRequestSuccessCallbackResult = {
  data: any;
  statusCode: number;
  header: Record<string, string>;
  cookies: string[];
  errMsg: string;
};

// 定义微信请求参数类型
type WxRequestOptions = {
  url: string;
  data?: string | object | ArrayBuffer;
  header?: Record<string, string>;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE' | 'CONNECT';
  dataType?: string;
  responseType?: 'text' | 'arraybuffer';
  success?: (res: WxRequestSuccessCallbackResult) => void;
  fail?: (res: any) => void;
  complete?: (res: any) => void;
};

// 补充缺失的类型定义
type ResponseDataType = any;
type SuccessCallbackOptions = WxRequestSuccessCallbackResult;

// 基于wx.request
export type RequestOptions = WxRequestOptions;

export type HttpRequest = {
  url: string;
  title?: string;
  load?: number;
  debounce?: boolean;
  throttle?: boolean;
  method?: WxRequestOptions["method"];
  data?: Record<string, any>;
  cookie?: boolean;
  headers?: {};
  responseType?: string;
};

export interface RequestInfo {
  title?: string;
  load?: number;
  url: string;
  method?: WxRequestOptions["method"];
  data?: Record<string, unknown>;
  cookie?: boolean;
  debounce?: boolean;
  throttle?: boolean;
  headers?: Record<string, string>;
  responseType?: "arraybuffer" | "text";
  success?: WxRequestOptions["success"];
  fail?: WxRequestOptions["fail"];
  complete?: WxRequestOptions["complete"];
  completeLoad?: WxRequestOptions["complete"];
  [key: string]: unknown;
}

export type PromiseFulfilled<T> = Omit<SuccessCallbackOptions, "data"> & {
  data: T;
};

export const request = <T extends ResponseDataType>(
  requestInfo: RequestInfo
): Promise<PromiseFulfilled<T>> => {
  return new Promise((resolve, reject) => {
    requestInfo.success = res => resolve(res as PromiseFulfilled<T>);
    requestInfo.fail = res => reject(res);
    xhr(requestInfo);
  });
};

const headers = {
  "cookie": "",
  "content-type": "application/x-www-form-urlencoded",
};

const xhr = (requestInfo: RequestInfo): void => {
  const defaultOptions: RequestInfo = {
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
