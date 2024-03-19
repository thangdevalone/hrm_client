import employeeApi from '@/api/employeeApi';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useInfoUser } from '@/hooks';
import { EmployeeEditDetailForm, InforUser } from '@/models';
import { yupResolver } from '@hookform/resolvers/yup';
import dayjs from 'dayjs';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import * as yup from 'yup';
import { authActions } from '../auth/AuthSlice';
import { ReloadIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { STATIC_HOST_NO_SPLASH } from '@/constants';
import {
    BankField,
    CalendarTypingField,
    SearchField,
    SelectionField,
    TextField,
} from '@/components/FormControls';
import { SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { colorBucket } from '@/utils';
import { Form } from '@/components/ui/form';
export const Profile = () => {
    const user = useInfoUser();
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const { toast } = useToast();
    useEffect(() => {
        if (user) {
            formEdit.setValue('EmpID', user.EmpID);
            formEdit.setValue('EmpName', user.EmpName);
            formEdit.setValue('Phone', user.Phone);
            formEdit.setValue('HireDate', user.HireDate);
            formEdit.setValue('BirthDate', user.BirthDate);
            formEdit.setValue('Address', user.Address);
            formEdit.setValue('Email', user.Email);
            formEdit.setValue('EmpStatus', user.EmpStatus);
            formEdit.setValue('Gender', user.Gender);
            formEdit.setValue('TaxCode', user.TaxCode);
            formEdit.setValue('CCCD', user.CCCD);
            formEdit.setValue('BankAccountNumber', user.BankAccountNumber);
            formEdit.setValue('BankName', user.BankName?.toUpperCase());
            formEdit.setValue('DepID', user.DepID);
            formEdit.setValue('JobID', user.JobID);
            formEdit.setValue('RoleID', user.RoleID);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const phoneRegExp =
        /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;
    const schema_edit = yup.object().shape({
        EmpName: yup.string().required('Cần nhập tên tài khoản'),
        Email: yup.string().email('Gmail không hợp lệ').required('Cần nhập gmail'),
        CCCD: yup
            .string()
            .required('Cần nhận căn cước công dân')
            .test(
                'is-valid-length',
                'CCCD/CMND phải có độ dài 12 ký tự',
                (value) => value.length === 12
            ),
        DepID: yup.number().required('Cần nhập tên phòng ban'),
        JobID: yup.number().required('Cần nhập tên công việc'),
        RoleID: yup.number().required('Cần nhập vị trí'),
        EmpStatus: yup.string().required('Cần chọn hình thức'),
        Phone: yup
            .string()
            .matches(phoneRegExp, 'Số điện thoại không hợp lệ')
            .min(9, 'Quá ngắn')
            .max(11, 'Quá dài'),
    });
    const formEdit = useForm<EmployeeEditDetailForm>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: yupResolver(schema_edit) as Resolver<EmployeeEditDetailForm, any>,
    });
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setImageData(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleEditButtonClick = () => {
        // Khi người dùng nhấn nút chỉnh sửa, gọi click() trên input để mở hộp thoại chọn tệp
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    const [imageData, setImageData] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleEdit: SubmitHandler<EmployeeEditDetailForm> = (data) => {
        (async () => {
            try {
                setLoading(true);
                const { EmpID, ...postData } = data;
                const reData: EmployeeEditDetailForm = {
                    ...postData,

                    BirthDate: dayjs(data.BirthDate).format('DD/MM/YYYY'),
                    HireDate: dayjs(data.HireDate).format('DD/MM/YYYY'),
                };
                if (imageData) {
                    reData.PhotoPath = imageData;
                }
                if (EmpID) {
                    const res = await employeeApi.editEmployee(EmpID, reData);
                    if (EmpID === user?.EmpID) {
                        dispatch(authActions.setUser(res.data[0] as unknown as InforUser));
                    }
                }
                setImageData(null);
                toast({
                    title: 'Thành công',
                    description: 'Sửa thông tin thành công',
                });
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
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Thông tin cá nhân</h3>
                <p className="text-sm text-muted-foreground">
                    Sửa đổi cập nhật thông tin không chỉ liên quan đến cá nhân mà còn liên quan đến
                    công việc
                </p>
            </div>
            <Separator />
            <div />
            <Form {...formEdit}>
                <form onSubmit={formEdit.handleSubmit(handleEdit)}>
                    <div className="flex flex-row gap-10">
                        <div>
                            <div className="ml-1 mr-3">
                                <div className="mb-3">
                                    <p className="mb-2 text-lg font-semibold">Thông tin chung</p>
                                    <div className="flex flex-row gap-5">
                                        <div>
                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                <TextField
                                                    name="EmpName"
                                                    label="Tên nhân viên"
                                                    placeholder="Nhập tên nhân viên"
                                                    require={true}
                                                />
                                                <TextField
                                                    name="Email"
                                                    label="Email"
                                                    placeholder="Nhập email"
                                                    require={true}
                                                    type="email"
                                                />
                                                <TextField
                                                    name="CCCD"
                                                    label="Số CCCD/CMND"
                                                    placeholder="Nhập CCCD/CMND"
                                                    require={true}
                                                />
                                                <SelectionField
                                                    name="Gender"
                                                    label="Giới tính"
                                                    placeholder="Chọn giới tính"
                                                >
                                                    <SelectItem value="Nam">Nam</SelectItem>
                                                    <SelectItem value="Nữ">Nữ</SelectItem>
                                                    <SelectItem value="Không xác định">
                                                        Không xác định
                                                    </SelectItem>
                                                </SelectionField>

                                                <TextField
                                                    name="TaxCode"
                                                    label="Mã số thuế"
                                                    placeholder="Nhập mã số thuế"
                                                />
                                                <TextField
                                                    name="Address"
                                                    label="Địa chỉ"
                                                    placeholder="Nhập địa chỉ"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <BankField
                                                    name="BankName"
                                                    label="Tên ngân hàng"
                                                    placeholder="Chọn ngân hàng"
                                                />
                                                <div className="grid grid-cols-2 gap-3">
                                                    <TextField
                                                        name="BankAccountNumber"
                                                        label="Số tài khoản"
                                                        placeholder="Nhập số tài khoản"
                                                    />
                                                    <TextField
                                                        name="Phone"
                                                        label="Số điện thoại"
                                                        placeholder="Nhập điện thoại"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <p className="mb-2 text-lg font-semibold">
                                        Thông tin công việc
                                    </p>
                                    <div className="grid grid-cols-3 gap-3 ">
                                        <SearchField
                                            name="DepID"
                                            label="Phòng ban"
                                            placeholder="Chọn phòng ban"
                                            typeApi="department"
                                            require={true}
                                            disabled={true}
                                        />
                                        <SearchField
                                            name="JobID"
                                            label="Chức vụ"
                                            placeholder="Chọn chức vụ"
                                            typeApi="job"
                                            require={true}
                                            disabled={true}
                                        />
                                        <SearchField
                                            name="RoleID"
                                            label="Vai trò"
                                            placeholder="Chọn vai trò"
                                            typeApi="role"
                                            require={true}
                                            disabled={true}
                                        />

                                        <SelectionField
                                            label="Hình thức"
                                            name="EmpStatus"
                                            placeholder="Chọn hình thức"
                                            require={true}
                                            disabled={true}
                                        >
                                            <SelectItem value="Toàn thời gian">
                                                <Badge
                                                    className={`${colorBucket['Toàn thời gian']} hover:${colorBucket['Toàn thời gian']}`}
                                                >
                                                    Toàn thời gian
                                                </Badge>
                                            </SelectItem>
                                            <SelectItem value="Bán thời gian">
                                                <Badge
                                                    className={`${colorBucket['Bán thời gian']} hover:${colorBucket['Bán thời gian']}`}
                                                >
                                                    Bán thời gian
                                                </Badge>
                                            </SelectItem>
                                            <SelectItem value="Thực tập sinh">
                                                <Badge
                                                    className={`${colorBucket['Thực tập sinh']} hover:${colorBucket['Thực tập sinh']}]`}
                                                >
                                                    Thực tập sinh
                                                </Badge>
                                            </SelectItem>
                                            <SelectItem value="Ngưng làm việc">
                                                <Badge
                                                    className={`${colorBucket['Ngưng làm việc']} hover:${colorBucket['Ngưng làm việc']}`}
                                                >
                                                    Ngưng làm việc
                                                </Badge>
                                            </SelectItem>
                                        </SelectionField>
                                        <CalendarTypingField
                                            disabled={true}
                                            name="HireDate"
                                            label="Ngày gia nhập"
                                        />
                                        <CalendarTypingField name="BirthDate" label="Ngày sinh" />
                                    </div>
                                </div>
                            </div>
                            <div className="text-start my-4 mr-3">
                                <p className="text-muted-foreground text-sm mb-3">
                                    Lưu ý: Tất cả các trường trên trang này là tùy chọn và có thể bị
                                    xóa bất kỳ lúc nào và bằng cách điền vào chúng, bạn đồng ý cho
                                    chúng tôi chia sẻ dữ liệu này cho người quản lí và những người
                                    cấp trên của bạn.
                                </p>
                                <Button type="submit">
                                    {loading && (
                                        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                                    )}{' '}
                                    Cập nhật hồ sơ
                                </Button>
                            </div>
                        </div>
                        <div className="relative ml-20 w-fit h-fit">
                            <Avatar className="w-[150px] border h-[150px]">
                                <AvatarImage
                                    className="object-cover"
                                    src={`${imageData || STATIC_HOST_NO_SPLASH + user?.PhotoPath}`}
                                />
                                <AvatarFallback>{user?.EmpName}</AvatarFallback>
                            </Avatar>
                            <Button
                                className="absolute px-2 bottom-[0px] left-[-30px] bg-white dark:bg-secondary"
                                variant="outline"
                                type="button"
                                size="sm"
                                onClick={handleEditButtonClick}
                            >
                                <Pencil className="mr-1 w-[15px]" /> Chỉnh sửa
                                <input
                                    hidden
                                    onChange={handleFileChange}
                                    type="file"
                                    accept="image/*"
                                    multiple={false}
                                    ref={fileInputRef}
                                />
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
};
