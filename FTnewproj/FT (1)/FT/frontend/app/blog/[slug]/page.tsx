"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Clock, ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import Footer from '@/components/Footer'

interface BlogPost {
    id: number
    post_title: string
    post_url: string
    post_content: string
    post_excerpt?: string
    feature_img?: string
    post_cat?: number
    category_name?: string
    read_time?: string
    post_date?: string
    insert_date?: string
}

interface SidebarPost {
    id: number
    post_title: string
    post_url: string
    feature_img?: string
    category_name?: string
    read_time?: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'

export default function BlogDetailPage() {
    const params = useParams()
    const slug = params.slug as string

    const [post, setPost] = useState<BlogPost | null>(null)
    const [sidebarPosts, setSidebarPosts] = useState<SidebarPost[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [inspirationIndex, setInspirationIndex] = useState(0)

    const inspirationDestinations = [
        {
            id: 1,
            country: "Sweden",
            subtitle: "Explore Sweden",
            image: "https://images.pexels.com/photos/3026364/pexels-photo-3026364.jpeg?auto=compress&cs=tinysrgb&w=1200",
        },
        {
            id: 2,
            country: "Norway",
            subtitle: "Explore Norway",
            image: "https://images.pexels.com/photos/3889891/pexels-photo-3889891.jpeg?auto=compress&cs=tinysrgb&w=1200",
        },
        {
            id: 3,
            country: "Spain",
            subtitle: "Explore Spain",
            image: "https://images.pexels.com/photos/5282269/pexels-photo-5282269.jpeg?auto=compress&cs=tinysrgb&w=1200",
        },
        {
            id: 4,
            country: "Italy",
            subtitle: "Explore Italy",
            image: "https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?auto=compress&cs=tinysrgb&w=1200",
        },
        {
            id: 5,
            country: "Greece",
            subtitle: "Explore Greece",
            image: "https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=1200",
        },
        {
            id: 6,
            country: "France",
            subtitle: "Explore France",
            image: "https://images.pexels.com/photos/2363/france-landmark-lights-night.jpg?auto=compress&cs=tinysrgb&w=1200",
        }
    ]

    const cardsPerPage = 3
    const totalPages = Math.ceil(inspirationDestinations.length / cardsPerPage)

    const nextInspiration = () => {
        if (inspirationIndex + cardsPerPage < inspirationDestinations.length) {
            setInspirationIndex(inspirationIndex + cardsPerPage)
        }
    }

    const prevInspiration = () => {
        if (inspirationIndex > 0) {
            setInspirationIndex(Math.max(0, inspirationIndex - cardsPerPage))
        }
    }

    useEffect(() => {
        // Scroll to top when page loads
        window.scrollTo(0, 0)

        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)

                // Fetch main post
                const postResponse = await fetch(`${API_BASE_URL}/posts/${slug}`)
                if (!postResponse.ok) throw new Error('Failed to fetch blog post')
                const postData = await postResponse.json()

                if (postData.success && postData.post) {
                    setPost(postData.post)
                } else {
                    throw new Error('Blog post not found')
                }

                // Fetch sidebar posts
                const postsResponse = await fetch(`${API_BASE_URL}/posts?limit=10`)
                const postsData = await postsResponse.json()
                if (postsData.success && postsData.posts) {
                    // Filter out current post
                    setSidebarPosts(postsData.posts.filter((p: SidebarPost) => p.post_url !== slug))
                }
            } catch (err) {
                console.error('Error fetching data:', err)
                setError(err instanceof Error ? err.message : 'Failed to load blog post')
            } finally {
                setLoading(false)
            }
        }

        if (slug) {
            fetchData()
        }
    }, [slug])

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="animate-pulse flex gap-8">
                        <div className="flex-1">
                            <div className="h-96 bg-gray-200 rounded mb-8"></div>
                            <div className="h-8 bg-gray-200 rounded mb-4"></div>
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            </div>
                        </div>
                        <div className="w-80">
                            <div className="h-64 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
                    <p className="text-gray-600 mb-8">{error || 'The blog post you are looking for does not exist.'}</p>
                    <Link href="/" className="text-[#C69C3C] hover:underline">
                        Back to Home
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Top Welcome Section with Image */}
            <div className="relative mb-8">
                {/* Background Image */}
                <div className="relative h-96 overflow-hidden">
                    <img
                        src={
                            post.feature_img
                                ? (post.feature_img.startsWith('http')
                                    ? post.feature_img
                                    : `${API_BASE_URL}/${post.feature_img}`)
                                : "https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg"
                        }
                        alt="Fayyaz Magazine"
                        className="w-full h-full object-cover"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white"></div>
                </div>

                {/* Welcome Text Overlay */}
                <div className="absolute bottom-0 left-0 right-0 pb-8">
                    <div className="max-w-md mx-auto text-center px-4">
                        <p className="text-gray-700 text-sm mb-2">Welcome to</p>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Fayyaz Magazine</h2>
                        <p className="text-gray-800 leading-relaxed text-sm">
                            At Fayyaz Travels, we are all about passionate traveling. Being an advocate of wanderlust, there's nothing we love more than sharing travel news, tips and inspirations with all jet-setters and globetrotters out there...and what better way to do so than to document it all?
                        </p>
                        <p className="text-gray-800 mt-3 text-sm">
                            Follow our blog and find yourself one flight away from the all the wonders of the world.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* Main Content */}
                    <article className="flex-1">

                        {/* Category Tabs */}
                        <div className="flex justify-center mb-8 border-b pb-4">
                            <button className="px-8 py-2 bg-gray-200 text-gray-900 font-semibold rounded-full text-lg">
                                Guidebook
                            </button>
                        </div>

                        {/* Guidebook Blog Cards */}
                        <div className="mb-12 space-y-4">
                            {sidebarPosts.slice(0, 5).map((blogPost) => (
                                <Link
                                    key={blogPost.id}
                                    href={`/blog/${blogPost.post_url}`}
                                    className="group flex items-center bg-gradient-to-r from-[#002147] to-[#003366] rounded-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                                >
                                    {/* Thumbnail */}
                                    <div className="w-24 h-24 flex-shrink-0">
                                        <img
                                            src={
                                                blogPost.feature_img
                                                    ? (blogPost.feature_img.startsWith('http')
                                                        ? blogPost.feature_img
                                                        : `${API_BASE_URL}/${blogPost.feature_img}`)
                                                    : "https://images.pexels.com/photos/3155666/pexels-photo-3155666.jpeg"
                                            }
                                            alt={blogPost.post_title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 px-4 py-3">
                                        <h3 className="text-white font-semibold text-base mb-1 group-hover:underline">
                                            {blogPost.post_title}
                                        </h3>
                                        {blogPost.read_time && (
                                            <p className="text-gray-300 text-sm">
                                                {blogPost.read_time}
                                            </p>
                                        )}
                                    </div>

                                    {/* Arrow Button */}
                                    <div className="w-12 h-24 bg-[#C69C3C] flex items-center justify-center flex-shrink-0">
                                        <ChevronRight className="w-6 h-6 text-white" />
                                    </div>
                                </Link>
                            ))}
                        </div>



                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                            {post.post_title}
                        </h1>

                        {/* Meta */}
                        {post.read_time && (
                            <div className="flex items-center gap-2 text-gray-600 mb-6">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">{post.read_time}</span>
                            </div>
                        )}

                        {/* Content */}
                        <div
                            className="prose prose-lg max-w-none mb-12 text-gray-700"
                            dangerouslySetInnerHTML={{ __html: post.post_content }}
                        />
                    </article>
                </div>
                {/* Travel Inspiration Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Travel Inspiration</h2>

                    {/* 3 Cards Grid */}
                    <div className="grid grid-cols-3 gap-6 mb-6">
                        {inspirationDestinations.slice(inspirationIndex, inspirationIndex + cardsPerPage).map((destination) => (
                            <div key={destination.id} className="group cursor-pointer">
                                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-lg">
                                    <img
                                        src={destination.image}
                                        alt={destination.country}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <h3 className="text-xl font-bold text-white mb-1">{destination.country}</h3>
                                        <p className="text-white/80 text-sm">{destination.subtitle}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center items-center gap-6">
                        <button
                            onClick={prevInspiration}
                            disabled={inspirationIndex === 0}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <span className="text-sm text-gray-600">
                            {Math.floor(inspirationIndex / cardsPerPage) + 1} / {totalPages}
                        </span>
                        <button
                            onClick={nextInspiration}
                            disabled={inspirationIndex + cardsPerPage >= inspirationDestinations.length}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />

            {/* Custom styles for blog content */}
            <style jsx global>{`
        .prose {
          color: #374151;
        }
        .prose h2 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #1f2937;
        }
        .prose h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #1f2937;
        }
        .prose p {
          margin-bottom: 1.25rem;
          line-height: 1.8;
        }
        .prose ul, .prose ol {
          margin-bottom: 1.25rem;
          padding-left: 1.5rem;
        }
        .prose li {
          margin-bottom: 0.5rem;
        }
        .prose strong {
          font-weight: 600;
          color: #1f2937;
        }
        .prose a {
          color: #002147;
          text-decoration: underline;
        }
        .prose a:hover {
          color: #003366;
        }
        .prose img {
          border-radius: 0.5rem;
          margin: 1.5rem 0;
        }
        .prose blockquote {
          border-left: 4px solid #C69C3C;
          padding-left: 1rem;
          font-style: italic;
          color: #4b5563;
          margin: 1.5rem 0;
        }
      `}</style>
        </div>
    )
}
