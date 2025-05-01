import React, { useEffect, useState } from 'react';
import { List, Button, InputNumber, message } from 'antd';
import api from '../api/client';
import { CartItem } from '../types';

export const Cart: React.FC = () => {
  const [items, setItems] = useState<CartItem[]>([]);

  const load = async () => {
    try {
      const res = await api.get<CartItem[]>('/customers/api/v1/cart');
      setItems(res.data);
    } catch {
      message.error('Failed to load cart');
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <List
      dataSource={items}
      renderItem={i => (
        <List.Item
          actions={[
            <InputNumber
              defaultValue={i.quantity}
              min={1}
              onChange={async q => { await api.put(`/customers/api/v1/cart/${i.product_id}/update`, { quantity: q }); load(); }}
            />,
            <Button danger onClick={async () => { await api.delete(`/customers/api/v1/cart/${i.product_id}/remove`); load(); }}>
              Remove
            </Button>
          ]}
        >
          {i.product_id}
        </List.Item>
      )}
    />
  );
};
