import { Link } from '@inertiajs/react';
import { Edit, Trash2 } from 'lucide-react';

export default function Table({
    columns,
    data,
    onEdit,
    onDelete,
    pagination = null,
}) {
    return (
        <div className="rounded-lg border border-gray-100 bg-white shadow-sm">
            <div className="w-full overflow-x-auto">
                <table className="w-full text-right text-sm">
                    <thead className="bg-[#000000] text-white">
                        <tr>
                            {columns.map((col, index) => (
                                <th
                                    key={index}
                                    className="px-6 py-4 font-medium"
                                >
                                    {col.header}
                                </th>
                            ))}
                            <th className="px-6 py-4 text-left font-medium">
                                الإجراءات
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? (
                            data.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className="border-b border-gray-100 hover:bg-gray-50"
                                >
                                    {columns.map((col, colIndex) => (
                                        <td
                                            key={colIndex}
                                            className="px-6 py-4 text-gray-700"
                                        >
                                            {row[col.accessor]}
                                        </td>
                                    ))}
                                    <td className="flex items-center justify-end gap-3 px-6 py-4 text-left">
                                        <button
                                            onClick={() => onEdit(row)}
                                            className="text-gray-400 hover:text-[#1b2b20]"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(row)}
                                            className="text-red-400 hover:text-red-600"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length + 1}
                                    className="px-6 py-4 text-center text-gray-500"
                                >
                                    لا توجد بيانات
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {pagination && pagination.links && pagination.links.length > 3 && (
                <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <Link
                            href={pagination.prev_page_url || '#'}
                            className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${!pagination.prev_page_url ? 'pointer-events-none opacity-50' : ''}`}
                            preserveState
                            preserveScroll
                        >
                            السابق
                        </Link>
                        <Link
                            href={pagination.next_page_url || '#'}
                            className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${!pagination.next_page_url ? 'pointer-events-none opacity-50' : ''}`}
                            preserveState
                            preserveScroll
                        >
                            التالي
                        </Link>
                    </div>
                    <div
                        className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between"
                        dir="ltr"
                    >
                        <div>
                            <p className="text-sm text-gray-700">
                                عرض{' '}
                                <span className="font-medium">
                                    {pagination.from || 0}
                                </span>{' '}
                                إلى{' '}
                                <span className="font-medium">
                                    {pagination.to || 0}
                                </span>{' '}
                                من أصل{' '}
                                <span className="font-medium">
                                    {pagination.total || 0}
                                </span>{' '}
                                نتيجة
                            </p>
                        </div>
                        <div>
                            <nav
                                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                                aria-label="Pagination"
                            >
                                {pagination.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${link.active ? 'z-10 bg-black text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'} ${!link.url ? 'pointer-events-none opacity-50' : ''} ${i === 0 ? 'rounded-l-md' : ''} ${i === pagination.links.length - 1 ? 'rounded-r-md' : ''} `}
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                link.label ===
                                                '&laquo; Previous'
                                                    ? '&laquo;'
                                                    : link.label ===
                                                        'Next &raquo;'
                                                      ? '&raquo;'
                                                      : link.label,
                                        }}
                                        preserveState
                                        preserveScroll
                                    />
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
