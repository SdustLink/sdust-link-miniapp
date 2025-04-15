export const RegExec = {
  exec: (regex: RegExp, str: string): string => {
    const res = regex.exec(str);
    return res ? res[1] : "";
  },
  match: (regex: RegExp, str: string): string[] => {
    const res = str.match(regex);
    return res || [];
  },
  get: (arr: string[], index: number): string => {
    return arr[index] || "";
  },
};

export const base64Encode = (str: string): string => {
  return btoa(encodeURIComponent(str));
};
