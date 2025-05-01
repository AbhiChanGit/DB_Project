// frontend/src/pages/StaffStockManagement.tsx
import React, { useEffect, useState } from 'react';
import { Form, Select, InputNumber, Button, message } from 'antd';
import api from '../api/client';
import { Product } from '../types';

interface Warehouse {
  warehouse_id: number;
  address: string;
}

export const StaffStockManagement: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    const load = async () => {
      try {
        const w = await api.get<Warehouse[]>('/staffs/warehouses');
        setWarehouses(w.data);
      } catch {
        message.error('Failed to load warehouses');
      }
      try {
        const p = await api.get<Product[]>('/customers/products');
        setProducts(p.data);
      } catch {
        message.error('Failed to load products');
      }
    };
    load();
  }, []);

  const onFinish = async (vals: { product_id: string; warehouse_id: number; quantity: number }) => {
    try {
      await api.post(`/staffs/api/v1/stock/${vals.product_id}/add`, {
        warehouse_id: vals.warehouse_id,
        quantity: vals.quantity,
      });
      message.success('Stock added');
      form.resetFields();
    } catch {
      message.error('Failed to add stock');
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 400, margin: 'auto' }}>
      <Form.Item name="product_id" label="Product" rules={[{ required: true }]}>
        <Select placeholder="Select product">
          {products.map(p => (
            <Select.Option key={p.product_id} value={p.product_id}>
              {p.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="warehouse_id" label="Warehouse" rules={[{ required: true }]}>
        <Select placeholder="Select warehouse">
          {warehouses.map(w => (
            <Select.Option key={w.warehouse_id} value={w.warehouse_id}>
              {w.address}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="quantity" label="Quantity" rules={[{ required: true, type: 'number', min: 1 }]}>
        <InputNumber style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" block>Add Stock</Button>
      </Form.Item>
    </Form>
  );
};
