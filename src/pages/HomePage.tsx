import Hero from "../components/Hero";
import NavigationCards from "../components/NavigationCards";
import EventsSection from "../components/EventsSection";
import TestimonialsSection from "../components/TestimonialsSection";
import Newsletter from "../components/Newsletter";

const HomePage = () => {

  return (
    <div className="min-h-screen">
      <Hero />
      <NavigationCards />
      <EventsSection />
      <TestimonialsSection />
      <Newsletter />
    </div>
  );
};

export default HomePage;
