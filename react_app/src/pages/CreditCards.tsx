// frontend/src/pages/CreditCards.tsx
import React, { useEffect, useState } from 'react';
import { List, Button, Modal, message } from 'antd';
import api from '../api';
import { CreditCard } from '../types';
import { CreditCardForm } from '../components/CreditCardForm';

const dummyCreditCards: CreditCard[] = [
  {
    card_id: 1,
    customer_id: 1,
    card_number: '4111111111111111',
    card_holder_name: 'John Doe',
    expiry_date: '2026-12-31',
    cvv: '123',
    billing_address_id: 1,
    is_default: true,
  },
];

export const CreditCards: React.FC = () => {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState<CreditCard | undefined>();

  const load = async () => {
    // try {
    //   const r = await api.get<CreditCard[]>('/customers/credit_cards');
    //   setCards(r.data);
    // } catch {
    //   message.error('Failed to load cards');
    // }

    // simulate loading dummy cards
    setCards(dummyCreditCards);
  };

  useEffect(() => { load(); }, []);

  const save = async (data: any) => {
    // try {
    //   if (edit) {
    //     await api.put('/customers/credit_card_update', { card_id: edit.card_id, ...data });
    //   } else {
    //     await api.post('/customers/credit_card_create', data);
    //   }
    //   setModal(false);
    //   setEdit(undefined);
    //   load();
    // } catch {
    //   message.error('Save failed');
    // }

    setModal(false);
    setEdit(undefined);
    load();
  };

  return (
    <>
      <Button type="primary" onClick={() => setModal(true)}>Add Card</Button>
      <List
        dataSource={cards}
        renderItem={c => (
          <List.Item
            actions={[
              <Button onClick={() => { setEdit(c); setModal(true); }}>Edit</Button>,
              <Button danger onClick={async () => { await api.delete('/customers/credit_card_delete', { data: { card_id: c.card_id } }); load(); }}>
                Delete
              </Button>
            ]}
          >
            **** **** **** {c.card_number.slice(-4)}
          </List.Item>
        )}
      />
      <Modal visible={modal} footer={null} onCancel={() => { setModal(false); setEdit(undefined); }}>
        <CreditCardForm initial={edit} onSave={save} />
      </Modal>
    </>
  );
};
