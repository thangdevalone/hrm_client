import { useAppSelector } from '@/app/hooks';
import { InfoUser } from '@/models';

export const useInfoUser = (): InfoUser | undefined => {
    return useAppSelector((state) => state.auth.currentUser);
};
