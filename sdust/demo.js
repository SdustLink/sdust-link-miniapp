import { login, timetable, grade, exam } from "./api";

/**
 * 山科小站API使用示例
 *
 * 注意：该文件仅作演示用途，实际使用时需要在小程序环境中运行
 */

// 第一步：登录
async function loginAndFetchData() {
  console.log("开始登录流程...");

  // 1. 获取验证码
  const verifyCodeBuffer = await login.requestForVerifyCode();
  console.log("获取到验证码");

  // 2. 登录（实际使用时需要输入账号、密码和验证码）
  const account = "学号";
  const password = "密码";
  const code = "验证码"; // 实际使用中需要识别或用户输入

  const loginResult = await login.loginApp(account, password, code);

  if (loginResult.status !== 1) {
    console.error("登录失败:", loginResult.msg);
    return;
  }

  console.log("登录成功！");

  // 3. 获取当前学期的课表
  const currentTerm = "2023-2024-2"; // 例如：2023-2024学年第2学期
  const currentWeek = 1; // 第1周

  console.log("开始获取课表...");
  const timeTableData = await timetable.requestRemoteTimeTable(currentTerm, currentWeek);
  console.log("课表数据:", timeTableData);

  // 4. 获取成绩
  console.log("开始获取成绩...");
  const gradeData = await grade.requestForGrade(currentTerm);
  console.log("成绩数据:", gradeData);

  // 5. 获取考试安排
  console.log("开始获取考试安排...");
  const examData = await exam.requestForExam(currentTerm);
  console.log("考试安排:", examData);
}

// 使用示例
// loginAndFetchData().catch(console.error);

/**
 * 单独使用某个API的例子
 */

// 只查课表
async function fetchTimeTable() {
  const term = "2023-2024-2";
  const week = 1;
  const data = await timetable.requestRemoteTimeTable(term, week);
  return data;
}

// 只查成绩
async function fetchGrade() {
  const term = "2023-2024-2";
  const data = await grade.requestForGrade(term);
  return data;
}

// 只查考试
async function fetchExam() {
  const term = "2023-2024-2";
  const data = await exam.requestForExam(term);
  return data;
}

export {
  loginAndFetchData,
  fetchTimeTable,
  fetchGrade,
  fetchExam
}; 