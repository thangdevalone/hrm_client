import { QueryParam } from "@/models";

export const ConvertQueryParam = (param?: QueryParam): string => {
    if (!param) return "";
    const { filters, ...rest } = param;

    // Tạo một đối tượng mới chỉ chứa các trường có giá trị
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queryParams: { [key: string]: any } = {};

    for (const key in rest) {
        if (Object.prototype.hasOwnProperty.call(rest, key)) {
            const value = rest[key];

            if (value !== undefined) {
                queryParams[key] = value;
            }
        }
    }

    if (filters !== undefined) {
        // Xử lý filters dựa trên cấu trúc ColumnFilter
        filters.forEach((filter) => {
            if (Array.isArray(filter.value)) {
                // Nếu giá trị là một mảng, chuyển nó thành chuỗi và nối các giá trị bằng dấu phẩy
                queryParams[filter.id] = filter.value.join(",");
            } else {
                // Nếu giá trị là một chuỗi, sử dụng nó trực tiếp
                queryParams[filter.id] = filter.value;
            }
        });
    }

    const queryString = Object.keys(queryParams)
        .map((key) => `${key}=${queryParams[key]}`)
        .join("&");

    return queryString ? `?${queryString}` : "";
};
