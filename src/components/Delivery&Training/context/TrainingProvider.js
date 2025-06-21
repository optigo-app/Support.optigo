import React, { createContext, useContext, useState, useEffect } from "react";
import TrainingAPI from './../../../apis/TrainingController';

const TrainingContext = createContext();

export const TrainingProvider = ({ children }) => {
    const [Traininglist, setTraininglist] = useState([]);
    const [masterData, setMasterData] = useState(() => {
        const stored = sessionStorage.getItem("TrainingmasterData");
        return stored ? JSON.parse(stored) : { customer: null, employees: null };
    });
    const [refresh, setrefresh] = useState(false);

    const COMPANY_MASTER_LIST = masterData.customer?.map(item => ({
        label: item?.CustomerCode,
        value: item.Id,
        ...item
    })) || [];
    const EMPLOYEE_LIST = masterData.employees?.map(item => ({
        label: item?.user,
        value: item?.userid,
        ...item
    }));

    useEffect(() => {
        const GetMasterData = async () => {
            try {
                const [master, employees] = await Promise.all([
                    TrainingAPI.getCustomerMaster(),
                    TrainingAPI.getEmployeeList()
                ]);
                const data = { customer: master?.Data?.rd || [], employees: employees?.Data?.rd || [] };
                setMasterData(data);
                sessionStorage.setItem("TrainingmasterData", JSON.stringify(data));
            } catch (err) {
                console.error("Error fetching master data:", err.message);
            }
        };
        if (!sessionStorage.getItem("TrainingmasterData")) {
            GetMasterData();
        }
    }, []);

    useEffect(() => {
        const fetchTraining = async () => {
            try {
                const response = await TrainingAPI.listTrainings();
                setTraininglist(response.Data.rd);
            } catch (error) {
                console.log(error);
            }
        };
        fetchTraining();
    }, [refresh]);

    const addTraining = async (newTraining) => {
        try {
            const data = await TrainingAPI.createTraining({
                Attendees: newTraining.attendees ?? "",
                CutomerPackage: newTraining.packageInfo ?? "",
                CutomerType: newTraining.customerType ?? "",
                TrainingDate: newTraining.date ?? "",
                Details: newTraining.details ?? "",
                EndTime: newTraining.endTime ?? "",
                Projectcode: newTraining.projectCode ?? "",
                Remark: newTraining.remarks ?? "",
                StartTime: newTraining.startTime ?? "",
                Status: newTraining.status ?? "",
                TicketNo: newTraining.ticketNo ?? "",
                TrainingBy: newTraining.trainingBy ?? "",
                TrainingMode: newTraining.trainingMode ?? "",
                TrainingType: newTraining.trainingType ?? "",
            });
            const result = data?.Data?.rd?.[0];
            if (result?.stat === 0) {
                throw new Error(result.stat_msg || 'Failed to add training.');
            }
            console.log('Training added:', data);
            setrefresh((prev) => !prev);
        } catch (error) {
            console.error('Error adding training:', error.message || error);
            throw error; // Re-throw to let calling code handle it too, if needed
        }
    };
    const editTraining = async (id, updatedFields) => {
        if (!id) return;
        try {
            const data = await TrainingAPI.updateTraining({
                Attendees: updatedFields.attendees ?? "",
                CutomerPackage: updatedFields.packageInfo ?? "",
                CutomerType: updatedFields.customerType ?? "",
                TrainingDate: updatedFields.date ?? "",
                Details: updatedFields.details ?? "",
                EndTime: updatedFields.endTime ?? "",
                Projectcode: updatedFields.projectCode ?? "",
                Remark: updatedFields.remarks ?? "",
                StartTime: updatedFields.startTime ?? "",
                Status: updatedFields.status ?? "",
                TicketNo: updatedFields.ticketNo ?? "",
                TrainingBy: updatedFields.trainingBy ?? "",
                TrainingMode: updatedFields.trainingMode ?? "",
                TrainingType: updatedFields.trainingType ?? "",
                SessionID: id
            });
            console.log(data);
            setrefresh((prev) => !prev);
        } catch (error) {
            console.error('Error updating training:', error);
        }
    };
    const deleteTraining = async (id) => {
        try {
            const res = await TrainingAPI.deleteTraining(id);
            console.log(res);
            setrefresh((prev) => !prev);
        } catch (error) {
            console.error('Error deleting training:', error);
        }
    };

    const value = {
        Traininglist,
        addTraining,
        editTraining,
        deleteTraining,
        COMPANY_MASTER_LIST,
        EMPLOYEE_LIST
    };

    return (
        <TrainingContext.Provider value={value}>
            {children}
        </TrainingContext.Provider>
    );
};

export const useTraining = () => useContext(TrainingContext);