import React, { useState } from 'react';
import { Form, Input, Button, Radio, message } from 'antd';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';
import { SignupValues } from '../types';

export const Signup: React.FC = () => {
  const [form] = Form.useForm<SignupValues>();
  const [userType, setUserType] = useState<'customer' | 'staff'>('customer');
  const nav = useNavigate();

  const onFinish = async (vals: SignupValues) => {
    const {
      first_name,
      last_name,
      email,
      password,
      phone,
      userType: type,
      salary,
      job_title,
      hire_date,
    } = vals;

    try {
      // 1) send signup request
      await api.post('/auth/signup', {
        first_name,
        last_name,
        email,
        password,
        phone,
        userType: type,
        salary,
        job_title,
        hire_date,
      });

      message.success('✅ Verification code sent to your email (valid 10 min)');

      // 2) navigate to verify, passing all fields
      nav('/verify-signup', {
        state: {
          email,
          username: email.split('@')[0],
          password,
          userType: type,
          first_name,
          last_name,
          phone,
          salary,
          job_title,
          hire_date,
        },
      });
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <Form
      form={form}
      onFinish={onFinish}
      layout="vertical"
      style={{ maxWidth: 400, margin: 'auto', marginTop: 50 }}
      initialValues={{ userType: 'customer' }}
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
        name="userType"
        label="User Type"
        rules={[{ required: true, message: 'Please select a user type' }]}
      >
        <Radio.Group onChange={e => setUserType(e.target.value)}>
          <Radio value="customer">Customer</Radio>
          <Radio value="staff">Staff</Radio>
        </Radio.Group>
      </Form.Item>

      {userType === 'staff' && (
        <>
          <Form.Item
            name="salary"
            label="Salary"
            rules={[{ required: true, message: 'Please enter a salary' }]}
          >
            <Input type="number" step="0.01" />
          </Form.Item>

          <Form.Item
            name="job_title"
            label="Job Title"
            rules={[{ required: true, message: 'Please enter a job title' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="hire_date"
            label="Hire Date"
            rules={[{ required: true, message: 'Please pick a hire date' }]}
          >
            <Input type="date" />
          </Form.Item>
        </>
      )}

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Sign Up
        </Button>
      </Form.Item>
    </Form>
  );
};
