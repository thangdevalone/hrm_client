import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { InfoCompany } from '@/models';
import { yupResolver } from '@hookform/resolvers/yup';
import { Resolver, SubmitHandler, useForm } from 'react-hook-form';
import * as yup from 'yup';

export const Organization = () => {
    const phoneRegExp =
        /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;
    const schema = yup.object().shape({
        company_name: yup.string().required('Cần nhập tên đăng nhập'),
        number_emp: yup.number().required('Cần nhập mật khẩu'),
        tax: yup.string().required('Cần nhập mã thuế'),
        phone: yup
            .string()
            .required('Điền số điện thoại')
            .matches(phoneRegExp, 'Số điện thoại không hợp lệ'),
        email: yup.string().email().required('Cần nhập gm ail'),
    });

    const form = useForm<InfoCompany>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: yupResolver(schema) as Resolver<InfoCompany, any>,
        defaultValues: {
            company_name: '',
            number_emp: 0,
            tax: '',
            phone: '',
            email: '',
        },
    });
    const handleLogin: SubmitHandler<InfoCompany> = (data) => {
        console.log(data);
    };
    return (
        <div>
            <h3 className="text-xl font-semibold py-4">Thông tin chung</h3>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-8">
                    <div className="grid lg:grid-cols-4 grid-cols-3 relative gap-5">
                        <FormField
                            control={form.control}
                            name="company_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tên công ty</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nhập tên công ty" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="example@gmail.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <img
                            className="absolute right-[10px]"
                            src="/assets/logo.jpg"
                            alt="logo"
                            style={{ width: '150px' }}
                        />
                    </div>
                    <div className="grid lg:grid-cols-4 md:grid-cols-4 gap-5">
                        <FormField
                            control={form.control}
                            name="number_emp"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Số lượng nhân viên</FormLabel>
                                    <FormControl>
                                        <Input
                                            className="lg:max-w-[200px] md:w-full"
                                            placeholder="Nhập số lượng nhân viên"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="tax"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mã thuế</FormLabel>
                                    <FormControl>
                                        <Input
                                            className="lg:max-w-[200px] md:w-full"
                                            placeholder="Nhập mã thuế"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Số điện thoại</FormLabel>
                                    <FormControl>
                                        <Input
                                            className="max-w-[200px]"
                                            placeholder="Nhập số điện thoại"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button disabled>Lưu</Button>
                </form>
            </Form>
        </div>
    );
};
