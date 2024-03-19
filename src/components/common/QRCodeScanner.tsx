import { ReloadIcon } from '@radix-ui/react-icons';
import { Html5Qrcode } from 'html5-qrcode';
import React, { useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '../ui/button';
import { DialogFooter } from '../ui/dialog';
import { useToast } from '../ui/use-toast';
import dayjs from 'dayjs';
export type CCCD = {
    code: string;
    name: string;
    sex: string;
    birth: string;
    address: string;
};
interface QRCodeScannerProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setDialogState: (newState: number) => void;
}
const QRCodeScanner = (props: QRCodeScannerProps) => {
    const { setDialogState } = props;
    const form = useFormContext();
    const [qrCodeText, setQrCodeText] = useState('');
    const qrCodeScannerRef = useRef<Html5Qrcode | null>(null);
    const inputUpload = useRef<HTMLInputElement | null>(null);
    const [detecting, setDetecting] = useState(false);
    const [data, setData] = useState<CCCD | null>(null);

    function convertDateFormat(inputDateStr: string) {
        // Tách chuỗi ngày thành các thành phần: tháng, ngày và năm
        const dateComponents = inputDateStr.split('/');

        // Kiểm tra xem chuỗi có đúng định dạng không (MM/DD/YYYY)
        if (dateComponents.length !== 3) {
            return 'Invalid date format';
        }

        // Tạo chuỗi ngày mới ở định dạng DD/MM/YYYY
        const outputDateStr = `${dateComponents[1]}/${dateComponents[0]}/${dateComponents[2]}`;

        return outputDateStr;
    }

    const { toast } = useToast();
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        // Initialize the scanner only if it has not been initialized
        if (!qrCodeScannerRef.current) {
            qrCodeScannerRef.current = new Html5Qrcode('reader');
        }

        try {
            const rs = await qrCodeScannerRef.current.scanFile(file, true);
            setDetecting(true);
            const spData = rs.split('|');
            setData({
                code: spData[0]?.match(/.{1,4}/g)?.join(' ') || '',
                name: spData[2],
                birth: spData[3]?.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3') || '',
                sex: spData[4],
                address: spData[5],
            });
            toast({
                title: 'Thành công',
                description: 'Bấm tiếp tục để tạo nhân viên',
            });
        } catch (err) {
            console.error('Error scanning file.', err);
            setQrCodeText('');
            toast({
                variant: 'destructive',
                title: 'Thất bại',
                description: 'Error scanning file.',
            });
        } finally {
            setDetecting(false);
        }
    };
    const handleUpload = () => {
        if (inputUpload?.current) {
            inputUpload.current.click();
        }
    };
    const handleUploadCCCD = () => {
        form.setValue('EmpName', data?.name);
        form.setValue('CCCD', data?.code.replace(/\s/g, ''));
        form.setValue('Gender', data?.sex);
        form.setValue('Address', data?.address);
        if (data?.birth) {
            form.setValue('BirthDate', dayjs(convertDateFormat(data?.birth)));
        }
        setData(null);
        setDialogState(2);
    };
    return (
        <>
            <p>
                <strong>Lưu ý: </strong>Bản thử nghiệm chỉ dùng cho căn cước công dân gắn chip, nếu
                là chứng minh nhân dân vui lòng chọn <strong>bỏ qua</strong> để nhập tay.Trong
                trường hợp không xuất hiện thẻ căn cước! Vui lòng chụp lại căn cước rõ ràng hơn xin
                cảm ơn
            </p>
            <Button onClick={handleUpload} disabled={detecting}>
                {' '}
                {detecting && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />} Tải lên ảnh căn
                cước công dân
            </Button>
            <p className="text-gray-500 text-sm mb-2">
                * Ảnh chỉ bao gồm thẻ căn cước không bao gồm gì khác
            </p>
            <div hidden>
                <input type="file" ref={inputUpload} onChange={handleFileChange} accept="image/*" />
                <div id="reader"></div>
                {qrCodeText && <p>Scanned QR Code Text: {qrCodeText}</p>}
            </div>
            {data && (
                <div
                    className="relative rounded-xl py-3 px-4 w-full max-w-[500px]"
                    style={{
                        boxShadow:
                            'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px',
                        background:
                            "linear-gradient(to bottom right, rgba(255, 255, 255,1), rgba(255, 255, 255, 0.4)), url('/assets/vn_td.jpg')",
                        backgroundSize: '300px',
                        backgroundPosition: '230px 50px',
                        backgroundRepeat: 'no-repeat',
                    }}
                >
                    <img
                        src="/assets/vn_qh.png"
                        alt="qhvn"
                        className="absolute w-[50px] right-[20px] top-[15px]"
                    />
                    <div className="mb-2">
                        <p className="text-gray-500">Số CCCD</p>
                        <p className="font-semibold text-xl">{data.code}</p>
                    </div>
                    <div className="mb-2">
                        <p className="text-gray-500">Họ và tên</p>
                        <p>{data.name}</p>
                    </div>
                    <div className="flex flex-row w-full mb-2">
                        <div>
                            <p className="text-gray-500">Giới tính</p>
                            <p>{data.sex}</p>
                        </div>
                        <div className="ml-[150px]">
                            <p className="text-gray-500">Ngày sinh</p>
                            <p>{data.birth}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-gray-500">Nơi cư chú</p>
                        <p>{data.address}</p>
                    </div>
                </div>
            )}
            <DialogFooter className="w-full">
                <Button
                    onClick={() => {
                        setDialogState(2);
                    }}
                    variant="outline"
                    type="submit"
                >
                    Bỏ qua
                </Button>
                <Button onClick={handleUploadCCCD} disabled={!data} type="submit">
                    Tiếp tục
                </Button>
            </DialogFooter>
        </>
    );
};

export default QRCodeScanner;
