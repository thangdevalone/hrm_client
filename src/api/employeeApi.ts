import { ConvertQueryParam } from '@/utils';
import axiosClient from './axiosClient';
import { EmployeeCreateForm, EmployeeEditForm, QueryParam } from '@/models';

const employeeApi = {
    getListEmployee(param?: QueryParam) {
        const url = `employee/list-employee${ConvertQueryParam(param)}`;
        return axiosClient.get(url);
    },
    getEmployee(id:string|number) {
        const url = `employee/${id}`;
        return axiosClient.get(url);
    },
    createEmployee(data:EmployeeCreateForm){
        const url="employee/create-employee"
        return axiosClient.post(url,data)
    },
    editEmployee(id:number,data:EmployeeEditForm){
        const url = `employee/update-employee/${id}`;
        return axiosClient.patch(url,data)
    },
};
export default employeeApi;
