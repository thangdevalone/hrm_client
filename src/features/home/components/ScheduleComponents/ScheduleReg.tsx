/* eslint-disable @typescript-eslint/no-unused-vars */
import scheduleApi from '@/api/scheduleApi';
import { useTheme } from '@/components/theme-provider';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useInfoUser } from '@/hooks';
import { cn } from '@/lib/utils';
import {
    InfoConfigSchedule,
    InfoSchedule,
    InfoWorkShift,
    ListResponse,
    ScheduleCreateForm,
} from '@/models';
import {
    getNowSunday,
    isTimeAfterNowOnSunday,
    isWithinThisWeek
} from '@/utils';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Check, Lock } from 'lucide-react';
import queryString from 'query-string';
import * as React from 'react';
import { DayContentProps, DayPicker } from 'react-day-picker';
import { useLocation, useNavigate } from 'react-router-dom';
import {toast as toastSonner} from 'sonner'
interface DataSetter {
    year: number;
    month: number;
}

export const ScheduleReg = () => {
    const defYear = new Date().getFullYear();
    const location = useLocation();
    const param = queryString.parse(location.search);
    const user = useInfoUser();
    const [dataSetter, setDataSetter] = React.useState<DataSetter>({
        year: param && param.year ? Number(param.year) : new Date().getFullYear(),
        month: param && param.month ? Number(param.month) : new Date().getMonth() + 1,
    });
    const navigate = useNavigate();
    const [usingConfig, setUsingConfig] = React.useState<InfoConfigSchedule>();
    const [shift, setShift] = React.useState<InfoWorkShift[]>();
    const [monthSetter, setMonthSetter] = React.useState<Date>(
        param ? new Date(dataSetter.year, dataSetter.month - 1) : new Date()
    );
    const handleMonthChange = (value: string) => {
        setDataSetter({ ...dataSetter, month: parseInt(value) });
    };
    const sunday = getNowSunday();
    const [mySchedule, setMySchedule] = React.useState<InfoSchedule[]>();
    const handleYearChange = (value: string) => {
        setDataSetter({ ...dataSetter, year: parseInt(value) });
    };

    const handleSetter = (month: Date) => {
        setDataSetter({ year: month.getFullYear(), month: month.getMonth() + 1 });
    };
    const { toast } = useToast();

    React.useEffect(() => {
        const newDate = new Date(dataSetter.year, dataSetter.month - 1);
        // Cập nhật state monthSetter với giá trị mới
        setMonthSetter(newDate);
        navigate({ search: `?month=${dataSetter.month}&year=${dataSetter.year}&type=reg` });
        location.search = `?month=${dataSetter.month}&year=${dataSetter.year}&type=reg`;
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataSetter]);
    const fetchData = async () => {
        try {
            const paramString = param
                ? location.search
                : `?month=${dataSetter.month}&year=${dataSetter.year}&type=reg`;
            console.log(paramString);
            const scheduleData = (await scheduleApi.getListSchedule(
                paramString
            )) as unknown as ListResponse;
            setMySchedule(scheduleData.data);
        } catch (error) {
            console.log(error);
        }
    };
    React.useEffect(() => {
        fetchData();

        if (!localStorage.getItem('showScheduleColor')) {
            localStorage.setItem('showScheduleColor', 'true');
            setShowScheduleColor(true);
        }
        if (!localStorage.getItem('showShowBadge')) {
            localStorage.setItem('showShowBadge', 'true');
            setShowBadge(true);
        }
        (async () => {
            try {
                const [workShiftData, configData] = await Promise.all([
                    scheduleApi.getListWorkShift() as unknown as ListResponse,
                    scheduleApi.getListConfigTrue() as unknown as InfoConfigSchedule[],
                ]);
                setShift(workShiftData.data);
                setUsingConfig(configData[0]);
            } catch (error) {
                console.log(error);
            }
        })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [showBadge, setShowBadge] = React.useState(
        localStorage.getItem('showBadge') === 'true' ? true : false
    );
    const [showScheduleColor, setShowScheduleColor] = React.useState(
        localStorage.getItem('showScheduleColor') === 'true' ? true : false
    );
    const handleReg = async (date: Date, data: InfoWorkShift) => {
        try {
            if (user && user?.EmpID !== undefined) {
                const dateReg = format(date, 'yyyy-MM-dd');
                const postData: ScheduleCreateForm = {
                    EmpID: user?.EmpID,
                    WorkShift: data.id,
                    Date: dateReg,
                };
                await scheduleApi.createSchedule(postData);
                toastSonner.success(`Đăng kí ${data.WorkShiftName} vào ${dateReg} thành công!`,{closeButton:true})
                fetchData();
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Có lỗi xảy ra',
            });
        }
    };
    const handleRegStatus = (status: boolean | undefined) => {
        if (status == true) {
            toast({
                variant: 'destructive',
                title: 'Bị khóa',
                description: 'Đã quá thời gian đăng kí lịch',
            });
        }
    };
    const logic = (date: Date) => {
        if (mySchedule === undefined) return { logic: false, find: null, color: null };
        const find = mySchedule.find((ck) => ck.Date === format(date, 'yyyy-MM-dd'));
        const res = Boolean(mySchedule && find);
        return {
            logic: res || false,
            find: find || null,
            color: find?.WorkShiftDetail.Color || null,
        };
    };
    const theme=useTheme()
    const BadgeRender = (props: { date: Date }) => {
        const data = logic(props.date);
        return (
            <>
                {data.logic && data.find && (
                    <Badge
                        style={{
                            backgroundColor: data.find.WorkShiftDetail.Color,
                        }}
                        className="absolute w-max top-[-15px] right-[-60px]"
                    >
                        {data.find.WorkShiftDetail.WorkShiftName}
                    </Badge>
                )}
            </>
        );
    };
    const handleShowBadge = () => {
        localStorage.setItem('showBadge', JSON.stringify(!showBadge));
        setShowBadge((prev: boolean) => !prev);
    };
    const handleShowScheduleColor = () => {
        localStorage.setItem('showScheduleColor', JSON.stringify(!showScheduleColor));
        setShowScheduleColor((prev: boolean) => !prev);
    };
    const handleDel = async (data: InfoSchedule | undefined) => {
        console.log(data);
        try {
            if (data && data.id) {
                await scheduleApi.deleteSchedule(data.id);
                toastSonner.success(`Hủy đăng kí ${data.WorkShiftDetail.WorkShiftName} vào ${format(
                    data.Date,
                    'dd/MM/yyyy'
                )} thành công!`)
                fetchData();
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Có lỗi xảy ra',
            });
        }
    };
    return (
        <div className="w-full">
            <div style={{ height: 'calc(100vh - 180px)' }}>
                <div className="flex flex-row  mb-5  items-end justify-between">
                    <div className="flex flex-row items-end gap-5">
                        <div>
                            <Label>Tháng: </Label>
                            <Select
                                value={dataSetter.month.toString()}
                                onValueChange={handleMonthChange}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <SelectItem key={i + 1} value={`${i + 1}`}>
                                            {i + 1}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Năm: </Label>
                            <Select
                                value={dataSetter.year.toString()}
                                onValueChange={handleYearChange}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 6 }, (_, i) => (
                                        <SelectItem key={i} value={`${defYear - 2 + i}`}>
                                            {defYear - 2 + i}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2 ml-10">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    checked={showBadge}
                                    onClick={handleShowBadge}
                                    id="showBadge"
                                />
                                <Label
                                    htmlFor="showBadge"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Show badge
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    checked={showScheduleColor}
                                    onClick={handleShowScheduleColor}
                                    id="showScheduleColor"
                                />
                                <Label
                                    htmlFor="showScheduleColor"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Show background color
                                </Label>
                            </div>
                        </div>
                    </div>
                    <div>
                        {usingConfig && (
                            <div className="flex flex-col">
                                <p>
                                    Ngày tối thiểu: <strong>{usingConfig.DateMin}</strong> ngày
                                </p>
                                <p>
                                    Khóa đăng kí vào:{' '}
                                    <strong>{usingConfig.TimeBlock} Chủ nhật</strong>
                                </p>
                            </div>
                        )}{' '}
                    </div>
                </div>

                <DayPicker
                    showOutsideDays={true}
                    month={monthSetter}
                    onMonthChange={handleSetter}
                    className={cn('w-full h-full')}
                    locale={vi}
                    disabled={(date) => {
                        if (
                            isWithinThisWeek(date) &&
                            usingConfig &&
                            isTimeAfterNowOnSunday(usingConfig?.TimeBlock, sunday)
                        ) {
                            return true;
                        }
                        return date < sunday ? true : false;
                    }}
                    classNames={{
                        months: 'flex w-full h-full flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                        month: 'space-y-4 flex-1',
                        caption: 'flex justify-center h-fit  relative items-center',
                        caption_label: 'text-base font-medium',
                        nav: 'space-x-1 flex items-center',
                        nav_button: cn(buttonVariants({ variant: 'default' }), 'h-9 w-9 p-0 '),
                        nav_button_previous: 'absolute left-1',
                        nav_button_next: 'absolute right-1',
                        table: 'w-full h-full border-collapse space-y-1',
                        head_row: 'flex ',
                        head_cell: 'flex-1 rounded-md  font-bold text-base ',
                        row: 'flex w-full my-4',
                        cell: cn(
                            'relative flex-1 p-0 mx-4 text-center text-base focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md',

                            '[&:has([aria-selected])]:rounded-md'
                        ),
                        tbody: 'h-full',
                        day: 'flex items-center justify-center',
                        day_range_start: 'day-range-start',
                        day_range_end: 'day-range-end',
                        day_selected:
                            'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                        day_outside:
                            'day-outside text-muted-foreground opacity-50  aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
                        day_disabled: 'text-muted-foreground opacity-50',
                        day_range_middle:
                            'aria-selected:bg-accent aria-selected:text-accent-foreground',
                        day_hidden: 'invisible',
                    }}
                    components={{
                        IconLeft: ({ ...props }) => <ChevronLeftIcon className="h-5 w-5" />,
                        IconRight: ({ ...props }) => <ChevronRightIcon className="h-5 w-5" />,
                        DayContent: (...props) => {
                            const { date, activeModifiers } =
                                props[0] as unknown as DayContentProps;
                            console.log();
                            return (
                                <div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger
                                            onClick={() =>
                                                handleRegStatus(activeModifiers.disabled)
                                            }
                                            disabled={activeModifiers.disabled}
                                            asChild
                                        >
                                            <div
                                                className={cn(
                                                    'relative flex items-center bg  cursor-pointer justify-center rounded-md h-8 w-8 p-0 font-normal aria-selected:opacity-100',
                                                    activeModifiers.today
                                                        ? 'bg-black border text-white'
                                                        : 'border',(showScheduleColor && logic(date)?.color)?"text-white":""
                                                )}
                                                style={{
                                                    backgroundColor: `${
                                                        (showScheduleColor && logic(date)?.color) ||
                                                        ''
                                                    }`,
                                                }}
                                            >
                                                {activeModifiers.disabled && (
                                                    <div className="absolute top-[-12px] z-[2] left-[-7px]">
                                                        <Lock
                                                            fill={theme.theme=="light"?"white":"black"}
                                                            className="w-5"
                                                      
                                                            stroke={theme.theme=="light"?"black":"white"}
                                                        />
                                                    </div>
                                                )}
                                                {date.getDate()}
                                                {showBadge && <BadgeRender date={date} />}
                                            </div>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side="right" align="start">
                                            <DropdownMenuLabel>
                                                Đăng kí ngày {format(date, 'dd/MM/yyyy')}
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {shift &&
                                                shift.map((item) => (
                                                    <DropdownMenuItem
                                                        className="cursor-pointer"
                                                        key={item.id}
                                                        onClick={() => handleReg(date, item)}
                                                    >
                                                        <div className="flex w-full flex-row justify-between items-center">
                                                            <Badge
                                                                style={{
                                                                    backgroundColor: item.Color,
                                                                }}
                                                            >
                                                                {item.WorkShiftName}
                                                            </Badge>
                                                            <Check
                                                                className={cn(
                                                                    ' h-4 w-4',
                                                                    mySchedule &&
                                                                        mySchedule.find(
                                                                            (ck) =>
                                                                                ck.Date ===
                                                                                    format(
                                                                                        date,
                                                                                        'yyyy-MM-dd'
                                                                                    ) &&
                                                                                item.WorkShiftName ==
                                                                                    ck
                                                                                        .WorkShiftDetail
                                                                                        .WorkShiftName
                                                                        )
                                                                        ? 'opacity-100'
                                                                        : 'opacity-0'
                                                                )}
                                                            />
                                                        </div>
                                                    </DropdownMenuItem>
                                                ))}
                                            {shift &&
                                                shift.map((item) => {
                                                    const scheduledShift =
                                                        mySchedule &&
                                                        mySchedule.find(
                                                            (ck) =>
                                                                ck.Date ===
                                                                    format(date, 'yyyy-MM-dd') &&
                                                                item.WorkShiftName ===
                                                                    ck.WorkShiftDetail.WorkShiftName
                                                        );

                                                    return (
                                                        scheduledShift && (
                                                            <React.Fragment key={scheduledShift.id}>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleDel(scheduledShift)
                                                                    }
                                                                    className="cursor-pointer flex justify-between"
                                                                >
                                                                    Hủy đăng kí
                                                                </DropdownMenuItem>
                                                            </React.Fragment>
                                                        )
                                                    );
                                                })}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            );
                        },
                    }}
                />
            </div>
        </div>
    );
};
