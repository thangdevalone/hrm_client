import { LeaveCreateForm, LeaveTypeCreateForm, QueryParam } from '@/models';
import { ConvertQueryParam } from '@/utils';
import axiosClient from './axiosClient';

const leaveApi = {
    getListLeave(param?: QueryParam, role?: string ) {
        if (role === undefined) return;
        let url = '';
        if (role === 'Admin' || role === 'Hr') {
            url = `leave/list-leave${ConvertQueryParam(param)}`;
        }
        if (role === 'Employee') {
            url = `leave/list-leave-staff${ConvertQueryParam(param)}`;
        }
        return axiosClient.get(url);
    },
    getListType(param?: QueryParam){
        const  url = `leavetype/list-leave-type${ConvertQueryParam(param)}`;
        return axiosClient.get(url);
    },
    leaveRemain(userId:number){
        const url=`/leave/leave-remainder/${userId}`
        return axiosClient.get(url);
    },
    createLeave(data: LeaveCreateForm) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const url = 'leave/create-leave';
        return axiosClient.post(url, data);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    editLeave(id:number,data: any){
        const url = `leave/update-leave/${id}`;
        return axiosClient.patch(url, data);
    },
    createLeaveType(data: LeaveTypeCreateForm){
        const url = 'leavetype/create-leave-type';
        return axiosClient.post(url, data);
    },
    deleteLeave(id:number){
        const url = `leave/delete-leave/${id}`;
        return axiosClient.delete(url);
    },
    deleteLeaveType(id:number){
        const url = `leavetype/delete-leave-type/${id}`;
        return axiosClient.delete(url);
    }
};
export default leaveApi;
