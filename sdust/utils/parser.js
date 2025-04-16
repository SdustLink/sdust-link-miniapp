export const RegExec = {
  exec: (regex, str) => {
    const res = regex.exec(str);
    return res ? res[1] : "";
  },
  match: (regex, str) => {
    const res = str.match(regex);
    return res || [];
  },
  get: (arr, index) => {
    return arr[index] || "";
  },
};

// 微信小程序环境下的Base64编码实现
export const base64Encode = (str) => {
  // 定义Base64索引表
  const BASE64_KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  
  // 对原始字符串进行URL编码
  const encodedStr = encodeURIComponent(str);
  
  // 初始化结果字符串
  let result = '';
  let i = 0;
  
  // 处理UTF8编码
  const utftext = encodedStr.replace(/%([0-9A-F]{2})/g, (match, hex) => {
    return String.fromCharCode(parseInt('0x' + hex));
  });
  
  // Base64编码主要过程
  while (i < utftext.length) {
    let chr1 = utftext.charCodeAt(i++);
    let chr2 = i < utftext.length ? utftext.charCodeAt(i++) : 0;
    let chr3 = i < utftext.length ? utftext.charCodeAt(i++) : 0;
    
    let enc1 = chr1 >> 2;
    let enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    let enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    let enc4 = chr3 & 63;
    
    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }
    
    result += BASE64_KEYS.charAt(enc1) + BASE64_KEYS.charAt(enc2) + 
              BASE64_KEYS.charAt(enc3) + BASE64_KEYS.charAt(enc4);
  }
  
  return result;
}; 