import { Combobox, Transition } from '@headlessui/react';
import axios from 'axios';
import { Check, ChevronsUpDown, Search, UserPlus } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';
import useTranslation from '@/hooks/useTranslation';

export default function CustomerSearchSelect({ selected, setSelected, onAddNew }) {
    const { __ } = useTranslation();
    const [query, setQuery] = useState('');
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCustomers = async () => {
            setLoading(true);
            try {
                const response = await axios.get(route('customers.search'), {
                    params: { search: query }
                });
                setCustomers(response.data);
            } catch (error) {
                console.error('Error fetching customers:', error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchCustomers();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    return (
        <div className="relative w-full font-['Cairo']" dir="rtl">
            <Combobox value={selected} onChange={setSelected}>
                <div className="relative">
                    <div className="relative w-full cursor-default overflow-hidden rounded-2xl border border-gray-200 bg-white text-right transition-all focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                        <Combobox.Input
                            className="w-full border-none py-3 pl-10 pr-12 text-sm leading-5 text-gray-900 focus:ring-0 text-right"
                            displayValue={(customer) => customer?.name}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder={__('keywords.search_customer')}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                            <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        </div>
                        <Combobox.Button className="absolute inset-y-0 left-0 flex items-center pl-2">
                            <ChevronsUpDown
                                className="h-4 w-4 text-gray-400 hover:text-gray-600"
                                aria-hidden="true"
                            />
                        </Combobox.Button>
                    </div>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        afterLeave={() => setQuery('')}
                    >
                        <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-2xl bg-white py-1 text-base shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {loading ? (
                                <div className="relative cursor-default select-none py-4 px-4 text-gray-700 text-center">
                                    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-black border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                                </div>
                            ) : customers.length === 0 && query !== '' ? (
                                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                    {__('keywords.no_results')}
                                </div>
                            ) : (
                                customers.map((customer) => (
                                    <Combobox.Option
                                        key={customer.id}
                                        className={({ active }) =>
                                            `relative cursor-default select-none py-3 pl-10 pr-4 ${
                                                active ? 'bg-black text-white' : 'text-gray-900'
                                            }`
                                        }
                                        value={customer}
                                    >
                                        {({ selected, active }) => (
                                            <>
                                                <div className="flex flex-col">
                                                    <span className={`block truncate font-bold ${selected ? 'font-black' : 'font-medium'}`}>
                                                        {customer.name}
                                                    </span>
                                                    <span className={`block truncate text-xs ${active ? 'text-gray-200' : 'text-gray-400'}`}>
                                                        {customer.phone || customer.national_number || '---'}
                                                    </span>
                                                </div>
                                                {selected ? (
                                                    <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-black'}`}>
                                                        <Check className="h-4 w-4" aria-hidden="true" />
                                                    </span>
                                                ) : null}
                                            </>
                                        )}
                                    </Combobox.Option>
                                ))
                            )}

                            <div 
                                onClick={onAddNew}
                                className="sticky bottom-0 flex cursor-pointer items-center justify-center gap-2 border-t border-gray-100 bg-gray-50 py-3 text-sm font-bold text-gray-700 hover:bg-gray-100 hover:text-black"
                            >
                                <UserPlus size={16} />
                                {__('keywords.add_new_customer')}
                            </div>
                        </Combobox.Options>
                    </Transition>
                </div>
            </Combobox>
        </div>
    );
}
