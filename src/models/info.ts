import { ColorKey } from '@/utils';

export interface InfoCompany {
    company_name: string;
    number_emp: number;
    tax: string;
    phone: string;
    email: string;
}
export interface InforUser {
    EmpID: number;
    EmpName: string;
    Phone: string;
    HireDate: string;
    BirthDate: string;
    Address: string;
    PhotoPath: string;
    Email: string;
    EmpStatus: string;
    Gender: string;
    TaxCode: string;
    CCCD: string;
    BankAccountNumber: string;
    BankName: string;
    DepID: number;
    JobID: number;
    RoleID: number;
    RoleName: string;
    DepName: string;
    JobName: string;
}

export interface InforEmployee {
    EmpID: number;
    EmpName: string;
    Phone: string;
    HireDate: string;
    BirthDate: string;
    Address: string;
    PhotoPath: string;
    Email: string;
    EmpStatus: ColorKey;
    Gender: string;
    TaxCode: string;
    CCCD: string;
    BankAccountNumber: string;
    BankName: string;
    DepID: number;
    JobID: number;
    RoleID: number;
    UserID: string;
    password: string;
    JobName: string;
    DepName: string;
}

export interface InfoAccount {
    UserID?: string;
    password?: string;
    UserStatus?: boolean | 0 | 1;
    EmpID?: string;
}

export interface CreateAccount {
    UserID: string;
    password: string;
    UserStatus: number;
    EmpID: number;
}

export interface InforUser {
    user_id: number;
    username: string;
    password: string;
    user_status: boolean;
    emp_name: string;
}

export interface InfoJob {
    JobID: number;
    JobName: string;
    Descriptions: string;
    DepID: number;
    DepName: string;
}
export interface InfoRole {
    RoleName: string;
    RoleID: number;
}
export interface InfoDepartment {
    employee_count: number;
    DepID: number;
    DepName: string;
    DepShortName: string;
    ManageID: number;
    EmpName: string;
}

export interface InfoLeave {
    EmpID: number;
    EmpName: string;
    Phone: string;
    HireDate: string;
    BirthDate: string;
    Address: string;
    PhotoPath: string;
    Email: string;
    EmpStatus: string;
    Gender: string;
    TaxCode: string;
    CCCD: string;
    BankAccountNumer: string;
    BankName: string;
    DepID: number;
    JobID: number;
    RoleID: number;
    LeaveRequestID: number;
    LeaveStartDate: string;
    LeaveEndDate: string;
    Reason: string;
    LeaveStatus: string;
    Duration: number;
    LeaveTypeID: number;
    LeaveTypeName: string;
}
export interface InfoLeaveType {
    LeaveTypeID: number;
    LeaveTypeName: string;
    LeaveTypeDescription: string;
    LimitedDuration: number;
}
export interface InfoWorkShift {
    id: number;
    WorkShiftName: string;
    StartTime: string;
    EndTime: string;
    Color: string;
}

export interface InfoConfigSchedule {
    id: number;
    TimeBlock: string;
    DateMin: number;
    Using: boolean;
}

export interface InfoSchedule {
    EmpID: number;
    id?: number;
    Date: string;
    WorkShift: number;
    WorkShiftDetail: InfoWorkShift;
}
export interface InfoScheduleAll {
    EmpID: number;
    EmployeeName: string;
    PhotoPath: string;
    DepName: string;
    Email: string;
    Date: string;
    WorkShift: number;
    WorkShiftDetail: InfoWorkShift;
}
export interface InfoTimeKeep {
    EmpID: number;
    EmpName: string;
    id: number;
    TimeIn: string;
    TimeOut: string | null;
    Late: number;
    WorkHour: number;
    Phone: string;
    HireDate: string;
    BirthDate: string;
    Address: string;
    PhotoPath: string;
    Email: string;
    EmpStatus: string;
    Gender: string;
    TaxCode: string;
    CCCD: string;
    BankAccountNumber: string;
    BankName: string;
    DepID: number;
    JobID: number;
    RoleID: number;
    RoleName: string;
    DepName: string;
    JobName: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Tasks:any[];
}
export interface RawTimeSheet {
    EmpID: number;
    EmpName: string;
    Phone: string;
    HireDate: string;
    BirthDate: string;
    Address: string;
    PhotoPath: string;
    Email: string;
    EmpStatus: string;
    Gender: string;
    TaxCode: null | string;
    CCCD: string;
    BankAccountNumber: string;
    BankName: string;
    DepID: number;
    JobID: number;
    RoleID: number;
    UserID: string;
    DepName: string;
    RoleName: string;
    JobName: string;
    DateValue: {
        [date: string]: {
            total_late: number;
            total_workhour: number;
        };
    };
}

export interface DateValue {
    id: number;
    TimeIn: string;
    TimeOut?: string;
    Late: number;
    WorkHour: number;
    EmpID: number;
    date: string;
    day: number;
    month: number;
    year: number;
}
export interface NoAttendance {
    EmpID: number
    EmpName: string
    Phone: string
    HireDate: string
    BirthDate: string
    Address: string
    PhotoPath: string
    Email: string
    EmpStatus: string
    Gender: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TaxCode: any
    CCCD: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    BankAccountNumber: any
    BankName: string
    DepID: number
    JobID: number
    RoleID: number
    UserID: string
    DepName: string
    RoleName: string
    JobName: string
    NotAttendedDates: NotAttendedDate[]
  }
  
  export interface NotAttendedDate {
    date: string
    coe: number
  }
  