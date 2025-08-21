import React from 'react';
import OrderCard from './OrderCard';

export default function OrderCardList({orders}){
    return(
        <div>
            {orders.map((order) => (
                <OrderCard key={order.order_id} order={order} />
            ))}
        </div>
    )
}