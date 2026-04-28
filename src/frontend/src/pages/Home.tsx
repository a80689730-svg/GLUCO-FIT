import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Heart,
  Salad,
  Shield,
  Star,
  Stethoscope,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useCurrentUser } from "../hooks/useBackend";
import { PLANS } from "../types";

const features = [
  {
    icon: Salad,
    title: "Smart Diet Logging",
    description:
      "Log meals instantly and get accurate calorie counts, gram measurements, and nutritional insights tailored for diabetes management.",
    link: "/diet",
    color: "text-primary",
    bg: "bg-primary/10",
    cta: "Log Your Diet",
  },
  {
    icon: Stethoscope,
    title: "Expert Doctor Consultations",
    description:
      "Connect with certified diabetes specialists via free video or voice calls. Get professional guidance from the comfort of your home.",
    link: "/doctors",
    color: "text-accent",
    bg: "bg-accent/10",
    cta: "Book Appointment",
  },
  {
    icon: Shield,
    title: "Comprehensive Care Plans",
    description:
      "Choose a 3, 6, or 12-month plan that includes your diabetes care kit. Everything you need — no hidden charges.",
    link: "/plans",
    color: "text-primary",
    bg: "bg-primary/10",
    cta: "View Plans",
  },
];

const stats = [
  { value: "10,000+", label: "Patients Managed", icon: Users },
  { value: "98%", label: "Satisfaction Rate", icon: Star },
  { value: "50+", label: "Expert Doctors", icon: Heart },
  { value: "24/7", label: "Support Available", icon: Activity },
];

const testimonials = [
  {
    name: "Priya Sharma",
    location: "Mumbai",
    text: "Gluco Fit helped me bring my HbA1c from 9.2 to 6.8 in just 3 months. The diet logging feature is incredibly easy to use!",
    plan: "6 Month Plan",
  },
  {
    name: "Rajesh Kumar",
    location: "Delhi",
    text: "The doctor consultations are a lifesaver. I can connect with specialists without traveling. Highly recommend to every diabetic patient.",
    plan: "1 Year Plan",
  },
  {
    name: "Anita Patel",
    location: "Ahmedabad",
    text: "The care kit arrived quickly and the app made it so easy to track everything. My whole family feels more confident now.",
    plan: "3 Month Plan",
  },
];

export default function Home() {
  const { isLoggedIn } = useCurrentUser();

  return (
    <div data-ocid="home.page">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden bg-card"
        data-ocid="home.hero_section"
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-diabetes-care.dim_1200x600.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

        <div className="relative container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
                🌿 India's Trusted Diabetes Management Platform
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Take Control of Your{" "}
                <span className="text-primary">Diabetes</span> Today
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
                Track your diet, consult expert doctors, and follow a
                personalized care plan — all in one place. Thousands of Indians
                are living healthier with Gluco Fit.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {!isLoggedIn ? (
                  <Link to="/login">
                    <Button
                      size="lg"
                      className="gap-2 text-base px-8"
                      data-ocid="home.hero_login_button"
                    >
                      Get Started Free
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/dashboard">
                    <Button
                      size="lg"
                      className="gap-2 text-base px-8"
                      data-ocid="home.hero_cta_button"
                    >
                      Go to Dashboard
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                )}
                <Link to="/plans">
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 text-base px-8"
                    data-ocid="home.hero_plans_button"
                  >
                    View Care Plans
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative border-t border-border bg-muted/40">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-1">
                    <stat.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="font-display text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        className="bg-background py-20"
        data-ocid="home.features_section"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge className="mb-3 bg-accent/10 text-accent border-accent/20">
              Everything You Need
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Complete Diabetes Care, All In One App
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From daily diet tracking to expert doctor consultations — we've
              built every tool a diabetic patient needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                data-ocid={`home.feature_card.${i + 1}`}
              >
                <Card className="h-full shadow-health hover:shadow-health-elevated transition-smooth group border-border hover:border-primary/20">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div
                      className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}
                    >
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                      {feature.description}
                    </p>
                    <Link to={feature.link} className="mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-primary hover:text-primary hover:bg-primary/10 px-0 group-hover:gap-2 transition-smooth"
                        data-ocid={`home.feature_cta.${i + 1}`}
                      >
                        {feature.cta}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Preview */}
      <section
        className="bg-muted/30 py-20 border-y border-border"
        data-ocid="home.plans_section"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
              Care Plans
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Choose Your Treatment Plan
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              All plans include your diabetes care kit. No hidden charges. No
              additional fees — ever.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.type}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                data-ocid={`home.plan_card.${i + 1}`}
              >
                <Card
                  className={`relative h-full shadow-health hover:shadow-health-elevated transition-smooth ${plan.popular ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground shadow-health px-3">
                        Best Value
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="mb-4">
                      <h3 className="font-display text-xl font-bold text-foreground">
                        {plan.label}
                      </h3>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-bold text-primary">
                          ₹{plan.price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          / {plan.duration}
                        </span>
                      </div>
                    </div>
                    <ul className="space-y-2 flex-1 mb-6">
                      {plan.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link to="/plans">
                      <Button
                        className={`w-full gap-2 ${plan.popular ? "" : "variant-outline"}`}
                        variant={plan.popular ? "default" : "outline"}
                        data-ocid={`home.plan_subscribe.${i + 1}`}
                      >
                        Subscribe Now
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            🎁 Every plan includes the complete Gluco Fit kit. Delivered to your
            doorstep.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section
        className="bg-background py-20"
        data-ocid="home.testimonials_section"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-accent/10 text-accent border-accent/20">
              Patient Stories
            </Badge>
            <h2 className="font-display text-3xl font-bold text-foreground mb-3">
              Real Results from Real Patients
            </h2>
            <p className="text-muted-foreground">
              Join thousands of Indians who've transformed their health journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                data-ocid={`home.testimonial.${i + 1}`}
              >
                <Card className="h-full shadow-health border-border hover:shadow-health-elevated transition-smooth">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-3">
                      {(["s1", "s2", "s3", "s4", "s5"] as const).map((k) => (
                        <Star
                          key={k}
                          className="w-4 h-4 fill-primary text-primary"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      "{t.text}"
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {t.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.location}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {t.plan}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16" data-ocid="home.cta_section">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-center mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary-foreground opacity-80" />
                <Calendar className="w-6 h-6 text-primary-foreground opacity-80" />
                <Heart className="w-6 h-6 text-primary-foreground opacity-80" />
              </div>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Start Your Healthier Journey Today
            </h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
              Create your free account and securely access all features. Your
              health data stays private and under your control.
            </p>
            {!isLoggedIn ? (
              <Link to="/login">
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2 text-base px-8"
                  data-ocid="home.cta_login_button"
                >
                  Sign In & Get Started
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <Link to="/diet">
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2 text-base px-8"
                  data-ocid="home.cta_dashboard_button"
                >
                  Go to Diet Log
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
