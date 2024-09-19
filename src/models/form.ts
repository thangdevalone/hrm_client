import { TimeValue } from 'react-aria';
import { InfoDepartment, InfoJob, Role } from '@/models/info.ts';

export interface FormAccount {
    username: string;
    password: string;
    employee: string;
}

interface EmployeeBaseForm {
    id?: string;
    employeeName?: string;
    birthDate?: string;
    gender?: 'MALE' | 'FEMALE';
    hireDate?: string;
    email?: string;
    phone?: string;
    employeeStatus?: 'FULLTIME' | 'PARTTIME' | 'STOP';
    taxCode?: number;
    cccd?: string;
    address?: string;
    bankAccountNumber?: number;
    bankName?: string;
    photoPath?: string;
    role?: Role | string;
    department?: InfoDepartment | string;
    job?: InfoJob | string;
}

export interface EmployeeCreateForm extends EmployeeBaseForm {
}

export interface EmployeeEditForm extends EmployeeBaseForm {
    id?: string;
}

export interface EmployeeEditDetailForm extends EmployeeBaseForm {
    PhotoPath?: string;
    EmpID?: number;
}

export interface ChangePass {
    current_password: string;
    new_password: string;
    re_password: string;
}

export interface RoleEditForm extends RoleCreateForm {
    EmpID?: number;
}

export interface DepartmentCreateForm {
    id?: string;
    depName: string;
    depShortName: string;
}

export interface JobCreateForm {
    id?: string;
    jobName: string;
    descriptions: string;
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
    id?: string;
    depName: string;
    depShortName?: string;
}

export interface LeaveCreateForm {
    LeaveTypeID: number;
    LeaveStartDate: string;
    LeaveEndDate: string;
    Reason: string;
}

export interface LeaveEditForm {
    LeaveTypeID: number;
    LeaveStartDate: string;
    LeaveEndDate: string;
    Reason: string;
    EmpID: number;
    LeaveRequestID: number;

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
    Color: string;
}

export interface WorkShiftEditForm {
    id: number;
    WorkShiftName: string;
    StartTime?: TimeValue | null;
    EndTime?: TimeValue | null;
    RawStartTime: string;
    RawEndTime: string;
    Color: string;

}


export interface ConfigScheduleCreateForm {
    TimeBlock: string;
    DateMin: number;
    Using: boolean;
}

export interface ConfigScheduleEditForm {
    id: number;
    TimeBlock?: TimeValue | null;
    DateMin: number;
    RawTimeBlock: string;
    Using: boolean;
}

export interface ScheduleCreateForm {
    EmpID: number,
    Date: string,
    WorkShift: number
}

