import { ConvertQueryParam } from '@/utils';
import axiosClient from './axiosClient';
import { EmployeeCreateForm, EmployeeEditForm, QueryParam } from '@/models';

const employeeApi = {
    getListEmployee(param?: QueryParam) {
        const url = `employees${ConvertQueryParam(param)}`;
        return axiosClient.get(url);
    },
    getEmployee(id: string | number) {
        const url = `employees/${id}`;
        return axiosClient.get(url);
    },
    createEmployee(data: EmployeeCreateForm) {
        const url = 'employees';
        return axiosClient.post(url, data);
    },
    editEmployee(id: string, data: EmployeeEditForm) {
        const url = `employees/${id}`;
        return axiosClient.patch(url, data);
    },
};
export default employeeApi;
