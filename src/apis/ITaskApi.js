import { GetCredentialsFromCookie } from "../utils/AuthUtils";
import { BaseAPI } from "./BaseAPI";
import axios from "axios";

class ITaskApi extends BaseAPI {
  static getBaseUrl() {
    return super.BASE_URL;
  }
  static cookieUser = GetCredentialsFromCookie();

  static BASE_URL = this.getBaseUrl();

  static async post(endpoint, body, extraHeaders = {}) {
    try {
      const response = await axios.post(this.BASE_URL, body, {
        headers: {
          "Content-Type": "application/json",
          YearCode: this.cookieUser?.yc,
          version: "v4",
          sv: process.env.NODE_ENV === "production" ? "1" : "0",
          sp: "6",
          ...extraHeaders,
        },
      });
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  static async getCallLogList({ taskId }) {
    const payload = {
      con: JSON.stringify({
        id: "",
        mode: "getcallloglist",
        appuserid: this?.cookieUser?.userId,
      }),
      p: JSON.stringify({
        taskid: taskId,
      }),
      f: "Task Management (taskmaster)",
    };

    return await this.post("/api/report", payload);
  }

  /** Save a Task Log */
  static async saveCallLogTask({ taskData }) {
    const payload = {
      con: JSON.stringify({
        id: "",
        mode: "calllogtasksave",
        appuserid: this?.cookieUser?.userId,
      }),
      p: JSON.stringify(taskData),
      f: "Task Management (taskmaster)",
    };

    return await this.post("/api/report", payload);
  }
}

export default ITaskApi;

// {
//     "con":"{\"id\":\"\",\"mode\":\"calllogtasksave\",\"appuserid\":\"amrut@eg.com\"}",
//     "p":"{\"taskname\":\"UX for better user experience3\",\"StartDate\":\"\",\"estimate_hrs\":\"5.40\",
//     \"DeadLineDate\":\"\",\"priorityid\":\"1\",\"statusid\":\"5\",
//     \"workcategoryid\":\"2\",\"departmentid\":\"2\",\"descr\":\"this is my UX for better user experience1 \",
//     \"EndDate\":\"\",\"assigneids\":\"5\",\"customername\":\"admin\" }",
//     "f":"Task Management (taskmaster)"
// }

//   {
//                 "sr": 276,
//                 "date": "2025-10-09T00:00:00.000Z", -  StartDate
//                 "company": "Stock1",
//                 "callBy": "wdwd", customername         -------------
//                 "appname": "",
//                 "description": "qsqs", -   taskname   ----------------
//                 "receivedBy": "Joseph Archer",   - assigneids  ----------------
//                 "time": "13:52",
//                 "DeptName": "",
//                 "AssignedEmpName": "",
//                 "status": "",  -  statusid
//                 "Estatus": "",
//                 "feedback": "",
//                 "rating": 0,
//                 "topicRaisedBy": "",
//                 "priority": "",  - priorityid      -------------
//                 "callStart": "",
//                 "callClosed": "",
//                 "CallDuration": "",
//                 "callDetails": "",
//                 "ticket": "",
//                 "Ticket_CreatedDate": "",
//                 "Satisfaction": "",
//                 "review_comments": "",
//                 "CallType": "",
//                 "review_dept_issue_list": "",
//                 "comment": "",
//                 "parentId": ""
//             },
