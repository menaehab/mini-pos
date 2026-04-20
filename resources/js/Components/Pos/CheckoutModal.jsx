import CustomerModal from '@/Components/CustomerModal';
import useTranslation from '@/hooks/useTranslation';
import { useForm, usePage } from '@inertiajs/react';
import { Banknote, Calendar, Percent, Wallet, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import CustomerSearchSelect from './CustomerSearchSelect';

export default function CheckoutModal({ isOpen, onClose, cart, total }) {
    const { __ } = useTranslation();
    const { flash } = usePage().props;
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        customer_id: '',
        customer_name: '',
        type: 'cash',
        items: [],
        down_payment: total,
        installment_months: 1,
        installment_rate: 0,
        note: '',
    });

    useEffect(() => {
        if (isOpen) {
            setData((d) => ({
                ...d,
                down_payment: total,
                items: cart.map((item) => ({
                    product_id: item.id,
                    product_name: item.name,
                    quantity: item.quantity,
                    sale_price: item.sale_price,
                    purchase_price: item.purchase_price,
                })),
            }));
        }
    }, [isOpen, cart, total]);

    const [calculations, setCalculations] = useState({
        interestAmount: 0,
        totalWithInterest: total,
        remaining: total,
        monthlyAmount: 0,
    });

    useEffect(() => {
        if (data.type === 'installment') {
            const interestAmount = (total * data.installment_rate) / 100;
            const totalWithInterest = total + interestAmount;
            const remaining = totalWithInterest - data.down_payment;
            const monthlyAmount =
                data.installment_months > 0
                    ? remaining / data.installment_months
                    : 0;

            setCalculations({
                interestAmount,
                totalWithInterest,
                remaining,
                monthlyAmount,
            });
        } else {
            setCalculations({
                interestAmount: 0,
                totalWithInterest: total,
                remaining: total - data.down_payment,
                monthlyAmount: 0,
            });
        }
    }, [
        data.type,
        data.installment_rate,
        data.installment_months,
        data.down_payment,
        total,
    ]);

    useEffect(() => {
        if (flash?.new_customer && isCustomerModalOpen === false) {
            setSelectedCustomer(flash.new_customer);
        }
    }, [flash?.new_customer]);

    useEffect(() => {
        if (selectedCustomer) {
            setData((d) => ({
                ...d,
                customer_id: selectedCustomer.id,
                customer_name: selectedCustomer.name,
            }));
        }
    }, [selectedCustomer]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('sales.store'), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 font-['Cairo'] backdrop-blur-sm transition-opacity">
            <div
                className="animate-in fade-in zoom-in-95 relative w-full max-w-2xl rounded-[32px] bg-white p-8 shadow-2xl duration-200"
                dir="rtl"
            >
                <button
                    onClick={onClose}
                    className="absolute left-6 top-6 text-gray-400 transition-colors hover:text-gray-700"
                >
                    <X size={24} strokeWidth={2.5} />
                </button>

                <h2 className="mb-8 text-center text-2xl font-black text-gray-800">
                    {__('keywords.complete_sale')}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Customer Selection */}
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-bold text-gray-700">
                                {__('keywords.customer')}{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <CustomerSearchSelect
                                selected={selectedCustomer}
                                setSelected={setSelectedCustomer}
                                onAddNew={() => setIsCustomerModalOpen(true)}
                            />
                            {errors.customer_id && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.customer_id}
                                </p>
                            )}
                        </div>

                        {/* Payment Type */}
                        <div className="md:col-span-2">
                            <label className="mb-3 block text-sm font-bold text-gray-700">
                                {__('keywords.payment_type')}
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setData('type', 'cash')}
                                    className={`flex items-center justify-center gap-3 rounded-2xl border-2 py-4 font-bold transition-all ${data.type === 'cash' ? 'border-black bg-black text-white shadow-lg' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}
                                >
                                    <Wallet size={20} />
                                    {__('keywords.cash')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setData('type', 'installment')
                                    }
                                    className={`flex items-center justify-center gap-3 rounded-2xl border-2 py-4 font-bold transition-all ${data.type === 'installment' ? 'border-black bg-black text-white shadow-lg' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}
                                >
                                    <Calendar size={20} />
                                    {__('keywords.installment')}
                                </button>
                            </div>
                        </div>

                        {/* Installment Fields */}
                        {data.type === 'installment' && (
                            <>
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-gray-700">
                                        {__('keywords.installment_months')}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={data.installment_months}
                                            onChange={(e) =>
                                                setData(
                                                    'installment_months',
                                                    parseInt(e.target.value) ||
                                                        0,
                                                )
                                            }
                                            className="w-full rounded-2xl border-gray-200 py-3 pr-10 text-right focus:border-black focus:ring-black"
                                        />
                                        <Calendar className="absolute right-3 top-3.5 h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-gray-700">
                                        {__('keywords.interest_rate')} (%)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.installment_rate}
                                            onChange={(e) =>
                                                setData(
                                                    'installment_rate',
                                                    parseFloat(
                                                        e.target.value,
                                                    ) || 0,
                                                )
                                            }
                                            className="w-full rounded-2xl border-gray-200 py-3 pr-10 text-right focus:border-black focus:ring-black"
                                        />
                                        <Percent className="absolute right-3 top-3.5 h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Down Payment */}
                        <div
                            className={
                                data.type === 'installment'
                                    ? 'md:col-span-2'
                                    : 'md:col-span-2'
                            }
                        >
                            <label className="mb-2 block text-sm font-bold text-gray-700">
                                {data.type === 'installment'
                                    ? __('keywords.down_payment')
                                    : __('keywords.amount_paid')}
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.down_payment}
                                    onChange={(e) =>
                                        setData(
                                            'down_payment',
                                            parseFloat(e.target.value) || 0,
                                        )
                                    }
                                    className="w-full rounded-2xl border-gray-200 py-3 pr-10 text-right focus:border-black focus:ring-black"
                                />
                                <Banknote className="absolute right-3 top-3.5 h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="space-y-3 rounded-3xl bg-gray-50 p-6">
                        <div className="flex justify-between text-sm font-bold text-gray-500">
                            <span>{__('keywords.total')}</span>
                            <span>
                                {total.toFixed(2)} {__('keywords.currency')}
                            </span>
                        </div>
                        {data.type === 'installment' && (
                            <>
                                <div className="flex justify-between text-sm font-bold text-blue-500">
                                    <span>
                                        {__('keywords.interest')} (
                                        {data.installment_rate}%)
                                    </span>
                                    <span>
                                        +
                                        {calculations.interestAmount.toFixed(2)}{' '}
                                        {__('keywords.currency')}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm font-black text-gray-800">
                                    <span>
                                        {__('keywords.total_with_interest')}
                                    </span>
                                    <span>
                                        {calculations.totalWithInterest.toFixed(
                                            2,
                                        )}{' '}
                                        {__('keywords.currency')}
                                    </span>
                                </div>
                            </>
                        )}
                        <div className="flex justify-between border-t border-gray-200 pt-3">
                            <span className="text-lg font-black text-gray-800">
                                {data.type === 'installment'
                                    ? __('keywords.monthly_installment')
                                    : __('keywords.remaining')}
                            </span>
                            <span className="text-2xl font-black text-black">
                                {data.type === 'installment'
                                    ? calculations.monthlyAmount.toFixed(2)
                                    : calculations.remaining.toFixed(2)}{' '}
                                {__('keywords.currency')}
                            </span>
                        </div>
                        {data.type === 'installment' && (
                            <p className="text-center text-[10px] font-bold text-gray-400">
                                *{' '}
                                {__('keywords.installment_note', {
                                    months: data.installment_months,
                                })}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-2xl border border-gray-200 py-4 font-bold text-gray-500 transition-colors hover:bg-gray-50"
                        >
                            {__('keywords.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={processing || !data.customer_id}
                            className="flex-[2] rounded-2xl bg-black py-4 font-black text-white shadow-xl transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing
                                ? __('keywords.processing')
                                : __('keywords.confirm_and_pay')}
                        </button>
                    </div>
                </form>
            </div>

            <CustomerModal
                isOpen={isCustomerModalOpen}
                onClose={() => setIsCustomerModalOpen(false)}
                redirectBack={true}
            />
        </div>
    );
}
