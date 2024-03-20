import { addWeeks, format, isAfter, isBefore, isSameDay, parse, startOfWeek } from "date-fns";
import { TimeValue } from "react-aria";


export async function cryString(inputString: string) {
    // Create a hash object using SHA256 algorithm
    const inputBytes = new TextEncoder().encode(inputString);

    // Hash the input using SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', inputBytes);
  
    // Convert the hash buffer to hexadecimal representation
    const hashedValue = Array.from(new Uint8Array(hashBuffer))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  
    return hashedValue;
}
export function formatTime(timeString:string) {
    const parsedTime = parse(timeString, 'HH:mm:ss', new Date());
    return format(parsedTime, 'h:mm a');
  }
export function parseTimeString(timeString: string): TimeValue {
    const [hoursStr, minutesStr, secondsStr] = timeString.split(":");
    let hour = parseInt(hoursStr);
    const minute = parseInt(minutesStr);
    const second = parseInt(secondsStr);

    // Kiểm tra xem thời gian là buổi sáng (AM) hay buổi chiều (PM)

    // Chuyển đổi giờ sang định dạng 12 giờ
    if (hour > 12) {
        hour -= 12;
    }

    // Tạo một đối tượng thời gian mới với các giá trị đã cập nhật
    const timeValue: TimeValue = {
        hour,
        minute,
        second,
        millisecond: 0
    } as TimeValue;

    return timeValue;
}
export function formatTimeValue(timeValue: TimeValue): string {
    // Ensure hour, minute, and second are formatted with leading zeros
    const hourStr = String(timeValue.hour).padStart(2, '0');
    const minuteStr = String(timeValue.minute).padStart(2, '0');
    const secondStr = String(timeValue.second).padStart(2, '0');

    // Concatenate components with ":" separator
    return `${hourStr}:${minuteStr}:${secondStr}`;
}

export function getNowSunday(str?: string): Date {

    const today = new Date();
    const nextSunday = new Date(today);

    // Tìm ngày đầu tiên của tuần và tăng lên cho đến khi là Chủ Nhật
    while (nextSunday.getDay() !== 0) { // 0 là Chủ Nhật (tính từ 0 là Chủ Nhật)
        nextSunday.setDate(nextSunday.getDate() + 1);
    }
    if(str){
        const [hour, minutes, seconds] = str.split(":").map(Number); // Chuyển đổi chuỗi thành số nguyên
        nextSunday.setHours(hour);
        nextSunday.setMinutes(minutes);
        nextSunday.setSeconds(seconds);
    }
   

    return nextSunday;
}

export function isTimeAfterNowOnSunday(timeString: string, sunday: Date): boolean {
    const now = new Date();
    const [hour, minutes, seconds] = timeString.split(":").map(Number);

    if (!isSameDay(now, sunday)) { // Kiểm tra xem hôm nay có phải là Chủ Nhật không
        return false; // Nếu không phải Chủ Nhật, trả về false
    }

    const inputTime = new Date(sunday);
    inputTime.setHours(hour, minutes, seconds);
    console.log(inputTime,now)
    return isBefore(inputTime, now); // Trả về true nếu thời gian đầu vào nhỏ hơn thời gian hiện tại
}

export function isWithinThisWeek(date: Date): boolean {
    const today = new Date();
    const startOfThisWeek = startOfWeek(today, { weekStartsOn: 0 }); // Lấy ngày bắt đầu của tuần hiện tại (Chủ Nhật)
    const nextSunday = addWeeks(startOfThisWeek, 1); // Lấy Chủ Nhật trong tuần tiếp theo

    return isSameDay(date, nextSunday) || (isBefore(date, nextSunday) && isAfter(date, today));
}