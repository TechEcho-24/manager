# LeadPro CRM - Complete System Documentation for RAG Integration

## System Overview
LeadPro CRM is a neural-themed lead management system built on Next.js 16 with MongoDB backend. It provides comprehensive lead tracking, deal management, follow-up scheduling, and AI-powered assistance for sales teams.

## Core Application Features

### 1. Dashboard (Home Screen)
**Purpose**: Central command center showing real-time business metrics.
- **Key Metrics**: Total Leads, Active Deals, Today's Follow-ups, Total Revenue, Daily Goals.
- **Visuals**: Glassmorphism, Indigo-glow, Obsidian background.

### 2. Leads Section
**Purpose**: Complete lead management with full lifecycle tracking.
- **Fields**: Name, Email, Phone, Source (Web/LinkedIn/Manual), Priority (High/Med/Low), Status Pipeline (New to Won/Lost).
- **Product Interest**: Shopify, WordPress, Custom Web, Mobile, E-commerce.
- **Actions**: Add, Edit, Delete, Schedule Follow-up, View History.

### 3. Deals Section (Financial Command Center)
**Purpose**: Revenue tracking with milestone and installment management.
- **Milestones**: Link payments to project phases (e.g., 30% Kickoff).
- **Installments**: Time-based payments (Monthly/Quarterly).
- **Alerts**: Red flags for overdue payments.

### 4. Follow-ups Section
**Purpose**: Never miss a scheduled contact.
- **Tabs**: Today's, Upcoming (7 days), Overdue (Red).
- **Actions**: Mark complete, Reschedule, Add notes.

### 5. Daily Performance Goals
**Purpose**: Gamified productivity tracking.
- **Quotas**: New Leads Added, Follow-ups Completed.
- **Visuals**: Progress bars (Red < 50%, Yellow 50-80%, Green > 80%).

### 6. Power Analytics
**Purpose**: Data-driven insights.
- **Views**: Lead Distribution, Revenue Analytics, Product Interest, Performance Metrics.

## AI Assistant (Neural Core Chatbot)
**Capabilities**: Navigation, Data Retrieval, Lead Capture, Reminders, Quick Stats, How-to Guidance.
**Context**: Last 5 messages history, Bilingual (Hindi/English).

## Common User Workflows
- **Workflow 1**: Adding a New Lead (Leads -> Add -> Fill -> Submit).
- **Workflow 2**: Scheduling & Completing Follow-ups.
- **Workflow 3**: Creating a Deal (Won status -> Create Deal -> Select Milestones/Installments).
- **Workflow 4**: Using Analytics (Period selection -> View Charts -> Strategy).

## Technical Details
- **Tech Stack**: Next.js 16, Tailwind 4, MongoDB, NextAuth.
- **Database Collections**: Leads, Deals, Tasks, Goals.
- **API Endpoints**: `/api/leads`, `/api/deals`, `/api/followups`, `/api/analytics`, `/api/goals`, `/api/chat`.

## Frequently Asked Questions (FAQ)
- **Q: New lead kaise add karun?** A: Leads section mein jakar "Add New Lead" button par click karein.
- **Q: Payment milestones vs installments?** A: Milestones phase-based hain, installments time-based.
- **Q: Lead status kaise badlein?** A: Lead detail page par status dropdown use karein.

## Branding
- **Tagline**: "Powered by TechEcho - Your Neural Sales Command Center"
- **Identity**: Futuristic, minimalist, professional.
