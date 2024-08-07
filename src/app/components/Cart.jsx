'use client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function Cart({ cartItems, removeFromCart, updateCartItem, total }) {
    const router = useRouter();

    const handleQuantityChange = (index, value) => {
        const quantity = Number(value);
        if (!isNaN(quantity) && quantity >= 0) {
            updateCartItem(index, quantity);
        }
    };

    const handleProceedToCheckout = () => {
        router.push('/checkout');
    };

    return (
        <AnimatePresence>
            {cartItems.length > 0 && (
                <motion.div
                    className='absolute top-10 left-10 z-10 p-2 w-1/3 h-[80vh] overflow-auto bg-white rounded shadow-lg'
                    initial={{ opacity: 0, x: -300 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -300 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className='text-xl font-bold mb-4'>Cart</h2>
                    {cartItems.map((item, index) => (
                        <div key={index} className='p-2 border-b'>
                            <div className='flex items-center'>
                                <Image
                                    src={`http://localhost:8000/images/${item.filename}`}
                                    alt={item.description || item.name}
                                    width={100}
                                    height={100}
                                    className='mr-4'
                                />
                                <div>
                                    <h3 className='text-lg font-semibold'>{item.description}</h3>
                                    <div className='flex justify-between items-center mt-2'>
                                        <input
                                            type='number'
                                            value={item.quantity}
                                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                                            className='w-16 p-1 border rounded'
                                            min='0'
                                        />
                                        <p className='ml-4'>Price: ${item.price.toFixed(2)}</p>
                                        <button
                                            onClick={() => removeFromCart(index)}
                                            className='ml-4 p-1 bg-red-500 text-white rounded'
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className='p-2 mt-4 border-t'>
                        <h3 className='text-lg font-semibold'>Total: ${total.toFixed(2)}</h3>
                        <button
                            className='text-center border-black rounded-xl p-3 bg-slate-600 text-white'
                            onClick={handleProceedToCheckout}
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
