import React from "react";
import { Link } from "wouter";

// Instagram feed images
const instagramPosts = [
  {
    id: 1,
    imageUrl: "https://images.unsplash.com/photo-1489493585363-d69421e0edd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
    alt: "Desert dunes at sunset"
  },
  {
    id: 2,
    imageUrl: "https://pixabay.com/get/g87604373fdc4754c4104c221ce92212a7c784093a01fbd316c3879b4594030b57a4854d34f4b5161794457dfe8c53cda4579b5d64dccedaecf05591cc4111a72_1280.jpg",
    alt: "Local guide with camels"
  },
  {
    id: 3,
    imageUrl: "https://pixabay.com/get/g03192a26d8c85f12c17cebb81e1ef0f2fb89572adbe8555dc54337b3e2e26611cdd342a1e3abad41d006f5cf73e44d85d3199e46a42ef7679371026cbf12ac0d_1280.jpg",
    alt: "Moroccan mint tea service"
  },
  {
    id: 4,
    imageUrl: "https://pixabay.com/get/g4796dff552ca09f522d34b03d6e34ff89700abc201bccf125923d4f63d4e83238acc60d2d87b56c9ee31650fbf3edf78b68e796737dfd7d151f10f30d8351934_1280.jpg",
    alt: "Moroccan doorway with tilework"
  }
];

export default function InstagramSection() {
  return (
    <section className="py-16 bg-sandy/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-arabic font-bold text-moroccan-brown">Follow Our Adventures</h2>
          <div className="h-1 w-24 bg-moroccan-gold mx-auto mt-4"></div>
          <p className="mt-4 text-lg text-gray-700">
            Check out our latest tours on Instagram{" "}
            <a 
              href="https://www.instagram.com/medina_expeditions" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-royalblue hover:underline"
            >
              @medina_expeditions
            </a>
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {instagramPosts.map((post) => (
            <a 
              key={post.id}
              href="https://www.instagram.com/medina_expeditions" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <img 
                src={post.imageUrl} 
                alt={post.alt} 
                className="w-full h-64 object-cover rounded-lg hover:opacity-90 transition cursor-pointer"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
