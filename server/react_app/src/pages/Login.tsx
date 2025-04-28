import React, { useState, useContext } from 'react';
import { Form, Input, Button, Radio, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const Login: React.FC = () => {
  const auth = useContext(AuthContext)!;
  const [userType, setUserType] = useState<'customer' | 'staff'>('customer');
  const nav = useNavigate();

  const onFinish = async (vals: { email: string; password: string }) => {
    try {
      await auth.login(vals.email, vals.password, userType);
      nav('/');
    } catch {
      message.error('Login failed');
    }
  };

  return (
    <Form
      onFinish={onFinish}
      layout="vertical"
      style={{ maxWidth: 300, margin: 'auto', marginTop: 50 }}
    >
      <Form.Item name="email" label="Email" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="password" label="Password" rules={[{ required: true }]}>
        <Input.Password />
      </Form.Item>
      <Form.Item>
        <Radio.Group value={userType} onChange={e => setUserType(e.target.value)}>
          <Radio value="customer">Customer</Radio>
          <Radio value="staff">Staff</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" block>Login</Button>
      </Form.Item>
    </Form>
  );
};
