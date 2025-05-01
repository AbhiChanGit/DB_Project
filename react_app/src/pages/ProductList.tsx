import React, { useEffect, useState } from 'react';
import { Input, Row, Col } from 'antd';
import api from '../api';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

const dummyProducts: Product[] = [
  { product_id: '1', name: 'Air max', brand: 'Nike', price: 300, image_url: 'https://4app.kicksonfire.com/kofapp/upload/events_master_images/thumb_ipad_missing-link-x-nike-air-max-susan.jpg' },
  { product_id: '2', name: '55 inch TV', brand: 'Sony', price: 2000, image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwIf_fvmYcelsZbWEpnYbrZ585NEHpnuGJLw&s' },
  { product_id: '3', name: 'Laptop', brand: 'Dell', price: 1500, image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-B-syWeZzOl2lDbYJrqo5dPmxuTUELy7kRg&s' },
  { product_id: '4', name: 'Smartphone', brand: 'Apple', price: 1200, image_url: 'https://www.apple.com/newsroom/images/2024/09/apple-debuts-iphone-16-pro-and-iphone-16-pro-max/tile/Apple-iPhone-16-Pro-hero-240909-lp.jpg.og.jpg?202503102159' },
  { product_id: '5', name: 'Headphones', brand: 'Bose', price: 300, image_url: 'https://m.media-amazon.com/images/I/51ZR4lyxBHL._AC_UF894,1000_QL80_.jpg' },
  // add more dummy products as needed
];

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    // const url = search
    //   ? `/customers/api/v1/search_product?search=${encodeURIComponent(search)}`
    //   : '/customers/products';
    // const res = await api.get<Product[]>(url);
    const filtered = dummyProducts.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
    setProducts(filtered);
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
