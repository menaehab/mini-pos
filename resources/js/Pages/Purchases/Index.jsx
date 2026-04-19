import MainLayout from '@/Layouts/MainLayout';
import { Head } from '@inertiajs/react';

//data: purchases{data[{id, number, total_price, supplier_name, payment_type, supplier{id, name, phone}}], links, meta},filters: {number, supplier_name, payment_type, per_page}
const Index = ({ purchases = {}, filters = {} }) => {
    return (
        <>
            <Head title="Purchases" />

            <div>Purchases Index</div>
        </>
    );
};

Index.layout = (page) => <MainLayout>{page}</MainLayout>;

export default Index;
