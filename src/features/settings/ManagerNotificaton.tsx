import { Separator } from '@/components/ui/separator';

export const ManagerNotification = () => {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Quản lý thông báo</h3>
                <p className="text-sm text-muted-foreground">
                    Có thể bật tắt những thông báo không cần thiết
                </p>
            </div>
            <Separator />
            <div />
        </div>
    );
};
