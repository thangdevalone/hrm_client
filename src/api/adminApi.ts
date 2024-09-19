import {
    DepartmentCreateForm,
    DepartmentEditForm,
    InfoAccount,
    JobCreateForm,
    JobEditForm,
    QueryParam,
    RoleCreateForm,
    RoleEditForm,
} from '@/models';
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
        const url = `users${ConvertQueryParam(param)}`;
        return axiosClient.get(url);
    },
    getListLeave(param?: QueryParam) {
        const url = `leave/list-leave${ConvertQueryParam(param)}`;
        return axiosClient.get(url);
    },
    getJob(param?: QueryParam) {
        const url = `jobs${ConvertQueryParam(param)}`;
        return axiosClient.get(url);
    },
    getRole(param?: QueryParam) {
        const url = `roles${ConvertQueryParam(param)}`;
        return axiosClient.get(url);
    },
    getDepartment(param?: QueryParam) {
        const url = `departments${ConvertQueryParam(param)}`;
        return axiosClient.get(url);
    },
    createJob(data: JobCreateForm) {
        const url = 'jobs';
        return axiosClient.post(url, data);
    },
    createRole(data: RoleCreateForm) {
        const url = 'role/create-role';
        return axiosClient.post(url, data);
    },
    createDepartment(data: DepartmentCreateForm) {
        const url = 'departments';
        return axiosClient.post(url, data);
    },
    editAccount(id: string, data: InfoAccount) {
        const url = `account/update-account/${id}`;
        return axiosClient.patch(url, data);
    },
    editJob(id: string, data: JobEditForm) {
        const url = `jobs/${id}`;
        return axiosClient.patch(url, data);
    },
    editRole(id: number, data: RoleEditForm) {
        const url = `role/update-role/${id}`;
        return axiosClient.patch(url, data);
    },
    editDepartment(id: string, data: DepartmentEditForm) {
        const url = `departments/${id}`;
        return axiosClient.patch(url, data);
    },
    deleteJob(id: string) {
        const url = `jobs/${id}`;
        return axiosClient.delete(url);
    },
    deleteDepartment(id: string) {
        const url = `departments/${id}`;
        return axiosClient.delete(url);
    },
    deleteRole(id: string) {
        const url = `role/delete-role/${id}`;
        return axiosClient.delete(url);
    },
};
