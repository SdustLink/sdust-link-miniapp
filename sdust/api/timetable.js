import { SW_HOST } from "../utils/constant";
import { HTTP } from "../utils/request";
import { RegExec } from "../utils/parser";

export const requestRemoteTimeTable = (term, week) => {
  return HTTP.request({
    url: SW_HOST + "xskb/xskb_list.do",
    data: {
      week,
      term,
    },
  }).then(res => {
    return parseTimeTable(res.data);
  });
};

const parseTimeTable = (html) => {
  const timeTable = [];
  const classes = RegExec.match(/<div[\s\S]*?class="kbcontent"[\s]?>(.*?)<\/div>/g, html);

  classes.forEach((item, index) => {
    const repeat = item.split(/-{10,}/g);
    const day = index % 7;
    const serial = Math.floor(index / 7);

    for (const value of repeat) {
      if (value.startsWith("&nbsp;")) continue;
      const nameGroup = value.split(/(<\/br>)|(<br\/>)/g);
      const name = RegExec.get(nameGroup, 0).replace("<br>", "").replace(/[（]/g, "(").replace("）", ")");
      const teacher = RegExec.exec(/<font[\s\S]*?title='老师'[\s\S]*?>(.*?)<\/font>/g, value);
      const weekStr = RegExec.exec(/<font[\s\S]*?title='周次\(节次\)'[\s\S]*?>(.*?)<\/font>/g, value)
        .replace(/[,=\\]/g, ",")
        .replace(/[（]/g, "(")
        .replace("）", ")");
      const classroom = RegExec.exec(/<font[\s\S]*?title='教室'[\s\S]*?>(.*?)<\/font>/g, value);

      timeTable.push({
        weekDay: day,
        serial,
        className: name,
        classRoom: classroom,
        teacher,
        ext: weekStr.replace(/[()]/g, ""),
      });
    }
  });

  return timeTable;
}; 