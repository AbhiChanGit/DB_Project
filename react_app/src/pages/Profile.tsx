// frontend/src/pages/Profile.tsx
import React, { useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import api from '../api';

export const Profile: React.FC = () => {
  const [form] = Form.useForm();

  useEffect(() => {
    api.get('/customers/').then(r => form.setFieldsValue(r.data)).catch(() => message.error('Failed to load profile'));
  }, []);

  const onFinish = async (v: any) => {
    try {
      await api.put('/customers/customer_update', v);
      message.success('Profile updated');
    } catch {
      message.error('Update failed');
    }
  };

  return (
    <Form form={form} onFinish={onFinish} layout="vertical" style={{ maxWidth: 400, margin: 'auto' }}>
      <Form.Item name="email" label="Email"><Input /></Form.Item>
      <Form.Item name="password" label="Password"><Input.Password /></Form.Item>
      <Form.Item name="phone" label="Phone"><Input /></Form.Item>
      <Form.Item><Button type="primary" htmlType="submit">Save</Button></Form.Item>
    </Form>
  );
};
