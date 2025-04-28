import React from 'react';
import { Form, Input, Checkbox, Button } from 'antd';
import { CreditCard } from '../types';

export const CreditCardForm: React.FC<{
  initial?: Partial<CreditCard>;
  onSave: (data: Omit<CreditCard, 'card_id'>) => void;
}> = ({ initial = {}, onSave }) => {
  const [form] = Form.useForm();

  return (
    <Form form={form} initialValues={initial} onFinish={v => onSave(v as any)} layout="vertical">
      <Form.Item name="card_number" label="Card Number" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="card_holder_name" label="Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="expiry_date" label="Expiry" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="cvv" label="CVV" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item
        name="billing_address_id"
        label="Billing Address ID"
        rules={[{ required: true, type: 'number' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="is_default" valuePropName="checked">
        <Checkbox>Default</Checkbox>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">Save</Button>
      </Form.Item>
    </Form>
  );
};
