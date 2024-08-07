'use client';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Sky, useTexture } from '@react-three/drei';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { GirlModel } from './GirlModel';
import { Officetable } from './Officetable';
import Cart from './Cart';
import { useRouter } from 'next/navigation';

export default function Experience() {
    const [images, setImages] = useState([]);
    const [responseText, setResponseText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isProcessingQuery, setIsProcessingQuery] = useState(false);
    const [userPrompt, setUserPrompt] = useState('');
    const [cartItems, setCartItems] = useState([]);
    const recognition = useRef(null);
    const router = useRouter();

    useEffect(() => {
        if (window.SpeechRecognition || window.webkitSpeechRecognition) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition.current = new SpeechRecognition();
            recognition.current.continuous = true;
            recognition.current.interimResults = true;
            recognition.current.lang = 'en-US';

            recognition.current.onresult = async (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');

                if (event.results[0].isFinal) {
                    handleQuery(transcript);
                }
            };

            recognition.current.onerror = (event) => {
                console.error('Speech recognition error detected: ', event.error);
            };
        }
    }, []);

    const handleQuery = async (queryText) => {
        if (isProcessingQuery || isSpeaking) return;

        setIsProcessingQuery(true);
        try {
            const response = await axios.post('http://localhost:8000/query/', { query_text: queryText });
            const fetchedImages = response.data.images || [];
            setImages(fetchedImages);
            const newResponseText = response.data.response;

            if (newResponseText) {
                setResponseText(newResponseText);
                speakText(newResponseText);
            }

            const itemToAdd = response.data.addToCart;
            if (itemToAdd) {
                addToCart({
                    id: itemToAdd.id,
                    filename: itemToAdd.filename,
                    description: itemToAdd.description,
                    price: itemToAdd.price
                });
            }

            const actionResult = response.data.response;
            if (actionResult && actionResult.includes("deleted from cart")) {
                const itemDescription = queryText.toLowerCase().replace("delete the", "").replace("remove the", "").trim();
                const itemIndex = cartItems.findIndex(item => item.description.toLowerCase() === itemDescription);
                if (itemIndex > -1) {
                    removeFromCart(itemIndex);
                }
            }
        } catch (error) {
            console.error('Error querying the database', error);
        } finally {
            setIsProcessingQuery(false);
        }
    };

    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.onstart = () => {
                setIsSpeaking(true);
                stopListening();
            };
            utterance.onend = () => {
                setIsSpeaking(false);
                startListening();
            };
            window.speechSynthesis.speak(utterance);
        } else {
            console.warn('Speech synthesis not supported in this browser.');
        }
    };

    const startListening = () => {
        if (recognition.current && !isSpeaking && !isProcessingQuery) {
            recognition.current.start();
            setIsListening(true);
        }
    };

    const stopListening = () => {
        if (recognition.current) {
            recognition.current.stop();
            setIsListening(false);
        }
    };

    const handleTextSubmit = () => {
        if (userPrompt) {
            handleQuery(userPrompt);
            setUserPrompt('');
        }
    };

    const addToCart = (item) => {
        setCartItems((prevItems) => {
            const existingItemIndex = prevItems.findIndex(cartItem => cartItem.description === item.description);
            if (existingItemIndex > -1) {
                return prevItems.map((cartItem, index) =>
                    index === existingItemIndex
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            }
            return [...prevItems, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (index) => {
        if (typeof index !== 'number') {
            console.error('Index must be a number:', index);
            return;
        }

        setCartItems((prevItems) => prevItems.filter((_, i) => i !== index));
    };

    const updateCartItem = (index, quantity) => {
        setCartItems((prevItems) =>
            prevItems.map((item, i) => (i === index ? { ...item, quantity: Number(quantity) } : item))
        );
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + item.quantity * item.price, 0);
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
            <Canvas shadows camera={{ position: [0, 0, 2.4] }}>
                <OrbitControls />
                <Sky />
                <Environment preset="sunset" />

                <GirlModel />
                <Officetable />
                <TextureAndViewport />
                <TextureOnTable />
            </Canvas>
            <button
                onClick={() => (isListening ? stopListening() : startListening())}
                className='absolute top-[60%] left-[60%] transform -translate-x-1/2 -translate-y-1/2 z-10 p-2 text-2xl border rounded bg-slate-300'
            >
                {isListening ? '⏹️' : '🎤'}
            </button>
            <AnimatePresence>
                {images.length > 0 && (
                    <motion.div
                        className='absolute top-10 right-10 z-10 p-2 w-1/3 h-[80vh] overflow-auto bg-white rounded shadow-lg'
                        initial={{ opacity: 0, x: 300 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 300 }}
                        transition={{ duration: 0.5 }}
                    >
                        {images.map((image) => (
                            <ImageCard key={image.id} image={image} onAddToCart={addToCart} />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            <Cart
                cartItems={cartItems}
                removeFromCart={removeFromCart}
                updateCartItem={updateCartItem}
                total={calculateTotal()}
            />
            <div className='absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 p-2 w-1/3 bg-white rounded shadow-lg'>
                <input
                    type='text'
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder='Enter your query'
                    className='w-full p-2 border rounded'
                />
                <button
                    onClick={handleTextSubmit}
                    className='mt-2 w-full p-2 bg-blue-500 text-white rounded'
                >
                    Submit
                </button>
                {responseText && (
                    <div className='mt-4'>
                        <p>{responseText}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function TextureAndViewport() {
    const texture = useTexture('/shopbg.jpg');
    const viewport = useThree((state) => state.viewport);

    return (
        <mesh>
            <planeGeometry args={[viewport.width, viewport.height]} />
            <meshBasicMaterial map={texture} position={[0, 0, -5]} />
        </mesh>
    );
}

function TextureOnTable() {
    const banner = useTexture('/falconrobotics.jpg');
    const tableFrontWidth = 1.3;
    const tableFrontHeight = 0.36;

    return (
        <mesh position={[-0.1, -0.5, 0.9]} rotation={[0, 0.1, 0]}>
            <planeGeometry args={[tableFrontWidth, tableFrontHeight]} />
            <meshBasicMaterial map={banner} />
        </mesh>
    );
}

function ImageCard({ image, onAddToCart }) {
    return (
        <div className='p-2 border-b'>
            <h3>{image.description}</h3>
            <p>Price: ${image.price.toFixed(2)}</p>
            <Image
                src={`http://localhost:8000/images/${image.filename}`}
                alt={image.description}
                width={200}
                height={200}
                className='w-full h-auto'
            />
            <button
                onClick={() => onAddToCart(image)}
                className='mt-2 p-2 bg-green-500 text-white rounded'
            >
                Add to Cart
            </button>
        </div>
    );
}
