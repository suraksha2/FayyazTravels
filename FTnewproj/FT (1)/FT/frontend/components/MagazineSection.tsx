"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Clock, Tag } from 'lucide-react'
import Link from 'next/link'

interface Post {
  id: number
  post_title: string
  post_url: string
  post_content: string
  feature_img: string
  post_cat: number
  category_name: string
  read_time: string
  post_date: string
  insert_date: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'

export default function MagazineSection() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/posts?limit=5`)
        const data = await response.json()
        
        if (data.success && data.posts) {
          setPosts(data.posts)
        }
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-[#002147] to-[#003366] text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8">Fayyaz Magazine</h2>
          <p className="text-gray-300">Loading articles...</p>
        </div>
      </section>
    )
  }

  const featuredPost = posts[0]
  const otherPosts = posts.slice(1, 5)

  return (
    <section className="py-20 bg-gradient-to-b from-[#002147] to-[#003366] text-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main title centered */}
        <h2 className="text-4xl font-bold text-center mb-16">Fayyaz Magazine</h2>

        {/* Featured article section */}
        {featuredPost && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-16 max-w-5xl mx-auto">
            {/* Image with rounded corners */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={featuredPost.feature_img ? `http://localhost:3003/${featuredPost.feature_img}` : "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg"}
                alt={featuredPost.post_title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Content section with yellow accent bar */}
            <div className="relative pl-6">
              {/* Yellow accent bar on the left */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C69C3C]"></div>
              
              <div className="space-y-4">
                <h3 className="text-3xl font-bold">{featuredPost.post_title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {featuredPost.post_content?.replace(/<[^>]*>/g, '').substring(0, 200) + '...'}
                </p>
                
                {/* Badges with icons */}
                <div className="flex items-center gap-3">
                  {featuredPost.category_name && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-white/90 text-gray-800 rounded text-xs">
                      <Tag className="w-3 h-3" />
                      {featuredPost.category_name}
                    </span>
                  )}
                  {featuredPost.read_time && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-white/90 text-gray-800 rounded text-xs">
                      <Clock className="w-3 h-3" />
                      {featuredPost.read_time}
                    </span>
                  )}
                </div>
                
                {/* Buttons */}
                <div className="flex flex-col gap-3 pt-4">
                  <Link href={`/blog/${featuredPost.post_url}`}>
                    <Button className="w-full bg-white text-gray-800 hover:bg-gray-100 font-medium">
                      Read Now
                    </Button>
                  </Link>
                  <Link href="/blog">
                    <Button className="w-full bg-white text-gray-800 hover:bg-gray-100 font-medium">
                      See all Blogs
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom article cards - horizontal layout */}
        {otherPosts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {otherPosts.map((post) => (
              <Link 
                key={post.id}
                href={`/blog/${post.post_url}`}
                className="bg-white rounded-lg overflow-hidden flex items-center cursor-pointer hover:shadow-lg transition-shadow"
              >
                {/* Small image on left */}
                <div className="w-20 h-20 flex-shrink-0">
                  <img
                    src={post.feature_img ? `http://localhost:3003/${post.feature_img}` : "https://images.pexels.com/photos/2161449/pexels-photo-2161449.jpeg"}
                    alt={post.post_title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Title on right */}
                <div className="flex-1 px-4">
                  <h4 className="text-gray-800 font-medium text-sm">{post.post_title}</h4>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}