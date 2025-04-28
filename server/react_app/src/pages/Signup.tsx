import React from 'react';
import { Form, Input, Button, Radio, message } from 'antd';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { SignupValues } from '../types';

export const Signup: React.FC = () => {
  const nav = useNavigate();

  const onFinish = async (vals: SignupValues) => {
    try {
      await api.post('/auth/signup', vals);
      message.success('Signup successful');
      nav('/login');
    } catch {
      message.error('Signup failed');
    }
  };

  return (
    <Form
      onFinish={onFinish}
      layout="vertical"
      style={{ maxWidth: 400, margin: 'auto', marginTop: 50 }}
    >
      <Form.Item name="first_name" label="First Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="middle_name" label="Middle Name">
        <Input />
      </Form.Item>
      <Form.Item name="last_name" label="Last Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="email" label="Email" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="password" label="Password" rules={[{ required: true }]}>
        <Input.Password />
      </Form.Item>
      <Form.Item name="phone_number" label="Phone" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="type_of_user" label="User Type" rules={[{ required: true }]}>
        <Radio.Group>
          <Radio value="customer">Customer</Radio>
          <Radio value="staff">Staff</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" block>Sign Up</Button>
      </Form.Item>
    </Form>
  );
};
