import MainLayout from '@/Layouts/MainLayout';
import { Head } from '@inertiajs/react';

const Index = ({ purchaseReturns = {}, filters = {} }) => {
    return (
        <>
            <Head title="Purchase Returns" />

            <div>Purchase Returns Index</div>
        </>
    );
};

Index.layout = (page) => <MainLayout>{page}</MainLayout>;

export default Index;
