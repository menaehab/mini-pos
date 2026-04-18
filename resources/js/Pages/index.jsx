import MainLayout from "../Layouts/MainLayout";
import Index from "./Users/Index";

export default function index() {
    return <div>
        <Index/>
    </div>;
}
index.layout = (page) => <MainLayout children={page} />;