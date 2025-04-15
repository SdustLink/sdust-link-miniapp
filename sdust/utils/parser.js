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

export const base64Encode = (str) => {
  return btoa(encodeURIComponent(str));
}; 