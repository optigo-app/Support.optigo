class TrainingAPI {
    static BASE_URL = 'http://newnextjs.web/api/report';
    // static BASE_URL = process.env.NODE_ENV === "production" ? "https://livenx.optigoapps.com/api/report" : "http://newnextjs.web/api/report";

    static VERSION_NO = null;
    static SV = null;
    static SP = null;
    static APP_USER_ID = null;
    static YEAR_CODE = null;
    static isInitialized = false;

    static initialize(cookieData = null) {
        if (!cookieData) {
            console.error('TrainingAPI initialization failed: No cookie data provided');
            return null;
        }

        TrainingAPI.YEAR_CODE = cookieData.yc || '';
        TrainingAPI.SV = cookieData.sv || '';
        TrainingAPI.APP_USER_ID = cookieData.userId || '';
        TrainingAPI.SP = cookieData.sp || '17';
        TrainingAPI.VERSION_NO = cookieData.version || 'v1';

        TrainingAPI.isInitialized = true;

        console.log('TrainingAPI initialized with:', {
            yearCode: TrainingAPI.YEAR_CODE,
            sv: TrainingAPI.SV,
            sp: TrainingAPI.SP,
            appUserId: TrainingAPI.APP_USER_ID,
            version: TrainingAPI.VERSION_NO
        });

        return {
            yearCode: TrainingAPI.YEAR_CODE,
            sv: TrainingAPI.SV,
            sp: TrainingAPI.SP,
            appUserId: TrainingAPI.APP_USER_ID,
            version: TrainingAPI.VERSION_NO
        };
    }

    static getHeaders() {
        if (!TrainingAPI.isInitialized) {
            console.error('TrainingAPI not initialized. Please call initialize() with cookie data first.');
            throw new Error('API not initialized');
        }

        return {
            'Content-Type': 'application/json',
            YearCode: TrainingAPI.YEAR_CODE,
            version: TrainingAPI.VERSION_NO,
            sv: TrainingAPI.SV,
            sp: TrainingAPI.SP
        };
    }

    static async requestToApi({ mode, params, functionName }) {
        if (!TrainingAPI.isInitialized) {
            console.error('TrainingAPI not initialized. Please call initialize() with cookie data first.');
            throw new Error('API not initialized');
        }

        const body = {
            con: JSON.stringify({
                id: '',
                mode,
                appuserid: TrainingAPI.APP_USER_ID
            }),
            p: JSON.stringify(params),
            f: `Training Dashboard (${functionName})`
        };

        try {
            const response = await fetch(TrainingAPI.BASE_URL, {
                method: 'POST',
                headers: TrainingAPI.getHeaders(),
                body: JSON.stringify(body)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || `Failed to ${functionName.toLowerCase()}`);
            }

            return data;
        } catch (error) {
            console.error(`Error during "${functionName}" operation:`, error);
            throw error;
        }
    }
    // ✅ Token
    static async getToken(userId) {
        try {
            const response = await TrainingAPI.requestToApi({
                mode: 'gettoken',
                params: { appuserid: userId },
                functionName: 'gettoken',
            });

            return response;
        } catch (error) {
            console.error('Error getting token:', error);
            throw error;
        }
    }
    // ✅ Create
    static async createTraining({
        TrainingDate, Projectcode, TicketNo, TrainingType, TrainingMode,
        TrainingBy, Attendees, StartTime, EndTime, Details, CutomerType,
        CutomerPackage, Status, Remark
    }) {
        return await this.requestToApi({
            mode: 'create',
            params: {
                TrainingDate, Projectcode, TicketNo, TrainingType, TrainingMode,
                TrainingBy, Attendees, StartTime, EndTime, Details, CutomerType,
                CutomerPackage, Status, Remark
            },
            functionName: 'Create'
        });
    }
    // ✅ Update - Now supports partial updates!
    static async updateTraining({
        SessionID, TrainingDate, Projectcode, TicketNo, TrainingType, TrainingMode,
        TrainingBy, Attendees, StartTime, EndTime, Details, CutomerType,
        CutomerPackage, Status, Remark
    }) {
        const payload = {
            SessionID,
            ...(TrainingDate !== undefined && { TrainingDate }),
            ...(Projectcode !== undefined && { Projectcode }),
            ...(TicketNo !== undefined && { TicketNo }),
            ...(TrainingType !== undefined && { TrainingType }),
            ...(TrainingMode !== undefined && { TrainingMode }),
            ...(TrainingBy !== undefined && { TrainingBy }),
            ...(Attendees !== undefined && { Attendees }),
            ...(StartTime !== undefined && { StartTime }),
            ...(EndTime !== undefined && { EndTime }),
            ...(Details !== undefined && { Details }),
            ...(CutomerType !== undefined && { CutomerType }),
            ...(CutomerPackage !== undefined && { CutomerPackage }),
            ...(Status !== undefined && { Status }),
            ...(Remark !== undefined && { Remark })
        };

        return await this.requestToApi({
            mode: 'update',
            params: payload,
            functionName: 'Update'
        });
    }
    // ✅ Delete
    static async deleteTraining(SessionID) {
        return await this.requestToApi({
            mode: 'delete',
            params: { SessionID },
            functionName: 'Delete'
        });
    }
    // ✅ List
    static async listTrainings() {
        return await this.requestToApi({
            mode: 'list',
            params: {},
            functionName: 'List'
        });
    }

    // ✅ Customer Master
    static async getCustomerMaster() {
        return await this.requestToApi({
            mode: 'customer_master',
            params: {},
            functionName: 'Customer Master'
        });
    }
    // ✅ Get Employee List
    static async getEmployeeList(appUserId = this.APP_USER_ID) {
        return await this.requestToApi({
            mode: 'EMPLOYEE_LIST',
            params: { appuserid: appUserId },
            functionName: 'Employee List'
        });
    }
}

export default TrainingAPI;