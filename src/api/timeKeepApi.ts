import { QueryParam } from '@/models';
import { ConvertQueryParam } from '@/utils';
import axiosClient from './axiosClient';

const timeKeepApi = {
    getListTimeKeepAll(param?: QueryParam) {
        const url = `timesheet/list-timesheet${ConvertQueryParam(param)}`;
        return axiosClient.get(url);
    },
    getListTimeKeepAllRaw(param?: QueryParam) {
        const url = `timesheet/list-timesheet-raw${ConvertQueryParam(param)}`;
        return axiosClient.get(url);
    },
    getListTimeKeep(param?: QueryParam) {
        const url = `timesheet/list-timesheet-staff${ConvertQueryParam(param)}`;
        return axiosClient.get(url);
    },
    checkin(tags: string[]) {
        const url = `timesheet/check-in`;
        return axiosClient.post(url, { work_plans: tags });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    checkout(data:any) {
        const url = `timesheet/check-out`;
        return axiosClient.post(url,data);
    },
    getTaskToday(){
        const url='timesheet/user-timesheet-tasks'
        return axiosClient.get(url)
    },
    setIp() {
        const url = `timesheet/set-ip`;
        return axiosClient.post(url);
    },
    listNoAttendance(param?: QueryParam) {
        const url = `timesheet/registed-without-attendance${ConvertQueryParam(param)}`;
        return axiosClient.get(url);
    },
    export2(param?: string) {
        const url = param ? `timesheet/timesheet-infor${param}` : 'timesheet/timesheet-infor';
        return axiosClient.get(url);
    },
};
export default timeKeepApi;
