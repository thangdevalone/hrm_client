
import { TimeValue } from "react-aria";

export interface FormAccount {
    username: string;
    password: string;
    employee: string;
}

interface EmployeeBaseForm {
    EmpName: string;
    Email: string;
    CCCD: string;
    DepID: number;
    JobID: number;
    RoleID: number;
    EmpStatus: string;
    BankAccountNumber?: string;
    BankName?: string;
    Gender?: string;
    TaxCode?: string;
    Phone?: string;
    HireDate?: string;
    BirthDate?: string;
    Address?: string;
}

export interface EmployeeCreateForm extends EmployeeBaseForm {}

export interface EmployeeEditForm extends EmployeeBaseForm {
    EmpID?: number;
}

export interface EmployeeEditDetailForm extends EmployeeBaseForm {
    PhotoPath?: string;
    EmpID?: number;
}
export interface ChangePass{
    current_password:string;
    new_password:string
    re_password:string;
}
export interface RoleEditForm extends RoleCreateForm {
    EmpID?: number;
}
export interface DepartmentCreateForm {
    DepName: string;
    DepShortName: string;
    ManageID: number;
}

export interface JobCreateForm {
    DepID: number;
    JobName: string;
    Descriptions?: string;
}
export interface RoleCreateForm {
   RoleName: string;
}
export interface RoleEditForm extends RoleCreateForm {
    RoleID?: number;
}
export interface JobEditForm extends JobCreateForm {
    JobID?: number;
}
export interface DepartmentEditForm {
    DepID?: number;
    DepName: string;
    DepShortName?: string;
    ManageID: number;
}

export interface LeaveCreateForm {
    LeaveTypeID: number;
    LeaveStartDate?: string | null;
    LeaveEndDate?: string | null;
    Reason: string;
    leaveDate: string;
}
export interface LeaveEditForm {
    LeaveTypeID: number;
    LeaveStartDate?: string | null;
    LeaveEndDate?: string | null;
    leaveDate: string;
    Reason: string;
    EmpID: number;
    LeaveRequestID: number;
    RawDateStart?: Date | null;
    RawDateEnd?: Date | null;
    LeaveStatus?: string | null;
}

export interface LeaveTypeCreateForm {
    LeaveTypeName: string;
    LeaveTypeDescription: string;
    LimitedDuration: number;
}

export interface WorkShiftCreateForm {
    WorkShiftName: string;
    StartTime: string; 
    EndTime: string;
    Color:string;
}
export interface WorkShiftEditForm {
    id:number
    WorkShiftName: string;
    StartTime?: TimeValue|null; 
    EndTime?: TimeValue|null;
    RawStartTime:string;
    RawEndTime:string
    Color:string;

}


export interface ConfigScheduleCreateForm {
    TimeBlock:string;
    DateMin:number;
    Using:boolean;
}
export interface ConfigScheduleEditForm {
    id:number
    TimeBlock?:TimeValue|null;
    DateMin:number;
    RawTimeBlock:string;
    Using:boolean;
}

export interface ScheduleCreateForm{
    EmpID:number,
    Date:string,
    WorkShift:number
}

