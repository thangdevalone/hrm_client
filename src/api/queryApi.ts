import axiosClient from './axiosClient';

const queryApi = {
    querySearch(type: string) {
        const url = `/query/${type}`;
        return axiosClient.get(url);
    },
};
export default queryApi;
