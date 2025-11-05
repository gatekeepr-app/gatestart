// emails/NewsletterWelcomeEmail.tsx
import * as React from "react";
import { Html, Head, Preview, Body, Container, Text, Link } from "@react-email/components";

interface NewsletterWelcomeEmailProps {
  name?: string;
}

export default function NewsletterWelcomeEmail({ name }: NewsletterWelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to our Newsletter!</Preview>
      <Body style={{ backgroundColor: "#f9f9f9", fontFamily: "Arial, sans-serif" }}>
        <Container style={{ margin: "40px auto", backgroundColor: "#fff", padding: "20px", borderRadius: "8px" }}>
          <Text style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "10px" }}>
            Hi {name || "there"},
          </Text>
          <Text style={{ fontSize: "16px", color: "#555" }}>
            Thank you for subscribing to our newsletter! 🎉  
            We’ll keep you updated with the latest stories and updates.
          </Text>
          <Text style={{ fontSize: "14px", color: "#888", marginTop: "20px" }}>
            Stay tuned and follow us for more:
          </Text>
          <Link href="https://yourwebsite.com" style={{ color: "#0070f3", fontSize: "14px" }}>
            Visit our site
          </Link>
        </Container>
      </Body>
    </Html>
  );
}
