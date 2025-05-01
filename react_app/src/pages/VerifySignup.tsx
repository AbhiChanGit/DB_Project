import React, { useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import api from '../api/client';
import { useNavigate, useLocation } from 'react-router-dom';

interface VerifyState {
  email:      string;
  username:   string;
  password:   string;
  userType:   'customer' | 'staff';
  first_name: string;
  last_name:  string;
  phone:      string;
  salary?:    string;
  job_title?: string;
  hire_date?: string;
}

export const VerifySignup: React.FC = () => {
  const [form] = Form.useForm<{ email: string; code: string }>();
  const nav = useNavigate();
  const { state } = useLocation();
  const {
    email,
    username,
    password,
    userType,
    first_name,
    last_name,
    phone,
    salary,
    job_title,
    hire_date,
  } = (state as VerifyState) || {};

  useEffect(() => {
    const missingCore =
      !email || !username || !password || !userType ||
      !first_name || !last_name || !phone;
    const missingStaff =
      userType === 'staff' && (!salary || !job_title || !hire_date);

    if (missingCore || missingStaff) {
      message.error('Missing signup info—please start over');
      nav('/signup');
      return;
    }
    form.setFieldsValue({ email });
  }, [
    email, username, password, userType,
    first_name, last_name, phone,
    salary, job_title, hire_date,
    form, nav,
  ]);

  const onFinish = async (values: { code: string }) => {
    try {
      await api.post('/auth/verify-signup', {
        email,
        code:       values.code,
        username,
        password,
        userType,
        first_name,
        last_name,
        phone,
        ...(userType === 'staff' && { salary, job_title, hire_date }),
      });
      message.success('✅ Signup verified! You can now log in.');
      nav('/login');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Verification failed');
    }
  };

  return (
    <Form
      form={form}
      onFinish={onFinish}
      layout="vertical"
      style={{ maxWidth: 360, margin: 'auto', marginTop: 40 }}
    >
      <Form.Item label="Email">
        <Input disabled />
      </Form.Item>

      <Form.Item
        name="code"
        label="Verification Code"
        rules={[{ required: true, message: 'Enter the code we emailed you' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Verify
        </Button>
      </Form.Item>
    </Form>
  );
};
