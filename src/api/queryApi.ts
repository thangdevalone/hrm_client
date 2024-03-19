import { QueryParam } from '@/models';
import { ConvertQueryParam } from '@/utils';
import axiosClient from './axiosClient';

const queryApi = {
    querySearch(param:QueryParam,type:string) {
        const url = `/query/${type}${ConvertQueryParam(param)}`;
        return axiosClient.get(url);
    },
};
export default queryApi;
