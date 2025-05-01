import React, { useEffect, useState } from 'react';
import { List, Button, InputNumber } from 'antd';
import { CartItem, Product } from '../types';

// Dummy products simulating the product list from ProductList.tsx
const dummyProducts: Product[] = [
  { product_id: '1', name: 'Air max', brand: 'Nike', price: 300, image_url: 'https://4app.kicksonfire.com/kofapp/upload/events_master_images/thumb_ipad_missing-link-x-nike-air-max-susan.jpg' },
  { product_id: '2', name: '55 inch TV', brand: 'Sony', price: 2000, image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwIf_fvmYcelsZbWEpnYbrZ585NEHpnuGJLw&s' },
  { product_id: '3', name: 'Laptop', brand: 'Dell', price: 1500, image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-B-syWeZzOl2lDbYJrqo5dPmxuTUELy7kRg&s' },
  // add more dummy products as needed
];

// Dummy cart items using product IDs from dummyProducts
const dummyCartItems: CartItem[] = [
  { product_id: '1', quantity: 2 },
  { product_id: '2', quantity: 1 },
];

export const Cart: React.FC = () => {
  const [items, setItems] = useState<CartItem[]>([]);

  const load = async () => {
    // simulate loading dummy cart items
    setItems(dummyCartItems);
  };

  useEffect(() => { load(); }, []);

  return (
    <List
      dataSource={items}
      renderItem={i => {
        // Find the corresponding product information for each cart item
        const product = dummyProducts.find(p => p.product_id === i.product_id);
        return (
          <List.Item
            actions={[
              <InputNumber
                defaultValue={i.quantity}
                min={1}
                onChange={async q => {
                  // simulate updating quantity locally
                  setItems(prev =>
                    prev.map(item =>
                      item.product_id === i.product_id ? { ...item, quantity: q ?? item.quantity } : item
                    )
                  );
                }}
              />,
              <Button
                danger
                onClick={async () => {
                  // simulate removing item locally
                  setItems(prev => prev.filter(item => item.product_id !== i.product_id));
                }}
              >
                Remove
              </Button>
            ]}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {product ? (
                <>
                  <img src={product.image_url} alt={product.name} style={{ width: 50, marginRight: 10 }} />
                  <div>
                    <div>
                      <strong>{product.name}</strong> by {product.brand}
                    </div>
                    <div>Price: ${product.price}</div>
                    <div>Quantity: {i.quantity}</div>
                  </div>
                </>
              ) : (
                <span>Product ID: {i.product_id}</span>
              )}
            </div>
          </List.Item>
        );
      }}
    />
  );
};