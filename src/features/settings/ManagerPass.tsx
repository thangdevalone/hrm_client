import authApi from '@/api/authApi';
import { PasswordField } from '@/components/FormControls';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useInfoUser } from '@/hooks';
import { ChangePass } from '@/models';
import { yupResolver } from '@hookform/resolvers/yup';
import { ReloadIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { Resolver, SubmitHandler, useForm } from 'react-hook-form';
import * as yup from 'yup';

export const ManagerPass = () => {
    const schema_edit = yup.object().shape({
        current_password: yup.string().required('Cần xác thực mật khẩu cũ'),
        new_password: yup
            .string()
            .required('Nhập mật khẩu mới')
            .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
            .matches(/[A-Z]/, 'Mật khẩu mới phải chứa ít nhất 1 ký tự in hoa'),
        re_password: yup
            .string()
            .required('Nhập lại mật khẩu mới')
            .oneOf([yup.ref('new_password')], 'Mật khẩu không khớp'),
    });

    const [loading, setLoading] = useState(false);
    const [loading2, setLoading2] = useState(false);

    const [alert, setAlert] = useState(false);
    const formEdit = useForm<ChangePass>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: yupResolver(schema_edit) as Resolver<ChangePass, any>,
    });
    const user = useInfoUser();
    const { toast } = useToast();

    const handleEdit: SubmitHandler<ChangePass> = (data) => {
        (async () => {
            try {
                if (user && user.EmpID) {
                    setLoading(true);
                    await authApi.changePass(user.EmpID, data);
                    formEdit.reset();
                    toast({
                        title: 'Thành công',
                        description: 'Thay đổi mật khẩu thành công',
                    });
                    setAlert(false);
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                toast({
                    variant: 'destructive',
                    title: 'Có lỗi xảy ra',
                    description: error.error,
                });
            } finally {
                setLoading(false);
            }
        })();
    };

    const handleSendGmail = () => {
        (async () => {
            try {
                if (user) {
                    setLoading2(true);
                    await authApi.forgotPass(user?.Email);
                    toast({
                        title: 'Thành công',
                        description: 'Link đổi mật khẩu đã được gửi vào gmail của bạn',
                    });
                    setAlert(false);
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                toast({
                    variant: 'destructive',
                    title: 'Có lỗi xảy ra',
                    description: error.error,
                });
            } finally {
                setLoading2(false);
            }
        })();
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Quản lý mật khẩu</h3>
                <p className="text-sm text-muted-foreground">
                    Bạn có thể thay đổi mật khẩu và quên mật khẩu ở đây
                </p>
            </div>
            <Separator />
            <Form {...formEdit}>
                <form onSubmit={formEdit.handleSubmit(handleEdit)}>
                    <div className="grid grid-cols-1 lg:max-w-md gap-3 mb-3">
                        <PasswordField
                            name="current_password"
                            label="Mật khẩu cũ"
                            require={true}
                            placeholder={'Nhập mật khẩu cũ'}
                            autoComplete={'on'}
                        />
                        <PasswordField
                            name="new_password"
                            label="Mật khẩu mới"
                            require={true}
                            placeholder={'Nhập mật khẩu mới'}
                            autoComplete={'off'}
                        />
                        <PasswordField
                            name="re_password"
                            label="Xác thực mật khẩu mới"
                            require={true}
                            placeholder={'Nhập lại mật khẩu mới'}
                            autoComplete={'off'}
                        />
                        <AlertDialog open={alert} onOpenChange={setAlert}>
                            <AlertDialogTrigger asChild>
                                <i className="underline text-sm cursor-pointer">
                                    Bạn đã quên mật khẩu?
                                </i>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Quên mật khẩu</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Link đổi mật khẩu sẽ được gửi về gmail của bạn. Truy cập vào
                                        gmail để đổi mật khẩu
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Đóng</AlertDialogCancel>
                                    <Button disabled={loading2} onClick={handleSendGmail} type="submit">
                                        {loading2 && (
                                            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Gửi
                                    </Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                    <Button type="submit">
                        {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />} Đổi mật
                        khẩu
                    </Button>
                </form>
            </Form>
            <div />
        </div>
    );
};
