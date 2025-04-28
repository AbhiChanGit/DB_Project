// frontend/src/types/index.ts
export interface Product {
    product_id: string;
    name: string;
    brand: string;
    price: number;
    image_url?: string;
}
  
export interface CartItem {
    product_id: string;
    quantity: number;
}
  
export interface Address {
    address_id: number;
    address_type: string;
    street_address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
}
  
export interface CreditCard {
    card_id: number;
    card_number: string;
    card_holder_name: string;
    expiry_date: string;
    cvv: string;
    billing_address_id: number;
    is_default: boolean;
}
  
export interface SignupValues {
    first_name: string;
    middle_name?: string;
    last_name: string;
    email: string;
    password: string;
    phone_number: string;
    type_of_user: 'customer' | 'staff';
}
  