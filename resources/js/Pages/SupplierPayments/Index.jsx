import MainLayout from '@/Layouts/MainLayout';
import { Head } from '@inertiajs/react';

export default function Index() {
    return (
        <>
            <Head title="Supplier Payments" />

            <div>Supplier Payments</div>
        </>
    );
}

Index.layout = (page) => <MainLayout>{page}</MainLayout>;
