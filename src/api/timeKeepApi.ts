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
    checkin(p: string) {
        const url = `timesheet/check-in`;
        console.log(p)
        return axiosClient.post(
            url,
            {"data":"checkin"},
            {
                headers: {
                    'X-Forwarded-For': p,
                },
            }
        );
    },
    checkout(p: string) {
        const url = `timesheet/check-out`;
        return axiosClient.post(
            url,
            {"data":"checkout"},
            {
                headers: {
                    'X-Forwarded-For': p,
                },
            }
        );
    },
    setIp(p: string) {
        const url = `timesheet/set-ip?crypto=${p}`;
        return axiosClient.post(url);
    },
    listNoAttendance(param?: QueryParam) {
        const url = `timesheet/registed-without-attendance${ConvertQueryParam(param)}`;
        return axiosClient.get(url);
    },
};
export default timeKeepApi;
