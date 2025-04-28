// frontend/src/components/ProductCard.tsx
import React from 'react';
import { Card, Button, message } from 'antd';
import { Product } from '../types';
import api from '../api';

export const ProductCard: React.FC<{ product: Product; onAdd?: () => void }> = ({ product, onAdd }) => {
  const addToCart = async () => {
    try {
      await api.post(`/customers/api/v1/cart/${product.product_id}/add`, { quantity: 1 });
      message.success('Added to cart');
      onAdd?.();
    } catch {
      message.error('Failed to add to cart');
    }
  };

  return (
    <Card
      cover={product.image_url && <img alt={product.name} src={product.image_url} />}
      title={product.name}
      extra={<span>${product.price.toFixed(2)}</span>}
    >
      <Button type="primary" onClick={addToCart}>Add to Cart</Button>
    </Card>
  );
};
