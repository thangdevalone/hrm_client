import { useTheme } from '@/components/theme-provider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

export const Personalisation = () => {
    const { setTheme,theme } = useTheme()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChangeTheme=(value:any)=>{
        localStorage.setItem('theme',value);
        setTheme(value)
    }
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Cá nhân hóa</h3>
                <p className="text-sm text-muted-foreground">
                    Thay đổi giao diện trên máy cá nhân. Chỉnh sửa theo ý thích
                </p>
            </div>
            <Separator />
            <div>
                <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Theme
                </span>
                <p className="text-[0.8rem] text-muted-foreground">Chọn màu chủ đề cho trang chủ</p>
                <RadioGroup defaultValue={theme||"light"} value={theme} onValueChange={handleChangeTheme}>
                    <div className="grid grid-cols-2 w-fit mt-5 gap-3">
                        <div onClick={()=>handleChangeTheme('light')} className="border rounded-md overflow-hidden cursor-pointer">
                            <img
                                className="border-b"
                                src="/assets/light_theme.svg"
                                alt="light_theme"
                            />
                            <div className="flex py-2 px-2 flex-row items-center justify-between">
                                <p className="font-semibold">Light theme</p>
                                <RadioGroupItem value="light" id="light" />
                            </div>
                        </div>
                        <div  onClick={()=>handleChangeTheme('dark')} className="border rounded-md overflow-hidden cursor-pointer">
                            <img src="/assets/dark_theme.svg" alt="light_theme" />
                            <div className="flex py-2 px-2 flex-row items-center justify-between">
                                <p className="font-semibold">Dark theme</p>
                                <RadioGroupItem value="dark" id="dark" />
                            </div>
                        </div>
                    </div>
                </RadioGroup>
            </div>
            <div />
        </div>
    );
};
