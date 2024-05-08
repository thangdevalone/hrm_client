import { ConfigScheduleCreateForm, QueryParam, ScheduleCreateForm, WorkShiftCreateForm } from '@/models';
import { ConvertQueryParam } from '@/utils';
import axiosClient from './axiosClient';

const scheduleApi = {
    getListWorkShift(param?: QueryParam) {
        const url = `workshifts/${ConvertQueryParam(param)}`;
        return axiosClient.get(url);
    },
    createWorkShift(data: WorkShiftCreateForm) {
        const url = 'workshifts/';
        return axiosClient.post(url, data);
    },
    deleteWorkShift(id: number) {
        const url = `workshifts/${id}/`;
        return axiosClient.delete(url);
    },
    updateWorkShift(id: number, data: WorkShiftCreateForm) {
        const url = `workshifts/${id}/`;
        return axiosClient.put(url, data);
    },
    getListConfigTrue() {
        const url = `configchedules/using-true/`;
        return axiosClient.get(url);
    },
    getListConfigSchedule(param?: QueryParam) {
        const url = `configchedules${ConvertQueryParam(param)}`;
        return axiosClient.get(url);
    },
    createConfigSchedule(data: ConfigScheduleCreateForm) {
        const url = 'configchedules/';
        return axiosClient.post(url, data);
    },
    deleteConfigSchedule(id: number) {
        const url = `configchedules/${id}/`;
        return axiosClient.delete(url);
    },
    updateConfigSchedule(id: number, data: ConfigScheduleCreateForm) {
        const url = `configchedules/${id}/`;
        return axiosClient.put(url, data);
    },
    getListSchedule(param?:string) {
        const url = `schedules/${param}`;
        return axiosClient.get(url);
    },
    getListAllSchedule(param?:string) {
        const url = `schedule-list/${param}`;
        return axiosClient.get(url);
    },
    createSchedule(data: ScheduleCreateForm) {
        const url = 'schedules/';
        return axiosClient.post(url, data);
    },
    deleteSchedule(id: number) {
        const url = `schedules/${id}/`;
        return axiosClient.delete(url);
    },
    updateSchedule(id: number, data: ScheduleCreateForm) {
        const url = `schedules/${id}/`;
        return axiosClient.put(url, data);
    }
 
};
export default scheduleApi;
