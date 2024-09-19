export interface InfoCompany {
    company_name: string;
    number_emp: number;
    tax: string;
    phone: string;
    email: string;
}

export interface InfoUser {
    id: string;
    employeeName: string;
    birthDate: string;
    gender: 'MALE' | 'FEMALE';
    hireDate: string;
    email?: string;
    phone: string;
    employeeStatus: 'FULLTIME' | 'PARTTIME' | 'STOP';
    taxCode: number;
    cccd: string;
    address?: string;
    bankAccountNumber?: number;
    bankName?: string;
    photoPath?: string;
    role?: Role;
    department?: InfoDepartment;
    job?: InfoJob;
}

export interface Role {
    id: string;
    roleName: ROLE_DEF;
}

export enum ROLE_DEF {
    ADMIN = 'ADMIN',
    HR = 'HRM',
    EMPLOYEE = 'USER',
}

export interface InfoAccount {
    id?: string;
    username?: string;
    userStatus?: 'ACTIVE' | 'INACTIVE';
    employee?: InfoUser;
}

export interface CreateAccount {
    UserID: string;
    password: string;
    UserStatus: number;
    EmpID: number;
}


export interface InfoJob {
    id?: string;
    jobName: string;
    descriptions: string;

}

export interface InfoRole {
    roleName: string;
    id: number;
}

export interface InfoDepartment {
    id?: string;
    employeeCount?: number;
    depName: string;
    depShortName: string;
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
    Tasks: any[];
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TaxCode: any;
    CCCD: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    BankAccountNumber: any;
    BankName: string;
    DepID: number;
    JobID: number;
    RoleID: number;
    UserID: string;
    DepName: string;
    RoleName: string;
    JobName: string;
    NotAttendedDates: NotAttendedDate[];
}

export interface NotAttendedDate {
    date: string;
    coe: number;
}
