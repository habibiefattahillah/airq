"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"

export default function LandingPage() {
  const router = useRouter()
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!carouselApi) return

    setActiveIndex(carouselApi.selectedScrollSnap())
    carouselApi.on("select", () => {
      setActiveIndex(carouselApi.selectedScrollSnap())
    })
  }, [carouselApi])

  useEffect(() => {
    if (!carouselApi) return

    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % 3
      carouselApi.scrollTo(nextIndex)
    }, 5000)

    return () => clearInterval(interval)
  }, [carouselApi, activeIndex])

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section")
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect()
        if (rect.top >= 0 && rect.top < window.innerHeight / 2) {
          setActiveIndex(index)
        }
      })
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }

  const carouselContent = [
    {
      title: "Klasifikasi Kualitas Air",
      description: "Fitur ini memungkinkan pengguna untuk mengklasifikasikan kualitas air menggunakan model machine learning yang telah dilatih. Pengguna dapat mengunggah data kualitas air dan mendapatkan klasifikasi secara otomatis.",
      image: "/images/carousel/feature1.png",
    },
    {
      title: "Tabel Data Kualitas Air",
      description: "Disediakan tabel yang menampilkan data kualitas air yang telah diunggah. Pengguna dapat mengelola data kualitas air dengan mudah.",
      image: "/images/carousel/feature2.png",
    },
    {
      title: "Visualisasi Data Kualitas Air",
      description: "Visualisasi data kualitas air dalam bentuk peta. Pengguna dapat melihat distribusi kualitas air di berbagai lokasi secara interaktif.",
      image: "/images/carousel/feature3.png",
    },
  ]

  const Blob = ({ className }: { className?: string }) => (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={`absolute opacity-20 text-blue-200 fill-current ${className}`}
    >
      <path d="M46.1,-56.5C59.8,-45.6,71.3,-30.4,73.4,-14.7C75.5,1.1,68.2,17.2,58.2,30.3C48.3,43.4,35.8,53.6,21.3,58.7C6.7,63.9,-9.9,64.1,-24.7,58.6C-39.4,53.2,-52.2,41.9,-59.8,27.7C-67.4,13.5,-69.9,-3.7,-63.8,-17.7C-57.7,-31.7,-42.9,-42.5,-28.2,-53.5C-13.5,-64.6,0.9,-75.9,16.7,-76.5C32.6,-77,49.7,-66.5,46.1,-56.5Z" transform="translate(100 100)" />
    </svg>
  )

  return (
    <main className="relative font-sans">
      <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50 flex items-center justify-between px-8 py-4 backdrop-blur-sm">
        <nav className="flex space-x-6 hidden md:block">
          {["section1", "section2", "section3", "section4"].map((id, i) => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              {["Home", "Features", "FAQ", "Contact"][i]}
            </button>
          ))}
        </nav>
        <Link href="/" className="lg:hidden flex gap-1 items-center">
            <Image
              width={56}
              height={12}
              src="/images/water.png"
              alt="Logo"
            />
            <h1 className="font-bold text-2xl">AirQ</h1>
        </Link>
        <div className="flex items-center space-x-2">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" size="sm">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm">Sign Up</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Button size="sm" onClick={() => router.push("/application")}>Go to App</Button>
          </SignedIn>
        </div>
      </header>

      <div className="snap-y snap-mandatory h-screen overflow-y-scroll scroll-smooth pt-[72px]">
        {/* Section 1 */}
        <section id="section1" className="relative snap-start min-h-screen flex justify-center items-center bg-sky-50 px-4 py-24 overflow-hidden">
          <Blob className="top-[-100px] left-[-80px] w-[300px]" />
          <Blob className="bottom-[-100px] right-[-100px] w-[400px]" />
          <div className="bg-white rounded-3xl shadow-xl p-10 md:p-16 flex flex-col md:flex-row max-w-6xl w-full gap-10 relative z-10">
            <div className="flex-1 flex flex-col justify-center">
              <h1 className="text-5xl md:text-7xl font-extrabold text-blue-600 tracking-tight">AirQ</h1>
              <p className="mt-6 text-xl md:text-2xl text-gray-700">Giving you insights into water quality, share your data with the world.</p>
              <div className="mt-8 bg-gray-100 rounded-lg p-4 font-mono text-sm text-gray-800 border border-gray-200">
                <p>Example API Endpoints</p>
                <p>POST airq-pearl.vercel.app/api/classify</p>
                <p>POST airq-pearl.vercel.app/api/impute</p>
              </div>
            </div>
            <div className="flex-1 flex justify-center items-center">
              <div className="w-full h-64 md:h-96 bg-blue-100 rounded-2xl shadow-inner flex items-center justify-center">
                {/* <span className="text-gray-400 text-sm">[ Environmental Image Placeholder ]</span> */}
                <Image
                  src="/images/drinking-water.svg"
                  alt="Environmental"
                  className="w-full h-full object-cover rounded-2xl"
                  width={400}
                  height={400}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 (full-screen carousel) */}
        <section id="section2" className="snap-start relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-blue-50 px-4 overflow-hidden">
          <Carousel className="w-full max-w-6xl" opts={{ loop: true }} setApi={setCarouselApi}>
            <CarouselContent>
              {carouselContent.map((item, index) => (
                <CarouselItem key={index} className="h-screen flex flex-col md:flex-row items-center justify-between gap-10 p-8">
                  <div className="flex-1 flex justify-center items-center">
                    <div className="w-full h-64 md:h-96 bg-gray-100 rounded-xl shadow-md overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-3xl md:text-5xl font-bold mb-4 text-gray-800">{item.title}</h3>
                    <p className="text-gray-600 text-lg md:text-xl leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${activeIndex === i ? "bg-blue-600" : "bg-gray-300"}`}
                  onClick={() => carouselApi?.scrollTo(i)}
                />
              ))}
            </div>
          </Carousel>
        </section>

        {/* Section 3 */}
        <section id="section3" className="relative snap-start min-h-screen bg-gray-50 px-6 py-24 overflow-hidden">
          <Blob className="top-0 left-[-100px] w-[300px]" />
          <Blob className="bottom-[-100px] right-0 w-[300px]" />
          <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-md p-10 relative z-10">
            <h2 className="text-4xl md:text-5xl font-semibold text-center mb-12 text-gray-800">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible>
              <AccordionItem value="faq-1">
                <AccordionTrigger>Apa itu AirQ?</AccordionTrigger>
                <AccordionContent>
                  AirQ adalah platform yang menyediakan layanan klasifikasi kualitas air menggunakan machine learning. Dengan AirQ, pengguna dapat mengunggah data kualitas air dan mendapatkan klasifikasi secara otomatis.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-2">
                <AccordionTrigger>Seberapa akurat hasil klasifikasi?</AccordionTrigger>
                <AccordionContent>
                  Akurasi hasil klasifikasi tergantung pada kualitas dan jumlah data yang digunakan untuk melatih model. AirQ menggunakan model machine learning yang telah dilatih dengan data yang relevan untuk memberikan hasil yang akurat.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-3">
                <AccordionTrigger>Bagaimana memulai?</AccordionTrigger>
                <AccordionContent>
                  Untuk memulai, daftar dan jelajahi dasbor. Unggah data Anda dan dapatkan wawasan kualitas secara instan.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Section 4 (already bordered) */}
        <section id="section4" className="snap-start min-h-screen flex flex-col justify-center items-center px-6 py-24 bg-white">
          <h2 className="text-4xl md:text-5xl font-semibold text-center mb-12 text-gray-800">Contact Us</h2>
          <form className="w-full max-w-lg space-y-6 bg-gray-50 p-8 rounded-2xl shadow-md">
            <Input type="text" placeholder="Your Name" required className="rounded-md" />
            <Input type="email" placeholder="Your Email" required className="rounded-md" />
            <Textarea placeholder="Your Message" rows={5} required className="rounded-md" />
            <Button type="submit" className="w-full">Send Message</Button>
          </form>
        </section>
      </div>
    </main>
  )
}
