// import Taro from "@tarojs/taro";

// 导入常量
import { SW_HOST } from "./constant";

// 会话Cookie存储
let sessionCookie = "";

// 检查域名是否添加到了微信小程序的安全域名列表
function checkDomain(url) {
  // 提取域名
  let domain = "";
  try {
    if (url.startsWith("http")) {
      const urlObj = new URL(url);
      domain = urlObj.hostname;
    } else if (url.includes("//")) {
      domain = url.split("//")[1].split("/")[0];
    } else {
      domain = url.split("/")[0];
    }
    
    console.log("请求域名:", domain);
    // 这里可以添加已知安全域名的判断，但最终还是要在小程序管理后台设置
    return {
      domain,
      message: "请确保该域名已添加到微信小程序管理后台的'request合法域名'中"
    };
  } catch (e) {
    return {
      domain: url,
      message: "域名解析出错，请检查URL格式"
    };
  }
}

export const request = (requestInfo) => {
  return new Promise((resolve, reject) => {

    const options = {  ...requestInfo };
    
    // 处理Cookie
    if (options.cookie && sessionCookie) {
      options.headers.cookie = sessionCookie;
    }

    // 从Storage中恢复Cookie（以防内存中的sessionCookie丢失）
    if (options.cookie && !options.headers.cookie) {
      const storedCookies = wx.getStorageSync('cookies');
      if (storedCookies) {
        options.headers.cookie = storedCookies;
      }
    }

    // 检查域名配置
    const domainInfo = checkDomain(options.url);
    console.log(`发起请求: ${options.url} (${domainInfo.domain})`);

    // 执行wx.request请求
    wx.request({
      url: options.url,
      data: options.data,
      method: options.method,
      header: options.headers,
      responseType: options.responseType,
      success: (res) => {
        console.log("请求成功，状态码:", res.statusCode);
        
        // 自动保存Cookie
        if (res.header && (res.header['Set-Cookie'] || res.header['set-cookie'])) {
          sessionCookie = res.header['Set-Cookie'] || res.header['set-cookie'];
          // 也可以保存到Storage
          wx.setStorageSync('cookies', sessionCookie);
        }

        if (res.statusCode < 400) {
          try {
            resolve(res);
          } catch (error) {
            console.error("请求处理失败:", error);
            reject({ ...res, errMsg: "Execute Fail" });
          }
        } else {
          console.error("请求返回错误状态码:", res.statusCode);
          reject({ ...res, errMsg: "Response No Status" });
        }
      },
      fail: (err) => {
        console.error("网络请求失败:", err);
        
        // 添加更具体的错误信息
        let errorMsg = err.errMsg || "未知错误";
        if (errorMsg.includes("timeout")) {
          errorMsg = "请求超时，请检查网络连接";
        } else if (errorMsg.includes("SSL")) {
          errorMsg = "SSL证书错误，请确认网站证书有效";
        } else if (errorMsg.includes("connection closed") || errorMsg.includes("CONNECTION_CLOSED")) {
          errorMsg = `连接被关闭，可能是服务器拒绝了请求或域名未在微信小程序白名单中。
请确保域名 ${domainInfo.domain} 已在微信小程序管理后台配置为合法域名。
如果是在开发环境，可在开发工具中勾选"不校验合法域名"选项。`;
        }
        
        reject({...err, errMsg: errorMsg, domainInfo: domainInfo});
      },
      complete: (res) => {
        if (options.complete) {
          options.complete(res);
        }
      }
    });
  });
};

// 导出HTTP对象
export const HTTP = { request }; 