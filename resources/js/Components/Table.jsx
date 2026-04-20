import { Banknote, Edit, Eye, Trash2 } from 'lucide-react';

export default function Table({
    columns = [],
    data = [],
    onView,
    onEdit,
    onPay,
    onDelete,
    canView = true,
    canEdit = true,
    canDelete = true,
}) {
    const tableData = Array.isArray(data) ? data : data?.data || [];
    const hasActions = canView || canEdit || canDelete;

    return (
        <div
            className="w-full overflow-x-auto rounded-lg border border-gray-100 bg-white font-['Cairo'] shadow-sm"
            dir="rtl"
        >
            <table className="w-full text-right text-sm">
                <thead className="bg-[#000000] text-white">
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index} className="px-6 py-4 font-medium">
                                {col.header}
                            </th>
                        ))}
                        {hasActions && (
                            <th className="px-6 py-4 text-left font-medium"></th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {tableData.length > 0 ? (
                        tableData.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${canView && onView ? 'cursor-pointer' : ''}`}
                                onClick={(e) => {
                                    const isActionColumn =
                                        e.target.closest('.actions-column');
                                    if (!isActionColumn && canView && onView) {
                                        onView(row);
                                    }
                                }}
                            >
                                {columns.map((col, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className="px-6 py-4 text-gray-700"
                                    >
                                        {col.render
                                            ? col.render(row)
                                            : row[col.accessor]}
                                    </td>
                                ))}

                                {hasActions && (
                                    <td className="actions-column flex items-center justify-end gap-3 px-6 py-4 text-left">
                                        {onPay && (
                                            <button
                                                onClick={() => onPay(row)}
                                                className="transition-colors hover:text-blue-600"
                                                title="السداد"
                                            >
                                                <Banknote size={18} />
                                            </button>
                                        )}

                                        {canView && onView && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onView(row);
                                                }}
                                                className="text-gray-400 transition-colors hover:text-blue-600"
                                                title="عرض"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        )}

                                        {canEdit && onEdit && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit(row);
                                                }}
                                                className="text-gray-400 transition-colors hover:text-[#1b2b20]"
                                                title="تعديل"
                                            >
                                                <Edit size={18} />
                                            </button>
                                        )}

                                        {canDelete && onDelete && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(row);
                                                }}
                                                className="text-red-400 transition-colors hover:text-red-600"
                                                title="حذف"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={columns.length + (hasActions ? 1 : 0)}
                                className="px-6 py-12 text-center font-medium text-gray-500"
                            >
                                لا توجد بيانات لعرضها
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
