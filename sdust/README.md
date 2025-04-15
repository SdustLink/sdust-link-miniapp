# 山科小站API

山东科技大学教务系统API封装，支持登录、查询课表、成绩、考试安排等功能。纯客户端实现，无需服务器中转。

## 项目结构

```
sdust/
├── api/
│   ├── index.ts      # API入口文件
│   ├── login.ts      # 登录相关API
│   ├── timetable.ts  # 课表相关API
│   ├── grade.ts      # 成绩相关API
│   └── exam.ts       # 考试相关API
└── utils/
    ├── constant.ts   # 常量定义
    ├── parser.ts     # HTML解析工具
    └── request.ts    # HTTP请求工具
```

## 使用方法

### 安装依赖

本项目依赖于Taro框架，确保已经安装了`@tarojs/taro`包：

```bash
npm install @tarojs/taro
```

### 基本使用流程

1. **登录**

```typescript
import { login } from 'sdust/api';

// 获取验证码
const verifyCodeBuffer = await login.requestForVerifyCode();
// 处理验证码...

// 登录
const result = await login.loginApp('学号', '密码', '验证码');
if (result.status === 1) {
  console.log('登录成功');
} else {
  console.error('登录失败:', result.msg);
}
```

2. **查询课表**

```typescript
import { timetable } from 'sdust/api';

// 查询指定学期和周次的课表
const timeTableData = await timetable.requestRemoteTimeTable('2023-2024-2', 1);
console.log(timeTableData);
```

3. **查询成绩**

```typescript
import { grade } from 'sdust/api';

// 查询指定学期的成绩
const gradeData = await grade.requestForGrade('2023-2024-2');
console.log(gradeData);
```

4. **查询考试安排**

```typescript
import { exam } from 'sdust/api';

// 查询指定学期的考试安排
const examData = await exam.requestForExam('2023-2024-2');
console.log(examData);
```

### 完整流程示例

```typescript
import { login, timetable, grade, exam } from 'sdust/api';

async function main() {
  // 1. 登录
  const verifyCodeBuffer = await login.requestForVerifyCode();
  // 处理验证码...
  const loginResult = await login.loginApp('学号', '密码', '验证码');
  
  if (loginResult.status !== 1) {
    console.error('登录失败:', loginResult.msg);
    return;
  }
  
  // 2. 查询课表
  const currentTerm = '2023-2024-2';
  const currentWeek = 1;
  const timeTableData = await timetable.requestRemoteTimeTable(currentTerm, currentWeek);
  
  // 3. 查询成绩
  const gradeData = await grade.requestForGrade(currentTerm);
  
  // 4. 查询考试安排
  const examData = await exam.requestForExam(currentTerm);
}
```

## 注意事项

1. 需要在小程序环境中使用，因为依赖于Taro的API
2. 所有请求直接与强智教务系统通信，无需服务器中转
3. 登录成功后才能使用其他API
4. 学期格式为"学年-学期"，例如"2023-2024-2"表示2023-2024学年第2学期

## 数据格式

### 课表数据

```typescript
type TimeTableItem = {
  weekDay: number;    // 周几，0-6分别代表周日到周六
  serial: number;     // 第几节课，0-4分别代表第1-2、3-4、5-6、7-8、9-10节
  className: string;  // 课程名称
  classRoom: string;  // 教室
  teacher: string;    // 教师名称
  ext?: string;       // 扩展信息，通常包含周次信息
};
```

### 成绩数据

```typescript
type GradeType = {
  no: string;        // 课程代码
  name: string;      // 课程名称
  grade: string;     // 成绩
  makeup: string;    // 补考成绩
  rebuild: string;   // 重修成绩
  type: string;      // 课程类型
  credit: string;    // 学分
  gpa: string;       // 绩点
  minor: string;     // 辅修标记
};
```

### 考试数据

```typescript
type ExamType = {
  no: string;         // 课程代码
  name: string;       // 课程名称
  time: string;       // 考试时间
  classroom: string;  // 考试教室
  location: string;   // 考试位置
};
``` 
