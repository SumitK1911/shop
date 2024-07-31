'use client'
import React from 'react'
import Card from './Card'

const Carousel = () => {
    const slides =[
        {image: '/falconrobotics.jpg', title:'Slide 1'},
        {image: '/falconrobotics.jpg', title:'Slide 1'},
        {image: '/falconrobotics.jpg', title:'Slide 1'},
    ]
  return (
    <div>
        <Card slides={slides}/>
    </div>
  )
}

export default Carousel