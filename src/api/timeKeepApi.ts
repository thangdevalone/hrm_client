import { QueryParam } from '@/models';
import { ConvertQueryParam } from '@/utils';
import axiosClient from './axiosClient';

const timeKeepApi = {
    getListTimeKeepAll(param?: QueryParam) {
        const url = `time-sheets${ConvertQueryParam(param)}`;
        return axiosClient.get(url);
    },

};
export default timeKeepApi;
