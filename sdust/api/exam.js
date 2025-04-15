import { SW_HOST } from "../utils/constant";
import { HTTP } from "../utils/request";
import { RegExec } from "../utils/parser";

export const requestForExam = (term) => {
  return HTTP.request({
    method: "POST",
    url: SW_HOST + "xsks/xsksap_list",
    data: {
      xnxqid: term,
      xqlbmc: "",
      xqlb: "",
    },
  }).then(res => {
    return parseExams(res.data);
  });
};

const parseExams = (html) => {
  const exams = [];
  const content = RegExec.exec(/<table[\s]*id="dataList"[\s\S]*?>([\s\S]*?)<\/table>/g, html);
  const group = RegExec.match(/<tr[\s\S]*?>([\s\S]*?)<\/tr>/g, content);

  group.forEach(item => {
    const data = RegExec.match(/<td[\s\S]*?>([\s\S]*?)<\/td>/g, item);
    if (!data[2]) return;

    exams.push({
      no: data[2],
      name: data[3],
      time: data[4],
      classroom: data[5],
      location: data[6],
    });
  });

  return exams;
}; 