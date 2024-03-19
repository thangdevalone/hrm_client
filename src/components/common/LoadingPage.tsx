import { useEffect, useState } from 'react';

export const LoadingPage = () => {
    const [showLoading, setShowLoading] = useState(false);

    useEffect(() => {
        // Set a timeout to add the loading-page class after 2 seconds
        const timeoutId = setTimeout(() => {
            setShowLoading(true);
        }, 1500);

        // Cleanup the timeout when the component unmounts
        return () => clearTimeout(timeoutId);
    }, []); // Empty dependency array means this effect runs once after the initial render

    return (
        <div
            className={`h-screen w-screen fixed z-20 flex justify-center items-center top-0 left-0 ${
                showLoading ? 'loading-page' : ''
            } dark:bg-[hsl(var(--background))] bg-white`}
        >
            <div className="spinner">
                <div className="spinner-item"></div>
                <div className="spinner-item"></div>
                <div className="spinner-item"></div>
            </div>
        </div>
    );
};
