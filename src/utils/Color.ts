export const colorBucket = {
    'PARTTIME': 'bg-[purple]',
    'FULLTIME': 'bg-[green]',
    'Ngưng làm việc': 'bg-[red]',
    'Chờ xác nhận': 'bg-teal-500',
    'Chờ phê duyệt': 'bg-teal-700',
    'Đã phê duyệt': 'bg-[green]',
    'Đã từ chối': 'bg-[red]',
};
export type ColorKey = keyof typeof colorBucket;
