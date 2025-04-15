import { SW_HOST } from "../utils/constant";
import { HTTP } from "../utils/request";
import { RegExec } from "../utils/parser";

export const requestForGrade = (term) => {
  return HTTP.request({
    method: "POST",
    url: SW_HOST + "kscj/cjcx_list_new",
    data: {
      kksj: term,
      xsfs: "all",
      showType: 2,
      kcxz: "",
      kcmc: "",
    },
  }).then(res => {
    return parseGrades(res.data);
  });
};

const parseGrades = (html) => {
  const grades = [];
  const content = RegExec.exec(/<table[\s]*id="dataList"[\s\S]*?>([\s\S]*?)<\/table>/g, html);
  const group = RegExec.match(/<tr[\s\S]*?>([\s\S]*?)<\/tr>/g, content);

  group.forEach(item => {
    const data = RegExec.match(/<td[\s\S]*?>([\s\S]*?)<\/td>/g, item);
    if (!data[2]) return;

    grades.push({
      no: data[2],
      name: data[3],
      grade: data[4],
      makeup: data[5],
      rebuild: data[6],
      type: data[7],
      credit: data[8],
      gpa: data[9],
      minor: data[10],
    });
  });

  return grades;
}; 