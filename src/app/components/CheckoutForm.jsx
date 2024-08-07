import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useState } from 'react';
import axios from 'axios';
import Image from 'next/image';

const CheckoutForm = ({ cartItems = [] }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + item.quantity * item.price, 0).toFixed(2);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: elements.getElement(CardElement),
        });

        if (error) {
            setError(error.message);
        } else {
            try {
                const response = await axios.post('/api/payment_intent', {
                    paymentMethodId: paymentMethod.id,
                    amount: calculateTotal(), // Send the total amount to be charged
                });

                if (response.data.success) {
                    setSuccess(true);
                } else {
                    setError('Payment failed');
                }
            } catch (err) {
                setError(err.response ? err.response.data.error : 'An error occurred');
            }
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            {cartItems.length === 0 ? (
                <p>No items in cart.</p>
            ) : (
                cartItems.map((item, index) => (
                    <div key={index} className="flex items-center mb-4">
                        <Image
                            src={`http://localhost:8000/images/${item.filename}`}
                            alt={item.description || item.name}
                            width={100}
                            height={100}
                            className="mr-4"
                        />
                        <div>
                            <h3 className="text-lg font-semibold">{item.description}</h3>
                            <p className="text-gray-600">Quantity: {item.quantity}</p>
                            <p className="text-gray-600">Price: ${item.price.toFixed(2)}</p>
                        </div>
                    </div>
                ))
            )}
            <h3 className="text-lg font-semibold mt-6">Total: ${calculateTotal()}</h3>
            <form onSubmit={handleSubmit} className="mt-6">
                <CardElement className="p-3 border rounded-md" />
                <button type="submit" disabled={!stripe} className="mt-4 p-2 bg-blue-500 text-white rounded-md">
                    Pay
                </button>
                {error && <div className="mt-4 text-red-500">{error}</div>}
                {success && <div className="mt-4 text-green-500">Payment succeeded!</div>}
            </form>
        </div>
    );
};

export default CheckoutForm;
