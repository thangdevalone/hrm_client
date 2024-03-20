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
    checkin(p:string){
        const url=`timesheet/check-in?ip=${p}`;
        return axiosClient.post(url);
    },
    checkout(p:string){
        const url=`timesheet/check-out?ip=${p}`;
        return axiosClient.post(url);
    },
    setIp(p:string){
        const url=`timesheet/set-ip?crypto=${p}`;
        return axiosClient.post(url);
    },
    listNoAttendance(param?: QueryParam){
        const url = `timesheet/registed-without-attendance${ConvertQueryParam(param)}`
        return axiosClient.get(url);

    }
 
};
export default timeKeepApi;
