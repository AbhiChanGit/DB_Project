import React from 'react';
import { Form, Input, Checkbox, Button } from 'antd';
import { Address } from '../types';

export const AddressForm: React.FC<{
  initial?: Partial<Address>;
  onSave: (data: Omit<Address, 'address_id'>) => void;
}> = ({ initial = {}, onSave }) => {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      initialValues={initial}
      onFinish={vals => onSave(vals as any)}
      layout="vertical"
    >
      <Form.Item name="address_type" label="Type" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="street_address" label="Street" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="city" label="City" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="state" label="State" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="postal_code" label="Postal Code" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="country" label="Country" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="is_default" valuePropName="checked">
        <Checkbox>Default</Checkbox>
      </Form.Item>
      <Form.Item>
        <Button htmlType="submit" type="primary">Save</Button>
      </Form.Item>
    </Form>
  );
};
