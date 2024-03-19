/* eslint-disable react-hooks/exhaustive-deps */
import employeeApi from '@/api/employeeApi';
import {
    BankField,
    CalendarTypingField,
    SearchField,
    SelectionField,
    TextField,
} from '@/components/FormControls';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SelectItem } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { STATIC_HOST_NO_SPLASH } from '@/constants';
import { authActions } from '@/features/auth/AuthSlice';
import { useInfoUser } from '@/hooks';
import { EmployeeEditDetailForm, InforEmployee, InforUser } from '@/models';
import { colorBucket } from '@/utils';
import { yupResolver } from '@hookform/resolvers/yup';
import { ReloadIcon } from '@radix-ui/react-icons';
import dayjs from 'dayjs';
import { Pencil } from 'lucide-react';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import * as yup from 'yup';
export const EmployeeDetail = () => {
    const { idEmp } = useParams();
    const [info, setInfo] = useState<InforEmployee>();
    useEffect(() => {
        (async () => {
            try {
                if (idEmp) {
                    const data = (await employeeApi.getEmployee(idEmp)) as unknown as InforEmployee;
                    setInfo(data);
                    formEdit.setValue('EmpID', data.EmpID);
                    formEdit.setValue('EmpName', data.EmpName);
                    formEdit.setValue('Phone', data.Phone);
                    formEdit.setValue('HireDate', data.HireDate);
                    formEdit.setValue('BirthDate', data.BirthDate);
                    formEdit.setValue('Address', data.Address);
                    formEdit.setValue('Email', data.Email);
                    formEdit.setValue('EmpStatus', data.EmpStatus);
                    formEdit.setValue('Gender', data.Gender);
                    formEdit.setValue('TaxCode', data.TaxCode);
                    formEdit.setValue('CCCD', data.CCCD);
                    formEdit.setValue('BankAccountNumber', data.BankAccountNumber);
                    formEdit.setValue('BankName', data.BankName?.toUpperCase());
                    formEdit.setValue('DepID', data.DepID);
                    formEdit.setValue('JobID', data.JobID);
                    formEdit.setValue('RoleID', data.RoleID);
                    console.log(formEdit.getValues('DepID'), data);
                }
            } catch (error) {
                console.log(error);
            }
        })();
    }, []);
    const [imageData, setImageData] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const dispatch = useDispatch();
    const user = useInfoUser();
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
                toast({
                    title: 'Thành công',
                    description: 'Sửa nhân viên thành công',
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
        <div className="flex flex-row gap-5">
            <ScrollArea className="flex-1" style={{ height: 'calc(100vh - 120px)' }}>
                <div className=" space-y-6">
                    <div>
                        <h3 className="text-xl mb-1 font-medium">Thông tin nhân viên</h3>
                        <p className="text-sm text-muted-foreground">
                            Chỉnh sửa thông tin nhân viên và xem chi tiết các thông tin liên quan
                        </p>
                    </div>
                    <Separator />
                    <Form {...formEdit}>
                        <form onSubmit={formEdit.handleSubmit(handleEdit)}>
                            <div className="ml-1 mr-3">
                                <div className="mb-3">
                                    <p className="mb-2 text-lg font-semibold">Thông tin chung</p>
                                    <div className="grid grid-cols-3 gap-3 mb-3">
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
                                <div className="mb-2">
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
                                        />
                                        <SearchField
                                            name="JobID"
                                            label="Chức vụ"
                                            placeholder="Chọn chức vụ"
                                            typeApi="job"
                                            require={true}
                                        />
                                        <SearchField
                                            name="RoleID"
                                            label="Vai trò"
                                            placeholder="Chọn vai trò"
                                            typeApi="role"
                                            require={true}
                                        />

                                        <SelectionField
                                            label="Hình thức"
                                            name="EmpStatus"
                                            placeholder="Chọn hình thức"
                                            require={true}
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
                                            name="HireDate"
                                            label="Ngày gia nhập"
                                        />
                                        <CalendarTypingField name="BirthDate" label="Ngày sinh" />
                                    </div>
                                </div>
                                <div>
                                    <p className="mb-2 text-lg font-semibold">Ảnh đại diện</p>
                                    <div className="relative w-fit">
                                        <Avatar className="w-[150px] border h-[150px]">
                                            <AvatarImage
                                                className="object-cover"
                                                src={`${
                                                    imageData ||
                                                    STATIC_HOST_NO_SPLASH + info?.PhotoPath
                                                }`}
                                            />
                                            <AvatarFallback>{info?.EmpName}</AvatarFallback>
                                        </Avatar>
                                        <Button
                                            className="absolute px-2 bottom-[0px] right-[-50px] bg-white dark:bg-secondary"
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
                            </div>
                            <div className="text-end my-4 mr-3">
                                <Button type="submit">
                                    {loading && (
                                        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                                    )}{' '}
                                    Lưu thay đổi
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </ScrollArea>
            <Separator orientation="vertical" className="h-screen" />
            <div className="flex-1 space-y-6">
                <div>
                    <h3 className="text-xl mb-1 font-medium">Tổng quan</h3>
                    <p className="text-sm text-muted-foreground">
                        Tổng quan công việc của nhân viên, thành tích, hiệu suất,...
                    </p>
                </div>
                <Separator />
            </div>
        </div>
    );
};
