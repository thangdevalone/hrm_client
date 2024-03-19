import { Link, useLocation } from 'react-router-dom';
import { Icons } from '../icons';

export const Breadcrumbs = () => {
    const { pathname } = useLocation();
    const pathArray = pathname.split('/').slice(2);
    const first = pathArray.shift();
    const last = pathArray.pop();
    return (
        <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                <li className="inline-flex items-center">
                    <Link
                        to={`/home/${first}`}
                        className="inline-flex text-sm  capitalize items-center  font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
                    >
                        {first}
                    </Link>
                </li>
                <></>
                {pathArray && (
                    <>
                        {pathArray.map((item) => (
                            <li>
                                <div className="flex items-center">
                                    <Icons.arrowRight />

                                    <a
                                        href={`/home/${first + '/' + item}`}
                                        className="ms-1 text-sm capitalize font-medium text-gray-700 hover:text-blue-600 md:ms-2 dark:text-gray-400 dark:hover:text-white"
                                    >
                                        {item}
                                    </a>
                                </div>
                            </li>
                        ))}
                    </>
                )}
                <li aria-current="page">
                    <div className="flex items-center">
                        <Icons.arrowRight />
                        <span className="ms-1 capitalize text-sm font-medium text-gray-500 md:ms-2 dark:text-gray-400">
                            {last}
                        </span>
                    </div>
                </li>
            </ol>
        </nav>
    );
};
