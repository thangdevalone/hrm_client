import { useAppSelector } from '@/app/hooks';
import { InforUser } from '@/models';

export const useInfoUser = (): InforUser | undefined => {
    const user = useAppSelector((state) => state.auth.currentUser);
    return user;
};
