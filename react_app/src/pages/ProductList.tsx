import React, { useEffect, useState } from 'react';
import { Input, Row, Col } from 'antd';
import api from '../api';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    const url = search
      ? `/customers/api/v1/search_product?search=${encodeURIComponent(search)}`
      : '/customers/products';
    const res = await api.get<Product[]>(url);
    setProducts(res.data);
  };

  useEffect(() => { fetchProducts(); }, [search]);

  return (
    <div style={{ padding: 20 }}>
      <Input.Search
        placeholder="Search products"
        onSearch={setSearch}
        style={{ marginBottom: 20 }}
      />
      <Row gutter={[16, 16]}>
        {products.map(p => (
          <Col key={p.product_id} span={6}>
            <ProductCard product={p} onAdd={fetchProducts} />
          </Col>
        ))}
      </Row>
    </div>
  );
};
