
import { SidebarLeft } from '@/components/SidebarLeft';
import { ModeToggle } from '@/components/mode-toggle';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

export default function Home() {
    const [collapse, setCollapse] = useState<boolean>(false);

    return (
        <div className="flex-row h-full flex">
            <div className="fixed right-[20px] top-[20px]">
                <ModeToggle />
            </div>
            <SidebarLeft
                setCollapse={setCollapse}
                collapse={collapse}
                className={`${
                    collapse ? 'basis-0 animate-slide-left' : 'basis-[200px] animate-slide-right'
                } `}
            />
            <div className="flex-1 flex flex-col">
                <Outlet />
            </div>
        </div>
    );
}
