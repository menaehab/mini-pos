import MainLayout from '@/Layouts/MainLayout';
import { Head } from '@inertiajs/react';

//data: purchase{id, number, total_price, supplier_name, payment_type, supplier_id, supplier{id, name, phone}, items[{id, purchase_id, item_name, quantity, purchase_price}]},filters: none
const Edit = ({ purchase }) => {
    return (
        <>
            <Head title="Edit Purchase" />

            <div>Edit Purchase #{purchase?.id}</div>
        </>
    );
};

Edit.layout = (page) => <MainLayout>{page}</MainLayout>;

export default Edit;
