import React, { useEffect, useState } from 'react';
import { List, Button, Modal, message } from 'antd';
import api from '../api';
import { Address } from '../types';
import { AddressForm } from '../components/AddressForm';

export const Addresses: React.FC = () => {
  const [addrs, setAddrs] = useState<Address[]>([]);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<Address | undefined>();

  const load = async () => {
    try {
      const r = await api.get<Address[]>('/customers/addresses');
      setAddrs(r.data);
    } catch {
      message.error('Failed to load addresses');
    }
  };
  useEffect(() => { load(); }, []);

  const save = async (data: any) => {
    try {
      if (edit) {
        await api.put('/customers/address_update', { address_id: edit.address_id, ...data });
      } else {
        await api.post('/customers/address_create', data);
      }
      setModal(false);
      setEdit(undefined);
      load();
    } catch {
      message.error('Save failed');
    }
  };

  return (
    <>
      <Button type="primary" onClick={() => setModal(true)}>Add Address</Button>
      <List
        dataSource={addrs}
        renderItem={a => (
          <List.Item
            actions={[
              <Button onClick={() => { setEdit(a); setModal(true); }}>Edit</Button>,
              <Button danger onClick={async () => { await api.delete('/customers/address_delete', { data: { address_id: a.address_id } }); load(); }}>
                Delete
              </Button>
            ]}
          >
            {a.street_address}, {a.city}
          </List.Item>
        )}
      />
      <Modal visible={modal} footer={null} onCancel={() => { setModal(false); setEdit(undefined); }}>
        <AddressForm initial={edit} onSave={save} />
      </Modal>
    </>
  );
};
