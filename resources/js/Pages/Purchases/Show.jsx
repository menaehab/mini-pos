import MainLayout from '@/Layouts/MainLayout';
import { Head } from '@inertiajs/react';

//data: purchase{id, number, total_price, supplier_name, payment_type, supplier_id, supplier{id, name, phone}, items[{id, purchase_id, item_name, quantity, purchase_price}], first_payment{id, amount, note, supplier_id, user_id, is_first_payment}},filters: none
const Show = ({ purchase }) => {
    return (
        <>
            <Head title="Purchase Details" />

            <div>Purchase Show #{purchase?.id}</div>
        </>
    );
};

Show.layout = (page) => <MainLayout>{page}</MainLayout>;

export default Show;
