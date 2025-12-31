const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Import models
const DonationProject = require('../models/DonationProject');

// Sample donation projects
const projects = [
  {
    title: {
      en: 'Feed Families in Need',
      ar: 'إطعام العائلات المحتاجة',
      ur: 'ضرورت مند خاندانوں کو کھانا کھلائیں',
      fr: 'Nourrir les familles dans le besoin'
    },
    description: {
      en: 'Provide nutritious meals and food packages to families struggling with hunger and poverty',
      ar: 'توفير وجبات مغذية وحزم غذائية للعائلات التي تعاني من الجوع والفقر',
      ur: 'بھوک اور غربت سے نبردآزما خاندانوں کو غذائیت بخش کھانا اور فوڈ پیکجز فراہم کریں',
      fr: 'Fournir des repas nutritifs et des colis alimentaires aux familles en difficulté'
    },
    slug: 'feed-families',
    goalAmount: 50000,
    collectedAmount: 18500,
    currency: 'USD',
    coverImage: '/images/donations/feed-families.jpg',
    category: 'food',
    active: true,
    featured: true,
    beneficiaries: 250,
    donorCount: 123
  },
  {
    title: {
      en: 'Build Water Wells',
      ar: 'بناء آبار المياه',
      ur: 'پانی کے کنویں بنائیں',
      fr: 'Construire des puits d\'eau'
    },
    description: {
      en: 'Provide clean drinking water to communities in need by building sustainable water wells',
      ar: 'توفير مياه الشرب النظيفة للمجتمعات المحتاجة من خلال بناء آبار مياه مستدامة',
      ur: 'پائیدار پانی کے کنویں بنا کر ضرورت مند برادریوں کو صاف پینے کا پانی فراہم کریں',
      fr: 'Fournir de l\'eau potable aux communautés dans le besoin en construisant des puits durables'
    },
    slug: 'water-wells',
    goalAmount: 100000,
    collectedAmount: 45000,
    currency: 'USD',
    coverImage: '/images/donations/water-wells.jpg',
    category: 'water',
    active: true,
    featured: true,
    beneficiaries: 500,
    donorCount: 87
  },
  {
    title: {
      en: 'Support Orphans',
      ar: 'دعم الأيتام',
      ur: 'یتیموں کی مدد کریں',
      fr: 'Soutenir les orphelins'
    },
    description: {
      en: 'Provide education, healthcare, and basic necessities to orphaned children',
      ar: 'توفير التعليم والرعاية الصحية والاحتياجات الأساسية للأطفال الأيتام',
      ur: 'یتیم بچوں کو تعلیم، صحت کی دیکھ بھال اور بنیادی ضروریات فراہم کریں',
      fr: 'Fournir éducation, soins de santé et besoins essentiels aux enfants orphelins'
    },
    slug: 'support-orphans',
    goalAmount: 75000,
    collectedAmount: 32000,
    currency: 'USD',
    coverImage: '/images/donations/orphans.jpg',
    category: 'orphans',
    active: true,
    featured: true,
    beneficiaries: 150,
    donorCount: 210
  },
  {
    title: {
      en: 'Emergency Relief Fund',
      ar: 'صندوق الإغاثة الطارئة',
      ur: 'ایمرجنسی ریلیف فنڈ',
      fr: 'Fonds d\'aide d\'urgence'
    },
    description: {
      en: 'Rapid response to natural disasters and humanitarian crises around the world',
      ar: 'استجابة سريعة للكوارث الطبيعية والأزمات الإنسانية حول العالم',
      ur: 'دنیا بھر میں قدرتی آفات اور انسانی بحرانوں کے لیے فوری ردعمل',
      fr: 'Réponse rapide aux catastrophes naturelles et crises humanitaires dans le monde'
    },
    slug: 'emergency-relief',
    goalAmount: 200000,
    collectedAmount: 95000,
    currency: 'USD',
    coverImage: '/images/donations/emergency.jpg',
    category: 'emergency',
    active: true,
    featured: false,
    beneficiaries: 1000,
    donorCount: 345
  },
  {
    title: {
      en: 'Education for All',
      ar: 'التعليم للجميع',
      ur: 'سب کے لیے تعلیم',
      fr: 'Éducation pour tous'
    },
    description: {
      en: 'Build schools and provide educational resources to children in underserved communities',
      ar: 'بناء المدارس وتوفير الموارد التعليمية للأطفال في المجتمعات المحرومة',
      ur: 'محروم کمیونٹیز میں بچوں کے لیے سکول بنائیں اور تعلیمی وسائل فراہم کریں',
      fr: 'Construire des écoles et fournir des ressources éducatives aux enfants des communautés défavorisées'
    },
    slug: 'education-for-all',
    goalAmount: 150000,
    collectedAmount: 67000,
    currency: 'USD',
    coverImage: '/images/donations/education.jpg',
    category: 'education',
    active: true,
    featured: false,
    beneficiaries: 300,
    donorCount: 156
  },
  {
    title: {
      en: 'Healthcare Access',
      ar: 'الوصول إلى الرعاية الصحية',
      ur: 'صحت کی دیکھ بھال تک رسائی',
      fr: 'Accès aux soins de santé'
    },
    description: {
      en: 'Provide medical care, medicines, and health facilities to underserved populations',
      ar: 'توفير الرعاية الطبية والأدوية والمرافق الصحية للسكان المحرومين',
      ur: 'محروم آبادیوں کو طبی دیکھ بھال، ادویات اور صحت کی سہولیات فراہم کریں',
      fr: 'Fournir soins médicaux, médicaments et installations de santé aux populations mal desservies'
    },
    slug: 'healthcare-access',
    goalAmount: 120000,
    collectedAmount: 54000,
    currency: 'USD',
    coverImage: '/images/donations/healthcare.jpg',
    category: 'healthcare',
    active: true,
    featured: false,
    beneficiaries: 400,
    donorCount: 98
  },
  {
    title: {
      en: 'Build a Masjid',
      ar: 'بناء مسجد',
      ur: 'مسجد بنائیں',
      fr: 'Construire une mosquée'
    },
    description: {
      en: 'Construct a community masjid for worship, education, and community gatherings',
      ar: 'بناء مسجد مجتمعي للعبادة والتعليم والتجمعات المجتمعية',
      ur: 'عبادت، تعلیم اور اجتماعی اجتماعات کے لیے ایک کمیونٹی مسجد بنائیں',
      fr: 'Construire une mosquée communautaire pour le culte, l\'éducation et les rassemblements'
    },
    slug: 'build-masjid',
    goalAmount: 500000,
    collectedAmount: 225000,
    currency: 'USD',
    coverImage: '/images/donations/masjid.jpg',
    category: 'masjid',
    active: true,
    featured: false,
    beneficiaries: 800,
    donorCount: 267
  }
];

// Seed function
const seedDonations = async () => {
  try {
    console.log('🌱 Starting donation projects seed...');

    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/noor-app';
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ MongoDB connected');

    // Clear existing projects
    await DonationProject.deleteMany({});
    console.log('🗑️  Cleared existing donation projects');

    // Insert new projects
    const createdProjects = await DonationProject.insertMany(projects);
    console.log(`✅ Created ${createdProjects.length} donation projects`);

    // Display created projects
    console.log('\n📋 Created Projects:');
    createdProjects.forEach(project => {
      console.log(`   - ${project.title.en} (${project.slug})`);
      console.log(`     Goal: $${project.goalAmount.toLocaleString()} | Collected: $${project.collectedAmount.toLocaleString()} (${project.progress}%)`);
      console.log(`     Category: ${project.category} | Featured: ${project.featured ? 'Yes' : 'No'}`);
      console.log('');
    });

    console.log('✅ Donation seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding donation projects:', error);
    process.exit(1);
  }
};

// Run the seed
seedDonations();
