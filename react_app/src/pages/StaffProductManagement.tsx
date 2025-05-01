import React from 'react';
import { Form, Input, Button, message, Table } from 'antd';
import { Product } from '../types';
import api from '../api';
import { useEffect, useState } from 'react';

const dummyProducts: Product[] = [
  { product_id: '1', name: 'Product A', brand: 'Brand X', price: 10.0, image_url: 'https://via.placeholder.com/150' },
  { product_id: '2', name: 'Product B', brand: 'Brand Y', price: 20.0, image_url: 'https://via.placeholder.com/150' },
];

export const StaffProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(dummyProducts);

  useEffect(() => { setProducts(dummyProducts); }, []);

  const deleteProduct = async (productId: string) => {
    setProducts(prev => prev.filter(p => p.product_id !== productId));
    message.success('Product deleted');
  };

  return (
    <>
      <Button type="primary">Add New Product</Button>
      <Table dataSource={products} rowKey="product_id" 
        columns={[
          { title: 'Product Name', dataIndex: 'name' },
          { title: 'Brand', dataIndex: 'brand' },
          { title: 'Price', dataIndex: 'price' },
          {
            title: 'Actions',
            render: (_, record) => (
              <>
                <Button onClick={() => {/* simulate edit */}}>Edit</Button>
                <Button danger onClick={() => deleteProduct(record.product_id)}>Delete</Button>
              </>
            )
          }
        ]}
      />
    </>
  );
};

// export const StaffProductManagement: React.FC = () => {
//   const [form] = Form.useForm();
//   const onFinish = async (v: any) => {
//     try {
//       await api.post(`/staffs/api/v1/products/${v.product_id}/create`, v);
//       message.success('Product added');
//       form.resetFields();
//     } catch {
//       message.error('Failed to add product');
//     }
//   };

//   return (
//     <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 400, margin: 'auto' }}>
//       <Form.Item name="product_id" label="ID" rules={[{ required: true }]}>
//         <Input />
//       </Form.Item>
//       <Form.Item name="name" label="Name" rules={[{ required: true }]}>
//         <Input />
//       </Form.Item>
//       <Form.Item name="description" label="Description">
//         <Input />
//       </Form.Item>
//       <Form.Item name="brand" label="Brand">
//         <Input />
//       </Form.Item>
//       <Form.Item name="size" label="Size">
//         <Input />
//       </Form.Item>
//       <Form.Item name="image_url" label="Image URL">
//         <Input />
//       </Form.Item>
//       <Form.Item name="price" label="Price" rules={[{ required: true, type: 'number' }]}>
//         <Input />
//       </Form.Item>
//       <Form.Item>
//         <Button type="primary" htmlType="submit" block>Add Product</Button>
//       </Form.Item>
//     </Form>
//   );
// };
