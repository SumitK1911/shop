'use client';
import { useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import Link from 'next/link';
import { useCart } from '../context/CartContext'; // Assuming you use context for cart items

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const Checkout = () => {
    const { cartItems } = useCart(); // Get cart items from context

    useEffect(() => {
        // Load any required data or initialize payment providers here
    }, []);

    return (
        <div className='p-6'>
            <div className='flex flex-row gap-5 mb-6'>
                <h1 className='text-2xl font-bold'>Checkout Page</h1>
                <Link href='/' className='text-blue-500'>Home</Link>
            </div>

            <Elements stripe={stripePromise}>
                <CheckoutForm cartItems={cartItems} />
            </Elements>
        </div>
    );
};

export default Checkout;
