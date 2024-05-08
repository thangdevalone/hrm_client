/* eslint-disable @typescript-eslint/no-unused-vars */
import scheduleApi from '@/api/scheduleApi';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { STATIC_HOST, STATIC_HOST_NO_SPLASH } from '@/constants';
import StorageKeys from '@/constants/storage-keys';
import { cn } from '@/lib/utils';
import {
    InfoConfigSchedule,
    InfoSchedule,
    InfoScheduleAll,
    InfoWorkShift,
    ListResponse,
} from '@/models';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, ReloadIcon } from '@radix-ui/react-icons';
import { addMonths, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import queryString from 'query-string';
import * as React from 'react';
import { DateRange, DayContentProps, DayPicker } from 'react-day-picker';
import { useLocation, useNavigate } from 'react-router-dom';
export interface DataSetter {
    year: number;
    month: number;
}
export const ScheduleList = () => {
    const defYear = new Date().getFullYear();
    const location = useLocation();
    const param = queryString.parse(location.search);
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
    const [mySchedule, setMySchedule] = React.useState<InfoSchedule[]>();
    const handleYearChange = (value: string) => {
        setDataSetter({ ...dataSetter, year: parseInt(value) });
    };

    const handleSetter = (month: Date) => {
        setDataSetter({ year: month.getFullYear(), month: month.getMonth() + 1 });
    };
    // const { toast } = useToast();
    const [peopleData, setPeopleData] = React.useState<InfoScheduleAll[]>();
    const [listing, setListing] =
        React.useState<Record<string, { [key: string]: number; total: number }>>();

    const [open, setOpen] = React.useState<boolean>(false);
    React.useEffect(() => {
        const newDate = new Date(dataSetter.year, dataSetter.month - 1);
        // Cập nhật state monthSetter với giá trị mới
        setMonthSetter(newDate);
        navigate({ search: `?month=${dataSetter.month}&year=${dataSetter.year}&type=list` });
        location.search = `?month=${dataSetter.month}&year=${dataSetter.year}&type=list`;
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataSetter]);

    React.useEffect(() => {
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
    }, []);
    const fetchData = async () => {
        try {
            const paramString = param
                ? location.search
                : `?month=${dataSetter.month}&year=${dataSetter.year}&type=list`;
            console.log(paramString);
            const scheduleData = (await scheduleApi.getListSchedule(
                paramString
            )) as unknown as ListResponse;
            setMySchedule(scheduleData.data);
        } catch (error) {
            console.log(error);
        }
    };
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: new Date(),
        to: addMonths(new Date(), 1),
    });
    const [titleDialog, setTitleDialog] = React.useState<string>();
    const handleChecker = async (rawDate: Date, shift: string, date: string) => {
        setTitleDialog(`Thông tin ${shift} ngày ${format(rawDate, 'dd/MM/yyyy')}`);
        const data = (await scheduleApi.getListAllSchedule(
            `?day=${date}&workshift=${shift}`
        )) as unknown as InfoScheduleAll[];
        setPeopleData(data);
        setOpen(true);
    };
    const token=localStorage.getItem(StorageKeys.TOKEN)
    const { toast } = useToast();
    const handleExport2 = () => {
        (async () => {
            if (date && date.from && date.to) {
                window.open(
                    `${STATIC_HOST}schedule/schedule-infor?from=${format(
                        date.from,
                        'yyyy-MM-dd'
                    )}&to=${format(date.to, 'yyyy-MM-dd')}&token=${token}`,
                    '_blank',
                    'noreferrer'
                );
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Yêu cầu chọn khoảng ngày',
                });
            }
        })();
    };
    React.useEffect(() => {
        const dateMap: Record<string, { [key: string]: number; total: number }> = {};

        // Lặp qua tất cả các bản ghi trong dữ liệu
        mySchedule?.forEach((item) => {
            const date = item.Date;
            const workShiftName = item.WorkShiftDetail.WorkShiftName;

            // Nếu ngày chưa được thêm vào dateMap, thêm nó vào và khởi tạo các giá trị
            if (!dateMap[date]) {
                dateMap[date] = { total: 0 };
            }

            // Tăng số lượng từng loại workshift cho ngày đó
            if (!dateMap[date][workShiftName]) {
                dateMap[date][workShiftName] = 0;
            }
            dateMap[date][workShiftName] += 1;

            // Tăng tổng số lượng workshift cho ngày đó
            dateMap[date].total += 1;
        });

        setListing(dateMap);
    }, [mySchedule]);
    console.log(listing);

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
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="flex gap-3">
                                    <Icons.sheet /> Xuất dữ liệu
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Chọn khoảng thời gian xuất dữ liệu</DialogTitle>
                                    <DialogDescription>
                                        Nhập tháng và năm cần xuất dữ liệu
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <div className={cn('grid gap-2')}>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        id="date"
                                                        variant={'outline'}
                                                        className={cn(
                                                            'w-[300px] justify-start text-left font-normal',
                                                            !date && 'text-muted-foreground'
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {date?.from ? (
                                                            date.to ? (
                                                                <>
                                                                    {format(date.from, 'LLL dd, y')}{' '}
                                                                    - {format(date.to, 'LLL dd, y')}
                                                                </>
                                                            ) : (
                                                                format(date.from, 'LLL dd, y')
                                                            )
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="w-auto p-0"
                                                    align="start"
                                                >
                                                    <Calendar
                                                        initialFocus
                                                        mode="range"
                                                        defaultMonth={date?.from}
                                                        selected={date}
                                                        onSelect={setDate}
                                                        numberOfMonths={2}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">Đóng</Button>
                                    </DialogClose>
                                    <Button onClick={handleExport2} className="flex gap-3">
                                        <Icons.sheet />
                                        Xuất dữ liệu
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
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
                <Dialog onOpenChange={setOpen} open={open}>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>{titleDialog}</DialogTitle>
                        </DialogHeader>
                        <div>
                            <Table>
                                <TableCaption className="caption-top">Bảng thông tin</TableCaption>
                                <ScrollArea className="h-[400px]">
                                    <TableHeader className="sticky top-0 z-[2] bg-[hsl(var(--background))]">
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Nhân viên</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Phòng ban</TableHead>
                                            <TableHead>Ca đăng ký</TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {peopleData
                                            ? peopleData?.map((item) => (
                                                  <TableRow key={item.EmpID}>
                                                      <TableCell>{item.EmpID}</TableCell>
                                                      <TableCell>
                                                          <div className="flex flex-row items-center gap-2">
                                                              {' '}
                                                              <img
                                                                  src={`${
                                                                      STATIC_HOST_NO_SPLASH +
                                                                      item.PhotoPath
                                                                  }`}
                                                                  alt="avatar"
                                                                  className=" w-8 h-8 border rounded-full"
                                                              />
                                                              <strong>{item.EmployeeName}</strong>
                                                          </div>
                                                      </TableCell>
                                                      <TableCell>{item.Email}</TableCell>
                                                      <TableCell>{item.DepName}</TableCell>
                                                      <TableCell>
                                                          <Badge
                                                              className="text-sm rounded-xl"
                                                              style={{
                                                                  backgroundColor: `${item.WorkShiftDetail.Color}`,
                                                              }}
                                                          >
                                                              {item.WorkShiftDetail.WorkShiftName}
                                                          </Badge>
                                                      </TableCell>
                                                  </TableRow>
                                              ))
                                            : 'Không có dữ liệu'}
                                    </TableBody>
                                </ScrollArea>
                            </Table>
                        </div>
                        <DialogFooter className="sm:justify-start">
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Đóng
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <DayPicker
                    showOutsideDays={true}
                    month={monthSetter}
                    onMonthChange={handleSetter}
                    className={cn('w-full h-full')}
                    locale={vi}
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

                            return (
                                <div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <div
                                                className={cn(
                                                    'relative flex items-center bg  cursor-pointer justify-center rounded-md h-8 w-8 p-0 font-normal aria-selected:opacity-100',
                                                    activeModifiers.today
                                                        ? 'bg-black text-white'
                                                        : 'border'
                                                )}
                                            >
                                                {date.getDate()}
                                                {listing && listing[format(date, 'yyyy-MM-dd')] && (
                                                    <Badge className="bg-black absolute rounded-full top-[-10px] right-[-15px] p-0 flex items-center justify-center w-5 h-5">
                                                        {listing[format(date, 'yyyy-MM-dd')].total}
                                                    </Badge>
                                                )}
                                            </div>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side="right" align="start">
                                            <DropdownMenuLabel>
                                                Xem đăng kí ngày {format(date, 'dd/MM/yyyy')}
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {shift &&
                                                shift.map((item) => (
                                                    <DropdownMenuItem
                                                        className="cursor-pointer"
                                                        key={item.id}
                                                        onClick={() =>
                                                            handleChecker(
                                                                date,
                                                                item.WorkShiftName,
                                                                format(date, 'yyyy-MM-dd')
                                                            )
                                                        }
                                                    >
                                                        <div className="flex w-full flex-row justify-between items-center">
                                                            {item.WorkShiftName}{' '}
                                                            <strong>
                                                                {(listing &&
                                                                    listing[
                                                                        format(date, 'yyyy-MM-dd')
                                                                    ] &&
                                                                    listing[
                                                                        format(date, 'yyyy-MM-dd')
                                                                    ][item.WorkShiftName]) ||
                                                                    0}
                                                            </strong>
                                                        </div>
                                                    </DropdownMenuItem>
                                                ))}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleChecker(
                                                        date,
                                                        'all',
                                                        format(date, 'yyyy-MM-dd')
                                                    )
                                                }
                                                className="cursor-pointer flex justify-between"
                                            >
                                                Xem tất cả{' '}
                                                <strong>
                                                    {(listing &&
                                                        listing[format(date, 'yyyy-MM-dd')] &&
                                                        listing[format(date, 'yyyy-MM-dd')]
                                                            ?.total) ||
                                                        0}
                                                </strong>
                                            </DropdownMenuItem>
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
