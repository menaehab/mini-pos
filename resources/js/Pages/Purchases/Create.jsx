import MainLayout from '@/Layouts/MainLayout';
import { Head } from '@inertiajs/react';

//data: none,filters: none
const Create = () => {
    return (
        <>
            <Head title="Create Purchase" />

            <div>Create Purchase</div>
        </>
    );
};

Create.layout = (page) => <MainLayout>{page}</MainLayout>;

export default Create;
