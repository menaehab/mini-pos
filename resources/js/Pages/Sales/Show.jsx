// data: sale{id, total_price, note, type, customer_name, installment_months, installment_amount, installment_rate, customer_id, user_id, customer{id, name, phone, address, national_number}, items[{id, product_name, sale_price, purchase_price, quantity, product_id, sale_id}], payment_allocations[{id, is_first_payment, customer_payment_id, sale_id, customer_payment{id, amount, note, customer_id, user_id}}]}
export default function Show({ sale }) {
    return <div>Show</div>;
}
