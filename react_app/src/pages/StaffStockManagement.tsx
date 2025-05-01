// frontend/src/pages/StaffStockManagement.tsx
import React, { useEffect, useState } from 'react';
import { Form, Select, InputNumber, Button, message, Table } from 'antd';
import api from '../api';
import { Product } from '../types';

interface Stock {
  id: number;
  product_id: string;
  warehouse_id: number;
  quantity: number;
}

const dummyStock: Stock[] = [
  { id: 1, product_id: '1', warehouse_id: 1, quantity: 100 },
  { id: 2, product_id: '2', warehouse_id: 1, quantity: 200 },
];

export const StaffStockManagement: React.FC = () => {
  const [stock, setStock] = useState<Stock[]>(dummyStock);

  useEffect(() => { setStock(dummyStock); }, []);

  const updateStock = (id: number, newQuantity: number) => {
    setStock(prev => prev.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
    message.success('Stock updated');
  };

  return (
    <>
      <Button type="primary">Update Stock</Button>
      <Table dataSource={stock} rowKey="id"
        columns={[
          { title: 'Product ID', dataIndex: 'product_id' },
          { title: 'Warehouse ID', dataIndex: 'warehouse_id' },
          { title: 'Quantity', dataIndex: 'quantity' },
          {
            title: 'Actions',
            render: (_, record) => (
              <Button onClick={() => updateStock(record.id, record.quantity + 10)}>
                Increment
              </Button>
            )
          }
        ]}
      />
    </>
  );
};

// export const StaffStockManagement: React.FC = () => {
//   const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
//   const [products, setProducts] = useState<Product[]>([]);
//   const [form] = Form.useForm();

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const w = await api.get<Warehouse[]>('/staffs/warehouses');
//         setWarehouses(w.data);
//       } catch {
//         message.error('Failed to load warehouses');
//       }
//       try {
//         const p = await api.get<Product[]>('/customers/products');
//         setProducts(p.data);
//       } catch {
//         message.error('Failed to load products');
//       }
//     };
//     load();
//   }, []);

//   const onFinish = async (vals: { product_id: string; warehouse_id: number; quantity: number }) => {
//     try {
//       await api.post(`/staffs/api/v1/stock/${vals.product_id}/add`, {
//         warehouse_id: vals.warehouse_id,
//         quantity: vals.quantity,
//       });
//       message.success('Stock added');
//       form.resetFields();
//     } catch {
//       message.error('Failed to add stock');
//     }
//   };

//   return (
//     <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 400, margin: 'auto' }}>
//       <Form.Item name="product_id" label="Product" rules={[{ required: true }]}>
//         <Select placeholder="Select product">
//           {products.map(p => (
//             <Select.Option key={p.product_id} value={p.product_id}>
//               {p.name}
//             </Select.Option>
//           ))}
//         </Select>
//       </Form.Item>
//       <Form.Item name="warehouse_id" label="Warehouse" rules={[{ required: true }]}>
//         <Select placeholder="Select warehouse">
//           {warehouses.map(w => (
//             <Select.Option key={w.warehouse_id} value={w.warehouse_id}>
//               {w.address}
//             </Select.Option>
//           ))}
//         </Select>
//       </Form.Item>
//       <Form.Item name="quantity" label="Quantity" rules={[{ required: true, type: 'number', min: 1 }]}>
//         <InputNumber style={{ width: '100%' }} />
//       </Form.Item>
//       <Form.Item>
//         <Button type="primary" htmlType="submit" block>Add Stock</Button>
//       </Form.Item>
//     </Form>
//   );
// };
