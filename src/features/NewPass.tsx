import authApi from '@/api/authApi';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { InputPassword } from '@/components/ui/inputPassword';
import { useToast } from '@/components/ui/use-toast';
import { yupResolver } from '@hookform/resolvers/yup';
import { ReloadIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup';
import { authActions } from './auth/AuthSlice';
export interface NewPassForm {
    password: string;
    password2: string;
}
export const NewPass = () => {
    const { token } = useParams();
    const schema_edit = yup.object().shape({
        password: yup
            .string()
            .required('Nhập mật khẩu mới')
            .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
            .matches(/[A-Z]/, 'Mật khẩu mới phải chứa ít nhất 1 ký tự in hoa'),
        password2: yup
            .string()
            .required('Nhập lại mật khẩu mới')
            .oneOf([yup.ref('password')], 'Mật khẩu không khớp'),
    });
    const formEdit = useForm<NewPassForm>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: yupResolver(schema_edit) as Resolver<NewPassForm, any>,
    });
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const handleChange: SubmitHandler<NewPassForm> = (data) => {
        (async () => {
            try {
                if (token) {
                    setLoading(true);
                    await authApi.resetPass(token, data);
                    formEdit.reset();
                    toast({
                        title: 'Thay đổi mật khẩu thành công',
                        description: 'Chuyển về trang login sau 2s',
                    });
                    setTimeout(() => {
                        dispatch(authActions.logout());
                        navigate('/login', { replace: true });
                    }, 2000);
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
    return (
        <>
            <div className="lg:p-8 lg mt-10">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">Quên mật khẩu</h1>
                        <p className="text-sm text-muted-foreground">
                            Nhập mật khẩu mới để đổi lại mật khẩu của bạn
                        </p>
                    </div>
                    <Form {...formEdit}>
                        <form onSubmit={formEdit.handleSubmit(handleChange)} className="space-y-4">
                            <FormField
                                control={formEdit.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mật khẩu mới</FormLabel>
                                        <FormControl>
                                            <InputPassword
                                                placeholder="Nhập mật khẩu mới"
                                                {...field}
                                                autoComplete="password"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={formEdit.control}
                                name="password2"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                                        <FormControl>
                                            <InputPassword
                                                placeholder="Nhập lại mật khẩu mới"
                                                {...field}
                                                autoComplete="password"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={loading} className="w-full ">
                                {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}{' '}
                                Đổi mật khẩu
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </>
    );
};
