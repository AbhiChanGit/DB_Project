import React from 'react';
import { Form, Input, Button, Radio, message } from 'antd';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';
import { SignupValues } from '../types';

export const Signup: React.FC = () => {
  const nav = useNavigate();

  const onFinish = async (vals: SignupValues) => {
    // 1) pull out only the fields your API expects
    const { first_name, last_name, email, password, phone, user_type } = vals;

    // 2) construct the payload
    const payload = { first_name, last_name, email, password, phone, user_type };

    try {
      await api.post('/auth/signup', payload);
      message.success('Verification code sent to your email (valid 10 min)');
      nav('/verify-signup');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <Form
      onFinish={onFinish}
      layout="vertical"
      style={{ maxWidth: 400, margin: 'auto', marginTop: 50 }}
    >
      <Form.Item
        name="first_name"
        label="First Name"
        rules={[{ required: true, message: 'Please enter your first name' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="last_name"
        label="Last Name"
        rules={[{ required: true, message: 'Please enter your last name' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="password"
        label="Password"
        rules={[{ required: true, message: 'Please enter a password' }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        name="phone"
        label="Phone"
        rules={[{ required: true, message: 'Please enter a phone number' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="user_type"
        label="User Type"
        rules={[{ required: true, message: 'Please select a user type' }]}
      >
        <Radio.Group>
          <Radio value="customer">Customer</Radio>
          <Radio value="staff">Staff</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Sign Up
        </Button>
      </Form.Item>
    </Form>
  );
};
