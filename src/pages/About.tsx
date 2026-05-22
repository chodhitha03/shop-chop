import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChefHat, ShoppingBag, Heart, Users, Star, Clock } from 'lucide-react';
import {
  PageTransition, FadeUp, StaggerChildren, StaggerItem, HoverLift
} from '@/components/motion';

const About = () => {
  const features = [
    { icon: ChefHat, title: 'Recipe Collection', description: 'Discover hundreds of delicious recipes organized by meal type - breakfast, lunch, dinner, and desserts.' },
    { icon: ShoppingBag, title: 'Integrated Shopping', description: 'Shop for ingredients directly from our supermarket section with real-time pricing and availability.' },
    { icon: Heart, title: 'Fresh & Quality', description: 'We partner with local suppliers to ensure you get the freshest ingredients delivered to your door.' },
    { icon: Users, title: 'Family Friendly', description: 'Recipes for every family size with clear serving information and adjustable quantities.' },
    { icon: Star, title: 'Curated Selection', description: 'Every recipe is tested and reviewed to ensure amazing results every time you cook.' },
    { icon: Clock, title: 'Time Efficient', description: 'Filter recipes by cooking time to find quick meals for busy weekdays or elaborate dishes for special occasions.' }
  ];

  return (
    <PageTransition>
      <div className="min-h-screen pb-24">
        <section className="section-tight">
          <div className="container">
            <FadeUp>
              <div className="surface-panel bg-background/80 p-10">
                <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-6">
                    <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Our studio</p>
                    <h1 className="text-4xl font-display md:text-5xl">Designed for modern kitchens</h1>
                    <p className="text-lg text-muted-foreground">
                      Shop & Chop is a culinary planning studio that helps you move from inspiration to ingredients
                      with zero friction. We blend recipe craft, grocery intelligence, and polished flows into one
                      modern experience.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Recipe planning</Badge>
                      <Badge variant="outline">Ingredient pricing</Badge>
                      <Badge variant="outline">Smart grocery lists</Badge>
                    </div>
                  </div>
                  <StaggerChildren className="grid gap-4 sm:grid-cols-2">
                    {[
                      { value: '4k+', label: 'recipes curated' },
                      { value: '98%', label: 'ingredient accuracy' },
                      { value: '24/7', label: 'shopper support' },
                      { value: '₹', label: 'local pricing built-in' },
                    ].map((stat) => (
                      <StaggerItem key={stat.label}>
                        <div className="surface-panel bg-background/70 p-4">
                          <p className="text-2xl font-display">{stat.value}</p>
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                        </div>
                      </StaggerItem>
                    ))}
                  </StaggerChildren>
                </div>
              </div>
            </FadeUp>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <FadeUp>
              <div className="text-center space-y-4">
                <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">What we value</p>
                <h2 className="text-3xl font-display md:text-4xl">Thoughtful cooking, simplified</h2>
              </div>
            </FadeUp>
            <StaggerChildren className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <StaggerItem key={feature.title}>
                  <HoverLift>
                    <Card className="bg-background/80 h-full">
                      <CardHeader>
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-foreground">
                          <feature.icon className="h-6 w-6" />
                        </div>
                        <CardTitle>{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base leading-relaxed">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </HoverLift>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>

        <section className="section bg-muted-gradient">
          <div className="container">
            <StaggerChildren className="grid gap-6 lg:grid-cols-3">
              {[
                { title: 'Curate', description: 'Build collections that match your week, your budget, and your schedule.' },
                { title: 'Source', description: 'Translate ingredients into a cart with accurate, local pricing in seconds.' },
                { title: 'Cook', description: 'Follow refined instructions with tips that keep you moving confidently.' }
              ].map((step, index) => (
                <StaggerItem key={step.title}>
                  <HoverLift>
                    <Card className="bg-background/80 h-full">
                      <CardHeader>
                        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background">
                          {index + 1}
                        </div>
                        <CardTitle>{step.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base">{step.description}</CardDescription>
                      </CardContent>
                    </Card>
                  </HoverLift>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>

        <section className="section-tight">
          <div className="container">
            <FadeUp>
              <div className="surface-panel bg-background/80 p-8 text-center">
                <h2 className="text-3xl font-display">Get in touch</h2>
                <p className="mt-3 text-lg text-muted-foreground">
                  Questions, feedback, or ideas? Our team would love to hear from you.
                </p>
                <StaggerChildren className="mt-8 grid gap-4 md:grid-cols-3">
                  {[
                    { title: 'Email', val: 'hello@shopandchop.com' },
                    { title: 'Phone', val: '(555) 123-COOK' },
                    { title: 'Support', val: '24/7 response window' },
                  ].map(c => (
                    <StaggerItem key={c.title}>
                      <HoverLift>
                        <Card>
                          <CardContent className="p-6 text-center">
                            <h3 className="font-semibold">{c.title}</h3>
                            <p className="text-sm text-muted-foreground">{c.val}</p>
                          </CardContent>
                        </Card>
                      </HoverLift>
                    </StaggerItem>
                  ))}
                </StaggerChildren>
              </div>
            </FadeUp>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default About;