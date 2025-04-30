import React from 'react';
import { Form, Input, Button, message } from 'antd';
import api from '../api/client';

export const StaffProductManagement: React.FC = () => {
  const [form] = Form.useForm();
  const onFinish = async (v: any) => {
    try {
      await api.post(`/staffs/api/v1/products/${v.product_id}/create`, v);
      message.success('Product added');
      form.resetFields();
    } catch {
      message.error('Failed to add product');
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 400, margin: 'auto' }}>
      <Form.Item name="product_id" label="ID" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="name" label="Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <Input />
      </Form.Item>
      <Form.Item name="brand" label="Brand">
        <Input />
      </Form.Item>
      <Form.Item name="size" label="Size">
        <Input />
      </Form.Item>
      <Form.Item name="image_url" label="Image URL">
        <Input />
      </Form.Item>
      <Form.Item name="price" label="Price" rules={[{ required: true, type: 'number' }]}>
        <Input />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" block>Add Product</Button>
      </Form.Item>
    </Form>
  );
};
