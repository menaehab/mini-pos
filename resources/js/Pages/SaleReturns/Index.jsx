import MainLayout from '@/Layouts/MainLayout';
import { Head } from '@inertiajs/react';

const Index = ({ saleReturns = {}, filters = {} }) => {
    return (
        <>
            <Head title="Sale Returns" />

            <div>Sale Returns Index</div>
        </>
    );
};

Index.layout = (page) => <MainLayout>{page}</MainLayout>;

export default Index;
