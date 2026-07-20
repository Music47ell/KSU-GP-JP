/**
 * KSU Job Portal — Database Seeder
 *
 * Usage:
 *   cp .env.example .env   # fill in SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *   bun run seed
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY (service_role, not anon) for admin.createUser().
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = Bun.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = Bun.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface SeedUser {
  email: string;
  password: string;
  email_confirm: boolean;
  user_metadata: Record<string, string>;
}

const seedUsers: SeedUser[] = [
  {
    email: "admin@test.com",
    password: "password123",
    email_confirm: true,
    user_metadata: { name: "Admin User", role: "admin" },
  },
  {
    email: "owner@test.com",
    password: "password123",
    email_confirm: true,
    user_metadata: { name: "Owner User", company: "Test Corp", role: "owner" },
  },
  {
    email: "seeker@test.com",
    password: "password123",
    email_confirm: true,
    user_metadata: {
      name: "Seeker User",
      role: "seeker",
      resume_url: "https://example.com/resume.pdf",
      github_url: "https://github.com/seeker",
      linkedin_url: "https://linkedin.com/in/seeker",
      portfolio_url: "https://seeker.dev",
    },
  },
];

async function seed() {
  console.log("Seeding database...\n");

  for (const user of seedUsers) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: user.email_confirm,
      user_metadata: user.user_metadata,
    });

    if (error) {
      console.error(`  ✗ ${user.email}:`, error.message);
    } else {
      console.log(`  ✓ ${user.email} → ${data.user?.id}`);
    }
  }

  console.log("\nDone.");
}

seed().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
