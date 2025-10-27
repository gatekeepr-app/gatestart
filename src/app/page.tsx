import GSButton from "@/components/layout/GSButton";
import React from "react";

function Home() {
  return (
    <div className="p-8 my-auto min-h-screen max-w-3xl flex flex-col items-start gap-3">
      <h1 className="text-6xl w-2/3 font-bold tracking-tighter">
        Welcome to the Home Page
      </h1>
      <p>This is the main landing page of the application.</p>
      <div className="flex">
        <GSButton text="Get Started" href="/get-started" variant="primary" />
        <GSButton
          text="Learn More"
          href="/learn-more"
          variant="ghost"
          className="ml-4"
        />
        <GSButton
          text="Contact Us"
          href="/contact"
          variant="black"
          className="ml-4"
        />
      </div>
    </div>
  );
}

export default Home;
