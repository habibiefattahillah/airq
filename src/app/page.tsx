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

  return (
    <main className="relative">
      {/* Header Navigation */}
      <header className="fixed top-0 left-0 w-full bg-white shadow z-10 flex items-center justify-between px-6 py-4">
        <nav className="flex space-x-4">
          {["section1", "section2", "section3", "section4"].map((id, i) => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              className="text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              {["Home", "Features", "FAQ", "Contact"][i]}
            </button>
          ))}
        </nav>
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
            <Button size="sm" onClick={() => router.push("/app")}>Go to App</Button>
          </SignedIn>
        </div>
      </header>

      {/* Page Sections */}
      <div className="snap-y snap-mandatory h-screen overflow-y-scroll scroll-smooth pt-[72px]">

        {/* Section 1: Hero */}
        <section id="section1" className="snap-start min-h-screen flex justify-center items-center bg-gradient-to-b from-sky-100 to-white px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 flex flex-col md:flex-row max-w-6xl w-full gap-8">
            <div className="flex-1 flex flex-col justify-center">
              <h1 className="text-4xl md:text-6xl font-bold text-blue-600">AirQ</h1>
              <p className="mt-4 text-lg md:text-xl text-gray-700">Monitor air and water quality with confidence.</p>
              <div className="mt-6 bg-gray-100 rounded-md p-4 font-mono text-sm text-gray-800">
                <p>// Example API Endpoints</p>
                <p>POST /api/classify</p>
                <p>POST /api/impute</p>
              </div>
            </div>
            <div className="flex-1 flex justify-center items-center">
              <div className="w-full h-64 md:h-80 bg-blue-200 rounded-xl shadow-inner flex items-center justify-center">
                <span className="text-gray-500">[ Environmental Image Placeholder ]</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Features Carousel */}
        <section id="section2" className="snap-start relative min-h-screen flex flex-col items-center justify-center bg-white px-4">
          <Carousel className="w-full max-w-6xl" opts={{ loop: true }} setApi={setCarouselApi}>
            <CarouselContent>
              {[1, 2, 3].map((i) => (
                <CarouselItem key={i} className="h-screen flex flex-col md:flex-row items-center justify-between gap-8 p-8">
                  <div className="flex-1 flex justify-center items-center">
                    <div className="w-full h-64 md:h-96 bg-green-200 rounded-xl shadow-inner flex items-center justify-center">
                      <span className="text-gray-600">[ Feature Image {i} ]</span>
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl md:text-4xl font-bold mb-4">Feature {i} Title</h3>
                    <p className="text-gray-700 text-base md:text-lg">
                      Feature {i} description goes here. Explain what this feature does and how it helps the user.
                    </p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    activeIndex === i ? "bg-blue-600" : "bg-gray-300"
                  }`}
                  onClick={() => carouselApi?.scrollTo(i)}
                />
              ))}
            </div>
          </Carousel>
        </section>

        {/* Section 3: FAQ */}
        <section id="section3" className="snap-start min-h-screen bg-gray-50 px-6 py-24">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-8">Frequently Asked Questions</h2>
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible>
              <AccordionItem value="faq-1">
                <AccordionTrigger>What is AirQ?</AccordionTrigger>
                <AccordionContent>
                  AirQ is a monitoring tool that analyzes air and water quality using machine learning models.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-2">
                <AccordionTrigger>How accurate is the data?</AccordionTrigger>
                <AccordionContent>
                  AirQ uses advanced ML models and continuous data calibration to ensure high accuracy in predictions and imputations.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-3">
                <AccordionTrigger>How do I get started?</AccordionTrigger>
                <AccordionContent>
                  To get started, sign up and explore the dashboard. Upload your data and get quality insights instantly.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Section 4: Contact */}
        <section id="section4" className="snap-start min-h-screen flex flex-col justify-center items-center px-6 py-12 bg-white">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-8">Contact Us</h2>
          <form className="w-full max-w-lg space-y-4">
            <Input type="text" placeholder="Your Name" required />
            <Input type="email" placeholder="Your Email" required />
            <Textarea placeholder="Your Message" rows={5} required />
            <Button type="submit">Send Message</Button>
          </form>
        </section>
      </div>
    </main>
  )
}
