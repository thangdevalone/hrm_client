import { DepartmentCreateForm, DepartmentEditForm, InfoAccount, JobCreateForm, JobEditForm, QueryParam, RoleCreateForm, RoleEditForm } from '@/models';
import { ConvertQueryParam } from '@/utils';
import axiosClient from './axiosClient';

export const adminApi = {
    getListTimeSheet(param?: QueryParam) {
        const url = `timesheet/list-timesheet${ConvertQueryParam(param)}`;
        return axiosClient.get(url);
    },
    getListAccount(param?: QueryParam) {
        const url = `employee/list-account${ConvertQueryParam(param)}`;
        return axiosClient.get(url);
    },
    getUserAccount(param?: QueryParam) {
        const url = `employee/list-username${ConvertQueryParam(param)}`;
        return axiosClient.get(url);
    },
    getListLeave(param?: QueryParam) {
        const url = `leave/list-leave${ConvertQueryParam(param)}`;
        return axiosClient.get(url);
    },
    getJob(param?: QueryParam) {
        const url = `job/list-job${ConvertQueryParam(param)}`;
        return axiosClient.get(url);
    },
    getRole(param?: QueryParam) {
        const url = `role/list-role${ConvertQueryParam(param)}`;
        return axiosClient.get(url);
    },
    getDepartment(param?: QueryParam) {
        const url = `department/list-department${ConvertQueryParam(param)}`;
        return axiosClient.get(url);
    },
    createJob(data: JobCreateForm) {
        const url = 'job/create-job';
        return axiosClient.post(url, data);
    },
    createRole(data: RoleCreateForm) {
        const url = 'role/create-role';
        return axiosClient.post(url, data);
    },
    createDepartment(data: DepartmentCreateForm) {
        const url = 'department/create-department';
        return axiosClient.post(url, data);
    },
    editAccount(id:string,data:InfoAccount){
        const url = `account/update-account/${id}`;
        return axiosClient.patch(url,data)
    },
    editJob(id: number,data:JobEditForm) {
        const url = `job/update-job/${id}`;
        return axiosClient.patch(url,data);
    },
    editRole(id: number,data:RoleEditForm) {
        const url = `role/update-role/${id}`;
        return axiosClient.patch(url,data);
    },
    editDepartment(id:number,data:DepartmentEditForm){
        const url = `department/update-department/${id}`;
        return axiosClient.patch(url,data);
    },
    deleteJob(id: string) {
        const url = `job/delete-job/${id}`;
        return axiosClient.delete(url);
    },
    deleteDepartment(id: string) {
        const url = `department/delete-department/${id}`;
        return axiosClient.delete(url);
    },
    deleteRole(id: string) {
        const url = `role/delete-role/${id}`;
        return axiosClient.delete(url);
    },
};
