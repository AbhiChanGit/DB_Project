import React, { useEffect, useState } from 'react';
import { Input, Row, Col, message } from 'antd';
import api from '../api/client';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    // Fetch (and re-fetch on search change)
    const fetchProducts = async () => {
      try {
        // Always call the same endpoint, with optional ?search=
        const endpoint = search
          ? `/customers/products?search=${encodeURIComponent(search)}`
          : `/customers/products`;

        const res = await api.get<Product[]>(endpoint);
        setProducts(res.data);
      } catch (err: any) {
        // Show a user-friendly message rather than uncaught errors
        message.error(err.response?.data?.message || 'Failed to load products');
      }
    };

    fetchProducts();
  }, [search]);

  return (
    <div style={{ padding: 20 }}>
      <Input.Search
        placeholder="Search products"
        onSearch={q => setSearch(q.trim())}
        style={{ marginBottom: 20 }}
        allowClear
      />

      <Row gutter={[16, 16]}>
        {products.map(p => (
          <Col key={p.product_id} span={6}>
            <ProductCard product={p} onAdd={() => { /* optional refetch */ }} />
          </Col>
        ))}
      </Row>
    </div>
  );
};
