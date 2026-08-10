import React, { useState, useRef, useEffect } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { Link, usePage } from '@inertiajs/react'
import { IconLogout, IconUserCog } from '@tabler/icons-react'
import { useForm } from '@inertiajs/react'
import { Menu as MenuLink } from '@/Utils/Menu'
import LinkItem from './LinkItem'
import LinkItemDropdown from './LinkItemDropdown'
export default function AuthDropdown({ auth, isMobile }) {

    // define usefrom
    const { post } = useForm();
    // define url from usepage
    const { url } = usePage();

    // define state isToggle
    const [isToggle, setIsToggle] = useState(false);
    // define state isOpen
    const [isOpen, setIsOpen] = useState(false);
    // define ref dropdown
    const dropdownRef = useRef(null);

    // define method handleClickOutside
    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsToggle(false);
        }
    };

    // get menu from utils
    const menuNavigation = MenuLink();

    // define useEffect for locking body scroll when mobile sidebar is open
    useEffect(() => {
        if (isToggle && isMobile) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isToggle, isMobile]);

    // define useEffect for click outside
    useEffect(() => {
        // add event listener
        window.addEventListener("mousedown", handleClickOutside);

        // remove event listener
        return () => {
            window.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // define function logout
    const logout = async (e) => {
        e.preventDefault();

        post(route('logout'));
    }

    return (
        <>
            {isMobile === false ?
                <Menu className='relative z-10' as="div">
                    <Menu.Button className='flex items-center rounded-full'>
                        <img src={auth.user.avatar ? auth.user.avatar : "https://ui-avatars.com/api/?name=" + auth.user.name} alt={auth.user.name} className='w-10 h-10 rounded-full' />
                    </Menu.Button>
                    <Transition
                        enter="transition duration-100 ease-out"
                        enterFrom="transform scale-95 opacity-0"
                        enterTo="transform scale-100 opacity-100"
                        leave="transition duration-75 ease-out"
                        leaveFrom="transform scale-100 opacity-100"
                        leaveTo="transform scale-95 opacity-0"
                    >
                        <Menu.Items className='absolute rounded-lg w-48 border mt-2 py-2 right-0 z-[100] bg-white dark:bg-gray-950 dark:border-gray-900'>
                            <div className='flex flex-col gap-1.5 divide-y divide-gray-100 dark:divide-gray-900'>
                                {/* <Menu.Item>
                                    <Link href="/apps/profile" className='px-3 py-1.5 text-sm flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'>
                                        <IconUserCog strokeWidth={'1.5'} size={'20'} /> Profile
                                    </Link>
                                </Menu.Item> */}
                                <Menu.Item>
                                    <button onClick={logout} className='px-3 py-1.5 text-sm flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'>
                                        <IconLogout strokeWidth={'1.5'} size={'20'} />
                                        Logout
                                    </button>
                                </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
                :
                <div ref={dropdownRef}>
                    <button className="flex items-center group" onClick={() => setIsToggle(!isToggle)}>
                        <img src={auth.user.avatar ? auth.user.avatar : "https://ui-avatars.com/api/?name=" + auth.user.name} alt={auth.user.name} className='w-10 h-10 rounded-full' />
                    </button>

                    {/* Backdrop Overlay */}
                    {isToggle && (
                        <div
                            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity"
                            onClick={() => setIsToggle(false)}
                        />
                    )}

                    {/* Mobile Sidebar */}
                    <div
                        className={`${
                            isToggle
                                ? 'translate-x-0 opacity-100 pointer-events-auto'
                                : '-translate-x-full opacity-0 pointer-events-none'
                        } fixed top-0 left-0 z-50 w-[300px] h-dvh max-h-dvh flex flex-col overflow-hidden transition-all duration-300 transform border-r bg-white dark:bg-gray-950 dark:border-gray-900`}
                    >
                        {/* Header Sidebar (tetap di atas) */}
                        <div className="flex justify-between items-center px-6 py-2 h-16 shrink-0 border-b dark:border-gray-900">
                            <div className="text-2xl font-bold leading-loose tracking-wider text-gray-900 dark:text-gray-200">
                                Menu
                            </div>
                            <button
                                onClick={() => setIsToggle(false)}
                                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                ✕
                            </button>
                        </div>

                        {/* User Info (tetap di atas) */}
                        <div className="w-full p-3 flex items-center gap-4 border-b shrink-0 dark:bg-gray-950/50 dark:border-gray-900">
                            <img
                                src={auth.user.avatar ? auth.user.avatar : "https://ui-avatars.com/api/?name=" + auth.user.name}
                                className="w-12 h-12 rounded-full"
                                alt={auth.user.name}
                            />
                            <div className="flex flex-col gap-0.5">
                                <div className="text-sm font-semibold capitalize text-gray-700 dark:text-gray-50">
                                    {auth.user.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {auth.user.email}
                                </div>
                            </div>
                        </div>

                        {/* Area Scroll Navigation (Hanya bagian ini yang scroll) */}
                        <div
                            style={{ overscrollBehavior: 'contain' }}
                            className="w-full flex-1 overflow-y-auto overscroll-contain p-3 pb-16 min-h-0"
                        >
                            {menuNavigation.map((item, index) => (
                                item.details.some(detail => detail.permissions === true) && (
                                    <div key={index}>
                                        <div className="text-gray-500 text-xs py-3 px-4 font-bold uppercase">
                                            {item.title}
                                        </div>
                                        {item.details.map((detail, indexDetail) => (
                                            detail.hasOwnProperty('subdetails') ?
                                                <LinkItemDropdown
                                                    key={indexDetail}
                                                    title={detail.title}
                                                    icon={detail.icon}
                                                    data={detail.subdetails}
                                                    access={detail.permissions}
                                                    sidebarOpen={true}
                                                    onClick={() => setIsToggle(!isToggle)}
                                                />
                                                :
                                                <LinkItem
                                                    key={indexDetail}
                                                    title={detail.title}
                                                    icon={detail.icon}
                                                    href={detail.href}
                                                    access={detail.permissions}
                                                    sidebarOpen={true}
                                                    method={detail.method}
                                                    as={detail.as}
                                                    onClick={() => setIsToggle(!isToggle)}
                                                />
                                        ))}
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                </div>
            }
        </>
    )
}
