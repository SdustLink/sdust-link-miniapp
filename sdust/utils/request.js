// import Taro from "@tarojs/taro";

// 导入常量
import { SW_HOST } from "./constant";

// 会话Cookie存储
let sessionCookie = "";
// 是否已初始化JSESSIONID
let jsessionInitialized = false;

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

// 从cookie字符串中提取JSESSIONID
function extractJSESSIONID(cookieStr) {
  if (!cookieStr) return null;
  const match = cookieStr.match(/JSESSIONID=([^;]+)/);
  return match ? match[1] : null;
}

// 初始化JSESSIONID - 发送GET请求到主页获取
async function initJSESSIONID() {
  console.log("初始化JSESSIONID...");
  try {
    const res = await wx.request({
      url: SW_HOST,
      method: "GET"
    });
    
    // 从响应头中提取JSESSIONID
    if (res.header && (res.header['Cookie'] || res.header['cookie'])) {
      const setCookie = res.header['Cookie'] || res.header['cookie'];
      const jsessionid = extractJSESSIONID(setCookie);
      
      if (jsessionid) {
        console.log("成功获取JSESSIONID:", jsessionid);
        sessionCookie = `JSESSIONID=${jsessionid}`;
        wx.setStorageSync('cookies', sessionCookie);
        jsessionInitialized = true;
        return true;
      }
    }
    
    console.log("未能从响应头中获取JSESSIONID");
    return false;
  } catch (error) {
    console.error("初始化JSESSIONID失败:", error);
    return false;
  }
}

// 包装请求函数，确保JSESSIONID已初始化
export const request = async (requestInfo) => {
  // 如果还未初始化JSESSIONID且不是主动请求获取JSESSIONID的请求
  if (!jsessionInitialized && !requestInfo.skipJsessionCheck) {
    console.log("JSESSIONID未初始化，正在获取...");
    await initJSESSIONID();
  }
  
  return new Promise((resolve, reject) => {
    const options = { headers: {}, ...requestInfo }; // 确保headers存在
    
    // 处理Cookie
    let cookieToSend = sessionCookie;
    if (!cookieToSend) {
      const storedCookies = wx.getStorageSync('cookies');
      if (storedCookies) {
        cookieToSend = storedCookies;
      }
    }
    if (cookieToSend) {
      options.headers.cookie = cookieToSend; // 直接设置
    }

    // 检查域名配置
    const domainInfo = checkDomain(options.url);
    console.log(`发起请求: ${options.url} (${domainInfo.domain})`);
    console.log(`使用的Cookie: ${options.headers.cookie || "无"}`);

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
        if (res.header && (res.header['Cookie'] || res.header['cookie'])) {
          const newCookie = res.header['Cookie'] || res.header['cookie'];
          
          // 如果是JSESSIONID，则更新
          const jsessionid = extractJSESSIONID(newCookie);
          if (jsessionid) {
            sessionCookie = `JSESSIONID=${jsessionid}`;
            jsessionInitialized = true;
            wx.setStorageSync('cookies', sessionCookie);
            console.log("更新JSESSIONID:", jsessionid);
          }
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

// 提供一个直接获取JSESSIONID的函数供外部调用
export const getJSESSIONID = async () => {
  if (!jsessionInitialized) {
    await initJSESSIONID();
  }
  return extractJSESSIONID(sessionCookie);
};

// 导出HTTP对象
export const HTTP = { 
  request,
  getJSESSIONID 
}; 