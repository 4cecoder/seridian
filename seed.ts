import { ConvexClient } from "convex/browser";
import { api } from "./convex/_generated/api";

const client = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function seed() {
  console.log("Seeding database...");

  const adminPubkey = "admin";
  const rodPubkey = "rod";

  await client.mutation(api.chat.updateUserStatus, {
    pubkey: adminPubkey,
    name: "Admin",
    status: "online",
  });

  await client.mutation(api.chat.updateUserStatus, {
    pubkey: rodPubkey,
    name: "Rod",
    status: "online",
  });

  const generalId = await client.mutation(api.chat.createChannel, {
    name: "general",
    type: "public",
    createdBy: adminPubkey,
    participants: [adminPubkey, rodPubkey],
  });

  const devId = await client.mutation(api.chat.createChannel, {
    name: "development",
    type: "public",
    createdBy: adminPubkey,
    participants: [adminPubkey, rodPubkey],
  });

  await client.mutation(api.chat.sendMessage, {
    channelId: generalId,
    senderId: adminPubkey,
    senderName: "Admin",
    content: "Welcome to Seridian Chat!",
    type: "text",
  });

  await client.mutation(api.chat.sendMessage, {
    channelId: generalId,
    senderId: rodPubkey,
    senderName: "Rod",
    content: "Hey! Ready to build.",
    type: "text",
  });

  const client1 = await client.mutation(api.clients.create, {
    name: "Acme Corp",
    company: "Acme Corporation",
    email: "contact@acme.com",
    status: "active",
    industry: "Technology",
  });

  const client2 = await client.mutation(api.clients.create, {
    name: "TechStart",
    company: "TechStart Inc",
    email: "hello@techstart.io",
    status: "active",
    industry: "SaaS",
  });

  const client3 = await client.mutation(api.clients.create, {
    name: "GreenBuild",
    company: "GreenBuild LLC",
    email: "info@greenbuild.co",
    status: "active",
    industry: "Construction",
  });

  await client.mutation(api.issues.create, {
    title: "Setup CI/CD pipeline",
    description: "Configure GitHub Actions for automated testing and deployment",
    status: "in_progress",
    priority: "high",
    clientId: client1,
    labels: ["devops", "infrastructure"],
  });

  await client.mutation(api.issues.create, {
    title: "Design system audit",
    description: "Review and document all UI components",
    status: "todo",
    priority: "medium",
    clientId: client2,
    labels: ["design", "ui"],
  });

  await client.mutation(api.issues.create, {
    title: "Database migration",
    description: "Migrate from PostgreSQL to Convex",
    status: "backlog",
    priority: "urgent",
    clientId: client1,
    labels: ["backend", "database"],
  });

  await client.mutation(api.issues.create, {
    title: "API documentation",
    description: "Write OpenAPI spec for all endpoints",
    status: "todo",
    priority: "low",
    clientId: client3,
    labels: ["docs"],
  });

  await client.mutation(api.deals.create, {
    name: "Acme Enterprise Plan",
    clientId: client1,
    value: 50000,
    stage: "proposal",
    probability: 70,
    contactEmail: "cto@acme.com",
  });

  await client.mutation(api.deals.create, {
    name: "TechStart Migration",
    clientId: client2,
    value: 25000,
    stage: "negotiation",
    probability: 85,
  });

  await client.mutation(api.bookings.create, {
    title: "Acme Kickoff",
    clientId: client1,
    startDateTime: new Date(Date.now() + 86400000).toISOString(),
    endDateTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
    type: "consultation",
  });

  await client.mutation(api.proposals.create, {
    title: "Cloud Migration Proposal",
    clientId: client1,
    content: "We propose migrating your infrastructure to a modern cloud-native architecture...",
    status: "draft",
    value: 75000,
    createdBy: adminPubkey,
  });

  await client.mutation(api.emailTemplates.create, {
    name: "Welcome Email",
    subject: "Welcome to Seridian, {{clientName}}!",
    body: "<h1>Welcome!</h1><p>Hi {{clientName}},</p><p>We're excited to work with you.</p>",
    category: "welcome",
    variables: ["{{clientName}}"],
    createdBy: adminPubkey,
  });

  await client.mutation(api.emailTemplates.create, {
    name: "Proposal Follow-up",
    subject: "Following up on: {{proposalTitle}}",
    body: "<p>Hi {{clientName}},</p><p>Just checking in on the proposal: {{proposalTitle}}</p>",
    category: "follow_up",
    variables: ["{{clientName}}", "{{proposalTitle}}"],
    createdBy: adminPubkey,
  });

  console.log("Seed complete!");
  console.log("Admin login: pubkey = admin");
  console.log("Rod login: pubkey = rod");
  process.exit(0);
}

seed().catch(console.error);
