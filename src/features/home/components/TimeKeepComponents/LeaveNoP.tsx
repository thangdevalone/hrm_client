/* eslint-disable react-hooks/exhaustive-deps */
import timeKeepApi from '@/api/timeKeepApi';
import { RangeCalendarField } from '@/components/FormControls';
import { Icons } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { STATIC_HOST_NO_SPLASH } from '@/constants';
import { NoAttendance, QueryParam } from '@/models';
import { ConvertQueryParam } from '@/utils';
import { yupResolver } from '@hookform/resolvers/yup';
import { format } from 'date-fns';
import { debounce } from 'lodash';
import queryString from 'query-string';
import { useCallback, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
interface FilterDateForm {
    dateRange?: string;
}
interface FilterDate {
    from: string;
    to: string;
}
export const LeaveNoP = () => {
    const [data, setData] = useState<NoAttendance[]>();
    const [filterDate, setFilterDate] = useState<FilterDate | undefined>();
    const [query, setQuery] = useState();
    const [queryLodash, setQueryLodash] = useState<string>();
    const navigate = useNavigate();
    const debouncedSetQuery = useCallback(
        debounce((value) => setQuery(value), 500),
        []
    );
    const location = useLocation();
    const handleNavigateQuery = () => {
        let paramObject: QueryParam = {};
        if (filterDate) {
            paramObject = {
                query: query,
                from: filterDate.from,
                to: filterDate.to,
            };
        } else {
            paramObject = {
                query: query,
            };
        }
        const newSearch = ConvertQueryParam(paramObject);
        navigate({ search: newSearch });
        location.search = newSearch;
    };
    const fetchData = () => {
        (async () => {
            try {
                const parsed = queryString.parse(
                    location.search ? location.search : '?query='
                ) as unknown as QueryParam;
                const res = (await timeKeepApi.listNoAttendance(parsed)) as {
                    data: NoAttendance[];
                };
                setData(res.data);
            } catch (error) {
                console.log(error);
            }
        })();
    };
    const [dataTrigger, setDataTrigger] = useState<NoAttendance>();
    useEffect(() => {
        handleNavigateQuery();
        fetchData();
    }, [query, filterDate]);
    const schema_date = yup.object().shape({
        dateRange: yup
            .string()
            .test('Check-end-date', 'Cần đủ ngày bắt đầu và ngày kết thúc', (value) => {
                if (!value) {
                    return true;
                }
                if (value) {
                    const [startDate, endDate] = value.split('-');
                    if (startDate && endDate) {
                        return true;
                    }
                    if (startDate && !endDate) {
                        return new yup.ValidationError('Cần chọn ngày kết thúc', null, 'dateRange');
                    }
                    if (!startDate && endDate) {
                        return new yup.ValidationError('Cần chọn ngày bắt đầu', null, 'dateRange');
                    }
                }
            }),
    });
    const FormDateFilter = useForm<FilterDateForm>({
        resolver: yupResolver(schema_date),
    });
    const handleFilter: SubmitHandler<FilterDateForm> = (data) => {
        if (data.dateRange) {
            const [startDateString, endDateString]: string[] = data.dateRange.split('-');

            // Convert each part into yyyy-mm-dd format
            const convertToISODate = (dateString: string): string => {
                const [day, month, year]: string[] = dateString.split('/');
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            };
            const startDateISO: string = convertToISODate(startDateString);
            const endDateISO: string = convertToISODate(endDateString);
            setFilterDate({ from: startDateISO, to: endDateISO });
        } else {
            setFilterDate(undefined);
        }
    };
    return (
        <>
            <Sheet>
                <div className="flex flex-row gap-3 px-4">
                    <Input
                        placeholder="Tìm kiếm theo tên.."
                        className="max-w-[250px]"
                        value={queryLodash}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            const { value } = event.target;
                            setQueryLodash(value);
                            debouncedSetQuery(value);
                        }}
                    />
                    <Form {...FormDateFilter}>
                        <form onSubmit={FormDateFilter.handleSubmit(handleFilter)}>
                            <div className="flex flex-row gap-3">
                                <RangeCalendarField
                                    name="dateRange"
                                    placeholder="Chọn khoảng ngày"
                                    disableDate={false}
                                />
                                <Button type="submit" className="flex flex-row gap-2">
                                    <Icons.filter className="dark:white white" /> Lọc
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
                <div className="grid grid-cols-3 gap-4 p-4 overflow-y-auto">
                    {data &&
                        data.map((item) => {
                            return (
                                <>
                                    <SheetTrigger onClick={() => setDataTrigger(item)} asChild>
                                        <div
                                            className="flex flex-row rounded-md items-center gap-3 px-4 py-2 cursor-pointer hover:bg-accent"
                                            style={{ boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px' }}
                                        >
                                            <Avatar className="border">
                                                <AvatarImage
                                                    className="object-fit"
                                                    src={`${
                                                        STATIC_HOST_NO_SPLASH + item?.PhotoPath
                                                    }`}
                                                />
                                                <AvatarFallback>{item.UserID}</AvatarFallback>
                                            </Avatar>
                                            <p className="font-medium">{item.EmpName}</p>
                                            <span>
                                                {item.NotAttendedDates.reduce(
                                                    (sum, cur) => sum + cur.coe,
                                                    0
                                                )}{' '}
                                                ca
                                            </span>
                                        </div>
                                    </SheetTrigger>
                                </>
                            );
                        })}
                </div>
                <SheetContent>
                    <SheetHeader className="mb-4">
                        <SheetTitle>Thông tin ngày nghỉ của {dataTrigger?.EmpName}</SheetTitle>
                        <SheetDescription>
                            Liệt kê danh sách ngày nghỉ theo các ngày đã lọc số ca nghỉ sẽ hiện lên
                            đó
                        </SheetDescription>
                    </SheetHeader>
                    {dataTrigger && dataTrigger?.NotAttendedDates.length > 0
                        ? dataTrigger?.NotAttendedDates.map((item) => {
                              return (
                                  <div
                                      className="relative rounded-md px-2 py-1 font-medium"
                                      style={{ boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px' }}
                                  >
                                      {format(item.date, 'dd/MM/yyyy')}
                                      <Badge className="bg-black absolute rounded-full top-[-10px] right-[-15px] p-0 flex items-center justify-center w-5 h-5">
                                          {item.coe}
                                      </Badge>
                                  </div>
                              );
                          })
                        : 'Không có dữ liệu nghỉ không phép'}
                    <p className="py-2 rounded-md">
                        <strong>Tổng: </strong> {dataTrigger?.NotAttendedDates.reduce((sum, cur) => sum + cur.coe, 0)}{' '}
                        ca
                    </p>
                </SheetContent>
            </Sheet>
        </>
    );
};
