import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

export default function Table({ columns, data, onEdit, onDelete }) {
    return (
        <div className="w-full overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
            <table className="w-full text-sm text-right">
                <thead className="text-white bg-[#000000]">
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index} className="px-6 py-4 font-medium">{col.header}</th>
                        ))}
                        <th className="px-6 py-4 font-medium text-left">الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-gray-100 hover:bg-gray-50">
                            {columns.map((col, colIndex) => (
                                <td key={colIndex} className="px-6 py-4 text-gray-700">
                                    {row[col.accessor]}
                                </td>
                            ))}
                            <td className="px-6 py-4 flex items-center justify-end gap-3 text-left">
                                <button onClick={() => onEdit(row)} className="text-gray-400 hover:text-[#1b2b20]">
                                    <Edit size={18} />
                                </button>
                                <button onClick={() => onDelete(row)} className="text-red-400 hover:text-red-600">
                                    <Trash2 size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}