import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Fetching admin user...");
  const admin = await prisma.user.findUnique({
    where: { email: "admin@news.com" }
  });

  if (!admin) {
    console.error("Admin user not found. Please run create_admin.js first.");
    return;
  }

  console.log("Fetching categories...");
  const categories = await prisma.category.findMany();
  
  if (categories.length === 0) {
    console.error("No categories found. Run prisma/seed.ts first.");
    return;
  }

  const sampleArticles = [
    {
      title: "India Launches Revolutionary High-Speed Rail Network",
      content: "<p>In a major leap for infrastructure, a new high-speed rail network connecting major metropolitan cities has been inaugurated today.</p><p>This network promises to reduce travel time by up to 60%, boosting economic activity across the regions.</p>",
      slug: "india-launches-revolutionary-high-speed-rail",
      coverImageUrl: "https://res.cloudinary.com/demo/image/upload/v1611151624/sample.jpg",
      status: "PUBLISHED",
      breaking: true,
      featured: true,
      trending: true,
      categoryName: "Politics"
    },
    {
      title: "Tech Giant Unveils Groundbreaking AI Assistant for Indian Languages",
      content: "<p>A leading tech firm announced a new AI model trained extensively on regional Indian languages, aiming to bridge the digital divide.</p>",
      slug: "tech-giant-unveils-ai-assistant-indian-languages",
      coverImageUrl: "https://res.cloudinary.com/demo/image/upload/v1611151624/sample.jpg",
      status: "PUBLISHED",
      breaking: false,
      featured: false,
      trending: true,
      categoryName: "Technology"
    },
    {
      title: "Cricket World Cup: Thrilling Final Over Seals Victory",
      content: "<p>In what will be remembered as one of the most nail-biting finishes in cricket history, the national team secured victory on the final ball of the match.</p>",
      slug: "cricket-world-cup-thrilling-final-over",
      coverImageUrl: "https://res.cloudinary.com/demo/image/upload/v1611151624/sample.jpg",
      status: "PUBLISHED",
      breaking: false,
      featured: false,
      trending: true,
      categoryName: "Sports"
    },
    {
      title: "Sensex Hits Record High Amidst Global Market Rally",
      content: "<p>The stock market witnessed an unprecedented surge today, with the Sensex crossing the historic 85,000 mark for the first time.</p>",
      slug: "sensex-hits-record-high-global-rally",
      coverImageUrl: "https://res.cloudinary.com/demo/image/upload/v1611151624/sample.jpg",
      status: "PUBLISHED",
      breaking: true,
      featured: false,
      trending: false,
      categoryName: "Business"
    },
    {
      title: "New Health Guidelines Issued for the Upcoming Monsoon Season",
      content: "<p>The Health Ministry has released a comprehensive advisory to combat water-borne diseases ahead of the monsoon.</p>",
      slug: "new-health-guidelines-monsoon-season",
      coverImageUrl: "https://res.cloudinary.com/demo/image/upload/v1611151624/sample.jpg",
      status: "PUBLISHED",
      breaking: false,
      featured: false,
      trending: false,
      categoryName: "Health"
    },
    {
      title: "ISRO Successfully Deploys Next-Gen Communication Satellite",
      content: "<p>The Indian Space Research Organisation has successfully placed its heaviest communication satellite into geostationary orbit.</p>",
      slug: "isro-successfully-deploys-communication-satellite",
      coverImageUrl: "https://res.cloudinary.com/demo/image/upload/v1611151624/sample.jpg",
      status: "PUBLISHED",
      breaking: false,
      featured: false,
      trending: true,
      categoryName: "Science"
    },
    {
      title: "Bollywood Blockbuster Breaks Box Office Records on Opening Weekend",
      content: "<p>The highly anticipated action thriller has shattered all previous box office records, crossing the 200 crore mark globally in just three days.</p>",
      slug: "bollywood-blockbuster-breaks-records",
      coverImageUrl: "https://res.cloudinary.com/demo/image/upload/v1611151624/sample.jpg",
      status: "PUBLISHED",
      breaking: false,
      featured: false,
      trending: true,
      categoryName: "Entertainment"
    },
    {
      title: "Upcoming E-Commerce Regulations Spark Industry Debate",
      content: "<p>Proposed changes to the e-commerce policy have sparked a massive debate among top retailers and online marketplaces.</p>",
      slug: "ecommerce-regulations-spark-debate",
      coverImageUrl: "https://res.cloudinary.com/demo/image/upload/v1611151624/sample.jpg",
      status: "PENDING",
      breaking: false,
      featured: false,
      trending: false,
      categoryName: "Business"
    },
    {
      title: "Exclusive: Behind the Scenes of the New Parliament Building",
      content: "<p>An exclusive look at the architectural marvels and deep symbolism embedded in the newly inaugurated parliamentary complex.</p>",
      slug: "exclusive-behind-the-scenes-parliament",
      coverImageUrl: "https://res.cloudinary.com/demo/image/upload/v1611151624/sample.jpg",
      status: "DRAFT",
      breaking: false,
      featured: false,
      trending: false,
      categoryName: "Politics"
    }
  ];

  console.log("Seeding articles...");
  let count = 0;
  for (const articleData of sampleArticles) {
    const category = categories.find(c => c.name === articleData.categoryName) || categories[0];
    
    // Check if exists
    const existing = await prisma.article.findUnique({ where: { slug: articleData.slug } });
    if (!existing) {
      await prisma.article.create({
        data: {
          title: articleData.title,
          content: articleData.content,
          slug: articleData.slug,
          coverImageUrl: articleData.coverImageUrl,
          status: articleData.status as any,
          breaking: articleData.breaking,
          featured: articleData.featured,
          trending: articleData.trending,
          authorId: admin.id,
          categoryId: category.id,
          publishedAt: articleData.status === "PUBLISHED" ? new Date() : null
        }
      });
      count++;
    }
  }

  console.log(`Successfully seeded ${count} new articles.`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
