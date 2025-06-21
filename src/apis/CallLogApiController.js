import { BaseAPI, ApiError } from './BaseAPI';

class CallLogApi extends BaseAPI {
    static serviceName = 'CallLog';

    static async requestToApi({ mode, params, yearCode, functionName }) {
        return super.requestToApi({
            mode,
            params,
            yearCode,
            functionName,
            serviceName: this.serviceName
        });
    }

    // Fetch Call Logs
    static async getCallLogs({ statusId, projectId, filter, startDate, endDate, searchTerm }) {
        try {
            const params = {
                StatusId: statusId,
                ProjectID: projectId,
                Filter: filter,
                StartDate: startDate,
                EndDate: endDate,
                SearchTerm: searchTerm
            };
            const response = await this.requestToApi({
                mode: 'CALLLOGLIST',
                params,
                functionName: 'CALLLOGLIST'
            });
            return response;
        } catch (error) {
            console.error('Error fetching call logs:', error);
            throw error;
        }
    }

    // Get Master Data
    static async getMasterData() {
        try {
            const params = {};
            const response = await this.requestToApi({
                mode: 'FILTER',
                params,
                functionName: 'FILTER'
            });
            return response;
        } catch (error) {
            console.error('Error fetching call logs:', error);
            throw error;
        }
    }

    static async getEmployeeMasterD() {
        try {
            const params = {};
            const response = await this.requestToApi({
                mode: 'EMPLOYEE_LIST',
                params,
                functionName: 'EMPLOYEE_LIST'
            });
            return response;
        } catch (error) {
            console.error('Error fetching call logs:', error);
            throw error;
        }
    }

    // Add a Call
    static async addCall({ entryDate, customerName, projectID, appID, description, deptId, empId, source, createdBy }) {
        try {
            const params = {
                EntryDate: entryDate,
                CustomerName: customerName,
                ProjectID: projectID,
                AppId: appID,
                Descr: description,
                Source: source,
                CreatedBy: createdBy
            };
            if (deptId) params.DeptId = deptId;
            if (empId) params.EmpId = empId;

            const response = await this.requestToApi({
                mode: 'ADDCALL',
                params,
                functionName: 'ADDCALL'
            });

            return response;
        } catch (error) {
            console.error('Error adding call:', error);
            throw error;
        }
    }

    static async editCallApi(CallLogid, createdBy, customerName, PriorityId, ParentId, description, employeeId, DeptId, status, Estatus, calldetails, EntryDate) {
        try {
            const params = {
                CallLogid: CallLogid,
                CreatedBy: createdBy,
                CustomerName: customerName || "",
                PriorityId: PriorityId || "",
                ParentId: ParentId || "",
                Descr: description || "",
                EmpId: employeeId || "",
                DeptId: DeptId || "",
                StatusId: status || "",
                calldetails: calldetails || "",
                Estatus: Estatus || "",
                EntryDate: EntryDate || "",
            };
            const response = await this.requestToApi({
                mode: 'EDIT',
                params,
                functionName: 'EDIT'
            });

            return response;
        } catch (error) {
            console.error('Error adding call:', error);
            throw error;
        }
    }

    // Start a Call
    static async startCall({ callLogId, createdBy }) {
        try {
            const params = { CallLogid: callLogId, CreatedBy: createdBy };
            const response = await this.requestToApi({
                mode: 'CALLSTART',
                params,
                functionName: 'CALLSTART'
            });
            return response;
        } catch (error) {
            console.error('Error starting call:', error);
            throw error;
        }
    }

    // Pause a Call
    static async pauseCall({ callLogId }) {
        try {
            const params = { CallLogid: callLogId };
            const response = await this.requestToApi({
                mode: 'CALLPAUSE',
                params,
                functionName: 'CALLPAUSE'
            });
            return response;
        } catch (error) {
            console.error('Error pausing call:', error);
            throw error;
        }
    }

    // Resume a Call
    static async resumeCall({ callLogId }) {
        try {
            const params = { CallLogid: callLogId };
            const response = await this.requestToApi({
                mode: 'CALLRESUME',
                params,
                functionName: 'CALLRESUME'
            });
            return response;
        } catch (error) {
            console.error('Error resuming call:', error);
            throw error;
        }
    }

    // End a Call
    static async endCall({ callLogId ,createdBy}) {
        try {
            const params = { CallLogid: callLogId ,  CreatedBy: createdBy  };
            const response = await this.requestToApi({
                mode: 'CALLEND',
                params,
                functionName: 'CALLEND'
            });
            return response;
        } catch (error) {
            console.error('Error ending call:', error);
            throw error;
        }
    }

    static async AcceptCall({ callLogId, createdBy }) {
        try {
            const params = { CallLogid: callLogId, CreatedBy: createdBy };
            const response = await this.requestToApi({
                mode: 'ACCEPTCALL',
                params,
                functionName: 'ACCEPTCALL'
            });
            return response;
        } catch (error) {
            console.error('Error starting call:', error);
            throw error;
        }
    }

    // Add Call Comments
    static async addCallComments(callLogId, comments, filePath, createdBy) {
        try {
            const params = { CallLogid: callLogId, Comments: comments, FilePath: filePath, CreatedBy: createdBy };
            const response = await this.requestToApi({
                mode: 'COMMENTS',
                params,
                functionName: 'COMMENTS'
            });
            return response;
        } catch (error) {
            console.error('Error adding comments to call:', error);
            throw error;
        }
    }

    // Add Feedback
    static async addFeedback({ callLogId, feedback, ratingByCustomer }) {
        try {
            const params = { CallLogid: callLogId, Feedback: feedback, RatingByCustomer: ratingByCustomer };
            const response = await this.requestToApi({
                mode: 'FEEDBACK',
                params,
                functionName: 'FEEDBACK'
            });
            return response;
        } catch (error) {
            console.error('Error adding feedback:', error);
            throw error;
        }
    }

    // Change Internal Status
    static async changeInternalStatus({ callLogId, statusId, createdBy }) {
        try {
            const params = { CallLogid: callLogId, StatusId: statusId, CreatedBy: createdBy };
            const response = await this.requestToApi({
                mode: 'IS',
                params,
                functionName: 'IS'
            });
            return response;
        } catch (error) {
            console.error('Error changing internal status:', error);
            throw error;
        }
    }

    // Change External Status and Priority
    static async changeExternalStatusAndPriority({ callLogId, statusId, priorityId, createdBy }) {
        try {
            const params = { CallLogid: callLogId, CreatedBy: createdBy };
            if (statusId) {
                params.Estatus = statusId;
            }
            if (priorityId) {
                params.PriorityId = priorityId;
            }

            const response = await this.requestToApi({
                mode: 'ES',
                params,
                functionName: 'ES'
            });

            return response;
        } catch (error) {
            console.error('Error changing external status and priority:', error);
            throw error;
        }
    }

    // Forward a Call
    static async forwardCall({ callLogId, deptId, empId, createdBy, statusId }) {
        try {
            const params = { CallLogid: callLogId, DeptId: deptId, EmpId: empId, CreatedBy: createdBy, StatusId: statusId };
            const response = await this.requestToApi({
                mode: 'FORWARDED',
                params,
                functionName: 'FORWARDED'
            });
            return response;
        } catch (error) {
            console.error('Error forwarding call:', error);
            throw error;
        }
    }
    // Private method to make the API request
    #getPrivate() {
        return new Promise((resolve, reject) => {
            resolve("token");
        });
    }
}

export default CallLogApi;